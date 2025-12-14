/**
 * Submission Repository Interface - Domain Layer
 */

import { SubmissionEntity, SubmissionStatus } from '../entities/submission.entity';

export interface SubmissionFilters {
  organizationId: string;
  status?: SubmissionStatus | SubmissionStatus[];
  search?: string; // Busca por name, email, subject
  reviewedBy?: string;
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface SubmissionPagination {
  page: number;
  limit: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface SubmissionListResult {
  submissions: SubmissionEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SubmissionStatusCount {
  status: SubmissionStatus;
  count: number;
}

export interface ISubmissionRepository {
  /**
   * Buscar submission por ID
   */
  findById(id: string): Promise<SubmissionEntity | null>;

  /**
   * Buscar submissions com filtros e paginação
   */
  findMany(filters: SubmissionFilters, pagination: SubmissionPagination): Promise<SubmissionListResult>;

  /**
   * Buscar todas as submissions de uma organização
   */
  findAllByOrganization(organizationId: string): Promise<SubmissionEntity[]>;

  /**
   * Buscar submissions por status
   */
  findByStatus(organizationId: string, status: SubmissionStatus): Promise<SubmissionEntity[]>;

  /**
   * Contar submissions por status
   */
  countByStatus(organizationId: string): Promise<SubmissionStatusCount[]>;

  /**
   * Criar uma nova submission
   */
  create(submission: SubmissionEntity): Promise<SubmissionEntity>;

  /**
   * Atualizar uma submission existente
   */
  update(submission: SubmissionEntity): Promise<SubmissionEntity>;

  /**
   * Deletar uma submission
   */
  delete(id: string): Promise<void>;

  /**
   * Verificar se uma submission existe
   */
  exists(id: string): Promise<boolean>;

  /**
   * Buscar submissions pendentes
   */
  findPending(organizationId: string): Promise<SubmissionEntity[]>;
}
