# Exemplo Completo de Uso do Sistema de Jobs

Este arquivo demonstra o fluxo completo do sistema de eventos e jobs.

## Fluxo: API Route → Event → Handler → Job → Worker

### 1. API Route (Cria Lead)

```typescript
// src/app/api/leads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getEventBus } from '@/infrastructure/events/event-bus';
import { LeadCreatedEvent } from '@/core/domain/events/lead-events';

export async function POST(req: NextRequest) {
  const body = await req.json();

  // 1. Criar lead no banco de dados
  const lead = await prisma.lead.create({
    data: {
      organizationId: body.organizationId,
      name: body.name,
      email: body.email,
      phone: body.phone,
      company: body.company,
      status: body.status || 'NEW',
      source: body.source || 'WEBSITE',
    },
  });

  // 2. Emitir evento
  const eventBus = getEventBus();
  await eventBus.emit(
    new LeadCreatedEvent(
      {
        leadId: lead.id,
        organizationId: lead.organizationId,
        name: lead.name,
        email: lead.email,
        status: lead.status,
        source: lead.source,
        assignedTo: body.assignedTo,
      },
      {
        userId: 'current-user-id', // TODO: pegar do auth
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      }
    )
  );

  return NextResponse.json(lead, { status: 201 });
}
```

### 2. Event Handler (Captura Evento e Dispara Jobs)

```typescript
// src/infrastructure/events/handlers/lead-handlers.ts
export async function handleLeadCreated(event: LeadCreatedEvent): Promise<void> {
  console.log(`[LeadHandler] New lead created: ${event.name}`);

  // Job 1: Criar notificação in-app
  await addNotificationJob({
    type: NotificationJobType.CREATE_NOTIFICATION,
    userId: event.payload.assignedTo,
    title: 'Novo Lead',
    message: `Lead ${event.name} foi criado e atribuído a você`,
    actionUrl: `/dashboard/leads/${event.leadId}`,
    notificationType: 'INFO',
  });

  // Job 2: Enriquecer dados (baixa prioridade, delay de 10s)
  await enrichLeadDataJob(event.leadId, event.organizationId, {
    delay: 10000,
    priority: 5,
  });

  // Job 3: Calcular score
  await calculateLeadScoreJob(event.leadId, event.organizationId);
}
```

### 3. Job Queue (Redis)

Jobs são persistidos no Redis em suas respectivas filas:

```
bull:notification:wait  ← Job de notificação
bull:lead:wait          ← Jobs de enriquecimento e score
```

### 4. Workers (Processam Jobs)

#### Notification Worker
```typescript
// src/infrastructure/jobs/workers/notification-worker.ts
async function processNotificationJob(job: Job<NotificationJobData>): Promise<void> {
  const { type, userId, title, message } = job.data;

  switch (type) {
    case NotificationJobType.CREATE_NOTIFICATION:
      await createNotification(userId, title, message);
      break;
  }
}

// Worker processa com concorrência 10
export const notificationWorker = new Worker('notification', processNotificationJob, {
  ...redisConnection,
  concurrency: 10,
});
```

#### Lead Worker
```typescript
// src/infrastructure/jobs/workers/lead-worker.ts
async function processLeadJob(job: Job<LeadJobData>): Promise<void> {
  const { type, leadId, organizationId } = job.data;

  switch (type) {
    case LeadJobType.ENRICH_LEAD_DATA:
      await enrichLeadData(leadId, organizationId);
      break;

    case LeadJobType.CALCULATE_LEAD_SCORE:
      await calculateLeadScore(leadId, organizationId);
      break;
  }
}

// Worker processa com concorrência 3
export const leadWorker = new Worker('lead', processLeadJob, {
  ...redisConnection,
  concurrency: 3,
});
```

### 5. Resultado Final

Depois de 10 segundos:
- ✅ Lead criado no banco
- ✅ Notificação criada para o usuário responsável
- ✅ Dados do lead enriquecidos com informações externas
- ✅ Score do lead calculado

## Linha do Tempo

```
T+0ms    → API: Lead criado no banco
T+0ms    → EventBus: LeadCreatedEvent emitido
T+0ms    → Handler: handleLeadCreated chamado
T+5ms    → Queue: 3 jobs adicionados (notification, enrich, score)
T+50ms   → Worker: Notification processada
T+10s    → Worker: Lead data enrichment iniciado
T+10.2s  → Worker: Lead data enrichment completo
T+11s    → Worker: Lead score calculado
```

## Monitoramento

### Logs

```bash
# API Route
[API] Lead created: João Silva (joao@example.com)

# EventBus
[EventBus] Event emitted: LeadCreated (event-abc123)

# Handler
[LeadHandler] New lead created: João Silva (joao@example.com)

# Queues
[NotificationQueue] Job job-456 is waiting
[LeadQueue] Job job-789 is waiting
[LeadQueue] Job job-012 is waiting

# Workers
[NotificationWorker] Processing CREATE_NOTIFICATION for user user-123
[NotificationWorker] ✅ CREATE_NOTIFICATION processed successfully
[NotificationWorker] Job job-456 completed

[LeadWorker] Processing ENRICH_LEAD_DATA for lead lead-abc (org: org-xyz)
[LeadWorker] Enriching lead data for lead-abc
[LeadWorker] ✅ ENRICH_LEAD_DATA processed successfully
[LeadWorker] Job job-789 completed

[LeadWorker] Processing CALCULATE_LEAD_SCORE for lead lead-abc (org: org-xyz)
[LeadWorker] Calculating lead score for lead-abc
[LeadWorker] ✅ CALCULATE_LEAD_SCORE processed successfully
[LeadWorker] Job job-012 completed
```

### Redis CLI

```bash
# Ver jobs em espera
redis-cli LRANGE bull:notification:wait 0 -1
redis-cli LRANGE bull:lead:wait 0 -1

# Ver tamanho das filas
redis-cli LLEN bull:notification:wait
redis-cli LLEN bull:lead:wait

# Ver jobs completados
redis-cli LRANGE bull:notification:completed 0 -1

# Ver jobs falhados
redis-cli LRANGE bull:notification:failed 0 -1
```

## Teste Manual

### 1. Iniciar Redis
```bash
docker run -d -p 6379:6379 redis:7-alpine
```

### 2. Iniciar Workers
```bash
npm run workers
```

### 3. Fazer Request para API
```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "org-123",
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "+55 11 98765-4321",
    "company": "Acme Corp",
    "source": "WEBSITE",
    "assignedTo": "user-456"
  }'
```

### 4. Observar Logs

Você verá a sequência completa de logs mostrando o fluxo do evento até a conclusão dos jobs.

## Diagrama de Arquitetura

```
┌─────────────┐
│  API Route  │
│ (POST lead) │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Prisma Create  │
│ (Database Save) │
└──────┬──────────┘
       │
       ▼
┌──────────────────────┐
│  EventBus.emit()     │
│ (LeadCreatedEvent)   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────────┐
│  handleLeadCreated()         │
│ (Event Handler)              │
└──────┬──┬──────────┬─────────┘
       │  │          │
       ▼  ▼          ▼
    ┌───┬───┬──────────┐
    │ N │ E │    S     │  Jobs adicionados às filas
    │ o │ n │    c     │
    │ t │ r │    o     │
    │ i │ i │    r     │
    │ f │ c │    e     │
    │   │ h │          │
    └─┬─┴─┬─┴────┬─────┘
      │   │      │
      ▼   ▼      ▼
    ┌──────────────┐
    │  Redis       │
    │ (Job Queues) │
    └──┬───┬────┬──┘
       │   │    │
       ▼   ▼    ▼
    ┌──────────────┐
    │  Workers     │
    │ (Processors) │
    └──────────────┘
```

## Benefícios

1. **Desacoplamento** - API não bloqueia esperando jobs pesados
2. **Resiliência** - Jobs têm retry automático em caso de falha
3. **Escalabilidade** - Workers podem rodar em máquinas separadas
4. **Priorização** - Jobs críticos processados primeiro
5. **Auditoria** - Todo evento é registrado com timestamp e metadata
6. **Rastreabilidade** - Logs completos do fluxo de execução
