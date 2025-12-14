# Sistema de Background Jobs

Sistema de processamento assíncrono de jobs usando **BullMQ** + **Redis**.

## Arquitetura

```
Event → EventBus → Event Handler → Job Queue → Worker → Job Processor
```

### Fluxo Completo

1. **Evento é emitido** - `eventBus.emit(new LeadCreatedEvent(...))`
2. **Handler captura evento** - `handleLeadCreated(event)`
3. **Handler adiciona job** - `await enrichLeadDataJob(leadId, orgId)`
4. **Job entra na fila** - BullMQ persiste no Redis
5. **Worker processa** - Executa lógica de negócio
6. **Job completa** - Evento de conclusão é disparado

## Estrutura de Pastas

```
src/infrastructure/jobs/
├── config/
│   └── redis.config.ts          # Configuração do Redis
├── queues/
│   ├── email-queue.ts           # Fila de emails
│   ├── notification-queue.ts    # Fila de notificações
│   └── lead-queue.ts            # Fila de leads
├── workers/
│   ├── email-worker.ts          # Worker de emails
│   ├── notification-worker.ts   # Worker de notificações
│   └── lead-worker.ts           # Worker de leads
├── jobs/
│   ├── send-welcome-email.job.ts
│   ├── send-lead-notification.job.ts
│   └── enrich-lead.job.ts
└── index.ts                     # Exporta tudo + inicia workers
```

## Queues (Filas)

### Email Queue

**Tipos de jobs:**
- `SEND_WELCOME` - Email de boas-vindas
- `SEND_LEAD_NOTIFICATION` - Notificação de novo lead
- `SEND_SUBMISSION_CONFIRMATION` - Confirmação de submission
- `SEND_BULK_EMAIL` - Envio em massa

**Configuração:**
- 3 tentativas com backoff exponencial
- Concorrência: 5 jobs em paralelo
- Rate limit: 10 jobs/segundo
- Mantém últimos 100 jobs completados
- Mantém últimos 500 jobs falhados

**Uso:**
```typescript
import { addEmailJob, EmailJobType } from '@/infrastructure/jobs/queues/email-queue';

await addEmailJob(
  {
    type: EmailJobType.SEND_WELCOME,
    to: 'user@example.com',
    data: { name: 'João' },
  },
  {
    priority: 1, // 1 = alta, 10 = baixa
    delay: 1000, // delay em ms (opcional)
  }
);
```

### Notification Queue

**Tipos de jobs:**
- `CREATE_NOTIFICATION` - Cria notificação no banco
- `SEND_PUSH_NOTIFICATION` - Envia push notification
- `SEND_SMS` - Envia SMS

**Configuração:**
- 2 tentativas com backoff fixo (5s)
- Concorrência: 10 jobs em paralelo

**Uso:**
```typescript
import { addNotificationJob, NotificationJobType } from '@/infrastructure/jobs/queues/notification-queue';

await addNotificationJob({
  type: NotificationJobType.CREATE_NOTIFICATION,
  userId: 'user-123',
  title: 'Novo Lead',
  message: 'Um novo lead foi atribuído a você',
  actionUrl: '/dashboard/leads/123',
  notificationType: 'INFO',
});
```

### Lead Queue

**Tipos de jobs:**
- `ENRICH_LEAD_DATA` - Enriquece dados do lead (Clearbit, etc.)
- `CALCULATE_LEAD_SCORE` - Calcula score do lead
- `SYNC_TO_CRM` - Sincroniza com CRM externo
- `SEND_FOLLOW_UP` - Envia email de follow-up

**Configuração:**
- 3 tentativas com backoff exponencial
- Concorrência: 3 jobs em paralelo (operações mais pesadas)

**Uso:**
```typescript
import { addLeadJob, LeadJobType } from '@/infrastructure/jobs/queues/lead-queue';

await addLeadJob(
  {
    type: LeadJobType.ENRICH_LEAD_DATA,
    leadId: 'lead-123',
    organizationId: 'org-456',
  },
  {
    priority: 5,
    delay: 10000, // 10 segundos
  }
);
```

## Workers

Workers processam jobs das filas. Rodam como processos separados.

### Iniciar Workers

#### Desenvolvimento (local)
```bash
# Em terminal separado
npm run workers
```

#### Produção
```bash
# Com PM2
pm2 start ecosystem.config.js

# Com Docker
docker-compose up workers
```

### Monitoramento

```typescript
// Event listeners
emailWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

emailWorker.on('error', (err) => {
  console.error('Worker error:', err);
});
```

## Jobs (Helpers)

Jobs são funções helper que facilitam adicionar jobs às filas.

### send-welcome-email.job.ts

```typescript
import { sendWelcomeEmailJob } from '@/infrastructure/jobs/jobs/send-welcome-email.job';

await sendWelcomeEmailJob('user@example.com', {
  name: 'João Silva',
  organizationName: 'Acme Corp',
});
```

### send-lead-notification.job.ts

```typescript
import { sendLeadNotificationJob } from '@/infrastructure/jobs/jobs/send-lead-notification.job';

await sendLeadNotificationJob('manager@example.com', {
  leadName: 'João Silva',
  leadEmail: 'joao@example.com',
  leadCompany: 'Acme Corp',
  source: 'WEBSITE',
  value: 50000,
});
```

### enrich-lead.job.ts

```typescript
import { enrichLeadDataJob, calculateLeadScoreJob, syncLeadToCRMJob } from '@/infrastructure/jobs/jobs/enrich-lead.job';

// Enriquecer dados
await enrichLeadDataJob('lead-123', 'org-456', {
  delay: 10000, // 10 segundos
  priority: 5,
});

// Calcular score
await calculateLeadScoreJob('lead-123', 'org-456');

// Sincronizar com CRM
await syncLeadToCRMJob('lead-123', 'org-456', {
  customField: 'value',
});
```

## Integração com EventBus

Os event handlers disparam jobs automaticamente:

```typescript
// src/infrastructure/events/handlers/lead-handlers.ts
export async function handleLeadCreated(event: LeadCreatedEvent): Promise<void> {
  // 1. Cria notificação in-app
  await addNotificationJob({
    type: NotificationJobType.CREATE_NOTIFICATION,
    userId: event.payload.assignedTo,
    title: 'Novo Lead',
    message: `Lead ${event.name} foi criado`,
  });

  // 2. Enriquece dados (delay de 10s)
  await enrichLeadDataJob(event.leadId, event.organizationId, {
    delay: 10000,
    priority: 5,
  });

  // 3. Calcula score
  await calculateLeadScoreJob(event.leadId, event.organizationId);
}
```

### Fluxo Completo de Exemplo

```typescript
// 1. API Route cria lead
const lead = await prisma.lead.create({ data: {...} });

// 2. Emite evento
await eventBus.emit(new LeadCreatedEvent({
  leadId: lead.id,
  organizationId: lead.organizationId,
  name: lead.name,
  email: lead.email,
  status: lead.status,
  source: lead.source,
}));

// 3. Handler captura evento e adiciona jobs
// handleLeadCreated() é chamado automaticamente

// 4. Workers processam jobs
// - notificationWorker processa notificação
// - leadWorker enriquece dados
// - leadWorker calcula score

// 5. Jobs completam
// Logs são gerados, métricas atualizadas
```

## Configuração do Redis

### Variáveis de Ambiente

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### Docker Compose

```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
```

### Iniciar Redis Local

```bash
# Com Docker
docker run -d -p 6379:6379 redis:7-alpine

# Com Docker Compose
docker-compose up -d redis
```

## Retry e Error Handling

### Configuração de Retry

```typescript
defaultJobOptions: {
  attempts: 3,
  backoff: {
    type: 'exponential', // ou 'fixed'
    delay: 2000, // ms
  },
}
```

### Tipos de Backoff

- **Exponential**: 2s, 4s, 8s, 16s...
- **Fixed**: 2s, 2s, 2s...

### Error Handling nos Workers

```typescript
async function processJob(job: Job<JobData>): Promise<void> {
  try {
    // Lógica do job
  } catch (error) {
    console.error('Error processing job:', error);
    throw error; // Re-throw para triggerar retry
  }
}
```

## Priorização de Jobs

Prioridade: 1 (mais alta) a 10 (mais baixa)

```typescript
await addEmailJob(data, { priority: 1 }); // Alta prioridade
await addEmailJob(data, { priority: 5 }); // Média prioridade
await addEmailJob(data, { priority: 10 }); // Baixa prioridade
```

## Rate Limiting

```typescript
limiter: {
  max: 10, // Máximo 10 jobs
  duration: 1000, // Por segundo
}
```

## Delayed Jobs

```typescript
await addEmailJob(data, {
  delay: 60000, // 1 minuto
});

await addLeadJob(data, {
  delay: 3600000, // 1 hora
});
```

## Monitoramento e Dashboard

### BullMQ Board (UI)

```bash
npm install -g @bull-board/cli
bull-board
```

Acesse: http://localhost:3000

### CLI do BullMQ

```bash
# Ver jobs na fila
redis-cli
> LRANGE bull:email:wait 0 -1

# Limpar fila
> DEL bull:email:wait
```

## Testes

```typescript
import { describe, it, expect, vi } from 'vitest';
import { addEmailJob } from './email-queue';

describe('Email Queue', () => {
  it('should add job to queue', async () => {
    const job = await addEmailJob({
      type: EmailJobType.SEND_WELCOME,
      to: 'test@example.com',
      data: { name: 'Test' },
    });

    expect(job.id).toBeDefined();
    expect(job.data.to).toBe('test@example.com');
  });
});
```

## Produção

### PM2 Configuration (ecosystem.config.js)

```javascript
module.exports = {
  apps: [
    {
      name: 'app',
      script: 'npm',
      args: 'start',
      instances: 2,
      exec_mode: 'cluster',
    },
    {
      name: 'workers',
      script: 'npm',
      args: 'run workers',
      instances: 1,
      exec_mode: 'fork',
    },
  ],
};
```

### Docker

```dockerfile
# Worker container
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
CMD ["npm", "run", "workers"]
```

## Troubleshooting

### Job não está sendo processado

1. Verificar se Redis está rodando: `redis-cli ping`
2. Verificar se worker está rodando: `ps aux | grep node`
3. Verificar logs do worker
4. Verificar se há jobs na fila: `redis-cli LLEN bull:email:wait`

### Jobs falhando repetidamente

1. Verificar logs de erro
2. Verificar configuração de retry
3. Testar lógica do job isoladamente
4. Aumentar timeout do job

### Performance Issues

1. Aumentar concorrência dos workers
2. Adicionar mais workers (escalar horizontalmente)
3. Otimizar lógica dos jobs
4. Usar priority para jobs críticos

## Best Practices

1. **Sempre use jobs para operações pesadas** (envio de email, chamadas externas, processamento de dados)
2. **Configure retry apropriado** (3-5 tentativas para operações idempotentes)
3. **Use priorização** para jobs críticos
4. **Adicione logging** para debugging
5. **Monitore filas** regularmente
6. **Teste jobs isoladamente** antes de integrar
7. **Use delays** para operações não urgentes (economiza recursos)
8. **Implemente idempotência** (jobs podem ser executados múltiplas vezes sem efeitos colaterais)

## Roadmap

- [ ] Integrar com Resend/SendGrid para emails reais
- [ ] Integrar com Firebase/OneSignal para push notifications
- [ ] Implementar dashboard customizado
- [ ] Adicionar métricas (Prometheus)
- [ ] Implementar dead letter queue
- [ ] Adicionar testes de integração
- [ ] Implementar job scheduling (cron)
- [ ] Adicionar support para job batching

## Recursos

- [BullMQ Documentation](https://docs.bullmq.io/)
- [Redis Documentation](https://redis.io/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/)
