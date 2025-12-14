/**
 * Lead Repository Implementation - Infrastructure Layer
 *
 * Implementa ILeadRepository usando Prisma como ORM.
 * Esta camada conhece detalhes de infraestrutura (Prisma).
 */

import { PrismaClient } from '@prisma/client';
import { LeadEntity, LeadStatus } from '@/core/domain/entities/lead.entity';
import {
  ILeadRepository,
  LeadFilters,
  LeadPagination,
  LeadListResult,
  LeadStatusCount,
} from '@/core/domain/repositories/lead.repository.interface';
import { LeadMapper } from '@/application/mappers/lead.mapper';

export class LeadRepository implements ILeadRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<LeadEntity | null> {
    const raw = await this.prisma.lead.findUnique({
      where: { id },
    });

    return raw ? LeadMapper.toDomain(raw) : null;
  }

  async findMany(
    filters: LeadFilters,
    pagination: LeadPagination
  ): Promise<LeadListResult> {
    const where = this.buildWhereClause(filters);

    const [rawLeads, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        orderBy: {
          [pagination.sortBy || 'createdAt']: pagination.sortOrder || 'desc',
        },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      this.prisma.lead.count({ where }),
    ]);

    const leads = LeadMapper.toDomainList(rawLeads);
    const totalPages = Math.ceil(total / pagination.limit);

    return {
      leads,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages,
    };
  }

  async findAllByOrganization(organizationId: string): Promise<LeadEntity[]> {
    const rawLeads = await this.prisma.lead.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });

    return LeadMapper.toDomainList(rawLeads);
  }

  async findByStatus(organizationId: string, status: LeadStatus): Promise<LeadEntity[]> {
    const rawLeads = await this.prisma.lead.findMany({
      where: {
        organizationId,
        status,
      },
      orderBy: { createdAt: 'desc' },
    });

    return LeadMapper.toDomainList(rawLeads);
  }

  async countByStatus(organizationId: string): Promise<LeadStatusCount[]> {
    const result = await this.prisma.lead.groupBy({
      by: ['status'],
      where: { organizationId },
      _count: { status: true },
    });

    return result.map((item) => ({
      status: item.status as LeadStatus,
      count: item._count.status,
    }));
  }

  async findByAssignedTo(userId: string): Promise<LeadEntity[]> {
    const rawLeads = await this.prisma.lead.findMany({
      where: { assignedTo: userId },
      orderBy: { createdAt: 'desc' },
    });

    return LeadMapper.toDomainList(rawLeads);
  }

  async create(lead: LeadEntity): Promise<LeadEntity> {
    const data = LeadMapper.toPrisma(lead);

    const raw = await this.prisma.lead.create({
      data: {
        ...data,
        id: lead.id,
      },
    });

    return LeadMapper.toDomain(raw);
  }

  async update(lead: LeadEntity): Promise<LeadEntity> {
    const data = LeadMapper.toPrisma(lead);

    const raw = await this.prisma.lead.update({
      where: { id: lead.id },
      data,
    });

    return LeadMapper.toDomain(raw);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.lead.delete({
      where: { id },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.lead.count({
      where: { id },
    });

    return count > 0;
  }

  async findHighPriority(organizationId: string, minScore: number = 70): Promise<LeadEntity[]> {
    const rawLeads = await this.prisma.lead.findMany({
      where: {
        organizationId,
        score: { gte: minScore },
        status: { notIn: ['WON', 'LOST'] },
      },
      orderBy: { score: 'desc' },
    });

    return LeadMapper.toDomainList(rawLeads);
  }

  async findRecentlyConverted(organizationId: string, days: number = 30): Promise<LeadEntity[]> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const rawLeads = await this.prisma.lead.findMany({
      where: {
        organizationId,
        status: 'WON',
        convertedAt: { gte: dateThreshold },
      },
      orderBy: { convertedAt: 'desc' },
    });

    return LeadMapper.toDomainList(rawLeads);
  }

  async findInactive(organizationId: string, days: number = 30): Promise<LeadEntity[]> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const rawLeads = await this.prisma.lead.findMany({
      where: {
        organizationId,
        status: { notIn: ['WON', 'LOST'] },
        OR: [
          { lastContactedAt: { lt: dateThreshold } },
          { lastContactedAt: null, createdAt: { lt: dateThreshold } },
        ],
      },
      orderBy: { lastContactedAt: 'asc' },
    });

    return LeadMapper.toDomainList(rawLeads);
  }

  /**
   * Helper privado para construir cláusula WHERE do Prisma
   */
  private buildWhereClause(filters: LeadFilters) {
    const where: any = {
      organizationId: filters.organizationId,
    };

    if (filters.status) {
      where.status = Array.isArray(filters.status)
        ? { in: filters.status }
        : filters.status;
    }

    if (filters.source) {
      where.source = Array.isArray(filters.source)
        ? { in: filters.source }
        : filters.source;
    }

    if (filters.assignedTo) {
      where.assignedTo = filters.assignedTo;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { company: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = { hasSome: filters.tags };
    }

    if (filters.minValue !== undefined) {
      where.value = { ...where.value, gte: filters.minValue };
    }

    if (filters.maxValue !== undefined) {
      where.value = { ...where.value, lte: filters.maxValue };
    }

    if (filters.minScore !== undefined) {
      where.score = { ...where.score, gte: filters.minScore };
    }

    if (filters.maxScore !== undefined) {
      where.score = { ...where.score, lte: filters.maxScore };
    }

    if (filters.createdAfter) {
      where.createdAt = { ...where.createdAt, gte: filters.createdAfter };
    }

    if (filters.createdBefore) {
      where.createdAt = { ...where.createdAt, lte: filters.createdBefore };
    }

    return where;
  }
}
