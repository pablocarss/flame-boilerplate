/**
 * Lead Repository Interface - Domain Layer
 *
 * Define o contrato que qualquer implementação de repositório de Lead deve seguir.
 * Esta interface pertence ao domínio e não conhece detalhes de infraestrutura.
 */

import { LeadEntity, LeadStatus, LeadSource } from '../entities/lead.entity';

export interface LeadFilters {
  organizationId: string;
  status?: LeadStatus | LeadStatus[];
  source?: LeadSource | LeadSource[];
  assignedTo?: string;
  search?: string; // Busca por name, email, company
  tags?: string[];
  minValue?: number;
  maxValue?: number;
  minScore?: number;
  maxScore?: number;
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface LeadPagination {
  page: number;
  limit: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'value' | 'score';
  sortOrder?: 'asc' | 'desc';
}

export interface LeadListResult {
  leads: LeadEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LeadStatusCount {
  status: LeadStatus;
  count: number;
}

export interface ILeadRepository {
  /**
   * Buscar lead por ID
   */
  findById(id: string): Promise<LeadEntity | null>;

  /**
   * Buscar leads com filtros e paginação
   */
  findMany(filters: LeadFilters, pagination: LeadPagination): Promise<LeadListResult>;

  /**
   * Buscar todos os leads de uma organização (sem paginação)
   */
  findAllByOrganization(organizationId: string): Promise<LeadEntity[]>;

  /**
   * Buscar leads por status
   */
  findByStatus(organizationId: string, status: LeadStatus): Promise<LeadEntity[]>;

  /**
   * Contar leads por status (para o Kanban)
   */
  countByStatus(organizationId: string): Promise<LeadStatusCount[]>;

  /**
   * Buscar leads atribuídos a um usuário
   */
  findByAssignedTo(userId: string): Promise<LeadEntity[]>;

  /**
   * Criar um novo lead
   */
  create(lead: LeadEntity): Promise<LeadEntity>;

  /**
   * Atualizar um lead existente
   */
  update(lead: LeadEntity): Promise<LeadEntity>;

  /**
   * Deletar um lead
   */
  delete(id: string): Promise<void>;

  /**
   * Verificar se um lead existe
   */
  exists(id: string): Promise<boolean>;

  /**
   * Buscar leads com alto score (prioridade)
   */
  findHighPriority(organizationId: string, minScore?: number): Promise<LeadEntity[]>;

  /**
   * Buscar leads convertidos recentemente
   */
  findRecentlyConverted(organizationId: string, days?: number): Promise<LeadEntity[]>;

  /**
   * Buscar leads inativos (sem contato há muito tempo)
   */
  findInactive(organizationId: string, days?: number): Promise<LeadEntity[]>;
}
