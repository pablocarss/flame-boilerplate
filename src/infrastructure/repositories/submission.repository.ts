/**
 * Submission Repository Implementation - Infrastructure Layer
 */

import { PrismaClient } from '@prisma/client';
import { SubmissionEntity, SubmissionStatus } from '@/core/domain/entities/submission.entity';
import {
  ISubmissionRepository,
  SubmissionFilters,
  SubmissionPagination,
  SubmissionListResult,
  SubmissionStatusCount,
} from '@/core/domain/repositories/submission.repository.interface';
import { SubmissionMapper } from '@/application/mappers/submission.mapper';

export class SubmissionRepository implements ISubmissionRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<SubmissionEntity | null> {
    const raw = await this.prisma.submission.findUnique({
      where: { id },
    });

    return raw ? SubmissionMapper.toDomain(raw) : null;
  }

  async findMany(
    filters: SubmissionFilters,
    pagination: SubmissionPagination
  ): Promise<SubmissionListResult> {
    const where = this.buildWhereClause(filters);

    const [rawSubmissions, total] = await Promise.all([
      this.prisma.submission.findMany({
        where,
        orderBy: {
          [pagination.sortBy || 'createdAt']: pagination.sortOrder || 'desc',
        },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      this.prisma.submission.count({ where }),
    ]);

    const submissions = SubmissionMapper.toDomainList(rawSubmissions);
    const totalPages = Math.ceil(total / pagination.limit);

    return {
      submissions,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages,
    };
  }

  async findAllByOrganization(organizationId: string): Promise<SubmissionEntity[]> {
    const rawSubmissions = await this.prisma.submission.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });

    return SubmissionMapper.toDomainList(rawSubmissions);
  }

  async findByStatus(organizationId: string, status: SubmissionStatus): Promise<SubmissionEntity[]> {
    const rawSubmissions = await this.prisma.submission.findMany({
      where: {
        organizationId,
        status,
      },
      orderBy: { createdAt: 'desc' },
    });

    return SubmissionMapper.toDomainList(rawSubmissions);
  }

  async countByStatus(organizationId: string): Promise<SubmissionStatusCount[]> {
    const result = await this.prisma.submission.groupBy({
      by: ['status'],
      where: { organizationId },
      _count: { status: true },
    });

    return result.map((item) => ({
      status: item.status as SubmissionStatus,
      count: item._count.status,
    }));
  }

  async create(submission: SubmissionEntity): Promise<SubmissionEntity> {
    const data = SubmissionMapper.toPrisma(submission);

    const raw = await this.prisma.submission.create({
      data: {
        ...data,
        id: submission.id,
      },
    });

    return SubmissionMapper.toDomain(raw);
  }

  async update(submission: SubmissionEntity): Promise<SubmissionEntity> {
    const data = SubmissionMapper.toPrisma(submission);

    const raw = await this.prisma.submission.update({
      where: { id: submission.id },
      data,
    });

    return SubmissionMapper.toDomain(raw);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.submission.delete({
      where: { id },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.submission.count({
      where: { id },
    });

    return count > 0;
  }

  async findPending(organizationId: string): Promise<SubmissionEntity[]> {
    const rawSubmissions = await this.prisma.submission.findMany({
      where: {
        organizationId,
        status: 'PENDING',
      },
      orderBy: { createdAt: 'desc' },
    });

    return SubmissionMapper.toDomainList(rawSubmissions);
  }

  private buildWhereClause(filters: SubmissionFilters) {
    const where: any = {
      organizationId: filters.organizationId,
    };

    if (filters.status) {
      where.status = Array.isArray(filters.status)
        ? { in: filters.status }
        : filters.status;
    }

    if (filters.reviewedBy) {
      where.reviewedBy = filters.reviewedBy;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { subject: { contains: filters.search, mode: 'insensitive' } },
      ];
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
