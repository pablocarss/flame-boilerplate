import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { verifyWebhookSignature, processWebhookEvent } from '@/infrastructure/services/payment/stripe.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event;
    try {
      event = verifyWebhookSignature(body, signature);
    } catch (error) {
      console.error("Webhook signature verification failed:", error);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Process the event
    try {
      await processWebhookEvent(event);
    } catch (error) {
      console.error("Error processing webhook event:", error);
      return NextResponse.json(
        { error: "Error processing event" },
        { status: 500 }
      );
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
