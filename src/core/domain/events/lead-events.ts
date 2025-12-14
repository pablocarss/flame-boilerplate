import { BaseDomainEvent } from './base.event';

/**
 * Evento disparado quando um novo lead é criado
 */
export class LeadCreatedEvent extends BaseDomainEvent {
  constructor(
    payload: {
      leadId: string;
      organizationId: string;
      name: string;
      email: string;
      status: string;
      source: string;
      value?: number;
      assignedTo?: string;
    },
    metadata?: {
      userId?: string;
      ipAddress?: string;
      userAgent?: string;
    }
  ) {
    super('LeadCreated', payload, metadata);
  }

  get leadId(): string {
    return this.payload.leadId;
  }

  get organizationId(): string {
    return this.payload.organizationId;
  }

  get name(): string {
    return this.payload.name;
  }

  get email(): string {
    return this.payload.email;
  }
}

/**
 * Evento disparado quando o status de um lead muda
 */
export class LeadStatusChangedEvent extends BaseDomainEvent {
  constructor(
    payload: {
      leadId: string;
      organizationId: string;
      previousStatus: string;
      newStatus: string;
      changedBy?: string;
    },
    metadata?: {
      userId?: string;
      reason?: string;
    }
  ) {
    super('LeadStatusChanged', payload, metadata);
  }

  get leadId(): string {
    return this.payload.leadId;
  }

  get previousStatus(): string {
    return this.payload.previousStatus;
  }

  get newStatus(): string {
    return this.payload.newStatus;
  }

  get isConversion(): boolean {
    return this.payload.newStatus === 'WON';
  }

  get isLoss(): boolean {
    return this.payload.newStatus === 'LOST';
  }
}

/**
 * Evento disparado quando um lead é atualizado
 */
export class LeadUpdatedEvent extends BaseDomainEvent {
  constructor(
    payload: {
      leadId: string;
      organizationId: string;
      updatedFields: string[];
      updatedBy?: string;
    },
    metadata?: {
      userId?: string;
      changes?: Record<string, { old: any; new: any }>;
    }
  ) {
    super('LeadUpdated', payload, metadata);
  }

  get leadId(): string {
    return this.payload.leadId;
  }

  get updatedFields(): string[] {
    return this.payload.updatedFields;
  }
}

/**
 * Evento disparado quando um lead é deletado
 */
export class LeadDeletedEvent extends BaseDomainEvent {
  constructor(
    payload: {
      leadId: string;
      organizationId: string;
      deletedBy?: string;
    },
    metadata?: {
      userId?: string;
      reason?: string;
    }
  ) {
    super('LeadDeleted', payload, metadata);
  }

  get leadId(): string {
    return this.payload.leadId;
  }
}

/**
 * Evento disparado quando um lead é convertido em cliente
 */
export class LeadConvertedEvent extends BaseDomainEvent {
  constructor(
    payload: {
      leadId: string;
      organizationId: string;
      convertedValue?: number;
      convertedBy?: string;
    },
    metadata?: {
      userId?: string;
      customerId?: string;
    }
  ) {
    super('LeadConverted', payload, metadata);
  }

  get leadId(): string {
    return this.payload.leadId;
  }

  get convertedValue(): number | undefined {
    return this.payload.convertedValue;
  }
}

/**
 * Evento disparado quando um lead é atribuído a um usuário
 */
export class LeadAssignedEvent extends BaseDomainEvent {
  constructor(
    payload: {
      leadId: string;
      organizationId: string;
      assignedTo: string;
      assignedBy?: string;
      previousAssignee?: string;
    },
    metadata?: {
      userId?: string;
    }
  ) {
    super('LeadAssigned', payload, metadata);
  }

  get leadId(): string {
    return this.payload.leadId;
  }

  get assignedTo(): string {
    return this.payload.assignedTo;
  }

  get previousAssignee(): string | undefined {
    return this.payload.previousAssignee;
  }
}
