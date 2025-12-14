import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infrastructure/prisma/client";
import { getCurrentUser } from '@/infrastructure/services/auth/auth.service';
import { guardOrganization } from '@/infrastructure/services/rbac/rbac.service';

/**
 * GET /api/submissions?organizationId=xxx
 * Lista todas as submissões de uma organização
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
    const formType = searchParams.get("formType");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!organizationId) {
      return NextResponse.json(
        { error: "ID da organização é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar permissões RBAC
    const guard = await guardOrganization(organizationId, "submission:read");

    if (!guard.success) {
      console.error("Permission denied:", guard.error);
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    const where: any = { organizationId };
    if (status && status !== "all") where.status = status;
    if (formType && formType !== "all") where.formType = formType;

    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.submission.count({ where }),
    ]);

    return NextResponse.json({
      submissions,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Falha ao carregar submissões. Por favor, tente novamente." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/submissions
 * Criar nova submissão
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      organizationId,
      userId,
      formType,
      data,
      source,
    } = body;

    if (!organizationId || !formType || !data) {
      return NextResponse.json(
        { error: "organizationId, formType, and data are required" },
        { status: 400 }
      );
    }

    // Capturar IP e User Agent
    const ipAddress = req.headers.get("x-forwarded-for") ||
                     req.headers.get("x-real-ip") ||
                     "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const submission = await prisma.submission.create({
      data: {
        organizationId,
        userId,
        formType,
        data,
        source: source || "web",
        ipAddress,
        userAgent,
      },
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error("Error creating submission:", error);
    return NextResponse.json(
      { error: "Failed to create submission" },
      { status: 500 }
    );
  }
}
