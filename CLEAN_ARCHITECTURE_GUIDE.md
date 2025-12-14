# Clean Architecture - Guia de Uso

Este projeto foi refatorado para seguir **Clean Architecture** com separação clara de responsabilidades.

## 📁 Estrutura

```
src/
├── core/domain/              # Domínio (regras de negócio)
│   ├── entities/            # Entities com lógica de domínio
│   ├── repositories/        # Interfaces (contratos)
│   └── events/              # Domain Events
│
├── application/             # Casos de Uso
│   ├── use-cases/          # Lógica de aplicação
│   ├── validators/         # Zod schemas
│   └── mappers/            # Entity ↔ DTO conversions
│
├── infrastructure/          # Implementações
│   ├── repositories/       # Implementações Prisma
│   ├── services/           # Services externos
│   ├── events/             # EventBus
│   ├── jobs/               # Background jobs
│   └── prisma/             # Prisma client
│
├── presentation/            # Controllers
│   └── controllers/        # API Controllers
│
└── shared/                  # Utilitários
    └── utils/
```

## 🎯 Camadas e Responsabilidades

### 1. Domain Layer (Core)

**Entities** - Contêm regras de negócio:

```typescript
// src/core/domain/entities/lead.entity.ts
export class LeadEntity {
  markAsConverted(): void {
    if (this.status === 'WON') {
      throw new Error('Lead is already converted');
    }
    this.status = 'WON';
    this.convertedAt = new Date();
  }
}
```

**Repository Interfaces** - Definem contratos:

```typescript
// src/core/domain/repositories/lead.repository.interface.ts
export interface ILeadRepository {
  findById(id: string): Promise<LeadEntity | null>;
  create(lead: LeadEntity): Promise<LeadEntity>;
  update(lead: LeadEntity): Promise<LeadEntity>;
  // ...
}
```

### 2. Application Layer

**Use Cases** - Orquestram lógica de aplicação:

```typescript
// src/application/use-cases/leads/create-lead.usecase.ts
export class CreateLeadUseCase {
  constructor(private leadRepository: ILeadRepository) {}

  async execute(input: CreateLeadInput): Promise<CreateLeadOutput> {
    // 1. Criar Entity
    const lead = LeadEntity.create(input);

    // 2. Persistir
    const savedLead = await this.leadRepository.create(lead);

    // 3. Disparar eventos
    await eventBus.emit(new LeadCreatedEvent({...}));

    return { lead: savedLead };
  }
}
```

**Mappers** - Convertem entre camadas:

```typescript
// src/application/mappers/lead.mapper.ts
export class LeadMapper {
  static toDomain(raw: PrismaLead): LeadEntity { ... }
  static toPrisma(entity: LeadEntity): PrismaData { ... }
  static toResponse(entity: LeadEntity): LeadResponse { ... }
}
```

### 3. Infrastructure Layer

**Repositories** - Implementam interfaces com Prisma:

```typescript
// src/infrastructure/repositories/lead.repository.ts
export class LeadRepository implements ILeadRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<LeadEntity | null> {
    const raw = await this.prisma.lead.findUnique({ where: { id } });
    return raw ? LeadMapper.toDomain(raw) : null;
  }
}
```

### 4. Presentation Layer

**Controllers** - Camada fina entre API e Use Cases:

```typescript
// src/presentation/controllers/lead.controller.ts
export class LeadController {
  static async create(req: NextRequest): Promise<NextResponse> {
    const body = await req.json();

    const repository = new LeadRepository(prisma);
    const useCase = new CreateLeadUseCase(repository);

    const result = await useCase.execute(body);

    return NextResponse.json(LeadMapper.toResponse(result.lead));
  }
}
```

## 🔄 Como Refatorar API Routes

### ANTES (Tudo no Route Handler):

```typescript
// src/app/api/leads/route.ts - ANTIGO
export async function POST(req: NextRequest) {
  const body = await req.json();

  // Validação
  if (!body.name || !body.email) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }

  // Lógica de negócio
  const lead = await prisma.lead.create({
    data: {
      name: body.name,
      email: body.email,
      status: 'NEW',
      // ...
    },
  });

  // Enviar email
  await emailService.send({...});

  return NextResponse.json(lead);
}
```

### DEPOIS (Usando Controller):

```typescript
// src/app/api/leads/route.ts - NOVO
import { LeadController } from '@/presentation/controllers';

export async function GET(req: NextRequest) {
  return LeadController.list(req);
}

export async function POST(req: NextRequest) {
  return LeadController.create(req);
}
```

**Benefícios:**
- ✅ Route está **fina** (apenas delega)
- ✅ Lógica movida para **Use Case**
- ✅ **Testável** isoladamente
- ✅ **Reutilizável** em outros contextos

## 📝 Exemplo Completo: Criar um Lead

### 1. Definir Entity com regras de negócio

```typescript
// src/core/domain/entities/lead.entity.ts
const lead = LeadEntity.create({
  organizationId: 'org-123',
  name: 'João Silva',
  email: 'joao@example.com',
  status: 'NEW',
  source: 'WEBSITE',
});

// Regras de negócio aplicadas automaticamente
lead.markAsConverted(); // ✅ Valida se pode converter
```

### 2. Criar Use Case

```typescript
// src/application/use-cases/leads/create-lead.usecase.ts
const useCase = new CreateLeadUseCase(leadRepository);
const result = await useCase.execute({
  organizationId: 'org-123',
  name: 'João Silva',
  email: 'joao@example.com',
});
```

### 3. Usar no Controller

```typescript
// src/presentation/controllers/lead.controller.ts
const repository = new LeadRepository(prisma);
const useCase = new CreateLeadUseCase(repository);
const result = await useCase.execute(input);
return NextResponse.json(LeadMapper.toResponse(result.lead));
```

### 4. API Route fina

```typescript
// src/app/api/leads/route.ts
export async function POST(req: NextRequest) {
  return LeadController.create(req);
}
```

## 🧪 Testando

### Test de Entity (Domain)

```typescript
describe('LeadEntity', () => {
  it('should mark lead as converted', () => {
    const lead = LeadEntity.create({...});

    lead.markAsConverted();

    expect(lead.status).toBe('WON');
    expect(lead.convertedAt).toBeDefined();
  });

  it('should throw error if already converted', () => {
    const lead = LeadEntity.create({...});
    lead.markAsConverted();

    expect(() => lead.markAsConverted()).toThrow();
  });
});
```

### Test de Use Case (Application)

```typescript
describe('CreateLeadUseCase', () => {
  it('should create lead and emit event', async () => {
    const mockRepository = {
      create: vi.fn().mockResolvedValue(mockLead),
    };
    const useCase = new CreateLeadUseCase(mockRepository);

    const result = await useCase.execute({...});

    expect(mockRepository.create).toHaveBeenCalled();
    expect(result.lead).toBeDefined();
  });
});
```

### Test de Repository (Infrastructure)

```typescript
describe('LeadRepository', () => {
  it('should find lead by id', async () => {
    const repository = new LeadRepository(prismaMock);
    prismaMock.lead.findUnique.mockResolvedValue(mockPrismaLead);

    const result = await repository.findById('lead-123');

    expect(result).toBeInstanceOf(LeadEntity);
  });
});
```

## 🚀 Próximos Passos

1. **Refatorar Remaining Routes** - Converter todas as API routes para usar Controllers
2. **Adicionar Validação** - Usar Zod schemas em todos os Use Cases
3. **Aumentar Cobertura de Testes** - Meta: 80%+
4. **Adicionar Logging** - Structured logging em Use Cases
5. **Implementar DTOs** - Response DTOs customizados por endpoint

## 📚 Recursos

- [Clean Architecture (Uncle Bob)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/tags/domain%20driven%20design.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

## ❓ FAQ

**P: Por que não usar Prisma diretamente nas routes?**
R: Para separar lógica de negócio da infraestrutura. Entities validam regras, Use Cases orquestram, Repositories abstraem persistência.

**P: É mais código, vale a pena?**
R: Sim! Código é mais testável, manutenível e escalável. Fácil adicionar novos features sem quebrar existentes.

**P: Como migrar routes existentes?**
R: Gradualmente. Crie Use Case → Controller → Atualize route. Mantenha ambas versões durante transição.
