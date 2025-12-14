/**
 * Lead Entity - Domain Model
 *
 * Esta entity representa um Lead no domínio de negócio.
 * Contém as regras de negócio e validações específicas de um Lead.
 */

export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';
export type LeadSource = 'WEBSITE' | 'REFERRAL' | 'SOCIAL_MEDIA' | 'EMAIL' | 'PHONE' | 'OTHER';

export interface LeadProps {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  position?: string | null;
  status: LeadStatus;
  source: LeadSource;
  value?: number | null;
  score?: number | null;
  notes?: string | null;
  tags?: string[];
  assignedTo?: string | null;
  convertedAt?: Date | null;
  lastContactedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class LeadEntity {
  private constructor(private props: LeadProps) {
    this.validate();
  }

  /**
   * Validações de domínio
   */
  private validate(): void {
    if (!this.props.name || this.props.name.length < 2) {
      throw new Error('Lead name must have at least 2 characters');
    }

    if (!this.props.email || !this.isValidEmail(this.props.email)) {
      throw new Error('Lead email is invalid');
    }

    if (this.props.value !== null && this.props.value !== undefined && this.props.value < 0) {
      throw new Error('Lead value cannot be negative');
    }

    if (this.props.score !== null && this.props.score !== undefined) {
      if (this.props.score < 0 || this.props.score > 100) {
        throw new Error('Lead score must be between 0 and 100');
      }
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Factory method para criar um novo Lead
   */
  static create(data: Omit<LeadProps, 'id' | 'createdAt' | 'updatedAt' | 'convertedAt' | 'score'>): LeadEntity {
    const now = new Date();

    return new LeadEntity({
      ...data,
      id: data.id || crypto.randomUUID(),
      score: 0,
      convertedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Factory method para reconstituir um Lead existente do banco
   */
  static fromPersistence(data: LeadProps): LeadEntity {
    return new LeadEntity(data);
  }

  /**
   * Regras de negócio - Marcar como convertido
   */
  markAsConverted(): void {
    if (this.props.status === 'WON') {
      throw new Error('Lead is already converted');
    }

    if (this.props.status === 'LOST') {
      throw new Error('Cannot convert a lost lead');
    }

    this.props.status = 'WON';
    this.props.convertedAt = new Date();
    this.props.updatedAt = new Date();
  }

  /**
   * Regras de negócio - Marcar como perdido
   */
  markAsLost(): void {
    if (this.props.status === 'LOST') {
      throw new Error('Lead is already lost');
    }

    if (this.props.status === 'WON') {
      throw new Error('Cannot mark a converted lead as lost');
    }

    this.props.status = 'LOST';
    this.props.updatedAt = new Date();
  }

  /**
   * Regras de negócio - Atualizar status
   */
  updateStatus(newStatus: LeadStatus): void {
    // Não pode voltar de WON para outro status
    if (this.props.status === 'WON' && newStatus !== 'WON') {
      throw new Error('Cannot change status of a converted lead');
    }

    // Não pode voltar de LOST para outro status (exceto para reativar)
    if (this.props.status === 'LOST' && newStatus !== 'LOST' && newStatus !== 'NEW') {
      throw new Error('Can only reactivate a lost lead to NEW status');
    }

    this.props.status = newStatus;
    this.props.updatedAt = new Date();

    if (newStatus === 'WON') {
      this.props.convertedAt = new Date();
    }
  }

  /**
   * Regras de negócio - Atribuir a um usuário
   */
  assignTo(userId: string): void {
    this.props.assignedTo = userId;
    this.props.updatedAt = new Date();
  }

  /**
   * Regras de negócio - Atualizar score
   */
  updateScore(score: number): void {
    if (score < 0 || score > 100) {
      throw new Error('Score must be between 0 and 100');
    }

    this.props.score = score;
    this.props.updatedAt = new Date();
  }

  /**
   * Regras de negócio - Registrar contato
   */
  registerContact(): void {
    this.props.lastContactedAt = new Date();
    this.props.updatedAt = new Date();

    // Auto-atualizar status se ainda estiver NEW
    if (this.props.status === 'NEW') {
      this.props.status = 'CONTACTED';
    }
  }

  /**
   * Regras de negócio - Adicionar tags
   */
  addTags(tags: string[]): void {
    const currentTags = this.props.tags || [];
    const uniqueTags = Array.from(new Set([...currentTags, ...tags]));

    this.props.tags = uniqueTags;
    this.props.updatedAt = new Date();
  }

  /**
   * Regras de negócio - Remover tags
   */
  removeTags(tags: string[]): void {
    if (!this.props.tags) return;

    this.props.tags = this.props.tags.filter(tag => !tags.includes(tag));
    this.props.updatedAt = new Date();
  }

  /**
   * Business logic - Verificar se está ativo
   */
  isActive(): boolean {
    return this.props.status !== 'WON' && this.props.status !== 'LOST';
  }

  /**
   * Business logic - Verificar se foi convertido
   */
  isConverted(): boolean {
    return this.props.status === 'WON';
  }

  /**
   * Business logic - Verificar se foi perdido
   */
  isLost(): boolean {
    return this.props.status === 'LOST';
  }

  /**
   * Business logic - Verificar se tem alto score
   */
  isHighPriority(): boolean {
    return (this.props.score || 0) >= 70;
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

  get phone(): string | null | undefined {
    return this.props.phone;
  }

  get company(): string | null | undefined {
    return this.props.company;
  }

  get position(): string | null | undefined {
    return this.props.position;
  }

  get status(): LeadStatus {
    return this.props.status;
  }

  get source(): LeadSource {
    return this.props.source;
  }

  get value(): number | null | undefined {
    return this.props.value;
  }

  get score(): number | null | undefined {
    return this.props.score;
  }

  get notes(): string | null | undefined {
    return this.props.notes;
  }

  get tags(): string[] {
    return this.props.tags || [];
  }

  get assignedTo(): string | null | undefined {
    return this.props.assignedTo;
  }

  get convertedAt(): Date | null | undefined {
    return this.props.convertedAt;
  }

  get lastContactedAt(): Date | null | undefined {
    return this.props.lastContactedAt;
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
  toObject(): LeadProps {
    return { ...this.props };
  }
}
