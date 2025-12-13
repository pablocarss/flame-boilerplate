# Flame Boilerplate

Um boilerplate completo e production-ready para construir aplicações SaaS modernas com Next.js 14, TypeScript, Prisma, PostgreSQL e Stripe.

## Stack Técnica

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Estilização**: Tailwind CSS, ShadcnUI, Radix UI, Lucide Icons
- **Temas**: next-themes com dark mode
- **Backend**: Next.js API Routes
- **Banco de Dados**: PostgreSQL + Prisma ORM
- **Autenticação**: JWT com jose (access + refresh tokens)
- **Pagamentos**: Stripe (Checkout + Customer Portal + Webhooks)
- **Storage**: MinIO (S3 compatible)
- **Email**: Resend / MailHog (desenvolvimento)
- **Infraestrutura**: Docker + Docker Compose

## Funcionalidades

### Landing Page
- Hero section com CTA
- Seção de features
- Seção de pricing com planos dinâmicos
- Footer responsivo
- Dark mode toggle

### Autenticação JWT Completa
- Registro de usuário com validação
- Login com JWT (access token + refresh token)
- Logout e revogação de tokens
- Middleware de proteção de rotas
- Recuperação de senha por email
- Reset de senha com token seguro
- Verificação de token de reset

### Sistema Multi-Organizacional
- Criação e gerenciamento de organizações
- Slug único para cada organização
- Dashboard por organização
- Settings de organização
- Suporte a múltiplas organizações por usuário

### Sistema de Convites
- Enviar convite para novo membro por email
- Aceitar/recusar convite via link único
- Listar convites pendentes
- Revogar convite (apenas admin)
- Expiração automática de convites
- Estados: PENDING, ACCEPTED, REVOKED, EXPIRED

### Sistema de Roles (RBAC)
- Roles: ADMIN, MEMBER
- Permissões granulares:
  - `organization:read`, `organization:update`, `organization:delete`
  - `member:read`, `member:create`, `member:update`, `member:delete`
  - `invite:read`, `invite:create`, `invite:revoke`
  - `billing:read`, `billing:update`
  - `integration:read`, `integration:create`, `integration:update`, `integration:delete`
- Guards no frontend e backend
- Middleware de verificação de permissões
- Páginas restritas por role

### Pagamentos com Stripe
- **Checkout Session**: Criação de sessão de checkout segura
- **Customer Portal**: Portal self-service para gerenciar assinatura
- **Webhooks**: Sincronização automática de eventos
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
- **Planos**: Free, Pro, Enterprise (configuráveis)
- **Status de assinatura**: ACTIVE, CANCELED, PAST_DUE, TRIALING, PAUSED
- **Sincronização automática** de status entre Stripe e banco de dados
- **Cancelamento**: Opção de cancelar ao fim do período
- Suporte a **múltiplas moedas** (padrão: BRL)

### Sistema de Integrações (Plugins)
- Dashboard de integrações disponíveis
- Conectar/desconectar integrações por organização
- Suporte para múltiplos providers:
  - ChatGPT (OpenAI)
  - Zapier
  - Figma
  - Google Drive
  - Google Calendar
  - Slack
  - Notion
  - GitHub
  - GitLab
  - Trello
- Armazenamento seguro de API Keys e tokens (TODO: criptografia)
- Estados: ACTIVE, INACTIVE, ERROR
- Configurações customizadas por integração (JSON)
- Last sync tracking
- Permissões RBAC para gerenciar integrações

### Sistema de Notificações
- **Notificações em tempo real** com polling automático
- **Dropdown de notificações** no header do dashboard com badge de não lidas
- **Página completa de notificações** com filtros (todas/não lidas)
- **Tipos de notificação**: Convites, membros, assinaturas, integrações, geral
- **Marcar como lida** individual ou todas de uma vez
- **Action URLs** para redirecionar para contexto relevante
- **Auto-refresh** a cada 30 segundos
- **Contador de não lidas** em tempo real
- Permissões RBAC integradas

### Sistema de API Keys
- **Geração segura de API keys** no formato `flame_live_xxxxxxxxxxxx`
- **Hash SHA-256** para armazenamento seguro
- **Chave completa mostrada apenas uma vez** na criação
- **Ativar/desativar** API keys
- **Tracking de último uso** e expiração
- **Mascaramento de chaves** (apenas últimos 8 caracteres visíveis)
- **Dashboard de gerenciamento** com documentação de uso
- **Múltiplas keys por organização**
- Ideal para integrações sistema-a-sistema
- Permissões RBAC (apikey:read, create, update, delete)

### Sistema de Submissões
- **Gerenciamento de formulários** e submissões
- **Status workflow**: PENDING → REVIEWED → APPROVED/REJECTED → ARCHIVED
- **Captura automática** de IP, User Agent e origem
- **Tipos de formulário**: contact, lead, support, custom
- **Dados estruturados em JSON** com visualização formatada
- **Adicionar notas** e comentários nas submissões
- **Filtros por status** e tipo de formulário
- **Modal de visualização/edição** detalhada
- **Review tracking** com usuário e timestamp
- Permissões RBAC integradas

### Sistema de Leads (CRM)
- **CRM completo** para gestão de leads e oportunidades
- **Pipeline de vendas**: NEW → CONTACTED → QUALIFIED → PROPOSAL → NEGOTIATION → WON/LOST
- **Origens rastreáveis**: Website, Referral, Social Media, Email Campaign, Cold Call, Event, Partner
- **Dashboard com métricas**: Total de leads, novos, em negociação, valor total
- **Gestão completa de informações**: Nome, email, telefone, empresa, cargo, valor estimado
- **Follow-ups e próximos passos** com datas
- **Tags personalizáveis** para categorização
- **Campos customizados** (JSON) para flexibilidade
- **Data de conversão** automática ao fechar venda (WON)
- **Filtros por status** e origem
- **Formulário completo** de criação e edição
- Permissões RBAC (lead:read, create, update, delete)

### Model Context Protocol (MCP)
- **Servidor MCP** completo para integração com IA
- **Ferramentas disponíveis**:
  - `create_organization` - Criar organizações
  - `create_lead` - Criar leads no CRM
  - `list_leads` - Listar leads com filtros
  - `update_lead_status` - Atualizar pipeline de vendas
  - `create_notification` - Criar notificações
  - `list_submissions` - Listar submissões
  - `get_organization_stats` - Obter estatísticas
- **Integração com Claude Desktop** e outros clientes MCP
- **Documentação completa** em `mcp/README.md`
- **Scripts de build e execução** incluídos
- Acesso direto ao banco de dados via Prisma

### Upload com MinIO/S3
- Upload de arquivos (avatars, documentos, etc.)
- Presigned URLs para upload seguro
- Validação de tipo MIME e tamanho
- Armazenamento de metadados
- Bucket público configurado automaticamente
- Console MinIO disponível em `http://localhost:9001`

### Banco de Dados Completo
- **User**: Usuários com autenticação
- **RefreshToken**: Tokens de refresh JWT
- **Organization**: Organizações multi-tenant
- **Member**: Membros de organizações com roles
- **Invite**: Sistema de convites
- **Plan**: Planos de assinatura
- **Subscription**: Assinaturas Stripe
- **Upload**: Uploads de arquivos
- **Integration**: Integrações de terceiros
- **Notification**: Sistema de notificações
- **ApiKey**: API keys para integrações
- **Submission**: Submissões de formulários
- **Lead**: CRM de leads e oportunidades
- Seeds para dados iniciais
- Migrations versionadas

## Começando

### Pré-requisitos

- Node.js 18+ ou pnpm
- Docker e Docker Compose
- Conta Stripe (teste gratuito)
- Stripe CLI (opcional, para webhooks locais)

### Instalação

1. **Clone o repositório:**
```bash
git clone <repo-url> flame-boilerplate
cd flame-boilerplate
```

2. **Copie o arquivo de ambiente:**
```bash
cp .env.example .env
```

3. **Configure as variáveis de ambiente no `.env`:**

**IMPORTANTE**: Nunca commite o arquivo `.env` com dados reais. Use valores de exemplo ou tokens de teste.

```env
# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (porta alterada para evitar conflito)
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/flame_db?schema=public"

# JWT (MUDE EM PRODUÇÃO)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# MinIO/S3
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=flame-uploads
MINIO_USE_SSL=false

# Email (MailHog para desenvolvimento local)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_FROM_EMAIL=noreply@flame.dev

# Resend (Para produção - opcional)
# RESEND_API_KEY=re_your_api_key_here
# RESEND_FROM_EMAIL=noreply@yourdomain.com

# Stripe (Use chaves de TEST)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Redis (porta alterada para evitar conflito)
REDIS_URL=redis://localhost:6380
```

4. **Inicie os serviços com Docker:**
```bash
docker-compose up -d
```

Serviços disponíveis:
- **PostgreSQL**: `localhost:5433`
- **MinIO**: `localhost:9000` (API) e `localhost:9001` (Console)
- **Redis**: `localhost:6380`
- **MailHog**: `localhost:8025` (Web UI)

5. **Instale as dependências:**
```bash
pnpm install
# ou
npm install
```

6. **Execute as migrations:**
```bash
pnpm db:push
# ou
npm run db:push
```

7. **Execute o seed (dados iniciais):**
```bash
pnpm db:seed
# ou
npm run db:seed
```

8. **Inicie o servidor de desenvolvimento:**
```bash
pnpm dev
# ou
npm run dev
```

9. **Configure o Stripe CLI (opcional, para webhooks):**

Veja instruções completas em [STRIPE_CLI_SETUP.md](./STRIPE_CLI_SETUP.md)

```bash
# Instalar Stripe CLI
choco install stripe-cli -y

# Fazer login
stripe login

# Escutar webhooks (em outro terminal)
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Acesse [http://localhost:3000](http://localhost:3000)

### Credenciais Demo

Após executar o seed, você pode usar:
- **Email**: demo@flame.dev
- **Senha**: demo123456

## Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev              # Inicia o servidor de desenvolvimento
pnpm build            # Build para produção
pnpm start            # Inicia o servidor de produção
pnpm lint             # Executa o linter

# Banco de Dados
pnpm db:generate      # Gera o Prisma Client
pnpm db:push          # Push do schema para o banco (sem migrations)
pnpm db:migrate       # Cria uma nova migration
pnpm db:seed          # Executa o seed
pnpm db:studio        # Abre o Prisma Studio

# Docker
pnpm docker:up        # Sobe os containers Docker
pnpm docker:down      # Para os containers Docker
pnpm docker:build     # Builda a imagem Docker

# Model Context Protocol (MCP)
pnpm mcp:build        # Compila o servidor MCP
pnpm mcp:start        # Inicia o servidor MCP
```

## Estrutura do Projeto

```
├── prisma/
│   ├── schema.prisma           # Schema do banco de dados
│   └── seed.ts                 # Dados iniciais (users, plans, orgs)
├── src/
│   ├── app/                    # App Router (Next.js 14)
│   │   ├── (dashboard)/        # Rotas protegidas do dashboard
│   │   │   ├── dashboard/
│   │   │   │   ├── billing/    # Gerenciamento de assinaturas
│   │   │   │   ├── invites/    # Gerenciamento de convites
│   │   │   │   ├── members/    # Gerenciamento de membros
│   │   │   │   ├── organizations/  # CRUD de organizações
│   │   │   │   ├── plugins/    # Dashboard de integrações
│   │   │   │   ├── settings/   # Configurações de usuário
│   │   │   │   └── page.tsx    # Dashboard home
│   │   │   └── layout.tsx      # Layout com sidebar e header
│   │   ├── api/                # API Routes
│   │   │   ├── auth/           # Endpoints de autenticação
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   ├── refresh/
│   │   │   │   ├── logout/
│   │   │   │   ├── forgot-password/
│   │   │   │   ├── reset-password/
│   │   │   │   ├── verify-reset-token/
│   │   │   │   └── me/
│   │   │   ├── billing/        # Endpoints Stripe
│   │   │   │   ├── checkout/
│   │   │   │   └── portal/
│   │   │   ├── integrations/   # CRUD de integrações
│   │   │   │   ├── route.ts    # GET, POST
│   │   │   │   └── [id]/       # GET, PATCH, DELETE
│   │   │   ├── invites/        # CRUD de convites
│   │   │   ├── members/        # CRUD de membros
│   │   │   ├── organizations/  # CRUD de organizações
│   │   │   ├── profile/        # Perfil do usuário
│   │   │   ├── upload/         # Upload de arquivos
│   │   │   └── webhooks/
│   │   │       └── stripe/     # Webhook Stripe
│   │   ├── auth/               # Páginas de autenticação
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   ├── invite/[token]/     # Página de aceitar convite
│   │   ├── layout.tsx          # Root layout com ThemeProvider
│   │   ├── page.tsx            # Landing page
│   │   └── globals.css         # Estilos globais (Tailwind)
│   ├── components/             # Componentes React
│   │   ├── billing/            # Componentes de billing
│   │   │   ├── manage-subscription-button.tsx
│   │   │   └── select-plan-button.tsx
│   │   ├── dashboard/          # Componentes do dashboard
│   │   │   ├── header.tsx
│   │   │   └── sidebar.tsx
│   │   ├── invites/            # Componentes de convites
│   │   ├── members/            # Componentes de membros
│   │   ├── theme-provider.tsx  # Provider de temas
│   │   ├── theme-toggle.tsx    # Toggle dark/light mode
│   │   └── ui/                 # Componentes UI (ShadcnUI)
│   └── lib/                    # Utilitários e configurações
│       ├── auth.ts             # Funções de autenticação JWT
│       ├── email.ts            # Client de email (Resend/SMTP)
│       ├── prisma.ts           # Client Prisma singleton
│       ├── rbac.ts             # Sistema de permissões RBAC
│       ├── storage.ts          # Client MinIO/S3
│       ├── stripe.ts           # Client Stripe + helpers
│       ├── utils.ts            # Utilitários gerais (cn, etc)
│       └── validations.ts      # Schemas Zod para validação
├── .claude/                    # Configurações Claude Code
├── docker-compose.yml          # Configuração Docker
├── Dockerfile                  # Build da aplicação
├── STRIPE_CLI_SETUP.md         # Guia de setup do Stripe CLI
├── .env.example                # Template de variáveis de ambiente
└── .gitignore                  # Arquivos ignorados (inclui .env)
```

## API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login (retorna access + refresh token)
- `POST /api/auth/refresh` - Renovar access token
- `POST /api/auth/logout` - Logout (revoga refresh token)
- `GET /api/auth/me` - Dados do usuário autenticado
- `POST /api/auth/forgot-password` - Solicitar reset de senha
- `POST /api/auth/verify-reset-token` - Verificar token de reset
- `POST /api/auth/reset-password` - Resetar senha

### Organizações
- `GET /api/organizations` - Listar organizações do usuário
- `POST /api/organizations` - Criar organização (auto admin)

### Membros
- `GET /api/members?organizationId=` - Listar membros
- `PATCH /api/members/:id/role` - Alterar role (admin only)
- `DELETE /api/members/:id` - Remover membro (admin only)

### Convites
- `GET /api/invites?organizationId=` - Listar convites
- `POST /api/invites` - Enviar convite (admin only)
- `POST /api/invites/verify` - Verificar validade de convite
- `POST /api/invites/accept` - Aceitar convite
- `POST /api/invites/:id/revoke` - Revogar convite (admin only)

### Billing (Stripe)
- `POST /api/billing/checkout` - Criar sessão de checkout
- `POST /api/billing/portal` - Criar sessão do customer portal
- `POST /api/webhooks/stripe` - Webhook Stripe (assinado)

### Integrações
- `GET /api/integrations?organizationId=` - Listar integrações
- `POST /api/integrations` - Criar integração
- `GET /api/integrations/:id` - Detalhes da integração
- `PATCH /api/integrations/:id` - Atualizar integração
- `DELETE /api/integrations/:id` - Deletar integração

### Upload
- `POST /api/upload` - Upload de arquivo
- `POST /api/upload/presigned` - Gerar URL presigned

### Perfil
- `GET /api/profile` - Dados do perfil
- `PATCH /api/profile` - Atualizar perfil
- `PATCH /api/profile/password` - Alterar senha

### Notificações
- `GET /api/notifications` - Listar notificações do usuário
- `POST /api/notifications` - Criar notificação
- `PATCH /api/notifications/:id` - Marcar como lida
- `DELETE /api/notifications/:id` - Deletar notificação
- `PATCH /api/notifications/mark-all-read` - Marcar todas como lidas

### API Keys
- `GET /api/api-keys?organizationId=` - Listar API keys
- `POST /api/api-keys` - Criar nova API key (retorna chave completa apenas 1x)
- `PATCH /api/api-keys/:id` - Ativar/desativar API key
- `DELETE /api/api-keys/:id` - Deletar API key

### Submissões
- `GET /api/submissions?organizationId=` - Listar submissões
- `POST /api/submissions` - Criar submissão
- `GET /api/submissions/:id` - Obter detalhes da submissão
- `PATCH /api/submissions/:id` - Atualizar status/notas
- `DELETE /api/submissions/:id` - Deletar submissão

### Leads (CRM)
- `GET /api/leads?organizationId=` - Listar leads
- `POST /api/leads` - Criar novo lead
- `GET /api/leads/:id` - Obter detalhes do lead
- `PATCH /api/leads/:id` - Atualizar lead
- `DELETE /api/leads/:id` - Deletar lead

## Variáveis de Ambiente

Veja `.env.example` para todas as variáveis disponíveis. **Nunca commite o arquivo `.env` com dados reais.**

### Variáveis Obrigatórias

```env
DATABASE_URL              # URL do PostgreSQL
JWT_SECRET                # Secret para access tokens
JWT_REFRESH_SECRET        # Secret para refresh tokens
STRIPE_SECRET_KEY         # Stripe secret key (teste)
STRIPE_WEBHOOK_SECRET     # Stripe webhook secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  # Stripe publishable key
```

### Variáveis Opcionais

```env
RESEND_API_KEY            # Para envio de emails (produção)
REDIS_URL                 # Para rate limiting
SMTP_HOST                 # SMTP para desenvolvimento (MailHog)
```

## Desenvolvimento Local

### Testando Emails (MailHog)

MailHog captura todos os emails enviados localmente:

1. Acesse: http://localhost:8025
2. Todos os emails aparecerão aqui
3. Perfeito para testar convites, reset de senha, etc.

### Testando Pagamentos (Stripe)

1. Use as chaves de **teste** do Stripe
2. Configure o Stripe CLI (veja [STRIPE_CLI_SETUP.md](./STRIPE_CLI_SETUP.md))
3. Use cartões de teste:
   - Sucesso: `4242 4242 4242 4242`
   - Falha: `4000 0000 0000 0002`
   - 3D Secure: `4000 0025 0000 3155`

### Acessando Serviços

- **App**: http://localhost:3000
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)
- **MailHog**: http://localhost:8025
- **Prisma Studio**: `pnpm db:studio`

## Deploy

### Docker (Produção)

```bash
# Build e start
docker-compose --profile production up -d

# Aplicação estará em http://localhost:3000
```

### Vercel / Outras Plataformas

1. Configure as variáveis de ambiente
2. Configure o banco PostgreSQL (Supabase, Neon, etc.)
3. Configure o Redis (Upstash, etc.)
4. Configure o MinIO ou use S3 da AWS
5. Adicione os webhooks do Stripe
6. Deploy automático via Git

**Importante para produção:**
- Use secrets fortes e únicos
- Configure CORS adequadamente
- Use HTTPS sempre
- Configure rate limiting com Redis
- Monitore logs e erros
- Configure backups do banco de dados

## Segurança

- ✅ JWT com access + refresh tokens
- ✅ Senhas hasheadas com bcrypt
- ✅ Validação de entrada com Zod
- ✅ RBAC com permissões granulares
- ✅ Tokens de reset com expiração
- ✅ Webhooks assinados (Stripe)
- ✅ .env no .gitignore
- ⚠️ TODO: Criptografia de API keys de integrações
- ⚠️ TODO: Rate limiting (requer Redis)
- ⚠️ TODO: CORS configurável

## Roadmap

- [x] Sistema de notificações ✅
- [x] Sistema de API Keys ✅
- [x] Sistema de Submissões ✅
- [x] CRM de Leads ✅
- [x] Model Context Protocol (MCP) ✅
- [ ] Auditoria de ações (audit log)
- [ ] Rate limiting com Redis
- [ ] Criptografia de API keys armazenadas
- [ ] Testes unitários e E2E
- [ ] CI/CD pipeline
- [ ] Documentação Swagger/OpenAPI
- [ ] Multi-idioma (i18n)
- [ ] Analytics e métricas
- [ ] Sistema de tickets/suporte
- [ ] Kanban board para leads
- [ ] Email tracking e templates

## Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'Add amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

## Licença

MIT

## Autor

**Pablo Cardoso**

---

**Desenvolvido com ❤️ usando Next.js 14, TypeScript, Prisma e Stripe**
