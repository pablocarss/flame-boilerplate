/**
 * Create Lead Use Case - Application Layer
 *
 * Orquestra a criação de um novo lead:
 * 1. Valida os dados de entrada
 * 2. Cria a Entity com regras de negócio
 * 3. Persiste via Repository
 * 4. Dispara eventos de domínio
 */

import { LeadEntity, LeadSource, LeadStatus } from '@/core/domain/entities/lead.entity';
import { ILeadRepository } from '@/core/domain/repositories/lead.repository.interface';
import { getEventBus } from '@/infrastructure/events/event-bus';
import { LeadCreatedEvent } from '@/core/domain/events/lead-events';

export interface CreateLeadInput {
  organizationId: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  status?: LeadStatus;
  source?: LeadSource;
  value?: number;
  notes?: string;
  tags?: string[];
  assignedTo?: string;
}

export interface CreateLeadOutput {
  lead: LeadEntity;
}

export class CreateLeadUseCase {
  constructor(private leadRepository: ILeadRepository) {}

  async execute(input: CreateLeadInput): Promise<CreateLeadOutput> {
    // 1. Criar Entity com regras de negócio
    const lead = LeadEntity.create({
      organizationId: input.organizationId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      company: input.company,
      position: input.position,
      status: input.status || 'NEW',
      source: input.source || 'WEBSITE',
      value: input.value,
      notes: input.notes,
      tags: input.tags,
      assignedTo: input.assignedTo,
    });

    // 2. Persistir via Repository
    const savedLead = await this.leadRepository.create(lead);

    // 3. Disparar evento de domínio
    const eventBus = getEventBus();
    await eventBus.emit(
      new LeadCreatedEvent(
        {
          leadId: savedLead.id,
          organizationId: savedLead.organizationId,
          name: savedLead.name,
          email: savedLead.email,
          status: savedLead.status,
          source: savedLead.source,
          assignedTo: savedLead.assignedTo,
        },
        {
          // metadata
        }
      )
    );

    return { lead: savedLead };
  }
}
