import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis.config';
import { NotificationJobData, NotificationJobType } from '../queues/notification-queue';

/**
 * Processa jobs de notificação
 */
async function processNotificationJob(
  job: Job<NotificationJobData>
): Promise<void> {
  const { type, userId, title, message, actionUrl, notificationType, metadata } =
    job.data;

  console.log(`[NotificationWorker] Processing ${type} for user ${userId}`);

  try {
    switch (type) {
      case NotificationJobType.CREATE_NOTIFICATION:
        await createNotification(userId, title, message, actionUrl, notificationType);
        break;

      case NotificationJobType.SEND_PUSH_NOTIFICATION:
        await sendPushNotification(userId, title, message, metadata);
        break;

      case NotificationJobType.SEND_SMS:
        await sendSMS(userId, message, metadata);
        break;

      default:
        throw new Error(`Unknown notification job type: ${type}`);
    }

    console.log(`[NotificationWorker] ✅ ${type} processed successfully`);
  } catch (error) {
    console.error(`[NotificationWorker] ❌ Error processing ${type}:`, error);
    throw error;
  }
}

/**
 * Cria notificação no banco de dados
 */
async function createNotification(
  userId: string,
  title: string,
  message: string,
  actionUrl?: string,
  type: string = 'INFO'
): Promise<void> {
  console.log(`[NotificationWorker] Creating notification for user ${userId}`);

  // TODO: Integrar com Prisma
  // await prisma.notification.create({
  //   data: {
  //     userId,
  //     type,
  //     title,
  //     message,
  //     actionUrl,
  //     read: false,
  //   },
  // });

  await new Promise((resolve) => setTimeout(resolve, 50));
}

/**
 * Envia push notification
 */
async function sendPushNotification(
  userId: string,
  title: string,
  message: string,
  metadata?: Record<string, any>
): Promise<void> {
  console.log(`[NotificationWorker] Sending push notification to user ${userId}`);

  // TODO: Integrar com serviço de push (Firebase, OneSignal, etc.)
  // await pushService.send({
  //   userId,
  //   title,
  //   message,
  //   data: metadata,
  // });

  await new Promise((resolve) => setTimeout(resolve, 100));
}

/**
 * Envia SMS
 */
async function sendSMS(
  userId: string,
  message: string,
  metadata?: Record<string, any>
): Promise<void> {
  console.log(`[NotificationWorker] Sending SMS to user ${userId}`);

  // TODO: Integrar com serviço de SMS (Twilio, etc.)
  // const phone = await getUserPhone(userId);
  // await smsService.send({
  //   to: phone,
  //   message,
  // });

  await new Promise((resolve) => setTimeout(resolve, 100));
}

/**
 * Worker de notificações
 */
export const notificationWorker = new Worker<NotificationJobData>(
  'notification',
  processNotificationJob,
  {
    ...redisConnection,
    concurrency: 10, // Processar 10 jobs em paralelo
  }
);

// Event listeners
notificationWorker.on('completed', (job) => {
  console.log(`[NotificationWorker] Job ${job.id} completed`);
});

notificationWorker.on('failed', (job, err) => {
  console.error(`[NotificationWorker] Job ${job?.id} failed:`, err.message);
});

notificationWorker.on('error', (err) => {
  console.error('[NotificationWorker] Error:', err);
});

console.log('[NotificationWorker] Started with concurrency 10');
