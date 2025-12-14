import { IEventBus, IDomainEvent, EventHandler } from '@/core/domain/events/base.event';

/**
 * Implementação em memória do EventBus usando padrão Observer/PubSub
 */
export class InMemoryEventBus implements IEventBus {
  private handlers: Map<string, Set<EventHandler>>;
  private eventHistory: IDomainEvent[];
  private maxHistorySize: number;

  constructor(maxHistorySize = 1000) {
    this.handlers = new Map();
    this.eventHistory = [];
    this.maxHistorySize = maxHistorySize;
  }

  /**
   * Publica um evento para todos os handlers registrados
   */
  async emit<T extends IDomainEvent>(event: T): Promise<void> {
    // Adiciona o evento ao histórico
    this.addToHistory(event);

    const eventHandlers = this.handlers.get(event.type);

    if (!eventHandlers || eventHandlers.size === 0) {
      console.log(`[EventBus] No handlers for event: ${event.type}`);
      return;
    }

    console.log(
      `[EventBus] Emitting ${event.type} to ${eventHandlers.size} handler(s)`
    );

    // Executa todos os handlers em paralelo
    const promises = Array.from(eventHandlers).map(async (handler) => {
      try {
        await handler(event);
      } catch (error) {
        console.error(
          `[EventBus] Error in handler for ${event.type}:`,
          error
        );
        // Não propaga o erro para não quebrar outros handlers
      }
    });

    await Promise.all(promises);
  }

  /**
   * Registra um handler para um tipo de evento
   */
  on<T extends IDomainEvent>(
    eventType: string,
    handler: EventHandler<T>
  ): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }

    this.handlers.get(eventType)!.add(handler as EventHandler);
    console.log(`[EventBus] Registered handler for: ${eventType}`);
  }

  /**
   * Remove um handler específico de um tipo de evento
   */
  off<T extends IDomainEvent>(
    eventType: string,
    handler: EventHandler<T>
  ): void {
    const eventHandlers = this.handlers.get(eventType);

    if (eventHandlers) {
      eventHandlers.delete(handler as EventHandler);

      if (eventHandlers.size === 0) {
        this.handlers.delete(eventType);
      }

      console.log(`[EventBus] Removed handler for: ${eventType}`);
    }
  }

  /**
   * Remove todos os handlers de um tipo de evento (ou de todos se não especificado)
   */
  removeAllListeners(eventType?: string): void {
    if (eventType) {
      this.handlers.delete(eventType);
      console.log(`[EventBus] Removed all handlers for: ${eventType}`);
    } else {
      this.handlers.clear();
      console.log('[EventBus] Removed all handlers');
    }
  }

  /**
   * Retorna o número de handlers registrados para um tipo de evento
   */
  listenerCount(eventType: string): number {
    return this.handlers.get(eventType)?.size ?? 0;
  }

  /**
   * Retorna o histórico de eventos
   */
  getEventHistory(): ReadonlyArray<IDomainEvent> {
    return [...this.eventHistory];
  }

  /**
   * Limpa o histórico de eventos
   */
  clearHistory(): void {
    this.eventHistory = [];
    console.log('[EventBus] Event history cleared');
  }

  /**
   * Adiciona um evento ao histórico (com limite de tamanho)
   */
  private addToHistory(event: IDomainEvent): void {
    this.eventHistory.push(event);

    // Mantém apenas os últimos N eventos
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  /**
   * Retorna todos os tipos de eventos que têm handlers registrados
   */
  getRegisteredEventTypes(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Retorna estatísticas do EventBus
   */
  getStats() {
    return {
      totalEventTypes: this.handlers.size,
      totalHandlers: Array.from(this.handlers.values()).reduce(
        (sum, handlers) => sum + handlers.size,
        0
      ),
      historySize: this.eventHistory.length,
      maxHistorySize: this.maxHistorySize,
      eventTypes: this.getRegisteredEventTypes(),
    };
  }
}

// Singleton global do EventBus
let eventBusInstance: InMemoryEventBus | null = null;

/**
 * Retorna a instância singleton do EventBus
 */
export function getEventBus(): InMemoryEventBus {
  if (!eventBusInstance) {
    eventBusInstance = new InMemoryEventBus();
  }
  return eventBusInstance;
}

/**
 * Reseta a instância do EventBus (útil para testes)
 */
export function resetEventBus(): void {
  eventBusInstance = null;
}
