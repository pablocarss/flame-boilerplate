/**
 * List Leads Use Case - Application Layer
 *
 * Orquestra a listagem de leads com filtros e paginação
 */

import {
  ILeadRepository,
  LeadFilters,
  LeadPagination,
  LeadListResult,
} from '@/core/domain/repositories/lead.repository.interface';
import { LeadStatus, LeadSource } from '@/core/domain/entities/lead.entity';

export interface ListLeadsInput {
  organizationId: string;
  status?: LeadStatus | LeadStatus[];
  source?: LeadSource | LeadSource[];
  assignedTo?: string;
  search?: string;
  tags?: string[];
  minValue?: number;
  maxValue?: number;
  minScore?: number;
  maxScore?: number;
  createdAfter?: Date;
  createdBefore?: Date;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'value' | 'score';
  sortOrder?: 'asc' | 'desc';
}

export type ListLeadsOutput = LeadListResult;

export class ListLeadsUseCase {
  constructor(private leadRepository: ILeadRepository) {}

  async execute(input: ListLeadsInput): Promise<ListLeadsOutput> {
    const filters: LeadFilters = {
      organizationId: input.organizationId,
      status: input.status,
      source: input.source,
      assignedTo: input.assignedTo,
      search: input.search,
      tags: input.tags,
      minValue: input.minValue,
      maxValue: input.maxValue,
      minScore: input.minScore,
      maxScore: input.maxScore,
      createdAfter: input.createdAfter,
      createdBefore: input.createdBefore,
    };

    const pagination: LeadPagination = {
      page: input.page || 1,
      limit: input.limit || 50,
      sortBy: input.sortBy || 'createdAt',
      sortOrder: input.sortOrder || 'desc',
    };

    return await this.leadRepository.findMany(filters, pagination);
  }
}
