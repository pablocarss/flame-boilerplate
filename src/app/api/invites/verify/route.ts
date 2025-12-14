import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infrastructure/prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token nao fornecido" },
        { status: 400 }
      );
    }

    const invite = await prisma.invite.findUnique({
      where: { token },
      include: {
        organization: {
          select: {
            name: true,
            slug: true,
          },
        },
        sender: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Convite nao encontrado" },
        { status: 404 }
      );
    }

    if (invite.status !== "PENDING") {
      const statusMessages = {
        ACCEPTED: "Este convite ja foi aceito",
        REVOKED: "Este convite foi revogado",
        EXPIRED: "Este convite expirou",
      };
      return NextResponse.json(
        { error: statusMessages[invite.status] || "Convite invalido" },
        { status: 400 }
      );
    }

    if (invite.expiresAt < new Date()) {
      // Update invite status to expired
      await prisma.invite.update({
        where: { id: invite.id },
        data: { status: "EXPIRED" },
      });
      return NextResponse.json(
        { error: "Este convite expirou" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      invite: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        organization: invite.organization,
        sender: invite.sender,
      },
    });
  } catch (error) {
    console.error("Verify invite error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
