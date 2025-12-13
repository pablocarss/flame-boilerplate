import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { guardOrganization } from "@/lib/rbac";

/**
 * GET /api/submissions/:id
 * Obter detalhes de uma submissão
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const submission = await prisma.submission.findUnique({
      where: { id },
    });

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // Verificar permissões RBAC
    const guard = await guardOrganization(
      submission.organizationId,
      "submission:read"
    );

    if (!guard.success) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Error fetching submission:", error);
    return NextResponse.json(
      { error: "Failed to fetch submission" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/submissions/:id
 * Atualizar submissão (status, notes, etc)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { status, notes } = body;

    const submission = await prisma.submission.findUnique({
      where: { id },
    });

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // Verificar permissões RBAC
    const guard = await guardOrganization(
      submission.organizationId,
      "submission:update"
    );

    if (!guard.success) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    const updated = await prisma.submission.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(status && status !== "PENDING" && {
          reviewedBy: user.id,
          reviewedAt: new Date(),
        }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating submission:", error);
    return NextResponse.json(
      { error: "Failed to update submission" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/submissions/:id
 * Deletar submissão
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const submission = await prisma.submission.findUnique({
      where: { id },
    });

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // Verificar permissões RBAC
    const guard = await guardOrganization(
      submission.organizationId,
      "submission:delete"
    );

    if (!guard.success) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    await prisma.submission.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting submission:", error);
    return NextResponse.json(
      { error: "Failed to delete submission" },
      { status: 500 }
    );
  }
}
