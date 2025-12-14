/**
 * Auth Controller - Presentation Layer
 *
 * Orquestra autenticação e registro via Use Cases
 */

import { NextRequest, NextResponse } from 'next/server';
import { LoginUseCase, RegisterUseCase } from '@/application/use-cases/auth';
import { loginSchema, registerSchema } from '@/application/validators/schemas';

export class AuthController {
  /**
   * POST /api/auth/login
   */
  static async login(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await req.json();

      // Validar input
      const validatedData = loginSchema.parse(body);

      // Criar e executar use case
      const useCase = new LoginUseCase();
      const result = await useCase.execute({
        email: validatedData.email,
        password: validatedData.password,
      });

      // Criar response com cookies
      const response = NextResponse.json({
        user: result.user,
        accessToken: result.accessToken,
      });

      // Set refresh token as HTTP-only cookie
      response.cookies.set('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });

      return response;
    } catch (error: any) {
      console.error('[AuthController] Login error:', error);

      if (error.message === 'Invalid credentials') {
        return NextResponse.json(
          { error: 'Email ou senha inválidos' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: error.message || 'Internal server error' },
        { status: 500 }
      );
    }
  }

  /**
   * POST /api/auth/register
   */
  static async register(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await req.json();

      // Validar input
      const validatedData = registerSchema.parse(body);

      // Criar e executar use case
      const useCase = new RegisterUseCase();
      const result = await useCase.execute({
        name: validatedData.name,
        email: validatedData.email,
        password: validatedData.password,
      });

      // Criar response com cookies
      const response = NextResponse.json(
        {
          user: result.user,
          accessToken: result.accessToken,
        },
        { status: 201 }
      );

      // Set refresh token as HTTP-only cookie
      response.cookies.set('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });

      return response;
    } catch (error: any) {
      console.error('[AuthController] Register error:', error);

      if (error.message === 'Email already in use') {
        return NextResponse.json(
          { error: 'Email já está em uso' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: error.message || 'Internal server error' },
        { status: 500 }
      );
    }
  }
}
