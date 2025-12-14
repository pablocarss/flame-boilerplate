import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infrastructure/prisma/client";
import { guardOrganization } from '@/infrastructure/services/rbac/rbac.service';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { memberId } = await params;
    const body = await request.json();
    const { organizationId } = body;

    // Check permission
    const guard = await guardOrganization(organizationId, "member:remove");
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

    // Can't remove yourself
    if (member.userId === guard.userId) {
      return NextResponse.json(
        { error: "Voce nao pode se remover da organizacao" },
        { status: 400 }
      );
    }

    // Check if this is the last admin
    if (member.role === "ADMIN") {
      const adminCount = await prisma.member.count({
        where: {
          organizationId,
          role: "ADMIN",
        },
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Nao e possivel remover o ultimo administrador" },
          { status: 400 }
        );
      }
    }

    // Remove member
    await prisma.member.delete({
      where: { id: memberId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove member error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
