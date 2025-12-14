/**
 * Login Use Case - Application Layer
 *
 * Orquestra o processo de autenticação:
 * 1. Valida credenciais
 * 2. Verifica senha
 * 3. Gera tokens JWT
 */

import { prisma } from '@/infrastructure/prisma/client';
import { verifyPassword, generateAccessToken, generateRefreshToken } from '@/infrastructure/services/auth/auth.service';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
  accessToken: string;
  refreshToken: string;
}

export class LoginUseCase {
  async execute(input: LoginInput): Promise<LoginOutput> {
    // 1. Buscar usuário por email
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // 2. Verificar senha
    const isPasswordValid = await verifyPassword(input.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // 3. Gerar tokens
    const accessToken = await generateAccessToken(user.id, user.email);
    const refreshToken = await generateRefreshToken(user.id);

    // 4. Salvar refresh token no banco
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
      accessToken,
      refreshToken,
    };
  }
}
