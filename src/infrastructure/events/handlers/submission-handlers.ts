import {
  SubmissionCreatedEvent,
  SubmissionStatusChangedEvent,
  SubmissionApprovedEvent,
  SubmissionRejectedEvent,
} from '@/core/domain/events/submission-events';

/**
 * Handler para processar nova submission
 */
export async function handleSubmissionCreated(
  event: SubmissionCreatedEvent
): Promise<void> {
  console.log(
    `[SubmissionHandler] New submission: ${event.formType} (${event.submissionId})`
  );

  // Enviar notificação para revisores
  // await notificationService.notifyReviewers({
  //   title: 'Nova Submissão',
  //   message: `Submissão de ${event.formType} recebida`,
  //   submissionId: event.submissionId,
  // });

  // Auto-processar submissions simples
  if (event.formType === 'NEWSLETTER') {
    console.log('[SubmissionHandler] Auto-approving newsletter signup');
    // await submissionService.approve(event.submissionId, 'system');
  }

  // Enviar email de confirmação
  if (event.payload.data.email) {
    console.log('[SubmissionHandler] Sending confirmation email');
    // await emailService.sendSubmissionConfirmation({
    //   to: event.payload.data.email,
    //   formType: event.formType,
    // });
  }
}

/**
 * Handler para mudança de status
 */
export async function handleSubmissionStatusChanged(
  event: SubmissionStatusChangedEvent
): Promise<void> {
  console.log(
    `[SubmissionHandler] Status changed: ${event.previousStatus} -> ${event.newStatus}`
  );

  // Log de auditoria
  // await auditLog.create({
  //   entity: 'Submission',
  //   entityId: event.submissionId,
  //   action: 'STATUS_CHANGED',
  //   changes: {
  //     from: event.previousStatus,
  //     to: event.newStatus,
  //   },
  //   userId: event.metadata?.userId,
  //   notes: event.metadata?.notes,
  // });
}

/**
 * Handler para submission aprovada
 */
export async function handleSubmissionApproved(
  event: SubmissionApprovedEvent
): Promise<void> {
  console.log(
    `[SubmissionHandler] Submission approved: ${event.submissionId}`
  );

  // Processar ações pós-aprovação
  // switch (formType) {
  //   case 'CONTACT':
  //     await leadService.createFromSubmission(event.submissionId);
  //     break;
  //   case 'PARTNERSHIP':
  //     await partnerService.createFromSubmission(event.submissionId);
  //     break;
  // }

  // Notificar o usuário
  // await notificationService.create({
  //   userId: event.payload.userId,
  //   title: 'Submissão Aprovada',
  //   message: 'Sua submissão foi aprovada!',
  // });
}

/**
 * Handler para submission rejeitada
 */
export async function handleSubmissionRejected(
  event: SubmissionRejectedEvent
): Promise<void> {
  console.log(
    `[SubmissionHandler] Submission rejected: ${event.submissionId}`
  );

  // Notificar o usuário
  // await notificationService.create({
  //   userId: event.payload.userId,
  //   title: 'Submissão Rejeitada',
  //   message: event.reason || 'Sua submissão foi rejeitada',
  // });

  // Enviar email explicativo
  // await emailService.sendRejectionEmail({
  //   submissionId: event.submissionId,
  //   reason: event.reason,
  // });
}
