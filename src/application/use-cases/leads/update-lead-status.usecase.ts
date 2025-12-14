/**
 * Update Lead Status Use Case - Application Layer
 *
 * Atualiza o status de um lead (usado no Kanban drag-and-drop)
 */

import { LeadEntity, LeadStatus } from '@/core/domain/entities/lead.entity';
import { ILeadRepository } from '@/core/domain/repositories/lead.repository.interface';
import { getEventBus } from '@/infrastructure/events/event-bus';
import { LeadStatusChangedEvent, LeadConvertedEvent } from '@/core/domain/events/lead-events';

export interface UpdateLeadStatusInput {
  leadId: string;
  newStatus: LeadStatus;
}

export interface UpdateLeadStatusOutput {
  lead: LeadEntity;
}

export class UpdateLeadStatusUseCase {
  constructor(private leadRepository: ILeadRepository) {}

  async execute(input: UpdateLeadStatusInput): Promise<UpdateLeadStatusOutput> {
    // 1. Buscar lead existente
    const lead = await this.leadRepository.findById(input.leadId);

    if (!lead) {
      throw new Error('Lead not found');
    }

    const previousStatus = lead.status;

    // 2. Atualizar status (regras de negócio na Entity)
    lead.updateStatus(input.newStatus);

    // 3. Persistir alteração
    const updatedLead = await this.leadRepository.update(lead);

    // 4. Disparar eventos
    const eventBus = getEventBus();

    await eventBus.emit(
      new LeadStatusChangedEvent({
        leadId: updatedLead.id,
        organizationId: updatedLead.organizationId,
        previousStatus,
        newStatus: updatedLead.status,
      })
    );

    // Evento especial se foi convertido
    if (updatedLead.status === 'WON') {
      await eventBus.emit(
        new LeadConvertedEvent({
          leadId: updatedLead.id,
          organizationId: updatedLead.organizationId,
          convertedValue: updatedLead.value || 0,
          assignedTo: updatedLead.assignedTo,
          leadName: updatedLead.name,
        })
      );
    }

    return { lead: updatedLead };
  }
}
