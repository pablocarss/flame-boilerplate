import { getEventBus } from './event-bus';
import {
  handleLeadCreated,
  handleLeadStatusChanged,
  handleLeadConverted,
  handleLeadDeleted,
  handleLeadAnalytics,
} from './handlers/lead-handlers';
import {
  handleSubmissionCreated,
  handleSubmissionStatusChanged,
  handleSubmissionApproved,
  handleSubmissionRejected,
} from './handlers/submission-handlers';

/**
 * Registra todos os event handlers no EventBus
 */
export function registerEventHandlers(): void {
  const eventBus = getEventBus();

  // Lead Events
  eventBus.on('LeadCreated', handleLeadCreated);
  eventBus.on('LeadCreated', handleLeadAnalytics);
  eventBus.on('LeadStatusChanged', handleLeadStatusChanged);
  eventBus.on('LeadStatusChanged', handleLeadAnalytics);
  eventBus.on('LeadConverted', handleLeadConverted);
  eventBus.on('LeadConverted', handleLeadAnalytics);
  eventBus.on('LeadDeleted', handleLeadDeleted);

  // Submission Events
  eventBus.on('SubmissionCreated', handleSubmissionCreated);
  eventBus.on('SubmissionStatusChanged', handleSubmissionStatusChanged);
  eventBus.on('SubmissionApproved', handleSubmissionApproved);
  eventBus.on('SubmissionRejected', handleSubmissionRejected);

  console.log('[EventBus] All event handlers registered');
  console.log('[EventBus] Stats:', eventBus.getStats());
}
