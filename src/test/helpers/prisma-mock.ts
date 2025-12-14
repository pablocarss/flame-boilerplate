import { PrismockClient } from 'prismock';
import { beforeEach } from 'vitest';

// Cliente Prisma mockado para testes
export const prismaMock = new PrismockClient();

// Reset do banco de dados mockado antes de cada teste
beforeEach(async () => {
  await prismaMock.$reset();
});

/**
 * Helper para criar um usuário de teste
 */
export async function createTestUser(overrides = {}) {
  return await prismaMock.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashedpassword123',
      emailVerified: true,
      ...overrides,
    },
  });
}

/**
 * Helper para criar uma organização de teste
 */
export async function createTestOrganization(overrides = {}) {
  return await prismaMock.organization.create({
    data: {
      name: 'Test Organization',
      slug: 'test-org',
      ...overrides,
    },
  });
}

/**
 * Helper para criar um lead de teste
 */
export async function createTestLead(organizationId: string, overrides = {}) {
  return await prismaMock.lead.create({
    data: {
      organizationId,
      name: 'Test Lead',
      email: 'lead@example.com',
      status: 'NEW',
      source: 'WEBSITE',
      tags: [],
      ...overrides,
    },
  });
}

/**
 * Helper para criar uma submission de teste
 */
export async function createTestSubmission(organizationId: string, userId: string, overrides = {}) {
  return await prismaMock.submission.create({
    data: {
      organizationId,
      userId,
      formType: 'CONTACT',
      data: { message: 'Test submission' },
      status: 'PENDING',
      ...overrides,
    },
  });
}

/**
 * Helper para criar um membro de organização
 */
export async function createTestMember(
  userId: string,
  organizationId: string,
  role: 'OWNER' | 'ADMIN' | 'MEMBER' = 'MEMBER'
) {
  return await prismaMock.member.create({
    data: {
      userId,
      organizationId,
      role,
    },
  });
}
