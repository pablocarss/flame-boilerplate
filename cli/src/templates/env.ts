import { nanoid } from 'nanoid';
import { getEnvVarsNeeded } from '../modules/module-mapper';

export interface EnvConfig {
  projectName: string;
  dbName: string;
  dbPort: number;
  redisPort: number;
  selectedModules: string[];
}

export function generateEnv(config: EnvConfig): string {
  const jwtSecret = nanoid(64);
  const jwtRefreshSecret = nanoid(64);

  let env = `# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:${config.dbPort}/${config.dbName}?schema=public"

# JWT Secrets (Auto-generated - keep these secure!)
JWT_SECRET=${jwtSecret}
JWT_REFRESH_SECRET=${jwtRefreshSecret}
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
`;

  const neededEnvVars = getEnvVarsNeeded(config.selectedModules);

  // MinIO/S3 (Storage module)
  if (neededEnvVars.some((v) => v.startsWith('MINIO_'))) {
    env += `
# MinIO/S3 Storage
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=${config.projectName}-uploads
MINIO_USE_SSL=false
`;
  }

  // Email (always included)
  env += `
# Email (MailHog for development)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_FROM_EMAIL=noreply@${config.projectName}.dev
SMTP_FROM_NAME=${config.projectName}
`;

  // Stripe (Billing module)
  if (neededEnvVars.some((v) => v.startsWith('STRIPE_'))) {
    env += `
# Stripe (Payments - Use TEST keys in development)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
`;
  }

  // Redis (Leads module for background jobs)
  if (config.selectedModules.includes('leads')) {
    env += `
# Redis (Background jobs and caching)
REDIS_URL=redis://localhost:${config.redisPort}
REDIS_HOST=localhost
REDIS_PORT=${config.redisPort}
REDIS_PASSWORD=
`;
  }

  // Resend (Email service - optional)
  env += `
# Resend (Email service - optional, comment out to use SMTP)
# RESEND_API_KEY=re_your_api_key_here
`;

  return env;
}
