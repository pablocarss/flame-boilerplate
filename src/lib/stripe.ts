import Stripe from "stripe";
import { prisma } from "./prisma";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
});

// Create Stripe checkout session for plan selection
export async function createCheckoutSession(
  organizationId: string,
  planSlug: string,
  userId: string,
  userEmail: string
): Promise<string> {
  // Get plan from database
  const plan = await prisma.plan.findUnique({
    where: { slug: planSlug },
  });

  if (!plan) {
    throw new Error("Plan not found");
  }

  // Get organization
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: { subscription: true },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  // Check if organization already has a Stripe customer
  let customerId = organization.subscription?.stripeCustomerId;

  // Create or get Stripe customer
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: userEmail,
      metadata: {
        organizationId,
        userId,
      },
    });
    customerId = customer.id;

    // Update subscription with customer ID
    if (organization.subscription) {
      await prisma.subscription.update({
        where: { organizationId },
        data: { stripeCustomerId: customerId },
      });
    }
  }

  // Get or create Stripe price
  let priceId = plan.stripePriceId;

  if (!priceId) {
    // Create product
    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description || undefined,
      metadata: {
        planId: plan.id,
        planSlug: plan.slug,
      },
    });

    // Create price
    const price = await stripe.prices.create({
      product: product.id,
      currency: "brl",
      unit_amount: Math.round(plan.price * 100), // Convert to cents
      recurring: {
        interval: plan.interval === "month" ? "month" : "year",
      },
    });

    priceId = price.id;

    // Update plan with Stripe price ID
    await prisma.plan.update({
      where: { id: plan.id },
      data: {
        stripeProductId: product.id,
        stripePriceId: price.id,
      },
    });
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
    metadata: {
      organizationId,
      planId: plan.id,
      userId,
    },
  });

  return session.url!;
}

// Create Stripe customer portal session
export async function createPortalSession(
  organizationId: string,
  returnUrl: string
): Promise<string> {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: { subscription: true },
  });

  if (!organization?.subscription?.stripeCustomerId) {
    throw new Error("No Stripe customer found for this organization");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: organization.subscription.stripeCustomerId,
    return_url: returnUrl,
  });

  return session.url;
}

// Sync subscription from Stripe to database
export async function syncSubscription(
  stripeSubscriptionId: string
): Promise<void> {
  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

  const organizationId = subscription.metadata.organizationId;
  if (!organizationId) {
    throw new Error("Organization ID not found in subscription metadata");
  }

  // Map Stripe status to our status
  const statusMap: Record<string, "ACTIVE" | "CANCELED" | "PAST_DUE" | "TRIALING" | "PAUSED"> = {
    active: "ACTIVE",
    canceled: "CANCELED",
    past_due: "PAST_DUE",
    trialing: "TRIALING",
    paused: "PAUSED",
    incomplete: "PAST_DUE",
    incomplete_expired: "CANCELED",
    unpaid: "PAST_DUE",
  };

  const planId = subscription.metadata.planId;
  if (!planId) {
    throw new Error("Plan ID not found in subscription metadata");
  }

  // Update or create subscription in database
  await prisma.subscription.upsert({
    where: { organizationId },
    update: {
      status: statusMap[subscription.status] || "ACTIVE",
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      planId,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      canceledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
    },
    create: {
      organizationId,
      planId,
      status: statusMap[subscription.status] || "ACTIVE",
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });
}

// Verify Stripe webhook signature
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    STRIPE_WEBHOOK_SECRET
  );
}

// Process Stripe webhook event
export async function processWebhookEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.subscription) {
        await syncSubscription(session.subscription as string);
      }
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await syncSubscription(subscription.id);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const organizationId = subscription.metadata.organizationId;
      if (organizationId) {
        await prisma.subscription.update({
          where: { organizationId },
          data: {
            status: "CANCELED",
            canceledAt: new Date(),
          },
        });
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription as string
        );
        const organizationId = subscription.metadata.organizationId;
        if (organizationId) {
          await prisma.subscription.update({
            where: { organizationId },
            data: { status: "PAST_DUE" },
          });
        }
      }
      break;
    }

    default:
      console.log(`Unhandled Stripe event: ${event.type}`);
  }
}
