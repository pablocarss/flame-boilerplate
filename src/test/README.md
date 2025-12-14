# Estrutura de Testes - Flame Boilerplate

Este diretório contém a infraestrutura de testes automatizados usando **Vitest** e **React Testing Library**.

## 📁 Estrutura de Diretórios

```
src/test/
├── README.md           # Este arquivo
├── setup.ts            # Configuração global de testes
└── helpers/
    ├── prisma-mock.ts  # Mocks do Prisma Client
    ├── test-data.ts    # Dados de teste reutilizáveis
    └── test-utils.tsx  # Utilitários para testes de componentes
```

## 🚀 Comandos Disponíveis

```bash
# Executar testes em modo watch
pnpm test

# Executar testes uma vez (CI/CD)
pnpm test:run

# Executar testes com UI interativa
pnpm test:ui

# Gerar relatório de cobertura
pnpm test:coverage

# Executar testes em modo watch
pnpm test:watch
```

## 📝 Como Escrever Testes

### Teste de Componente React

```typescript
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@/test/helpers/test-utils';
import { MyComponent } from './my-component';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent title="Test" />);

    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<MyComponent onClick={handleClick} />);

    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Teste de Função/Utilidade

```typescript
import { describe, it, expect } from 'vitest';
import { formatCurrency } from './utils';

describe('formatCurrency', () => {
  it('should format BRL currency correctly', () => {
    const result = formatCurrency(1000);
    expect(result).toBe('R$ 1.000,00');
  });
});
```

### Teste com Mock de Prisma

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { prismaMock, createTestLead } from '@/test/helpers/prisma-mock';

describe('LeadRepository', () => {
  beforeEach(async () => {
    await prismaMock.$reset();
  });

  it('should create a lead', async () => {
    const lead = await createTestLead('org-123', {
      name: 'Test Lead',
      email: 'test@example.com',
    });

    expect(lead.name).toBe('Test Lead');
    expect(lead.status).toBe('NEW');
  });
});
```

### Teste com Mock de Fetch

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { mockFetch, clearFetchMocks } from '@/test/helpers/test-utils';

describe('API Client', () => {
  beforeEach(() => {
    clearFetchMocks();
  });

  it('should fetch data successfully', async () => {
    mockFetch({ data: 'test' });

    const response = await fetch('/api/test');
    const data = await response.json();

    expect(data).toEqual({ data: 'test' });
  });
});
```

## 🎯 Melhores Práticas

### 1. Nomear Testes Claramente

✅ **Bom:**
```typescript
it('should display error message when email is invalid', () => {
  // ...
});
```

❌ **Ruim:**
```typescript
it('test email', () => {
  // ...
});
```

### 2. Organizar com describe/it

```typescript
describe('LeadCard', () => {
  describe('rendering', () => {
    it('should render lead name', () => {});
    it('should render lead email', () => {});
  });

  describe('interactions', () => {
    it('should call onEdit when edit button is clicked', () => {});
    it('should call onDelete when delete button is clicked', () => {});
  });
});
```

### 3. Usar beforeEach para Setup

```typescript
describe('MyComponent', () => {
  let mockData;

  beforeEach(() => {
    mockData = createMockLead('org-123');
    vi.clearAllMocks();
  });

  it('should render with mock data', () => {
    render(<MyComponent lead={mockData} />);
    // ...
  });
});
```

### 4. Testar Comportamentos, Não Implementação

✅ **Bom:** Testar o que o usuário vê/faz
```typescript
it('should show success message after form submission', async () => {
  const user = userEvent.setup();
  render(<ContactForm />);

  await user.type(screen.getByLabelText('Email'), 'test@example.com');
  await user.click(screen.getByRole('button', { name: /submit/i }));

  expect(await screen.findByText('Success!')).toBeInTheDocument();
});
```

❌ **Ruim:** Testar detalhes de implementação
```typescript
it('should call handleSubmit when form is submitted', () => {
  // Testando implementação interna
});
```

## 📊 Cobertura de Testes

O projeto está configurado com as seguintes metas de cobertura:

- **Linhas:** 80%
- **Funções:** 80%
- **Branches:** 80%
- **Statements:** 80%

Para visualizar o relatório de cobertura:

```bash
pnpm test:coverage
```

O relatório HTML será gerado em `coverage/index.html`.

## 🔧 Helpers Disponíveis

### `test-utils.tsx`

- `render()`: Renderiza componentes com providers necessários
- `mockFetch()`: Mock de fetch API
- `mockFetchError()`: Mock de fetch com erro
- `clearFetchMocks()`: Limpa mocks de fetch
- `waitForPromises()`: Aguarda promessas pendentes
- `mockToast()`: Mock do hook useToast

### `test-data.ts`

- `testUsers`: Usuários de teste predefinidos
- `testOrganizations`: Organizações de teste
- `testLeads`: Leads de teste
- `testSubmissions`: Submissões de teste
- `createMockUser()`: Factory para criar usuários
- `createMockOrganization()`: Factory para criar organizações
- `createMockLead()`: Factory para criar leads
- `createMockSubmission()`: Factory para criar submissões
- `mockResponses`: Responses HTTP mockadas

### `prisma-mock.ts`

- `prismaMock`: Cliente Prisma mockado
- `createTestUser()`: Criar usuário no banco mockado
- `createTestOrganization()`: Criar organização no banco mockado
- `createTestLead()`: Criar lead no banco mockado
- `createTestSubmission()`: Criar submission no banco mockado
- `createTestMember()`: Criar membro no banco mockado

## 🐛 Debugging de Testes

### Usar screen.debug()

```typescript
it('should render correctly', () => {
  render(<MyComponent />);

  // Imprime o HTML atual no console
  screen.debug();

  // Ou imprimir um elemento específico
  screen.debug(screen.getByRole('button'));
});
```

### Executar apenas um teste

```typescript
// Use .only para executar apenas este teste
it.only('should focus on this test', () => {
  // ...
});
```

### Pular um teste

```typescript
// Use .skip para pular este teste
it.skip('should skip this test', () => {
  // ...
});
```

## 📚 Recursos

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [User Event](https://testing-library.com/docs/user-event/intro)

## 🎓 Exemplos

Veja exemplos práticos em:
- `src/components/leads/lead-card.test.tsx` - Teste de componente React

---

**Meta de Cobertura:** 80%+ em todo o código crítico de negócio
