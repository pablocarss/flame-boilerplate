import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { guardOrganization } from "@/lib/rbac";
import { generateApiKey, hashApiKey } from "@/lib/api-key";

/**
 * GET /api/api-keys?organizationId=xxx
 * Lista todas as API keys de uma organização
 */
export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 }
      );
    }

    // Verificar permissões RBAC
    const guard = await guardOrganization(organizationId, "apikey:read");

    if (!guard.success) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        key: true, // Retorna apenas os últimos 8 caracteres
        createdBy: true,
        lastUsedAt: true,
        expiresAt: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Mascarar as chaves, mostrando apenas os últimos 8 caracteres
    const maskedKeys = apiKeys.map((key) => ({
      ...key,
      key: `****${key.key.slice(-8)}`,
    }));

    return NextResponse.json(maskedKeys);
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json(
      { error: "Failed to fetch API keys" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/api-keys
 * Criar nova API key
 */
export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { organizationId, name, expiresAt } = body;

    if (!organizationId || !name) {
      return NextResponse.json(
        { error: "organizationId and name are required" },
        { status: 400 }
      );
    }

    // Verificar permissões RBAC
    const guard = await guardOrganization(organizationId, "apikey:create");

    if (!guard.success) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    // Gerar API key
    const rawKey = generateApiKey("live");
    const hashedKey = hashApiKey(rawKey);

    // Criar API key no banco
    const apiKey = await prisma.apiKey.create({
      data: {
        name,
        key: hashedKey,
        organizationId,
        createdBy: user.id,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    // Retornar a chave completa APENAS nesta resposta
    // O usuário não poderá ver a chave completa novamente
    return NextResponse.json(
      {
        ...apiKey,
        key: rawKey, // Chave completa - mostrar APENAS uma vez
        warning:
          "ATENÇÃO: Salve esta chave agora. Você não poderá vê-la novamente!",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating API key:", error);
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    );
  }
}
