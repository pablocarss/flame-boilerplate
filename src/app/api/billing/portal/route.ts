import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { guardOrganization } from "@/lib/rbac";
import { createPortalSession } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
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

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        url: null,
        message: "Stripe não configurado",
      });
    }

    try {
      // Get portal URL
      const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`;
      const portalUrl = await createPortalSession(organizationId, returnUrl);

      return NextResponse.json({ url: portalUrl });
    } catch (error) {
      console.error("Stripe error:", error);
      return NextResponse.json({
        url: null,
        message:
          error instanceof Error
            ? error.message
            : "Erro ao conectar com Stripe",
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
