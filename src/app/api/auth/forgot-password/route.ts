import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infrastructure/prisma/client";
import { generatePasswordResetToken } from '@/infrastructure/services/auth/auth.service';
import { sendPasswordResetEmail } from '@/infrastructure/services/email/email.service';
import { forgotPasswordSchema } from '@/application/validators/schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = forgotPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email } = result.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Generate reset token
    const token = await generatePasswordResetToken(email);

    if (token) {
      // Send reset email
      await sendPasswordResetEmail(email, user.name || "Usuário", token);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
