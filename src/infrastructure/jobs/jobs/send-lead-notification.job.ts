import { addEmailJob } from '../queues/email-queue';
import { EmailJobType } from '../queues/email-queue';

/**
 * Envia notificação por email quando um novo lead é criado
 */
export async function sendLeadNotificationJob(
  recipientEmail: string,
  leadData: {
    leadName: string;
    leadEmail: string;
    leadPhone?: string;
    leadCompany?: string;
    source: string;
    value?: number;
    [key: string]: any;
  }
) {
  return await addEmailJob(
    {
      type: EmailJobType.SEND_LEAD_NOTIFICATION,
      to: recipientEmail,
      data: leadData,
    },
    {
      priority: 2, // Média prioridade
      delay: 1000, // Delay de 1 segundo para agrupar notificações
    }
  );
}
