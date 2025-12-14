import { BaseDomainEvent } from './base.event';

/**
 * Evento disparado quando uma nova submission é criada
 */
export class SubmissionCreatedEvent extends BaseDomainEvent {
  constructor(
    payload: {
      submissionId: string;
      organizationId: string;
      userId: string;
      formType: string;
      status: string;
      data: Record<string, any>;
    },
    metadata?: {
      ipAddress?: string;
      userAgent?: string;
      source?: string;
    }
  ) {
    super('SubmissionCreated', payload, metadata);
  }

  get submissionId(): string {
    return this.payload.submissionId;
  }

  get organizationId(): string {
    return this.payload.organizationId;
  }

  get formType(): string {
    return this.payload.formType;
  }
}

/**
 * Evento disparado quando o status de uma submission muda
 */
export class SubmissionStatusChangedEvent extends BaseDomainEvent {
  constructor(
    payload: {
      submissionId: string;
      organizationId: string;
      previousStatus: string;
      newStatus: string;
      reviewedBy?: string;
    },
    metadata?: {
      userId?: string;
      notes?: string;
    }
  ) {
    super('SubmissionStatusChanged', payload, metadata);
  }

  get submissionId(): string {
    return this.payload.submissionId;
  }

  get previousStatus(): string {
    return this.payload.previousStatus;
  }

  get newStatus(): string {
    return this.payload.newStatus;
  }

  get isApproved(): boolean {
    return this.payload.newStatus === 'APPROVED';
  }

  get isRejected(): boolean {
    return this.payload.newStatus === 'REJECTED';
  }
}

/**
 * Evento disparado quando uma submission é aprovada
 */
export class SubmissionApprovedEvent extends BaseDomainEvent {
  constructor(
    payload: {
      submissionId: string;
      organizationId: string;
      approvedBy: string;
    },
    metadata?: {
      userId?: string;
      notes?: string;
    }
  ) {
    super('SubmissionApproved', payload, metadata);
  }

  get submissionId(): string {
    return this.payload.submissionId;
  }

  get approvedBy(): string {
    return this.payload.approvedBy;
  }
}

/**
 * Evento disparado quando uma submission é rejeitada
 */
export class SubmissionRejectedEvent extends BaseDomainEvent {
  constructor(
    payload: {
      submissionId: string;
      organizationId: string;
      rejectedBy: string;
      reason?: string;
    },
    metadata?: {
      userId?: string;
    }
  ) {
    super('SubmissionRejected', payload, metadata);
  }

  get submissionId(): string {
    return this.payload.submissionId;
  }

  get rejectedBy(): string {
    return this.payload.rejectedBy;
  }

  get reason(): string | undefined {
    return this.payload.reason;
  }
}
