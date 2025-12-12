import { NextRequest, NextResponse } from "next/server";
import {
  verifyWebhookSignature,
  processWebhookEvent,
  type WebhookEvent,
} from "@/lib/abacatepay";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("x-abacatepay-signature") || "";

    // Verify signature
    if (!verifyWebhookSignature(payload, signature)) {
      console.error("Invalid webhook signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const event: WebhookEvent = JSON.parse(payload);

    console.log(`Processing webhook event: ${event.type}`);

    // Process the event
    await processWebhookEvent(event);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
