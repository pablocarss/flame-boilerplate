import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateIntegrationSchema } from "@/lib/validations";
import { guardOrganization } from "@/lib/rbac";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = params;

    // Get integration to verify ownership
    const integration = await prisma.integration.findUnique({
      where: { id },
    });

    if (!integration) {
      return NextResponse.json(
        { error: "Integração não encontrada" },
        { status: 404 }
      );
    }

    // Check permission
    const guard = await guardOrganization(integration.organizationId, "integration:update");
    if (!guard.success) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    const body = await request.json();

    // Validate input
    const result = updateIntegrationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, apiKey, accessToken, refreshToken, config, status } = result.data;

    // Update integration
    // TODO: Encrypt sensitive fields (apiKey, accessToken, refreshToken) before storing
    const updatedIntegration = await prisma.integration.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(apiKey && { apiKey }),
        ...(accessToken && { accessToken }),
        ...(refreshToken && { refreshToken }),
        ...(config && { config }),
        ...(status && { status }),
      },
      select: {
        id: true,
        provider: true,
        name: true,
        status: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ integration: updatedIntegration });
  } catch (error) {
    console.error("Update integration error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = params;

    // Get integration to verify ownership
    const integration = await prisma.integration.findUnique({
      where: { id },
    });

    if (!integration) {
      return NextResponse.json(
        { error: "Integração não encontrada" },
        { status: 404 }
      );
    }

    // Check permission
    const guard = await guardOrganization(integration.organizationId, "integration:delete");
    if (!guard.success) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    // Delete integration
    await prisma.integration.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete integration error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
