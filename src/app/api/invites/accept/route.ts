import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from '@/infrastructure/services/auth/auth.service';
import { prisma } from "@/infrastructure/prisma/client";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Voce precisa estar logado para aceitar o convite" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: "Token nao fornecido" },
        { status: 400 }
      );
    }

    const invite = await prisma.invite.findUnique({
      where: { token },
      include: {
        organization: true,
      },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Convite nao encontrado" },
        { status: 404 }
      );
    }

    if (invite.status !== "PENDING") {
      return NextResponse.json(
        { error: "Este convite nao esta mais disponivel" },
        { status: 400 }
      );
    }

    if (invite.expiresAt < new Date()) {
      await prisma.invite.update({
        where: { id: invite.id },
        data: { status: "EXPIRED" },
      });
      return NextResponse.json(
        { error: "Este convite expirou" },
        { status: 400 }
      );
    }

    // Check if user email matches invite email
    if (invite.email !== user.email) {
      return NextResponse.json(
        { error: "Este convite foi enviado para outro email" },
        { status: 403 }
      );
    }

    // Check if user is already a member
    const existingMember = await prisma.member.findFirst({
      where: {
        userId: user.id,
        organizationId: invite.organizationId,
      },
    });

    if (existingMember) {
      // Update invite status and return success
      await prisma.invite.update({
        where: { id: invite.id },
        data: { status: "ACCEPTED", recipientId: user.id },
      });
      return NextResponse.json({
        message: "Voce ja e membro desta organizacao",
      });
    }

    // Create member and update invite in a transaction
    await prisma.$transaction([
      prisma.member.create({
        data: {
          userId: user.id,
          organizationId: invite.organizationId,
          role: invite.role,
        },
      }),
      prisma.invite.update({
        where: { id: invite.id },
        data: { status: "ACCEPTED", recipientId: user.id },
      }),
    ]);

    return NextResponse.json({
      message: "Convite aceito com sucesso",
      organization: invite.organization,
    });
  } catch (error) {
    console.error("Accept invite error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
