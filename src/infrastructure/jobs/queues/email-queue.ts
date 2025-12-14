import { Queue, QueueOptions } from 'bullmq';
import { redisConnection } from '../config/redis.config';

/**
 * Tipos de jobs de email
 */
export enum EmailJobType {
  SEND_WELCOME = 'SEND_WELCOME',
  SEND_LEAD_NOTIFICATION = 'SEND_LEAD_NOTIFICATION',
  SEND_SUBMISSION_CONFIRMATION = 'SEND_SUBMISSION_CONFIRMATION',
  SEND_BULK_EMAIL = 'SEND_BULK_EMAIL',
}

/**
 * Dados para job de email
 */
export interface EmailJobData {
  type: EmailJobType;
  to: string | string[];
  subject?: string;
  template?: string;
  data?: Record<string, any>;
}

/**
 * Opções da fila de emails
 */
const queueOptions: QueueOptions = {
  ...redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      count: 100, // Manter últimos 100 jobs completados
    },
    removeOnFail: {
      count: 500, // Manter últimos 500 jobs falhados
    },
  },
};

/**
 * Fila de processamento de emails
 */
export const emailQueue = new Queue<EmailJobData>('email', queueOptions);

/**
 * Helper para adicionar job de email
 */
export async function addEmailJob(
  data: EmailJobData,
  options?: {
    priority?: number;
    delay?: number;
    jobId?: string;
  }
) {
  return await emailQueue.add(data.type, data, {
    priority: options?.priority,
    delay: options?.delay,
    jobId: options?.jobId,
  });
}

// Eventos da fila
emailQueue.on('error', (error) => {
  console.error('[EmailQueue] Error:', error);
});

emailQueue.on('waiting', ({ jobId }) => {
  console.log(`[EmailQueue] Job ${jobId} is waiting`);
});

console.log('[EmailQueue] Initialized');
