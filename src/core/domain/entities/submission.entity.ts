/**
 * Submission Entity - Domain Model
 *
 * Esta entity representa uma Submission (formulário enviado) no domínio de negócio.
 */

export type SubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface SubmissionProps {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  status: SubmissionStatus;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, any> | null;
  reviewedBy?: string | null;
  reviewedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class SubmissionEntity {
  private constructor(private props: SubmissionProps) {
    this.validate();
  }

  /**
   * Validações de domínio
   */
  private validate(): void {
    if (!this.props.name || this.props.name.length < 2) {
      throw new Error('Submission name must have at least 2 characters');
    }

    if (!this.props.email || !this.isValidEmail(this.props.email)) {
      throw new Error('Submission email is invalid');
    }

    if (!this.props.message || this.props.message.length < 10) {
      throw new Error('Submission message must have at least 10 characters');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Factory method para criar uma nova Submission
   */
  static create(
    data: Omit<SubmissionProps, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'reviewedBy' | 'reviewedAt'>
  ): SubmissionEntity {
    const now = new Date();

    return new SubmissionEntity({
      ...data,
      id: data.id || crypto.randomUUID(),
      status: 'PENDING',
      reviewedBy: null,
      reviewedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Factory method para reconstituir uma Submission existente do banco
   */
  static fromPersistence(data: SubmissionProps): SubmissionEntity {
    return new SubmissionEntity(data);
  }

  /**
   * Regras de negócio - Aprovar submission
   */
  approve(reviewerId: string): void {
    if (this.props.status !== 'PENDING') {
      throw new Error('Only pending submissions can be approved');
    }

    this.props.status = 'APPROVED';
    this.props.reviewedBy = reviewerId;
    this.props.reviewedAt = new Date();
    this.props.updatedAt = new Date();
  }

  /**
   * Regras de negócio - Rejeitar submission
   */
  reject(reviewerId: string): void {
    if (this.props.status !== 'PENDING') {
      throw new Error('Only pending submissions can be rejected');
    }

    this.props.status = 'REJECTED';
    this.props.reviewedBy = reviewerId;
    this.props.reviewedAt = new Date();
    this.props.updatedAt = new Date();
  }

  /**
   * Business logic - Verificar se está pendente
   */
  isPending(): boolean {
    return this.props.status === 'PENDING';
  }

  /**
   * Business logic - Verificar se foi aprovada
   */
  isApproved(): boolean {
    return this.props.status === 'APPROVED';
  }

  /**
   * Business logic - Verificar se foi rejeitada
   */
  isRejected(): boolean {
    return this.props.status === 'REJECTED';
  }

  /**
   * Business logic - Verificar se foi revisada
   */
  isReviewed(): boolean {
    return this.props.status !== 'PENDING';
  }

  /**
   * Getters
   */
  get id(): string {
    return this.props.id;
  }

  get organizationId(): string {
    return this.props.organizationId;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): string {
    return this.props.email;
  }

  get subject(): string | null | undefined {
    return this.props.subject;
  }

  get message(): string {
    return this.props.message;
  }

  get status(): SubmissionStatus {
    return this.props.status;
  }

  get ipAddress(): string | null | undefined {
    return this.props.ipAddress;
  }

  get userAgent(): string | null | undefined {
    return this.props.userAgent;
  }

  get metadata(): Record<string, any> | null | undefined {
    return this.props.metadata;
  }

  get reviewedBy(): string | null | undefined {
    return this.props.reviewedBy;
  }

  get reviewedAt(): Date | null | undefined {
    return this.props.reviewedAt;
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
  toObject(): SubmissionProps {
    return { ...this.props };
  }
}
