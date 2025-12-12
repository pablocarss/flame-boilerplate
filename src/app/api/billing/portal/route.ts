import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { guardOrganization } from "@/lib/rbac";
import { getCustomerPortalUrl, getOrCreateCustomer } from "@/lib/abacatepay";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { organizationId } = body;

    // Check permission
    const guard = await guardOrganization(organizationId, "billing:read");
    if (!guard.success) {
      return NextResponse.json(
        { error: guard.error },
        { status: guard.status }
      );
    }

    // Get organization
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        subscription: true,
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organizacao nao encontrada" },
        { status: 404 }
      );
    }

    // Check if AbacatePay is configured
    if (!process.env.ABACATEPAY_API_KEY) {
      return NextResponse.json({
        url: null,
        message: "AbacatePay nao configurado",
      });
    }

    try {
      // Get or create customer
      const customerId = await getOrCreateCustomer(
        organizationId,
        user.email,
        organization.name
      );

      // Get portal URL
      const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`;
      const { url } = await getCustomerPortalUrl(customerId, returnUrl);

      return NextResponse.json({ url });
    } catch (error) {
      console.error("AbacatePay error:", error);
      return NextResponse.json({
        url: null,
        message: "Erro ao conectar com AbacatePay",
      });
    }
  } catch (error) {
    console.error("Billing portal error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
