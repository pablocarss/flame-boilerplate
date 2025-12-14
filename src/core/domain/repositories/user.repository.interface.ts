/**
 * User Repository Interface - Domain Layer
 */

import { UserEntity } from '../entities/user.entity';

export interface IUserRepository {
  /**
   * Buscar user por ID
   */
  findById(id: string): Promise<UserEntity | null>;

  /**
   * Buscar user por email
   */
  findByEmail(email: string): Promise<UserEntity | null>;

  /**
   * Criar um novo user
   */
  create(user: UserEntity): Promise<UserEntity>;

  /**
   * Atualizar um user existente
   */
  update(user: UserEntity): Promise<UserEntity>;

  /**
   * Deletar um user
   */
  delete(id: string): Promise<void>;

  /**
   * Verificar se um user existe por ID
   */
  exists(id: string): Promise<boolean>;

  /**
   * Verificar se um email já está em uso
   */
  emailExists(email: string): Promise<boolean>;
}
