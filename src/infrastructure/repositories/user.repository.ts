/**
 * User Repository Implementation - Infrastructure Layer
 */

import { PrismaClient } from '@prisma/client';
import { UserEntity } from '@/core/domain/entities/user.entity';
import { IUserRepository } from '@/core/domain/repositories/user.repository.interface';
import { UserMapper } from '@/application/mappers/user.mapper';

export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<UserEntity | null> {
    const raw = await this.prisma.user.findUnique({
      where: { id },
    });

    return raw ? UserMapper.toDomain(raw) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const raw = await this.prisma.user.findUnique({
      where: { email },
    });

    return raw ? UserMapper.toDomain(raw) : null;
  }

  async create(user: UserEntity): Promise<UserEntity> {
    const data = UserMapper.toPrisma(user);

    const raw = await this.prisma.user.create({
      data: {
        ...data,
        id: user.id,
      },
    });

    return UserMapper.toDomain(raw);
  }

  async update(user: UserEntity): Promise<UserEntity> {
    const data = UserMapper.toPrisma(user);

    const raw = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        name: data.name,
        avatarUrl: data.avatarUrl,
        emailVerified: data.emailVerified,
      },
    });

    return UserMapper.toDomain(raw);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { id },
    });

    return count > 0;
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email },
    });

    return count > 0;
  }
}
