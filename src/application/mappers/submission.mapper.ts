/**
 * Submission Mapper - Application Layer
 */

import { Submission as PrismaSubmission } from '@prisma/client';
import { SubmissionEntity } from '@/core/domain/entities/submission.entity';

export class SubmissionMapper {
  static toDomain(raw: PrismaSubmission): SubmissionEntity {
    return SubmissionEntity.fromPersistence({
      id: raw.id,
      organizationId: raw.organizationId,
      name: raw.name,
      email: raw.email,
      subject: raw.subject,
      message: raw.message,
      status: raw.status as any,
      ipAddress: raw.ipAddress,
      userAgent: raw.userAgent,
      metadata: raw.metadata as any,
      reviewedBy: raw.reviewedBy,
      reviewedAt: raw.reviewedAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPrisma(entity: SubmissionEntity): Omit<PrismaSubmission, 'id' | 'createdAt' | 'updatedAt'> {
    const props = entity.toObject();

    return {
      organizationId: props.organizationId,
      name: props.name,
      email: props.email,
      subject: props.subject || null,
      message: props.message,
      status: props.status,
      ipAddress: props.ipAddress || null,
      userAgent: props.userAgent || null,
      metadata: props.metadata || null,
      reviewedBy: props.reviewedBy || null,
      reviewedAt: props.reviewedAt || null,
    };
  }

  static toResponse(entity: SubmissionEntity) {
    const props = entity.toObject();

    return {
      id: props.id,
      organizationId: props.organizationId,
      name: props.name,
      email: props.email,
      subject: props.subject,
      message: props.message,
      status: props.status,
      ipAddress: props.ipAddress,
      userAgent: props.userAgent,
      metadata: props.metadata,
      reviewedBy: props.reviewedBy,
      reviewedAt: props.reviewedAt?.toISOString(),
      createdAt: props.createdAt.toISOString(),
      updatedAt: props.updatedAt.toISOString(),
    };
  }

  static toDomainList(rawList: PrismaSubmission[]): SubmissionEntity[] {
    return rawList.map((raw) => this.toDomain(raw));
  }

  static toResponseList(entities: SubmissionEntity[]) {
    return entities.map((entity) => this.toResponse(entity));
  }
}
