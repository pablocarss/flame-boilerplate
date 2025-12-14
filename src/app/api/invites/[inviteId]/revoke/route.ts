import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from '@/infrastructure/services/auth/auth.service';
import { prisma } from "@/infrastructure/prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    const { inviteId } = await params;

    // Get invite
    const invite = await prisma.invite.findUnique({
      where: { id: inviteId },
      include: {
        organization: {
          include: {
            members: {
              where: {
                userId: user.id,
                role: "ADMIN",
              },
            },
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

    // Check if user is admin of the organization
    if (invite.organization.members.length === 0) {
      return NextResponse.json(
        { error: "Voce nao tem permissao para revogar este convite" },
        { status: 403 }
      );
    }

    // Check if invite is still pending
    if (invite.status !== "PENDING") {
      return NextResponse.json(
        { error: "Este convite nao pode ser revogado" },
        { status: 400 }
      );
    }

    // Revoke invite
    const updatedInvite = await prisma.invite.update({
      where: { id: inviteId },
      data: { status: "REVOKED" },
    });

    return NextResponse.json({ invite: updatedInvite });
  } catch (error) {
    console.error("Revoke invite error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
