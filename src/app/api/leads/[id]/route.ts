import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infrastructure/prisma/client";
import { getCurrentUser } from '@/infrastructure/services/auth/auth.service';
import { guardOrganization } from '@/infrastructure/services/rbac/rbac.service';

/**
 * GET /api/leads/:id
 * Obter detalhes de um lead
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Verificar permissões RBAC
    const guard = await guardOrganization(lead.organizationId, "lead:read");

    if (!guard.success) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error("Error fetching lead:", error);
    return NextResponse.json(
      { error: "Failed to fetch lead" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/leads/:id
 * Atualizar lead
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

    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Verificar permissões RBAC
    const guard = await guardOrganization(lead.organizationId, "lead:update");

    if (!guard.success) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    // Atualizar lead
    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.company !== undefined) updateData.company = body.company;
    if (body.position !== undefined) updateData.position = body.position;
    if (body.status !== undefined) {
      updateData.status = body.status;
      // Se o status for WON, registrar quando foi convertido
      if (body.status === "WON" && !lead.convertedAt) {
        updateData.convertedAt = new Date();
      }
    }
    if (body.source !== undefined) updateData.source = body.source;
    if (body.value !== undefined) updateData.value = body.value;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.assignedTo !== undefined) updateData.assignedTo = body.assignedTo;
    if (body.lastContactAt !== undefined) updateData.lastContactAt = new Date(body.lastContactAt);
    if (body.nextFollowUpAt !== undefined) updateData.nextFollowUpAt = new Date(body.nextFollowUpAt);
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.customFields !== undefined) updateData.customFields = body.customFields;

    const updated = await prisma.lead.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json(
      { error: "Failed to update lead" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/leads/:id
 * Deletar lead
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

    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Verificar permissões RBAC
    const guard = await guardOrganization(lead.organizationId, "lead:delete");

    if (!guard.success) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    await prisma.lead.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return NextResponse.json(
      { error: "Failed to delete lead" },
      { status: 500 }
    );
  }
}
