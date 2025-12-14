import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis.config';
import { EmailJobData, EmailJobType } from '../queues/email-queue';

/**
 * Processa jobs de email
 */
async function processEmailJob(job: Job<EmailJobData>): Promise<void> {
  const { type, to, subject, template, data } = job.data;

  console.log(`[EmailWorker] Processing ${type} for ${to}`);

  try {
    switch (type) {
      case EmailJobType.SEND_WELCOME:
        await sendWelcomeEmail(to as string, data);
        break;

      case EmailJobType.SEND_LEAD_NOTIFICATION:
        await sendLeadNotificationEmail(to as string, data);
        break;

      case EmailJobType.SEND_SUBMISSION_CONFIRMATION:
        await sendSubmissionConfirmationEmail(to as string, data);
        break;

      case EmailJobType.SEND_BULK_EMAIL:
        await sendBulkEmail(to as string[], subject!, template!, data);
        break;

      default:
        throw new Error(`Unknown email job type: ${type}`);
    }

    console.log(`[EmailWorker] ✅ ${type} sent successfully`);
  } catch (error) {
    console.error(`[EmailWorker] ❌ Error processing ${type}:`, error);
    throw error; // Re-throw to trigger retry
  }
}

/**
 * Envia email de boas-vindas
 */
async function sendWelcomeEmail(
  to: string,
  data?: Record<string, any>
): Promise<void> {
  console.log(`[EmailWorker] Sending welcome email to ${to}`);

  // TODO: Integrar com serviço de email (Resend, SendGrid, etc.)
  // await emailService.send({
  //   to,
  //   subject: 'Bem-vindo!',
  //   template: 'welcome',
  //   data: {
  //     name: data?.name,
  //     ...data,
  //   },
  // });

  // Simular envio (remover em produção)
  await new Promise((resolve) => setTimeout(resolve, 100));
}

/**
 * Envia email de notificação de lead
 */
async function sendLeadNotificationEmail(
  to: string,
  data?: Record<string, any>
): Promise<void> {
  console.log(`[EmailWorker] Sending lead notification to ${to}`);

  // TODO: Integrar com serviço de email
  // await emailService.send({
  //   to,
  //   subject: `Novo Lead: ${data?.leadName}`,
  //   template: 'lead-notification',
  //   data,
  // });

  await new Promise((resolve) => setTimeout(resolve, 100));
}

/**
 * Envia email de confirmação de submission
 */
async function sendSubmissionConfirmationEmail(
  to: string,
  data?: Record<string, any>
): Promise<void> {
  console.log(`[EmailWorker] Sending submission confirmation to ${to}`);

  // TODO: Integrar com serviço de email
  // await emailService.send({
  //   to,
  //   subject: 'Recebemos sua mensagem',
  //   template: 'submission-confirmation',
  //   data,
  // });

  await new Promise((resolve) => setTimeout(resolve, 100));
}

/**
 * Envia emails em massa
 */
async function sendBulkEmail(
  to: string[],
  subject: string,
  template: string,
  data?: Record<string, any>
): Promise<void> {
  console.log(`[EmailWorker] Sending bulk email to ${to.length} recipients`);

  // TODO: Integrar com serviço de email
  // await emailService.sendBulk({
  //   to,
  //   subject,
  //   template,
  //   data,
  // });

  await new Promise((resolve) => setTimeout(resolve, 500));
}

/**
 * Worker de emails
 */
export const emailWorker = new Worker<EmailJobData>(
  'email',
  processEmailJob,
  {
    ...redisConnection,
    concurrency: 5, // Processar 5 jobs em paralelo
    limiter: {
      max: 10, // Máximo 10 jobs
      duration: 1000, // Por segundo
    },
  }
);

// Event listeners
emailWorker.on('completed', (job) => {
  console.log(`[EmailWorker] Job ${job.id} completed`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`[EmailWorker] Job ${job?.id} failed:`, err.message);
});

emailWorker.on('error', (err) => {
  console.error('[EmailWorker] Error:', err);
});

console.log('[EmailWorker] Started with concurrency 5');
