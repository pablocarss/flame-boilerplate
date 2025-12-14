/**
 * User Mapper - Application Layer
 */

import { User as PrismaUser } from '@prisma/client';
import { UserEntity } from '@/core/domain/entities/user.entity';

export class UserMapper {
  static toDomain(raw: PrismaUser): UserEntity {
    return UserEntity.fromPersistence({
      id: raw.id,
      name: raw.name,
      email: raw.email,
      avatarUrl: raw.avatarUrl,
      emailVerified: raw.emailVerified || false,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPrisma(entity: UserEntity): Omit<PrismaUser, 'id' | 'password' | 'createdAt' | 'updatedAt'> {
    const props = entity.toObject();

    return {
      name: props.name,
      email: props.email,
      avatarUrl: props.avatarUrl || null,
      emailVerified: props.emailVerified || false,
      password: '', // Password is handled separately in auth
    };
  }

  static toResponse(entity: UserEntity) {
    const props = entity.toObject();

    return {
      id: props.id,
      name: props.name,
      email: props.email,
      avatarUrl: props.avatarUrl,
      emailVerified: props.emailVerified,
      createdAt: props.createdAt.toISOString(),
      updatedAt: props.updatedAt.toISOString(),
    };
  }

  static toDomainList(rawList: PrismaUser[]): UserEntity[] {
    return rawList.map((raw) => this.toDomain(raw));
  }

  static toResponseList(entities: UserEntity[]) {
    return entities.map((entity) => this.toResponse(entity));
  }
}
