# Flame Boilerplate

Um boilerplate completo para construir aplicações SaaS modernas com Next.js 14, TypeScript, Prisma, PostgreSQL e muito mais.

## Stack Técnica

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Estilização**: Tailwind CSS, ShadcnUI, Radix UI, Lucide Icons
- **Backend**: Next.js API Routes
- **Banco de Dados**: PostgreSQL + Prisma ORM
- **Autenticação**: JWT com jose (access + refresh token)
- **Pagamentos**: AbacatePay
- **Storage**: MinIO (S3 compatible)
- **Email**: Resend
- **Infraestrutura**: Docker + Docker Compose

## Funcionalidades

### Landing Page
- Hero section com CTA
- Seção de features
- Seção de pricing (planos)
- Footer responsivo

### Autenticação JWT
- Registro de usuário
- Login com JWT (access token + refresh token)
- Logout
- Middleware de proteção de rotas
- Recuperação de senha por email

### Banco de Dados
- Schema completo com: User, Organization, Member, Invite, Subscription, Plan, Upload
- Seeds para dados iniciais
- Migrations

### Sistema de Convites
- Enviar convite para novo membro por email
- Aceitar/recusar convite
- Listar convites pendentes
- Revogar convite

### Sistema de Roles (RBAC)
- Roles: ADMIN, MEMBER
- Guards no frontend e backend
- Middleware de verificação de permissões
- Páginas restritas por role

### Pagamentos com AbacatePay
- Criar cliente
- Gerenciar assinatura
- Webhooks para eventos
- Portal do cliente
- Planos: Free, Pro, Enterprise

### Upload com MinIO/S3
- Upload de arquivos (avatars, documentos)
- Presigned URLs
- Validação de tipo e tamanho

## Começando

### Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- npm ou yarn

### Instalação

1. Clone o repositório:
```bash
git clone <repo-url> flame-boilerplate
cd flame-boilerplate
```

2. Copie o arquivo de ambiente:
```bash
cp .env.example .env
```

3. Configure as variáveis de ambiente no `.env`

4. Inicie os serviços com Docker:
```bash
docker-compose up -d
```

5. Instale as dependências:
```bash
npm install
```

6. Execute as migrations:
```bash
npm run db:migrate
```

7. Execute o seed (dados iniciais):
```bash
npm run db:seed
```

8. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

### Credenciais Demo

Após executar o seed, você pode usar:
- **Email**: demo@flame.dev
- **Senha**: demo123456

## Scripts Disponíveis

```bash
npm run dev          # Inicia o servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Inicia o servidor de produção
npm run lint         # Executa o linter

npm run db:generate  # Gera o Prisma Client
npm run db:push      # Push do schema para o banco
npm run db:migrate   # Cria uma nova migration
npm run db:seed      # Executa o seed
npm run db:studio    # Abre o Prisma Studio

npm run docker:up    # Sobe os containers Docker
npm run docker:down  # Para os containers Docker
npm run docker:build # Builda a imagem Docker
```

## Estrutura do Projeto

```
├── prisma/
│   ├── schema.prisma      # Schema do banco de dados
│   └── seed.ts            # Dados iniciais
├── src/
│   ├── app/               # App Router (Next.js 14)
│   │   ├── (dashboard)/   # Rotas protegidas do dashboard
│   │   ├── api/           # API Routes
│   │   ├── auth/          # Páginas de autenticação
│   │   └── invite/        # Página de aceitar convite
│   ├── components/        # Componentes React
│   │   ├── billing/       # Componentes de billing
│   │   ├── dashboard/     # Componentes do dashboard
│   │   ├── invites/       # Componentes de convites
│   │   ├── members/       # Componentes de membros
│   │   └── ui/            # Componentes UI (ShadcnUI)
│   └── lib/               # Utilitários e configurações
│       ├── abacatepay.ts  # Client AbacatePay
│       ├── auth.ts        # Funções de autenticação
│       ├── email.ts       # Client de email (Resend)
│       ├── prisma.ts      # Client Prisma
│       ├── rbac.ts        # Sistema de permissões
│       ├── storage.ts     # Client MinIO/S3
│       ├── utils.ts       # Utilitários gerais
│       └── validations.ts # Schemas Zod
├── docker-compose.yml     # Configuração Docker
├── Dockerfile             # Build da aplicação
└── .env.example           # Variáveis de ambiente
```

## Variáveis de Ambiente

```env
# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/flame_db?schema=public"

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# MinIO/S3
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=flame-uploads

# Resend (Email)
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# AbacatePay
ABACATEPAY_API_KEY=your_api_key
ABACATEPAY_WEBHOOK_SECRET=your_webhook_secret
```

## Deploy

### Docker (Produção)

```bash
docker-compose --profile production up -d
```

### Vercel

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

## Licença

MIT
