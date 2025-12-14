import {
  LeadCreatedEvent,
  LeadStatusChangedEvent,
  LeadConvertedEvent,
  LeadDeletedEvent,
} from '@/core/domain/events/lead-events';
import { sendLeadNotificationJob } from '../../jobs/jobs/send-lead-notification.job';
import { enrichLeadDataJob, calculateLeadScoreJob } from '../../jobs/jobs/enrich-lead.job';
import { addNotificationJob } from '../../jobs/queues/notification-queue';
import { NotificationJobType } from '../../jobs/queues/notification-queue';

/**
 * Handler para enviar notificação quando um lead é criado
 */
export async function handleLeadCreated(event: LeadCreatedEvent): Promise<void> {
  console.log(`[LeadHandler] New lead created: ${event.name} (${event.email})`);

  try {
    // Envia notificação em-app para o usuário responsável
    if (event.payload.assignedTo) {
      await addNotificationJob({
        type: NotificationJobType.CREATE_NOTIFICATION,
        userId: event.payload.assignedTo,
        title: 'Novo Lead',
        message: `Lead ${event.name} foi criado e atribuído a você`,
        actionUrl: `/dashboard/leads/${event.leadId}`,
        notificationType: 'INFO',
      });
    }

    // Envia email de notificação para gestores
    // TODO: Buscar email do gestor do banco de dados
    // const managerEmail = await getOrganizationManagerEmail(event.organizationId);
    // if (managerEmail) {
    //   await sendLeadNotificationJob(managerEmail, {
    //     leadName: event.name,
    //     leadEmail: event.email,
    //     source: event.source,
    //   });
    // }

    // Enriquece dados do lead (baixa prioridade, delay de 10 segundos)
    await enrichLeadDataJob(event.leadId, event.organizationId, {
      delay: 10000,
      priority: 5,
    });

    // Calcula score do lead
    await calculateLeadScoreJob(event.leadId, event.organizationId);
  } catch (error) {
    console.error('[LeadHandler] Error in handleLeadCreated:', error);
    // Não propagamos o erro para não quebrar outros handlers
  }
}

/**
 * Handler para registrar mudanças de status
 */
export async function handleLeadStatusChanged(
  event: LeadStatusChangedEvent
): Promise<void> {
  console.log(
    `[LeadHandler] Lead status changed: ${event.previousStatus} -> ${event.newStatus}`
  );

  // Log de auditoria
  // await auditLog.create({
  //   entity: 'Lead',
  //   entityId: event.leadId,
  //   action: 'STATUS_CHANGED',
  //   changes: {
  //     from: event.previousStatus,
  //     to: event.newStatus,
  //   },
  //   userId: event.metadata?.userId,
  // });

  // Notificação para gestor se lead foi convertido
  if (event.isConversion) {
    console.log(`[LeadHandler] 🎉 Lead converted to customer!`);
    // await notificationService.notifyManagers({
    //   title: 'Lead Convertido!',
    //   message: `Lead foi convertido em cliente`,
    // });
  }

  // Notificação se lead foi perdido
  if (event.isLoss) {
    console.log(`[LeadHandler] ❌ Lead lost`);
    // await analyticsService.trackLostLead({
    //   leadId: event.leadId,
    //   reason: event.metadata?.reason,
    // });
  }
}

/**
 * Handler para processar conversão de lead
 */
export async function handleLeadConverted(
  event: LeadConvertedEvent
): Promise<void> {
  console.log(
    `[LeadHandler] Lead converted! Value: R$ ${event.convertedValue || 0}`
  );

  try {
    // Atualizar métricas de vendas
    // TODO: Implementar serviço de métricas
    // await metricsService.incrementConversions({
    //   organizationId: event.organizationId,
    //   value: event.convertedValue,
    // });

    // Notificar equipe sobre a conversão
    if (event.payload.assignedTo) {
      await addNotificationJob({
        type: NotificationJobType.CREATE_NOTIFICATION,
        userId: event.payload.assignedTo,
        title: '🎉 Lead Convertido!',
        message: `Lead ${event.payload.leadName} foi convertido com sucesso!`,
        actionUrl: `/dashboard/leads/${event.leadId}`,
        notificationType: 'SUCCESS',
      });
    }

    // Sincronizar com CRM
    // TODO: Descomentar quando CRM estiver configurado
    // await syncLeadToCRMJob(event.leadId, event.organizationId, {
    //   status: 'CUSTOMER',
    //   convertedValue: event.convertedValue,
    // });

    // Disparar email de boas-vindas
    // TODO: Buscar email do lead e enviar boas-vindas
    // const lead = await prisma.lead.findUnique({ where: { id: event.leadId } });
    // if (lead?.email) {
    //   await sendWelcomeEmailJob(lead.email, {
    //     name: lead.name,
    //   });
    // }
  } catch (error) {
    console.error('[LeadHandler] Error in handleLeadConverted:', error);
  }
}

/**
 * Handler para limpar dados quando lead é deletado
 */
export async function handleLeadDeleted(
  event: LeadDeletedEvent
): Promise<void> {
  console.log(`[LeadHandler] Lead deleted: ${event.leadId}`);

  // Log de auditoria
  // await auditLog.create({
  //   entity: 'Lead',
  //   entityId: event.leadId,
  //   action: 'DELETED',
  //   userId: event.metadata?.userId,
  //   reason: event.metadata?.reason,
  // });

  // Limpar dados relacionados (se necessário)
  // await leadActivityService.deleteByLeadId(event.leadId);
  // await leadNotesService.deleteByLeadId(event.leadId);
}

/**
 * Handler para analytics de leads
 */
export async function handleLeadAnalytics(
  event: LeadCreatedEvent | LeadStatusChangedEvent | LeadConvertedEvent
): Promise<void> {
  console.log(`[Analytics] Processing event: ${event.type}`);

  // Enviar para serviço de analytics
  // await analyticsService.track({
  //   event: event.type,
  //   properties: event.payload,
  //   timestamp: event.occurredAt,
  // });
}
