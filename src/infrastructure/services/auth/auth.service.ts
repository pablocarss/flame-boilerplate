import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/infrastructure/prisma/client";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default-secret-change-in-production"
);

const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || "default-refresh-secret-change-in-production"
);

export interface TokenPayload extends JWTPayload {
  userId: string;
  email: string;
  type: "access" | "refresh";
}

export interface UserSession {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

// Generate access token (short-lived)
export async function generateAccessToken(
  userId: string,
  email: string
): Promise<string> {
  const token = await new SignJWT({ userId, email, type: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_ACCESS_EXPIRES_IN || "15m")
    .sign(JWT_SECRET);

  return token;
}

// Generate refresh token (long-lived)
export async function generateRefreshToken(
  userId: string,
  email: string
): Promise<string> {
  const token = await new SignJWT({ userId, email, type: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_REFRESH_EXPIRES_IN || "7d")
    .sign(JWT_REFRESH_SECRET);

  // Store refresh token in database
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  return token;
}

// Verify access token
export async function verifyAccessToken(
  token: string
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

// Verify refresh token
export async function verifyRefreshToken(
  token: string
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET);

    // Check if token exists in database and is not expired
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return null;
    }

    return payload as TokenPayload;
  } catch {
    return null;
  }
}

// Invalidate refresh token
export async function invalidateRefreshToken(token: string): Promise<void> {
  await prisma.refreshToken.delete({
    where: { token },
  }).catch(() => {});
}

// Invalidate all refresh tokens for a user
export async function invalidateAllUserTokens(userId: string): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });
}

// Get current user from cookies
export async function getCurrentUser(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return null;
  }

  const payload = await verifyAccessToken(accessToken);
  if (!payload) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
    },
  });

  return user;
}

// Set auth cookies
export async function setAuthCookies(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 15, // 15 minutes
    path: "/",
  });

  cookieStore.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

// Clear auth cookies
export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
}

// Generate password reset token
export async function generatePasswordResetToken(email: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const resetToken = crypto.randomUUID();
  const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken,
      resetTokenExpiry,
    },
  });

  return resetToken;
}

// Verify password reset token
export async function verifyPasswordResetToken(token: string) {
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: {
        gt: new Date(),
      },
    },
  });

  return user;
}
