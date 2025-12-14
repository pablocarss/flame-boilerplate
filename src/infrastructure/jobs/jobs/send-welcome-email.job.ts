import { addEmailJob } from '../queues/email-queue';
import { EmailJobType } from '../queues/email-queue';

/**
 * Envia email de boas-vindas para novo usuário
 */
export async function sendWelcomeEmailJob(
  email: string,
  userData: {
    name?: string;
    organizationName?: string;
    [key: string]: any;
  }
) {
  return await addEmailJob(
    {
      type: EmailJobType.SEND_WELCOME,
      to: email,
      data: userData,
    },
    {
      priority: 1, // Alta prioridade
    }
  );
}
