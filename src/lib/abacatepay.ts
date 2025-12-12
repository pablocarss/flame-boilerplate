import { prisma } from "./prisma";

const ABACATEPAY_API_KEY = process.env.ABACATEPAY_API_KEY || "";
const ABACATEPAY_API_URL = process.env.ABACATEPAY_API_URL || "https://api.abacatepay.com/v1";

interface AbacatePayCustomer {
  id: string;
  email: string;
  name: string;
  taxId?: string;
  metadata?: Record<string, string>;
}

interface AbacatePaySubscription {
  id: string;
  customerId: string;
  planId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
}

interface AbacatePayError {
  error: string;
  message: string;
}

// API request helper
async function abacatePayRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: Record<string, unknown>
): Promise<T> {
  const response = await fetch(`${ABACATEPAY_API_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ABACATEPAY_API_KEY}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error((data as AbacatePayError).message || "AbacatePay API error");
  }

  return data as T;
}

// Customer management
export async function createCustomer(
  email: string,
  name: string,
  taxId?: string,
  metadata?: Record<string, string>
): Promise<AbacatePayCustomer> {
  return abacatePayRequest<AbacatePayCustomer>("/customers", "POST", {
    email,
    name,
    taxId,
    metadata,
  });
}

export async function getCustomer(customerId: string): Promise<AbacatePayCustomer> {
  return abacatePayRequest<AbacatePayCustomer>(`/customers/${customerId}`);
}

export async function updateCustomer(
  customerId: string,
  data: Partial<AbacatePayCustomer>
): Promise<AbacatePayCustomer> {
  return abacatePayRequest<AbacatePayCustomer>(`/customers/${customerId}`, "PUT", data);
}

// Subscription management
export async function createSubscription(
  customerId: string,
  planSlug: string,
  metadata?: Record<string, string>
): Promise<AbacatePaySubscription> {
  // Get plan from our database
  const plan = await prisma.plan.findUnique({
    where: { slug: planSlug },
  });

  if (!plan) {
    throw new Error("Plan not found");
  }

  return abacatePayRequest<AbacatePaySubscription>("/subscriptions", "POST", {
    customerId,
    planId: planSlug,
    metadata,
  });
}

export async function getSubscription(subscriptionId: string): Promise<AbacatePaySubscription> {
  return abacatePayRequest<AbacatePaySubscription>(`/subscriptions/${subscriptionId}`);
}

export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<AbacatePaySubscription> {
  return abacatePayRequest<AbacatePaySubscription>(
    `/subscriptions/${subscriptionId}/cancel`,
    "POST",
    { cancelAtPeriodEnd }
  );
}

export async function reactivateSubscription(
  subscriptionId: string
): Promise<AbacatePaySubscription> {
  return abacatePayRequest<AbacatePaySubscription>(
    `/subscriptions/${subscriptionId}/reactivate`,
    "POST"
  );
}

// Customer portal
export async function getCustomerPortalUrl(
  customerId: string,
  returnUrl: string
): Promise<{ url: string }> {
  return abacatePayRequest<{ url: string }>("/portal/sessions", "POST", {
    customerId,
    returnUrl,
  });
}

// Sync subscription from AbacatePay to our database
export async function syncSubscription(
  organizationId: string,
  abacatePaySubscriptionId: string
): Promise<void> {
  const abacateSubscription = await getSubscription(abacatePaySubscriptionId);

  // Map AbacatePay status to our status
  const statusMap: Record<string, "ACTIVE" | "CANCELED" | "PAST_DUE" | "TRIALING" | "PAUSED"> = {
    active: "ACTIVE",
    canceled: "CANCELED",
    past_due: "PAST_DUE",
    trialing: "TRIALING",
    paused: "PAUSED",
  };

  const plan = await prisma.plan.findFirst({
    where: { slug: abacateSubscription.planId },
  });

  if (!plan) {
    throw new Error("Plan not found");
  }

  await prisma.subscription.upsert({
    where: { organizationId },
    update: {
      status: statusMap[abacateSubscription.status] || "ACTIVE",
      abacatePaySubscriptionId: abacateSubscription.id,
      planId: plan.id,
      currentPeriodStart: new Date(abacateSubscription.currentPeriodStart),
      currentPeriodEnd: new Date(abacateSubscription.currentPeriodEnd),
    },
    create: {
      organizationId,
      planId: plan.id,
      status: statusMap[abacateSubscription.status] || "ACTIVE",
      abacatePaySubscriptionId: abacateSubscription.id,
      currentPeriodStart: new Date(abacateSubscription.currentPeriodStart),
      currentPeriodEnd: new Date(abacateSubscription.currentPeriodEnd),
    },
  });
}

// Create or get customer for organization
export async function getOrCreateCustomer(
  organizationId: string,
  email: string,
  name: string
): Promise<string> {
  const subscription = await prisma.subscription.findUnique({
    where: { organizationId },
  });

  if (subscription?.abacatePayCustomerId) {
    return subscription.abacatePayCustomerId;
  }

  const customer = await createCustomer(email, name, undefined, {
    organizationId,
  });

  // Update subscription with customer ID if exists
  if (subscription) {
    await prisma.subscription.update({
      where: { organizationId },
      data: { abacatePayCustomerId: customer.id },
    });
  }

  return customer.id;
}

// Upgrade/downgrade subscription
export async function changeSubscriptionPlan(
  organizationId: string,
  newPlanSlug: string
): Promise<void> {
  const subscription = await prisma.subscription.findUnique({
    where: { organizationId },
    include: { organization: true },
  });

  if (!subscription?.abacatePaySubscriptionId) {
    throw new Error("No active subscription found");
  }

  const newPlan = await prisma.plan.findUnique({
    where: { slug: newPlanSlug },
  });

  if (!newPlan) {
    throw new Error("Plan not found");
  }

  await abacatePayRequest(`/subscriptions/${subscription.abacatePaySubscriptionId}`, "PUT", {
    planId: newPlanSlug,
  });

  await prisma.subscription.update({
    where: { organizationId },
    data: { planId: newPlan.id },
  });
}

// Webhook event types
export type WebhookEventType =
  | "subscription.created"
  | "subscription.updated"
  | "subscription.canceled"
  | "subscription.renewed"
  | "payment.succeeded"
  | "payment.failed"
  | "customer.created"
  | "customer.updated";

export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  data: Record<string, unknown>;
  createdAt: string;
}

// Verify webhook signature
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const secret = process.env.ABACATEPAY_WEBHOOK_SECRET || "";
  const crypto = require("crypto");
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return signature === expectedSignature;
}

// Process webhook event
export async function processWebhookEvent(event: WebhookEvent): Promise<void> {
  switch (event.type) {
    case "subscription.created":
    case "subscription.updated":
    case "subscription.renewed": {
      const data = event.data as {
        organizationId: string;
        subscriptionId: string;
      };
      await syncSubscription(data.organizationId, data.subscriptionId);
      break;
    }

    case "subscription.canceled": {
      const data = event.data as { organizationId: string };
      await prisma.subscription.update({
        where: { organizationId: data.organizationId },
        data: { status: "CANCELED", canceledAt: new Date() },
      });
      break;
    }

    case "payment.failed": {
      const data = event.data as { organizationId: string };
      await prisma.subscription.update({
        where: { organizationId: data.organizationId },
        data: { status: "PAST_DUE" },
      });
      break;
    }

    default:
      console.log(`Unhandled webhook event: ${event.type}`);
  }
}
