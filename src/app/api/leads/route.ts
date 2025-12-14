import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infrastructure/prisma/client";
import { getCurrentUser } from '@/infrastructure/services/auth/auth.service';
import { guardOrganization } from '@/infrastructure/services/rbac/rbac.service';

/**
 * GET /api/leads?organizationId=xxx
 * Lista todos os leads de uma organização
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");
    const status = searchParams.get("status");
    const source = searchParams.get("source");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!organizationId) {
      return NextResponse.json(
        { error: "ID da organização é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar permissões RBAC
    const guard = await guardOrganization(organizationId, "lead:read");

    if (!guard.success) {
      console.error("Permission denied:", guard.error);
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    const where: any = { organizationId };
    if (status && status !== "all") where.status = status;
    if (source && source !== "all") where.source = source;

    const [leads, total, statusCounts] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.lead.count({ where }),
      prisma.lead.groupBy({
        by: ["status"],
        where: { organizationId },
        _count: true,
      }),
    ]);

    return NextResponse.json({
      leads,
      total,
      limit,
      offset,
      statusCounts: statusCounts.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Falha ao carregar leads. Por favor, tente novamente." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/leads
 * Criar novo lead
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      organizationId,
      name,
      email,
      phone,
      company,
      position,
      source,
      value,
      notes,
      tags,
    } = body;

    if (!organizationId || !name || !email) {
      return NextResponse.json(
        { error: "organizationId, name, and email are required" },
        { status: 400 }
      );
    }

    // Verificar permissões RBAC
    const guard = await guardOrganization(organizationId, "lead:create");

    if (!guard.success) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    const lead = await prisma.lead.create({
      data: {
        organizationId,
        name,
        email,
        phone,
        company,
        position,
        source: source || "WEBSITE",
        value,
        notes,
        tags: tags || [],
        assignedTo: user.id,
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    );
  }
}
