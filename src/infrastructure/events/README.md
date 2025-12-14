# Sistema de Eventos (EventBus)

Sistema de eventos em memória baseado no padrão **Observer/PubSub** para desacoplar componentes da aplicação.

## 📁 Estrutura

```
src/
├── core/domain/events/
│   ├── base.event.ts           # Interface base e tipos
│   ├── lead-events.ts          # Eventos de Lead
│   └── submission-events.ts    # Eventos de Submission
└── infrastructure/events/
    ├── event-bus.ts            # Implementação do EventBus
    ├── register-handlers.ts    # Registro de handlers
    ├── handlers/
    │   ├── lead-handlers.ts    # Handlers de Lead
    │   └── submission-handlers.ts  # Handlers de Submission
    └── event-bus.test.ts       # Testes (18 testes ✅)
```

## 🚀 Como Usar

### 1. Emitir um Evento

```typescript
import { getEventBus } from '@/infrastructure/events/event-bus';
import { LeadCreatedEvent } from '@/core/domain/events/lead-events';

// Obter instância do EventBus
const eventBus = getEventBus();

// Criar e emitir evento
const event = new LeadCreatedEvent(
  {
    leadId: 'lead-123',
    organizationId: 'org-123',
    name: 'John Doe',
    email: 'john@example.com',
    status: 'NEW',
    source: 'WEBSITE',
    value: 50000,
  },
  {
    userId: 'user-123', // metadata
    ipAddress: '192.168.1.1',
  }
);

await eventBus.emit(event);
```

### 2. Registrar um Handler

```typescript
import { getEventBus } from '@/infrastructure/events/event-bus';
import { LeadCreatedEvent } from '@/core/domain/events/lead-events';

const eventBus = getEventBus();

// Handler síncrono
eventBus.on('LeadCreated', (event: LeadCreatedEvent) => {
  console.log(`New lead: ${event.name}`);
});

// Handler assíncrono
eventBus.on('LeadCreated', async (event: LeadCreatedEvent) => {
  await sendEmail({
    to: event.email,
    subject: 'Welcome!',
  });
});
```

### 3. Múltiplos Handlers para o Mesmo Evento

```typescript
// Todos estes handlers serão executados em paralelo
eventBus.on('LeadCreated', sendWelcomeEmail);
eventBus.on('LeadCreated', notifyAssignee);
eventBus.on('LeadCreated', trackAnalytics);
eventBus.on('LeadCreated', updateDashboard);
```

### 4. Remover Handlers

```typescript
// Remover handler específico
eventBus.off('LeadCreated', sendWelcomeEmail);

// Remover todos os handlers de um tipo
eventBus.removeAllListeners('LeadCreated');

// Remover todos os handlers
eventBus.removeAllListeners();
```

## 📦 Eventos Disponíveis

### Lead Events

- **`LeadCreatedEvent`** - Lead criado
- **`LeadStatusChangedEvent`** - Status do lead mudou
- **`LeadUpdatedEvent`** - Lead atualizado
- **`LeadDeletedEvent`** - Lead deletado
- **`LeadConvertedEvent`** - Lead convertido em cliente
- **`LeadAssignedEvent`** - Lead atribuído a usuário

### Submission Events

- **`SubmissionCreatedEvent`** - Submission criada
- **`SubmissionStatusChangedEvent`** - Status mudou
- **`SubmissionApprovedEvent`** - Submission aprovada
- **`SubmissionRejectedEvent`** - Submission rejeitada

## 🎯 Exemplo Completo de Uso

```typescript
// 1. Na API de criação de lead
import { getEventBus } from '@/infrastructure/events/event-bus';
import { LeadCreatedEvent } from '@/core/domain/events/lead-events';

export async function POST(req: NextRequest) {
  const data = await req.json();

  // Criar lead no banco
  const lead = await prisma.lead.create({ data });

  // Emitir evento
  const eventBus = getEventBus();
  await eventBus.emit(
    new LeadCreatedEvent({
      leadId: lead.id,
      organizationId: lead.organizationId,
      name: lead.name,
      email: lead.email,
      status: lead.status,
      source: lead.source,
    })
  );

  return NextResponse.json(lead);
}

// 2. Registrar handlers na inicialização
import { registerEventHandlers } from '@/infrastructure/events/register-handlers';

// Em src/app/layout.tsx ou middleware
registerEventHandlers();
```

## 🔧 Handlers Disponíveis

### Lead Handlers

```typescript
// Notificar quando lead é criado
handleLeadCreated(event) → Envia notificação e email

// Registrar mudança de status
handleLeadStatusChanged(event) → Log de auditoria

// Processar conversão
handleLeadConverted(event) → Atualiza métricas, cria customer

// Limpar dados ao deletar
handleLeadDeleted(event) → Remove dados relacionados

// Analytics
handleLeadAnalytics(event) → Envia para analytics
```

### Submission Handlers

```typescript
// Processar nova submission
handleSubmissionCreated(event) → Notifica revisores, email

// Mudança de status
handleSubmissionStatusChanged(event) → Log de auditoria

// Aprovação
handleSubmissionApproved(event) → Processa ações pós-aprovação

// Rejeição
handleSubmissionRejected(event) → Notifica usuário
```

## 📊 Monitoramento e Debug

### Obter Estatísticas

```typescript
const stats = eventBus.getStats();
console.log(stats);
// {
//   totalEventTypes: 6,
//   totalHandlers: 12,
//   historySize: 150,
//   maxHistorySize: 1000,
//   eventTypes: ['LeadCreated', 'LeadStatusChanged', ...]
// }
```

### Histórico de Eventos

```typescript
// Obter histórico
const history = eventBus.getEventHistory();

// Limpar histórico
eventBus.clearHistory();
```

### Contar Handlers

```typescript
const count = eventBus.listenerCount('LeadCreated');
console.log(`Handlers registrados: ${count}`);
```

## 🧪 Testes

```bash
# Executar testes do EventBus
pnpm test:run event-bus

# Resultado: 18 testes passando ✅
```

### Exemplo de Teste

```typescript
import { describe, it, expect, vi } from 'vitest';
import { InMemoryEventBus } from './event-bus';
import { LeadCreatedEvent } from '@/core/domain/events/lead-events';

describe('EventBus', () => {
  it('should call handler when event is emitted', async () => {
    const eventBus = new InMemoryEventBus();
    const handler = vi.fn();

    eventBus.on('LeadCreated', handler);

    const event = new LeadCreatedEvent({
      leadId: 'lead-123',
      organizationId: 'org-123',
      name: 'Test',
      email: 'test@example.com',
      status: 'NEW',
      source: 'WEBSITE',
    });

    await eventBus.emit(event);

    expect(handler).toHaveBeenCalledWith(event);
  });
});
```

## 🎨 Criando Novos Eventos

### 1. Definir o Evento

```typescript
// src/core/domain/events/my-events.ts
import { BaseDomainEvent } from './base.event';

export class MyCustomEvent extends BaseDomainEvent {
  constructor(
    payload: {
      id: string;
      data: string;
    },
    metadata?: {
      userId?: string;
    }
  ) {
    super('MyCustomEvent', payload, metadata);
  }

  get id(): string {
    return this.payload.id;
  }
}
```

### 2. Criar Handler

```typescript
// src/infrastructure/events/handlers/my-handlers.ts
export async function handleMyCustomEvent(event: MyCustomEvent) {
  console.log(`Processing: ${event.id}`);
  // Sua lógica aqui
}
```

### 3. Registrar Handler

```typescript
// src/infrastructure/events/register-handlers.ts
import { handleMyCustomEvent } from './handlers/my-handlers';

eventBus.on('MyCustomEvent', handleMyCustomEvent);
```

## ⚙️ Configuração

### Limite de Histórico

```typescript
// Padrão: 1000 eventos
const eventBus = new InMemoryEventBus(1000);

// Customizado
const eventBus = new InMemoryEventBus(500);
```

### Singleton Global

```typescript
import { getEventBus, resetEventBus } from './event-bus';

// Obter instância (sempre a mesma)
const eventBus = getEventBus();

// Resetar (útil para testes)
resetEventBus();
```

## 🚨 Tratamento de Erros

O EventBus **não propaga erros** dos handlers para não quebrar a execução de outros handlers:

```typescript
eventBus.on('LeadCreated', async () => {
  throw new Error('Erro no handler 1');
});

eventBus.on('LeadCreated', async () => {
  console.log('Handler 2 executa normalmente');
});

// Ambos executam, erro é apenas logado
await eventBus.emit(event);
```

## 🎯 Casos de Uso

### 1. Desacoplamento

```typescript
// ❌ Antes: Código acoplado
async function createLead(data) {
  const lead = await db.create(data);
  await sendEmail(lead);
  await notifyUser(lead);
  await trackAnalytics(lead);
  return lead;
}

// ✅ Depois: Desacoplado
async function createLead(data) {
  const lead = await db.create(data);
  await eventBus.emit(new LeadCreatedEvent(lead));
  return lead;
}
```

### 2. Side Effects

Use eventos para side effects que não devem bloquear a operação principal:

- Enviar emails
- Atualizar analytics
- Gerar notificações
- Atualizar cache
- Disparar webhooks

### 3. Auditoria

```typescript
eventBus.on('LeadStatusChanged', async (event) => {
  await auditLog.create({
    action: 'LEAD_STATUS_CHANGED',
    from: event.previousStatus,
    to: event.newStatus,
    userId: event.metadata?.userId,
  });
});
```

## 📚 Referências

- **Pattern:** Observer / Pub-Sub
- **Inspiração:** Domain Events (DDD)
- **Testes:** 18 testes ✅ (100% coverage)

---

**Próximo Passo:** Integrar com BullMQ para processamento assíncrono de eventos
