import { NextRequest, NextResponse } from "next/server";
import { verifyPasswordResetToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ valid: false });
    }

    const user = await verifyPasswordResetToken(token);

    return NextResponse.json({ valid: !!user });
  } catch (error) {
    console.error("Verify reset token error:", error);
    return NextResponse.json({ valid: false });
  }
}
