"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Terminal, Package, Database, Rocket } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function GettingStartedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/docs" className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar aos Docs
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Início Rápido</h1>
            <p className="text-lg text-muted-foreground">
              Configure seu projeto Flame em minutos e comece a desenvolver
            </p>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
            {/* Pré-requisitos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Pré-requisitos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Antes de começar, certifique-se de ter instalado:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Node.js 18+</strong> ou <strong>pnpm</strong>
                  </li>
                  <li>
                    <strong>Docker e Docker Compose</strong> (para serviços
                    locais)
                  </li>
                  <li>
                    <strong>Git</strong> (para controle de versão)
                  </li>
                  <li>
                    <strong>Conta Stripe</strong> (gratuita para teste)
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Instalação */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  Passo 1: Clone o Repositório
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre>
                    git clone https://github.com/pablocarss/flame-boilerplate.git
                    {"\n"}cd flame-boilerplate
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  Passo 2: Configure Variáveis de Ambiente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Copie o arquivo de exemplo e configure suas variáveis:</p>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre>cp .env.example .env</pre>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>IMPORTANTE:</strong> Nunca commite o arquivo .env com
                  dados reais!
                </p>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre>{`# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (porta alterada para evitar conflito)
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/flame_db?schema=public"

# JWT (MUDE EM PRODUÇÃO)
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this

# Stripe (Use chaves de TEST)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key`}</pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Passo 3: Inicie os Serviços Docker
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Inicie PostgreSQL, Redis, MinIO e MailHog:</p>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre>docker-compose up -d</pre>
                </div>
                <p className="text-sm">Serviços disponíveis:</p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>
                    <strong>PostgreSQL:</strong> localhost:5433
                  </li>
                  <li>
                    <strong>MinIO API:</strong> localhost:9000
                  </li>
                  <li>
                    <strong>MinIO Console:</strong> localhost:9001
                  </li>
                  <li>
                    <strong>Redis:</strong> localhost:6380
                  </li>
                  <li>
                    <strong>MailHog Web:</strong> localhost:8025
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Passo 4: Instale Dependências
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre>pnpm install{"\n"}# ou{"\n"}npm install</pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Passo 5: Configure o Banco de Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Execute o push do schema e o seed:</p>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre>
                    pnpm db:push{"\n"}pnpm db:seed
                  </pre>
                </div>
                <p className="text-sm text-muted-foreground">
                  Isso criará as tabelas e inserirá dados iniciais (usuário
                  demo, planos, etc.)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5" />
                  Passo 6: Inicie o Servidor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre>pnpm dev{"\n"}# ou{"\n"}npm run dev</pre>
                </div>
                <p>
                  Acesse{" "}
                  <a
                    href="http://localhost:3000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-500 hover:underline"
                  >
                    http://localhost:3000
                  </a>
                </p>
              </CardContent>
            </Card>

            {/* Credenciais Demo */}
            <Card className="border-orange-500/20 bg-orange-500/5">
              <CardHeader>
                <CardTitle>Credenciais de Teste</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>Após o seed, você pode fazer login com:</p>
                <div className="bg-muted rounded-lg p-4 space-y-1">
                  <p className="font-mono text-sm">
                    <strong>Email:</strong> demo@flame.dev
                  </p>
                  <p className="font-mono text-sm">
                    <strong>Senha:</strong> demo123456
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Próximos Passos */}
            <Card>
              <CardHeader>
                <CardTitle>Próximos Passos</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-orange-500" />
                    <div>
                      <Link
                        href="/docs/authentication"
                        className="text-orange-500 hover:underline font-medium"
                      >
                        Configurar Autenticação
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        Entenda como funciona o sistema de auth com JWT
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-orange-500" />
                    <div>
                      <Link
                        href="/docs/stripe"
                        className="text-orange-500 hover:underline font-medium"
                      >
                        Integrar Stripe
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        Configure pagamentos e webhooks
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-orange-500" />
                    <div>
                      <Link
                        href="/docs/api"
                        className="text-orange-500 hover:underline font-medium"
                      >
                        Explorar API
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        Veja todos os endpoints disponíveis
                      </p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
