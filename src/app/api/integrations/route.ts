import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from '@/infrastructure/services/auth/auth.service';
import { prisma } from "@/infrastructure/prisma/client";
import { createIntegrationSchema } from '@/application/validators/schemas';
import { guardOrganization } from '@/infrastructure/services/rbac/rbac.service';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId é obrigatório" },
        { status: 400 }
      );
    }

    // Check permission
    const guard = await guardOrganization(organizationId, "integration:read");
    if (!guard.success) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    const integrations = await prisma.integration.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        provider: true,
        name: true,
        status: true,
        lastSyncAt: true,
        createdAt: true,
        updatedAt: true,
        // Don't return sensitive data
      },
    });

    return NextResponse.json({ integrations });
  } catch (error) {
    console.error("Get integrations error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const result = createIntegrationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { organizationId, provider, name, apiKey, accessToken, refreshToken, config } = result.data;

    // Check permission
    const guard = await guardOrganization(organizationId, "integration:create");
    if (!guard.success) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    // Check if integration already exists for this provider
    const existingIntegration = await prisma.integration.findUnique({
      where: {
        organizationId_provider: {
          organizationId,
          provider,
        },
      },
    });

    if (existingIntegration) {
      return NextResponse.json(
        { error: "Esta integração já existe para esta organização" },
        { status: 400 }
      );
    }

    // Create integration
    // TODO: Encrypt sensitive fields (apiKey, accessToken, refreshToken) before storing
    const integration = await prisma.integration.create({
      data: {
        organizationId,
        provider,
        name,
        apiKey,
        accessToken,
        refreshToken,
        config,
        status: "ACTIVE",
      },
      select: {
        id: true,
        provider: true,
        name: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ integration }, { status: 201 });
  } catch (error) {
    console.error("Create integration error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
