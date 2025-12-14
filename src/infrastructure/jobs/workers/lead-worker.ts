import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis.config';
import { LeadJobData, LeadJobType } from '../queues/lead-queue';

/**
 * Processa jobs de lead
 */
async function processLeadJob(job: Job<LeadJobData>): Promise<void> {
  const { type, leadId, organizationId, data } = job.data;

  console.log(
    `[LeadWorker] Processing ${type} for lead ${leadId} (org: ${organizationId})`
  );

  try {
    switch (type) {
      case LeadJobType.ENRICH_LEAD_DATA:
        await enrichLeadData(leadId, organizationId, data);
        break;

      case LeadJobType.CALCULATE_LEAD_SCORE:
        await calculateLeadScore(leadId, organizationId);
        break;

      case LeadJobType.SYNC_TO_CRM:
        await syncLeadToCRM(leadId, organizationId, data);
        break;

      case LeadJobType.SEND_FOLLOW_UP:
        await sendFollowUp(leadId, organizationId, data);
        break;

      default:
        throw new Error(`Unknown lead job type: ${type}`);
    }

    console.log(`[LeadWorker] ✅ ${type} processed successfully`);
  } catch (error) {
    console.error(`[LeadWorker] ❌ Error processing ${type}:`, error);
    throw error; // Re-throw to trigger retry
  }
}

/**
 * Enriquece dados do lead com informações externas
 */
async function enrichLeadData(
  leadId: string,
  organizationId: string,
  data?: Record<string, any>
): Promise<void> {
  console.log(`[LeadWorker] Enriching lead data for ${leadId}`);

  // TODO: Integrar com serviços de enriquecimento (Clearbit, FullContact, etc.)
  // const enrichedData = await enrichmentService.enrich({
  //   email: lead.email,
  //   company: lead.company,
  // });
  //
  // await prisma.lead.update({
  //   where: { id: leadId },
  //   data: {
  //     companySize: enrichedData.companySize,
  //     industry: enrichedData.industry,
  //     linkedinUrl: enrichedData.linkedinUrl,
  //     // ... outros campos
  //   },
  // });

  await new Promise((resolve) => setTimeout(resolve, 200));
}

/**
 * Calcula score do lead baseado em engajamento e dados
 */
async function calculateLeadScore(
  leadId: string,
  organizationId: string
): Promise<void> {
  console.log(`[LeadWorker] Calculating lead score for ${leadId}`);

  // TODO: Implementar lógica de lead scoring
  // const lead = await prisma.lead.findUnique({
  //   where: { id: leadId },
  //   include: { submissions: true, activities: true },
  // });
  //
  // let score = 0;
  //
  // // Critérios de pontuação
  // if (lead.email?.includes('@gmail.com')) score += 10;
  // if (lead.company) score += 20;
  // if (lead.position?.toLowerCase().includes('manager')) score += 30;
  // if (lead.submissions.length > 0) score += 15;
  // if (lead.value && lead.value > 10000) score += 25;
  //
  // await prisma.lead.update({
  //   where: { id: leadId },
  //   data: { score },
  // });

  await new Promise((resolve) => setTimeout(resolve, 150));
}

/**
 * Sincroniza lead com CRM externo
 */
async function syncLeadToCRM(
  leadId: string,
  organizationId: string,
  data?: Record<string, any>
): Promise<void> {
  console.log(`[LeadWorker] Syncing lead ${leadId} to CRM`);

  // TODO: Integrar com CRM (Salesforce, HubSpot, Pipedrive, etc.)
  // const lead = await prisma.lead.findUnique({
  //   where: { id: leadId },
  // });
  //
  // const crmContact = await crmService.createOrUpdateContact({
  //   email: lead.email,
  //   name: lead.name,
  //   company: lead.company,
  //   phone: lead.phone,
  //   customFields: {
  //     source: lead.source,
  //     status: lead.status,
  //     tags: lead.tags,
  //   },
  // });
  //
  // await prisma.lead.update({
  //   where: { id: leadId },
  //   data: {
  //     crmId: crmContact.id,
  //     lastSyncedAt: new Date(),
  //   },
  // });

  await new Promise((resolve) => setTimeout(resolve, 300));
}

/**
 * Envia email de follow-up automático
 */
async function sendFollowUp(
  leadId: string,
  organizationId: string,
  data?: Record<string, any>
): Promise<void> {
  console.log(`[LeadWorker] Sending follow-up for lead ${leadId}`);

  // TODO: Integrar com serviço de email
  // const lead = await prisma.lead.findUnique({
  //   where: { id: leadId },
  //   include: { organization: true },
  // });
  //
  // const template = data?.template || 'default-follow-up';
  // const delay = data?.delay || 0; // dias desde último contato
  //
  // await emailService.send({
  //   to: lead.email,
  //   from: lead.organization.contactEmail,
  //   subject: `Follow-up: ${lead.name}`,
  //   template,
  //   data: {
  //     leadName: lead.name,
  //     companyName: lead.organization.name,
  //     ...data,
  //   },
  // });
  //
  // await prisma.activity.create({
  //   data: {
  //     leadId,
  //     type: 'EMAIL_SENT',
  //     description: `Follow-up email sent`,
  //   },
  // });

  await new Promise((resolve) => setTimeout(resolve, 250));
}

/**
 * Worker de leads
 */
export const leadWorker = new Worker<LeadJobData>(
  'lead',
  processLeadJob,
  {
    ...redisConnection,
    concurrency: 3, // Processar 3 jobs em paralelo (operações mais pesadas)
  }
);

// Event listeners
leadWorker.on('completed', (job) => {
  console.log(`[LeadWorker] Job ${job.id} completed`);
});

leadWorker.on('failed', (job, err) => {
  console.error(`[LeadWorker] Job ${job?.id} failed:`, err.message);
});

leadWorker.on('error', (err) => {
  console.error('[LeadWorker] Error:', err);
});

console.log('[LeadWorker] Started with concurrency 3');
