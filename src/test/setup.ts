import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup após cada teste
afterEach(() => {
  cleanup();
});

// Mock de Next.js router
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock de cookies do Next.js
vi.mock('next/headers', () => ({
  cookies() {
    return {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
    };
  },
}));

// Configuração global de fetch mock
global.fetch = vi.fn();

// Mock de variáveis de ambiente
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
