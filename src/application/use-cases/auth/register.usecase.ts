/**
 * Register Use Case - Application Layer
 *
 * Orquestra o processo de registro de novo usuário:
 * 1. Valida dados
 * 2. Verifica se email já existe
 * 3. Hash de senha
 * 4. Cria usuário e organização padrão
 * 5. Gera tokens
 */

import { prisma } from '@/infrastructure/prisma/client';
import { hashPassword, generateAccessToken, generateRefreshToken } from '@/infrastructure/services/auth/auth.service';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface RegisterOutput {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
  accessToken: string;
  refreshToken: string;
}

export class RegisterUseCase {
  async execute(input: RegisterInput): Promise<RegisterOutput> {
    // 1. Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new Error('Email already in use');
    }

    // 2. Hash da senha
    const hashedPassword = await hashPassword(input.password);

    // 3. Criar usuário e organização padrão (transação)
    const result = await prisma.$transaction(async (tx) => {
      // Criar usuário
      const user = await tx.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
        },
      });

      // Criar organização padrão
      const organization = await tx.organization.create({
        data: {
          name: `${input.name}'s Organization`,
          slug: `${input.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
          ownerId: user.id,
        },
      });

      // Criar membership
      await tx.organizationMember.create({
        data: {
          organizationId: organization.id,
          userId: user.id,
          role: 'ADMIN',
        },
      });

      return { user, organization };
    });

    // 4. Gerar tokens
    const accessToken = await generateAccessToken(result.user.id, result.user.email);
    const refreshToken = await generateRefreshToken(result.user.id);

    // 5. Salvar refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: result.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        avatarUrl: result.user.avatarUrl,
      },
      accessToken,
      refreshToken,
    };
  }
}
