/**
 * Interface base para todos os eventos do domínio
 */
export interface IDomainEvent {
  /**
   * Tipo do evento (ex: 'LeadCreated', 'LeadStatusChanged')
   */
  readonly type: string;

  /**
   * Timestamp de quando o evento foi criado
   */
  readonly occurredAt: Date;

  /**
   * ID único do evento
   */
  readonly eventId: string;

  /**
   * Dados específicos do evento
   */
  readonly payload: Record<string, any>;

  /**
   * Metadados adicionais (usuário, IP, etc.)
   */
  readonly metadata?: Record<string, any>;
}

/**
 * Classe base abstrata para eventos
 */
export abstract class BaseDomainEvent implements IDomainEvent {
  public readonly type: string;
  public readonly occurredAt: Date;
  public readonly eventId: string;
  public readonly payload: Record<string, any>;
  public readonly metadata?: Record<string, any>;

  constructor(
    type: string,
    payload: Record<string, any>,
    metadata?: Record<string, any>
  ) {
    this.type = type;
    this.payload = payload;
    this.metadata = metadata;
    this.occurredAt = new Date();
    this.eventId = this.generateEventId();
  }

  private generateEventId(): string {
    return `${this.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Serializa o evento para JSON
   */
  toJSON() {
    return {
      type: this.type,
      occurredAt: this.occurredAt.toISOString(),
      eventId: this.eventId,
      payload: this.payload,
      metadata: this.metadata,
    };
  }
}

/**
 * Handler de eventos
 */
export type EventHandler<T extends IDomainEvent = IDomainEvent> = (
  event: T
) => void | Promise<void>;

/**
 * Interface do EventBus
 */
export interface IEventBus {
  /**
   * Publica um evento
   */
  emit<T extends IDomainEvent>(event: T): Promise<void>;

  /**
   * Registra um handler para um tipo de evento
   */
  on<T extends IDomainEvent>(
    eventType: string,
    handler: EventHandler<T>
  ): void;

  /**
   * Remove um handler de um tipo de evento
   */
  off<T extends IDomainEvent>(
    eventType: string,
    handler: EventHandler<T>
  ): void;

  /**
   * Remove todos os handlers de um tipo de evento
   */
  removeAllListeners(eventType?: string): void;

  /**
   * Retorna o número de handlers registrados para um tipo de evento
   */
  listenerCount(eventType: string): number;
}
