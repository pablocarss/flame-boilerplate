# Usando a CLI do Flame Boilerplate

## Visão Geral

Este projeto agora inclui uma CLI completa que permite criar novos projetos baseados no Flame Boilerplate com módulos opcionais.

## Instalação e Uso

### Opção 1: Uso Local (Desenvolvimento)

Para testar a CLI localmente durante o desenvolvimento:

```bash
# 1. Entre na pasta da CLI
cd cli

# 2. Instale as dependências
pnpm install

# 3. Faça o build
pnpm build

# 4. Teste a CLI
pnpm dev my-test-project
```

### Opção 2: Link Global

Para usar a CLI como um comando global no seu sistema:

```bash
# 1. Entre na pasta da CLI
cd cli

# 2. Instale as dependências e faça o build
pnpm install && pnpm build

# 3. Crie um link global
npm link

# 4. Agora você pode usar em qualquer lugar
create-flame-app my-awesome-project
```

### Opção 3: Publicação no NPM (Futuro)

Após publicar no NPM, os usuários poderão usar:

```bash
npx create-flame-app my-project
# ou
npm create flame-app my-project
# ou
pnpm create flame-app my-project
```

## O que a CLI Faz

A CLI automatiza todo o processo de criação de um novo projeto:

### 1. Validação do Ambiente
- Verifica Node.js 18+
- Verifica Docker e Docker Compose instalados
- Valida o nome do projeto

### 2. Configuração Interativa
Pergunta ao usuário:
- Nome do projeto
- Descrição (opcional)
- Módulos a incluir:
  - ☐ **Leads/CRM** - Sistema de gerenciamento de leads com Kanban
  - ☐ **Submissions** - Sistema de formulários e submissões
  - ☐ **Billing/Stripe** - Pagamentos e assinaturas
  - ☐ **Storage/MinIO** - Upload de arquivos S3-compatible
- Gerenciador de pacotes (pnpm, npm, yarn)
- Portas PostgreSQL e Redis

### 3. Criação do Projeto
- Copia arquivos do boilerplate
- Remove módulos não selecionados
- Limpa Prisma schema (remove models não usados)
- Remove pacotes NPM desnecessários

### 4. Geração de Configurações
- **docker-compose.yml** - Customizado com serviços necessários
- **.env** - Com JWT secrets auto-gerados e configurações corretas
- **package.json** - Com nome e descrição do projeto

### 5. Automação de Infraestrutura
- Sobe containers Docker automaticamente
- Cria banco de dados PostgreSQL
- Aguarda todos os serviços ficarem healthy

### 6. Setup do Projeto
- Instala dependências (pnpm/npm/yarn)
- Gera Prisma Client
- Executa migrations (prisma db push)

### 7. Pronto!
Projeto totalmente configurado e pronto para desenvolvimento.

## Exemplo de Uso

```bash
$ create-flame-app my-saas-app

  ╔═══════════════════════════════════╗
  ║   Flame Boilerplate Generator   ║
  ╚═══════════════════════════════════╝

[1/10] Validating environment...
ℹ Node.js version: v20.11.0
ℹ Docker version: 24.0.6
ℹ Docker Compose version: 2.23.0

[2/10] Collecting project configuration...
? Project name: my-saas-app
? Project description (optional): My awesome SaaS application
? Select modules to include:
  ◉ Leads/CRM - Kanban board, sales pipeline
  ◉ Submissions - Forms and submissions management
  ◯ Billing/Stripe - Payments and subscriptions
  ◉ Storage/MinIO - File uploads (S3-compatible)
? Package manager: pnpm
? PostgreSQL port: 5432
? Redis port: 6379

  Project Summary:

  Name: my-saas-app
  Description: My awesome SaaS application
  Modules: leads, submissions, storage
  Package manager: pnpm
  PostgreSQL port: 5432
  Redis port: 6379

? Create project with these settings? Yes

[3/10] Creating project directory...
[4/10] Copying boilerplate files...
[5/10] Customizing modules...
ℹ Removed 15 module-specific files
ℹ Removed 2 unused npm packages from package.json
ℹ Cleaning Prisma schema (removing 2 models/enums)...
ℹ Removed 3 empty directories

[6/10] Generating configuration files...
[7/10] Starting Docker services...
✓ All Docker services are running and healthy

[8/10] Setting up database...
✓ Database 'my_saas_app_db' created successfully

[9/10] Installing dependencies...
✓ Dependencies installed

[10/10] Running database migrations...
✓ Prisma Client generated
✓ Database schema created successfully

  ✓ SUCCESS! Project created.

  Project details:
    Name: my-saas-app
    Modules: leads, submissions, storage
    Package manager: pnpm

  Services running:
    PostgreSQL: localhost:5432
    Redis: localhost:6379
    MinIO: localhost:9000
    MinIO Console: localhost:9001
    MailHog: localhost:8025

  Next steps:

    cd my-saas-app
    pnpm dev

  Documentation: ./my-saas-app/README.md
```

## Recursos da CLI

### ✅ Rollback Automático
Se algo der errado durante a criação do projeto, a CLI automaticamente:
- Remove o diretório do projeto
- Para e remove containers Docker
- Exibe mensagem de erro clara

### ✅ Validações
- Nome de projeto válido (npm package name)
- Ambiente verificado (Node.js, Docker)
- Portas disponíveis

### ✅ Modularidade
Remove completamente módulos não selecionados:
- Arquivos de código
- Rotas API
- Componentes React
- Models do Prisma
- Pacotes NPM
- Serviços Docker

### ✅ Segurança
- JWT secrets gerados automaticamente
- Configurações sensíveis em .env

## Serviços Docker por Módulo

| Módulo | Serviços Docker |
|--------|----------------|
| **Base** | postgres, mailhog |
| **Leads/CRM** | + redis |
| **Storage/MinIO** | + minio, minio-setup |

## Variáveis de Ambiente por Módulo

| Módulo | Variáveis |
|--------|-----------|
| **Base** | DATABASE_URL, JWT_SECRET, SMTP_* |
| **Billing/Stripe** | + STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, etc |
| **Storage/MinIO** | + MINIO_ENDPOINT, MINIO_ACCESS_KEY, etc |
| **Leads/CRM** | + REDIS_URL, REDIS_HOST, REDIS_PORT |

## Troubleshooting

### Erro: "Directory already exists"
O diretório do projeto já existe. Escolha outro nome ou remova o diretório existente.

### Erro: "Docker is not installed"
Instale Docker Desktop antes de usar a CLI.

### Erro: "Port X is already in use"
Escolha portas diferentes durante o setup ou pare o serviço que está usando a porta.

### Erro durante instalação de dependências
Certifique-se de ter conexão com a internet e que o package manager escolhido está instalado.

## Desenvolvimento da CLI

Para contribuir com o desenvolvimento da CLI:

```bash
# Clone o repositório
git clone https://github.com/your-repo/flame-boilerplate.git
cd flame-boilerplate/cli

# Instale dependências
pnpm install

# Faça alterações no código fonte (src/)

# Compile
pnpm build

# Teste
pnpm dev test-project

# Ou use watch mode
tsc --watch
```

## Estrutura da CLI

```
cli/
├── bin/create-flame-app.js    # Entry point executável
├── src/
│   ├── index.ts              # Main logic
│   ├── prompts.ts            # Perguntas interativas
│   ├── modules/
│   │   └── module-mapper.ts  # Mapeamento de módulos
│   ├── generators/           # Geração e remoção de código
│   ├── templates/            # Templates de configuração
│   ├── docker/               # Automação Docker
│   ├── database/             # Setup de banco
│   └── utils/                # Utilitários
├── dist/                     # Código compilado
├── package.json
└── tsconfig.json
```

## Próximos Passos

1. Testar com diferentes combinações de módulos
2. Adicionar mais módulos opcionais
3. Publicar no NPM
4. Adicionar testes automatizados
5. Melhorar mensagens de erro

## Suporte

Para questões ou problemas, abra uma issue no repositório:
https://github.com/your-repo/flame-boilerplate/issues
