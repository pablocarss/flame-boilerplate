import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { guardOrganization } from "@/lib/rbac";
import { createCheckoutSession } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { organizationId, planSlug } = body;

    if (!organizationId || !planSlug) {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      );
    }

    // Check permission
    const guard = await guardOrganization(organizationId, "billing:update");
    if (!guard.success) {
      return NextResponse.json(
        { error: guard.error },
        { status: guard.status }
      );
    }

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe não configurado" },
        { status: 500 }
      );
    }

    // Create checkout session
    const checkoutUrl = await createCheckoutSession(
      organizationId,
      planSlug,
      user.id,
      user.email
    );

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao criar sessão de checkout",
      },
      { status: 500 }
    );
  }
}
