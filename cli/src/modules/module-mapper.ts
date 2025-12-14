export interface ModuleDefinition {
  name: string;
  key: string;
  description: string;
  dependencies: string[];
  files: string[];
  prismaModels: string[];
  prismaEnums: string[];
  envVars: string[];
  dockerServices: string[];
  npmPackages: string[];
}

export const MODULES: Record<string, ModuleDefinition> = {
  leads: {
    name: 'Leads/CRM',
    key: 'leads',
    description: 'Sistema CRM com pipeline de vendas e Kanban board',
    dependencies: [],
    files: [
      // API routes
      'src/app/api/leads/route.ts',
      'src/app/api/leads/[id]/route.ts',

      // Pages
      'src/app/(dashboard)/dashboard/leads/page.tsx',

      // Components
      'src/components/leads/kanban-board.tsx',
      'src/components/leads/kanban-column.tsx',
      'src/components/leads/lead-card.tsx',
      'src/components/leads/edit-lead-dialog.tsx',
      'src/components/leads/delete-lead-dialog.tsx',

      // Use cases
      'src/application/use-cases/leads/create-lead.usecase.ts',
      'src/application/use-cases/leads/list-leads.usecase.ts',
      'src/application/use-cases/leads/update-lead-status.usecase.ts',

      // Mappers
      'src/application/mappers/lead.mapper.ts',

      // Repositories
      'src/infrastructure/repositories/lead.repository.ts',

      // Domain
      'src/core/domain/entities/lead.entity.ts',
      'src/core/domain/repositories/lead.repository.interface.ts',
      'src/core/domain/events/lead-events.ts',

      // Jobs
      'src/infrastructure/jobs/jobs/enrich-lead.job.ts',
      'src/infrastructure/jobs/jobs/send-lead-notification.job.ts',
      'src/infrastructure/jobs/queues/lead-queue.ts',
      'src/infrastructure/jobs/workers/lead-worker.ts',

      // Event handlers
      'src/infrastructure/events/handlers/lead-handlers.ts',

      // Controllers
      'src/presentation/controllers/lead.controller.ts',
    ],
    prismaModels: ['Lead'],
    prismaEnums: ['LeadStatus', 'LeadSource'],
    envVars: [],
    dockerServices: ['redis'],
    npmPackages: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
  },

  submissions: {
    name: 'Submissions',
    key: 'submissions',
    description: 'Sistema de formulários e submissões',
    dependencies: [],
    files: [
      // API routes
      'src/app/api/submissions/route.ts',
      'src/app/api/submissions/[id]/route.ts',

      // Pages
      'src/app/(dashboard)/dashboard/submissions/page.tsx',

      // Repositories
      'src/infrastructure/repositories/submission.repository.ts',

      // Domain
      'src/core/domain/entities/submission.entity.ts',
      'src/core/domain/repositories/submission.repository.interface.ts',
      'src/core/domain/events/submission-events.ts',

      // Event handlers
      'src/infrastructure/events/handlers/submission-handlers.ts',

      // Mappers
      'src/application/mappers/submission.mapper.ts',
    ],
    prismaModels: ['Submission'],
    prismaEnums: ['SubmissionStatus'],
    envVars: [],
    dockerServices: [],
    npmPackages: [],
  },

  billing: {
    name: 'Billing/Stripe',
    key: 'billing',
    description: 'Sistema de pagamentos e assinaturas com Stripe',
    dependencies: [],
    files: [
      // API routes
      'src/app/api/billing/checkout/route.ts',
      'src/app/api/billing/portal/route.ts',
      'src/app/api/webhooks/stripe/route.ts',

      // Pages
      'src/app/(dashboard)/dashboard/billing/page.tsx',

      // Components
      'src/components/billing/manage-subscription-button.tsx',
      'src/components/billing/select-plan-button.tsx',

      // Services
      'src/infrastructure/services/payment/stripe.service.ts',
    ],
    prismaModels: ['Plan', 'Subscription'],
    prismaEnums: ['SubscriptionStatus'],
    envVars: [
      'STRIPE_SECRET_KEY',
      'STRIPE_PUBLISHABLE_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    ],
    dockerServices: [],
    npmPackages: ['stripe', '@stripe/stripe-js'],
  },

  storage: {
    name: 'Storage/MinIO',
    key: 'storage',
    description: 'Upload e armazenamento de arquivos S3-compatible',
    dependencies: [],
    files: [
      // API routes
      'src/app/api/upload/route.ts',
      'src/app/api/upload/presigned/route.ts',

      // Services
      'src/infrastructure/services/storage/minio.service.ts',
      'src/infrastructure/services/storage/storage.service.ts',
    ],
    prismaModels: ['Upload'],
    prismaEnums: [],
    envVars: [
      'MINIO_ENDPOINT',
      'MINIO_PORT',
      'MINIO_ACCESS_KEY',
      'MINIO_SECRET_KEY',
      'MINIO_BUCKET_NAME',
      'MINIO_USE_SSL',
    ],
    dockerServices: ['minio', 'minio-setup'],
    npmPackages: ['minio'],
  },
};

/**
 * Get all files that should be removed for unselected modules
 */
export function getFilesToRemove(selectedModules: string[]): string[] {
  const modulesToRemove = Object.keys(MODULES).filter(
    (key) => !selectedModules.includes(key)
  );

  const filesToRemove: string[] = [];

  for (const moduleKey of modulesToRemove) {
    const module = MODULES[moduleKey];
    filesToRemove.push(...module.files);
  }

  return filesToRemove;
}

/**
 * Get all Prisma models that should be removed for unselected modules
 */
export function getPrismaModelsToRemove(selectedModules: string[]): string[] {
  const modulesToRemove = Object.keys(MODULES).filter(
    (key) => !selectedModules.includes(key)
  );

  const modelsToRemove: string[] = [];

  for (const moduleKey of modulesToRemove) {
    const module = MODULES[moduleKey];
    modelsToRemove.push(...module.prismaModels);
    modelsToRemove.push(...module.prismaEnums);
  }

  return modelsToRemove;
}

/**
 * Get all NPM packages that should be removed for unselected modules
 */
export function getNpmPackagesToRemove(selectedModules: string[]): string[] {
  const modulesToRemove = Object.keys(MODULES).filter(
    (key) => !selectedModules.includes(key)
  );

  const packagesToRemove: string[] = [];

  for (const moduleKey of modulesToRemove) {
    const module = MODULES[moduleKey];
    packagesToRemove.push(...module.npmPackages);
  }

  return packagesToRemove;
}

/**
 * Get Docker services needed for selected modules
 */
export function getDockerServicesNeeded(selectedModules: string[]): string[] {
  const servicesSet = new Set<string>();

  // Always include postgres and mailhog
  servicesSet.add('postgres');
  servicesSet.add('mailhog');

  for (const moduleKey of selectedModules) {
    const module = MODULES[moduleKey];
    if (module) {
      module.dockerServices.forEach((service) => servicesSet.add(service));
    }
  }

  return Array.from(servicesSet);
}

/**
 * Get environment variables needed for selected modules
 */
export function getEnvVarsNeeded(selectedModules: string[]): string[] {
  const envVarsSet = new Set<string>();

  for (const moduleKey of selectedModules) {
    const module = MODULES[moduleKey];
    if (module) {
      module.envVars.forEach((envVar) => envVarsSet.add(envVar));
    }
  }

  return Array.from(envVarsSet);
}
