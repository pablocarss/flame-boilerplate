/**
 * Lead Mapper - Application Layer
 *
 * Converte entre diferentes representações de Lead:
 * - Prisma Model ↔ Domain Entity
 * - Domain Entity ↔ DTO/Response
 */

import { Lead as PrismaLead } from '@prisma/client';
import { LeadEntity } from '@/core/domain/entities/lead.entity';

export class LeadMapper {
  /**
   * Converte de Prisma Model para Domain Entity
   */
  static toDomain(raw: PrismaLead): LeadEntity {
    return LeadEntity.fromPersistence({
      id: raw.id,
      organizationId: raw.organizationId,
      name: raw.name,
      email: raw.email,
      phone: raw.phone,
      company: raw.company,
      position: raw.position,
      status: raw.status as any, // Prisma types são compatíveis
      source: raw.source as any,
      value: raw.value ? Number(raw.value) : null,
      score: raw.score,
      notes: raw.notes,
      tags: raw.tags || [],
      assignedTo: raw.assignedTo,
      convertedAt: raw.convertedAt,
      lastContactedAt: raw.lastContactedAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  /**
   * Converte de Domain Entity para Prisma Model (para criar/atualizar)
   */
  static toPrisma(entity: LeadEntity): Omit<PrismaLead, 'id' | 'createdAt' | 'updatedAt'> {
    const props = entity.toObject();

    return {
      organizationId: props.organizationId,
      name: props.name,
      email: props.email,
      phone: props.phone || null,
      company: props.company || null,
      position: props.position || null,
      status: props.status,
      source: props.source,
      value: props.value || null,
      score: props.score || null,
      notes: props.notes || null,
      tags: props.tags || [],
      assignedTo: props.assignedTo || null,
      convertedAt: props.convertedAt || null,
      lastContactedAt: props.lastContactedAt || null,
    };
  }

  /**
   * Converte Domain Entity para Response DTO (API)
   */
  static toResponse(entity: LeadEntity) {
    const props = entity.toObject();

    return {
      id: props.id,
      organizationId: props.organizationId,
      name: props.name,
      email: props.email,
      phone: props.phone,
      company: props.company,
      position: props.position,
      status: props.status,
      source: props.source,
      value: props.value,
      score: props.score,
      notes: props.notes,
      tags: props.tags,
      assignedTo: props.assignedTo,
      convertedAt: props.convertedAt?.toISOString(),
      lastContactedAt: props.lastContactedAt?.toISOString(),
      createdAt: props.createdAt.toISOString(),
      updatedAt: props.updatedAt.toISOString(),
    };
  }

  /**
   * Converte array de Prisma para array de Entities
   */
  static toDomainList(rawList: PrismaLead[]): LeadEntity[] {
    return rawList.map((raw) => this.toDomain(raw));
  }

  /**
   * Converte array de Entities para array de Response DTOs
   */
  static toResponseList(entities: LeadEntity[]) {
    return entities.map((entity) => this.toResponse(entity));
  }
}
