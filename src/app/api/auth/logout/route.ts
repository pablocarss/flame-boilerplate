import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { invalidateRefreshToken, clearAuthCookies } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    // Invalidate refresh token in database
    if (refreshToken) {
      await invalidateRefreshToken(refreshToken);
    }

    // Clear cookies
    await clearAuthCookies();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
