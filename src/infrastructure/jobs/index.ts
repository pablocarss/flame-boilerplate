/**
 * Central export file for jobs infrastructure
 *
 * Este arquivo exporta todas as queues, workers, e jobs,
 * e também inicializa os workers quando rodado diretamente.
 */

// Queues
export { emailQueue, addEmailJob, EmailJobType } from './queues/email-queue';
export { notificationQueue, addNotificationJob, NotificationJobType } from './queues/notification-queue';
export { leadQueue, addLeadJob, LeadJobType } from './queues/lead-queue';

// Workers
export { emailWorker } from './workers/email-worker';
export { notificationWorker } from './workers/notification-worker';
export { leadWorker } from './workers/lead-worker';

// Jobs (helpers)
export { sendWelcomeEmailJob } from './jobs/send-welcome-email.job';
export { sendLeadNotificationJob } from './jobs/send-lead-notification.job';
export {
  enrichLeadDataJob,
  calculateLeadScoreJob,
  syncLeadToCRMJob,
} from './jobs/enrich-lead.job';

// Types
export type { EmailJobData } from './queues/email-queue';
export type { NotificationJobData } from './queues/notification-queue';
export type { LeadJobData } from './queues/lead-queue';

/**
 * Inicializa todos os workers
 *
 * Chame esta função no início da aplicação ou em um processo separado
 * dedicado a processar jobs.
 *
 * @example
 * ```typescript
 * // Em development (npm run workers)
 * import { startWorkers } from '@/infrastructure/jobs';
 * startWorkers();
 *
 * // Em production (PM2 ou Docker)
 * // Criar arquivo workers.ts:
 * import { startWorkers } from '@/infrastructure/jobs';
 * startWorkers();
 * ```
 */
export function startWorkers() {
  console.log('[Jobs] Starting all workers...');

  // Workers já estão iniciados automaticamente quando importados
  // Este log apenas confirma que foram carregados

  console.log('[Jobs] ✅ All workers started successfully');
  console.log('[Jobs] Email Worker: concurrency 5, rate limit 10/s');
  console.log('[Jobs] Notification Worker: concurrency 10');
  console.log('[Jobs] Lead Worker: concurrency 3');

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('[Jobs] Received SIGTERM, closing workers...');
    const { emailWorker, notificationWorker, leadWorker } = await import('./index');

    await Promise.all([
      emailWorker.close(),
      notificationWorker.close(),
      leadWorker.close(),
    ]);

    console.log('[Jobs] ✅ All workers closed');
    process.exit(0);
  });
}

/**
 * Fecha todos os workers
 *
 * Use para graceful shutdown
 */
export async function stopWorkers() {
  const { emailWorker, notificationWorker, leadWorker } = await import('./index');

  await Promise.all([
    emailWorker.close(),
    notificationWorker.close(),
    leadWorker.close(),
  ]);

  console.log('[Jobs] All workers stopped');
}
