import { Queue, QueueOptions } from 'bullmq';
import { redisConnection } from '../config/redis.config';

/**
 * Tipos de jobs de lead
 */
export enum LeadJobType {
  ENRICH_LEAD_DATA = 'ENRICH_LEAD_DATA',
  CALCULATE_LEAD_SCORE = 'CALCULATE_LEAD_SCORE',
  SYNC_TO_CRM = 'SYNC_TO_CRM',
  SEND_FOLLOW_UP = 'SEND_FOLLOW_UP',
}

/**
 * Dados para job de lead
 */
export interface LeadJobData {
  type: LeadJobType;
  leadId: string;
  organizationId: string;
  data?: Record<string, any>;
}

/**
 * Opções da fila de leads
 */
const queueOptions: QueueOptions = {
  ...redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 3000,
    },
    removeOnComplete: {
      count: 100,
    },
    removeOnFail: {
      count: 300,
    },
  },
};

/**
 * Fila de processamento de leads
 */
export const leadQueue = new Queue<LeadJobData>('lead', queueOptions);

/**
 * Helper para adicionar job de lead
 */
export async function addLeadJob(
  data: LeadJobData,
  options?: {
    priority?: number;
    delay?: number;
  }
) {
  return await leadQueue.add(data.type, data, {
    priority: options?.priority,
    delay: options?.delay,
  });
}

// Eventos da fila
leadQueue.on('error', (error) => {
  console.error('[LeadQueue] Error:', error);
});

console.log('[LeadQueue] Initialized');
