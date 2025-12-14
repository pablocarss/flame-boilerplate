import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infrastructure/prisma/client";
import { getCurrentUser } from '@/infrastructure/services/auth/auth.service';
import { guardOrganization } from '@/infrastructure/services/rbac/rbac.service';

/**
 * DELETE /api/api-keys/:id
 * Revogar/deletar API key
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Buscar API key
    const apiKey = await prisma.apiKey.findUnique({
      where: { id },
    });

    if (!apiKey) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    // Verificar permissões RBAC
    const guard = await guardOrganization(apiKey.organizationId, "apikey:delete");

    if (!guard.success) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    // Deletar API key
    await prisma.apiKey.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting API key:", error);
    return NextResponse.json(
      { error: "Failed to delete API key" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/api-keys/:id
 * Ativar/desativar API key
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { isActive } = body;

    // Buscar API key
    const apiKey = await prisma.apiKey.findUnique({
      where: { id },
    });

    if (!apiKey) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    // Verificar permissões RBAC
    const guard = await guardOrganization(apiKey.organizationId, "apikey:update");

    if (!guard.success) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    // Atualizar API key
    const updated = await prisma.apiKey.update({
      where: { id },
      data: { isActive: isActive ?? true },
    });

    return NextResponse.json({
      ...updated,
      key: `****${updated.key.slice(-8)}`, // Mascarar chave
    });
  } catch (error) {
    console.error("Error updating API key:", error);
    return NextResponse.json(
      { error: "Failed to update API key" },
      { status: 500 }
    );
  }
}
