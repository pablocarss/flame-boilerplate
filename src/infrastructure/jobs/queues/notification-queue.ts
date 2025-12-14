import { Queue, QueueOptions } from 'bullmq';
import { redisConnection } from '../config/redis.config';

/**
 * Tipos de jobs de notificação
 */
export enum NotificationJobType {
  CREATE_NOTIFICATION = 'CREATE_NOTIFICATION',
  SEND_PUSH_NOTIFICATION = 'SEND_PUSH_NOTIFICATION',
  SEND_SMS = 'SEND_SMS',
}

/**
 * Dados para job de notificação
 */
export interface NotificationJobData {
  type: NotificationJobType;
  userId: string;
  title: string;
  message: string;
  actionUrl?: string;
  notificationType?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  metadata?: Record<string, any>;
}

/**
 * Opções da fila de notificações
 */
const queueOptions: QueueOptions = {
  ...redisConnection,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'fixed',
      delay: 5000,
    },
    removeOnComplete: {
      count: 200,
    },
    removeOnFail: {
      count: 500,
    },
  },
};

/**
 * Fila de processamento de notificações
 */
export const notificationQueue = new Queue<NotificationJobData>(
  'notification',
  queueOptions
);

/**
 * Helper para adicionar job de notificação
 */
export async function addNotificationJob(
  data: NotificationJobData,
  options?: {
    priority?: number;
    delay?: number;
  }
) {
  return await notificationQueue.add(data.type, data, {
    priority: options?.priority,
    delay: options?.delay,
  });
}

// Eventos da fila
notificationQueue.on('error', (error) => {
  console.error('[NotificationQueue] Error:', error);
});

console.log('[NotificationQueue] Initialized');
