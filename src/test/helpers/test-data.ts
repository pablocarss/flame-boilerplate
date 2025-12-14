/**
 * Dados de teste reutilizáveis para testes
 */

export const testUsers = {
  admin: {
    id: 'user-admin-123',
    email: 'admin@example.com',
    name: 'Admin User',
    password: 'hashedpassword123',
    emailVerified: true,
  },
  regular: {
    id: 'user-regular-123',
    email: 'user@example.com',
    name: 'Regular User',
    password: 'hashedpassword123',
    emailVerified: true,
  },
};

export const testOrganizations = {
  acme: {
    id: 'org-acme-123',
    name: 'Acme Corp',
    slug: 'acme-corp',
  },
  techco: {
    id: 'org-techco-123',
    name: 'Tech Co',
    slug: 'tech-co',
  },
};

export const testLeads = {
  newLead: {
    id: 'lead-new-123',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+55 11 99999-9999',
    company: 'Example Inc',
    position: 'CEO',
    status: 'NEW' as const,
    source: 'WEBSITE' as const,
    value: 50000,
    notes: 'Interested in our services',
    tags: ['premium', 'enterprise'],
  },
  qualifiedLead: {
    id: 'lead-qualified-123',
    name: 'Jane Smith',
    email: 'jane@example.com',
    status: 'QUALIFIED' as const,
    source: 'REFERRAL' as const,
    value: 75000,
    tags: ['referral'],
  },
};

export const testSubmissions = {
  contactForm: {
    id: 'submission-contact-123',
    formType: 'CONTACT' as const,
    data: {
      name: 'Contact User',
      email: 'contact@example.com',
      message: 'I want to know more about your services',
    },
    status: 'PENDING' as const,
  },
  newsletterSignup: {
    id: 'submission-newsletter-123',
    formType: 'NEWSLETTER' as const,
    data: {
      email: 'newsletter@example.com',
    },
    status: 'APPROVED' as const,
  },
};

export const testNotifications = {
  unread: {
    id: 'notification-unread-123',
    type: 'INFO' as const,
    title: 'Test Notification',
    message: 'This is a test notification',
    read: false,
  },
  read: {
    id: 'notification-read-123',
    type: 'SUCCESS' as const,
    title: 'Completed Action',
    message: 'Action completed successfully',
    read: true,
  },
};

/**
 * Factory functions para criar dados de teste customizados
 */

export function createMockUser(overrides = {}) {
  return {
    id: `user-${Math.random().toString(36).substr(2, 9)}`,
    email: `test-${Math.random().toString(36).substr(2, 5)}@example.com`,
    name: 'Test User',
    password: 'hashedpassword',
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockOrganization(overrides = {}) {
  const slug = `org-${Math.random().toString(36).substr(2, 9)}`;
  return {
    id: slug,
    name: 'Test Organization',
    slug,
    logoUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockLead(organizationId: string, overrides = {}) {
  return {
    id: `lead-${Math.random().toString(36).substr(2, 9)}`,
    organizationId,
    name: 'Test Lead',
    email: `lead-${Math.random().toString(36).substr(2, 5)}@example.com`,
    phone: null,
    company: null,
    position: null,
    status: 'NEW' as const,
    source: 'WEBSITE' as const,
    value: null,
    notes: null,
    assignedTo: null,
    lastContactAt: null,
    nextFollowUpAt: null,
    convertedAt: null,
    tags: [],
    customFields: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockSubmission(organizationId: string, userId: string, overrides = {}) {
  return {
    id: `submission-${Math.random().toString(36).substr(2, 9)}`,
    organizationId,
    userId,
    formType: 'CONTACT' as const,
    data: { message: 'Test message' },
    status: 'PENDING' as const,
    notes: null,
    reviewedBy: null,
    reviewedAt: null,
    source: null,
    ipAddress: null,
    userAgent: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Mock de responses HTTP
 */

export const mockResponses = {
  success: (data: any) => ({
    ok: true,
    status: 200,
    json: async () => data,
  }),
  created: (data: any) => ({
    ok: true,
    status: 201,
    json: async () => data,
  }),
  noContent: () => ({
    ok: true,
    status: 204,
    json: async () => ({}),
  }),
  badRequest: (error: string) => ({
    ok: false,
    status: 400,
    json: async () => ({ error }),
  }),
  unauthorized: () => ({
    ok: false,
    status: 401,
    json: async () => ({ error: 'Não autenticado' }),
  }),
  notFound: () => ({
    ok: false,
    status: 404,
    json: async () => ({ error: 'Não encontrado' }),
  }),
  serverError: () => ({
    ok: false,
    status: 500,
    json: async () => ({ error: 'Erro interno do servidor' }),
  }),
};
