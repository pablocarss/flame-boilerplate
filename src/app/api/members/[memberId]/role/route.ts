import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardOrganization } from "@/lib/rbac";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { memberId } = await params;
    const body = await request.json();
    const { role, organizationId } = body;

    if (!role || !["ADMIN", "MEMBER"].includes(role)) {
      return NextResponse.json(
        { error: "Funcao invalida" },
        { status: 400 }
      );
    }

    // Check permission
    const guard = await guardOrganization(organizationId, "member:update-role");
    if (!guard.success) {
      return NextResponse.json(
        { error: guard.error },
        { status: guard.status }
      );
    }

    // Get the member
    const member = await prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Membro nao encontrado" },
        { status: 404 }
      );
    }

    if (member.organizationId !== organizationId) {
      return NextResponse.json(
        { error: "Membro nao pertence a esta organizacao" },
        { status: 400 }
      );
    }

    // Can't change your own role
    if (member.userId === guard.userId) {
      return NextResponse.json(
        { error: "Voce nao pode alterar sua propria funcao" },
        { status: 400 }
      );
    }

    // Update role
    const updatedMember = await prisma.member.update({
      where: { id: memberId },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ member: updatedMember });
  } catch (error) {
    console.error("Update member role error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
