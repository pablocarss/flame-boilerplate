import { addLeadJob } from '../queues/lead-queue';
import { LeadJobType } from '../queues/lead-queue';

/**
 * Enriquece dados de um lead com informações externas
 */
export async function enrichLeadDataJob(
  leadId: string,
  organizationId: string,
  options?: {
    priority?: number;
    delay?: number;
  }
) {
  return await addLeadJob(
    {
      type: LeadJobType.ENRICH_LEAD_DATA,
      leadId,
      organizationId,
    },
    {
      priority: options?.priority || 5, // Baixa prioridade
      delay: options?.delay || 5000, // Delay de 5 segundos (não urgente)
    }
  );
}

/**
 * Calcula score de um lead
 */
export async function calculateLeadScoreJob(
  leadId: string,
  organizationId: string
) {
  return await addLeadJob(
    {
      type: LeadJobType.CALCULATE_LEAD_SCORE,
      leadId,
      organizationId,
    },
    {
      priority: 3, // Média prioridade
    }
  );
}

/**
 * Sincroniza lead com CRM
 */
export async function syncLeadToCRMJob(
  leadId: string,
  organizationId: string,
  crmData?: Record<string, any>
) {
  return await addLeadJob(
    {
      type: LeadJobType.SYNC_TO_CRM,
      leadId,
      organizationId,
      data: crmData,
    },
    {
      priority: 2, // Média-alta prioridade
    }
  );
}
