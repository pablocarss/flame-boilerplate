import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  invalidateRefreshToken,
  setAuthCookies,
} from '@/infrastructure/services/auth/auth.service';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token não encontrado" },
        { status: 401 }
      );
    }

    // Verify refresh token
    const payload = await verifyRefreshToken(refreshToken);

    if (!payload) {
      return NextResponse.json(
        { error: "Refresh token inválido ou expirado" },
        { status: 401 }
      );
    }

    // Invalidate old refresh token
    await invalidateRefreshToken(refreshToken);

    // Generate new tokens
    const newAccessToken = await generateAccessToken(
      payload.userId,
      payload.email
    );
    const newRefreshToken = await generateRefreshToken(
      payload.userId,
      payload.email
    );

    // Set new cookies
    await setAuthCookies(newAccessToken, newRefreshToken);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
