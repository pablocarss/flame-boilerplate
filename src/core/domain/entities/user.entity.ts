/**
 * User Entity - Domain Model
 *
 * Esta entity representa um User no domínio de negócio.
 */

export interface UserProps {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  emailVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class UserEntity {
  private constructor(private props: UserProps) {
    this.validate();
  }

  /**
   * Validações de domínio
   */
  private validate(): void {
    if (!this.props.name || this.props.name.length < 2) {
      throw new Error('User name must have at least 2 characters');
    }

    if (!this.props.email || !this.isValidEmail(this.props.email)) {
      throw new Error('User email is invalid');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Factory method para criar um novo User
   */
  static create(data: Omit<UserProps, 'id' | 'createdAt' | 'updatedAt' | 'emailVerified'>): UserEntity {
    const now = new Date();

    return new UserEntity({
      ...data,
      id: data.id || crypto.randomUUID(),
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Factory method para reconstituir um User existente do banco
   */
  static fromPersistence(data: UserProps): UserEntity {
    return new UserEntity(data);
  }

  /**
   * Regras de negócio - Atualizar nome
   */
  updateName(newName: string): void {
    if (!newName || newName.length < 2) {
      throw new Error('User name must have at least 2 characters');
    }

    this.props.name = newName;
    this.props.updatedAt = new Date();
  }

  /**
   * Regras de negócio - Atualizar avatar
   */
  updateAvatar(avatarUrl: string): void {
    this.props.avatarUrl = avatarUrl;
    this.props.updatedAt = new Date();
  }

  /**
   * Regras de negócio - Verificar email
   */
  verifyEmail(): void {
    if (this.props.emailVerified) {
      throw new Error('Email is already verified');
    }

    this.props.emailVerified = true;
    this.props.updatedAt = new Date();
  }

  /**
   * Business logic - Verificar se email está verificado
   */
  isEmailVerified(): boolean {
    return this.props.emailVerified || false;
  }

  /**
   * Getters
   */
  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): string {
    return this.props.email;
  }

  get avatarUrl(): string | null | undefined {
    return this.props.avatarUrl;
  }

  get emailVerified(): boolean {
    return this.props.emailVerified || false;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * Converter para objeto simples (para persistência)
   */
  toObject(): UserProps {
    return { ...this.props };
  }
}
