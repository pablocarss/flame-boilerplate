"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Lock, Globe, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const endpoints = [
  {
    category: "Autenticação",
    description: "Endpoints para gerenciar autenticação de usuários",
    routes: [
      {
        method: "POST",
        path: "/api/auth/register",
        desc: "Registrar novo usuário",
        auth: false,
        body: "{ email, name, password }",
      },
      {
        method: "POST",
        path: "/api/auth/login",
        desc: "Login (retorna access + refresh token)",
        auth: false,
        body: "{ email, password }",
      },
      {
        method: "POST",
        path: "/api/auth/refresh",
        desc: "Renovar access token",
        auth: false,
        body: "{ refreshToken }",
      },
      {
        method: "POST",
        path: "/api/auth/logout",
        desc: "Logout (revoga refresh token)",
        auth: true,
        body: "{ refreshToken }",
      },
      {
        method: "GET",
        path: "/api/auth/me",
        desc: "Dados do usuário autenticado",
        auth: true,
      },
      {
        method: "POST",
        path: "/api/auth/forgot-password",
        desc: "Solicitar reset de senha",
        auth: false,
        body: "{ email }",
      },
      {
        method: "POST",
        path: "/api/auth/verify-reset-token",
        desc: "Verificar token de reset",
        auth: false,
        body: "{ token }",
      },
      {
        method: "POST",
        path: "/api/auth/reset-password",
        desc: "Resetar senha",
        auth: false,
        body: "{ token, password }",
      },
    ],
  },
  {
    category: "Organizações",
    description: "Gerenciamento de organizações multi-tenant",
    routes: [
      {
        method: "GET",
        path: "/api/organizations",
        desc: "Listar organizações do usuário",
        auth: true,
      },
      {
        method: "POST",
        path: "/api/organizations",
        desc: "Criar organização (user vira admin automaticamente)",
        auth: true,
        body: "{ name, slug }",
      },
    ],
  },
  {
    category: "Membros",
    description: "Gerenciar membros de organizações",
    routes: [
      {
        method: "GET",
        path: "/api/members?organizationId=xxx",
        desc: "Listar membros da organização",
        auth: true,
        permission: "member:read",
      },
      {
        method: "PATCH",
        path: "/api/members/:id/role",
        desc: "Alterar role do membro",
        auth: true,
        permission: "member:update",
        body: "{ role: 'ADMIN' | 'MEMBER' }",
      },
      {
        method: "DELETE",
        path: "/api/members/:id",
        desc: "Remover membro",
        auth: true,
        permission: "member:delete",
      },
    ],
  },
  {
    category: "Convites",
    description: "Sistema de convites para novos membros",
    routes: [
      {
        method: "GET",
        path: "/api/invites?organizationId=xxx",
        desc: "Listar convites da organização",
        auth: true,
        permission: "invite:read",
      },
      {
        method: "POST",
        path: "/api/invites",
        desc: "Enviar convite por email",
        auth: true,
        permission: "invite:create",
        body: "{ organizationId, email, role }",
      },
      {
        method: "POST",
        path: "/api/invites/verify",
        desc: "Verificar validade do convite",
        auth: false,
        body: "{ token }",
      },
      {
        method: "POST",
        path: "/api/invites/accept",
        desc: "Aceitar convite",
        auth: true,
        body: "{ token }",
      },
      {
        method: "POST",
        path: "/api/invites/:id/revoke",
        desc: "Revogar convite",
        auth: true,
        permission: "invite:revoke",
      },
    ],
  },
  {
    category: "Billing (Stripe)",
    description: "Gerenciar assinaturas e pagamentos",
    routes: [
      {
        method: "POST",
        path: "/api/billing/checkout",
        desc: "Criar sessão de checkout",
        auth: true,
        permission: "billing:update",
        body: "{ organizationId, planSlug }",
      },
      {
        method: "POST",
        path: "/api/billing/portal",
        desc: "Criar sessão do customer portal",
        auth: true,
        permission: "billing:update",
        body: "{ organizationId }",
      },
      {
        method: "POST",
        path: "/api/webhooks/stripe",
        desc: "Webhook Stripe (assinado)",
        auth: false,
        note: "Verificado via signature do Stripe",
      },
    ],
  },
  {
    category: "Integrações",
    description: "CRUD de integrações de terceiros",
    routes: [
      {
        method: "GET",
        path: "/api/integrations?organizationId=xxx",
        desc: "Listar integrações",
        auth: true,
        permission: "integration:read",
      },
      {
        method: "POST",
        path: "/api/integrations",
        desc: "Criar integração",
        auth: true,
        permission: "integration:create",
        body: "{ organizationId, provider, name, apiKey, ... }",
      },
      {
        method: "GET",
        path: "/api/integrations/:id",
        desc: "Detalhes da integração",
        auth: true,
        permission: "integration:read",
      },
      {
        method: "PATCH",
        path: "/api/integrations/:id",
        desc: "Atualizar integração",
        auth: true,
        permission: "integration:update",
      },
      {
        method: "DELETE",
        path: "/api/integrations/:id",
        desc: "Deletar integração",
        auth: true,
        permission: "integration:delete",
      },
    ],
  },
  {
    category: "Upload",
    description: "Sistema de upload de arquivos (MinIO/S3)",
    routes: [
      {
        method: "POST",
        path: "/api/upload",
        desc: "Upload de arquivo",
        auth: true,
        body: "FormData com arquivo",
      },
      {
        method: "POST",
        path: "/api/upload/presigned",
        desc: "Gerar URL presigned para upload",
        auth: true,
        body: "{ filename, contentType }",
      },
    ],
  },
  {
    category: "Perfil",
    description: "Gerenciar perfil do usuário",
    routes: [
      {
        method: "GET",
        path: "/api/profile",
        desc: "Dados do perfil",
        auth: true,
      },
      {
        method: "PATCH",
        path: "/api/profile",
        desc: "Atualizar perfil",
        auth: true,
        body: "{ name, avatarUrl }",
      },
      {
        method: "PATCH",
        path: "/api/profile/password",
        desc: "Alterar senha",
        auth: true,
        body: "{ currentPassword, newPassword }",
      },
    ],
  },
];

export default function APIDocsPage() {
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
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">API Reference</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Documentação completa de todos os endpoints da API Flame
            </p>

            {/* Autenticação Info */}
            <Card className="border-orange-500/20 bg-orange-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Autenticação JWT
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  A maioria dos endpoints requer autenticação via JWT. Inclua o
                  token no header:
                </p>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                  <pre>Authorization: Bearer {"{access_token}"}</pre>
                </div>
                <p className="text-sm text-muted-foreground">
                  O access token expira em 15 minutos. Use o refresh token para
                  obter um novo.
                </p>
              </CardContent>
            </Card>

            {/* CORS Info */}
            <Card className="border-blue-500/20 bg-blue-500/5 mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  CORS (Cross-Origin Resource Sharing)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  O Flame está configurado para aceitar requisições de qualquer
                  origem em desenvolvimento. Em produção, configure o
                  middleware Next.js:
                </p>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre>{`// middleware.ts
export function middleware(request: Request) {
  const response = NextResponse.next();

  response.headers.set('Access-Control-Allow-Origin', 'https://seu-dominio.com');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return response;
}`}</pre>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>Recomendação:</strong> Use uma whitelist de domínios
                  permitidos em produção.
                </p>
              </CardContent>
            </Card>

            {/* RBAC Info */}
            <Card className="border-purple-500/20 bg-purple-500/5 mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  RBAC (Role-Based Access Control)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Endpoints com permissões específicas são protegidos pelo
                  sistema RBAC:
                </p>
                <ul className="space-y-2 text-sm">
                  <li>
                    <strong>ADMIN:</strong> Acesso total (create, read, update,
                    delete)
                  </li>
                  <li>
                    <strong>MEMBER:</strong> Acesso limitado (geralmente apenas
                    read)
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  A verificação de permissões acontece via{" "}
                  <code>guardOrganization()</code> em cada endpoint.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Endpoints por Categoria */}
          <div className="space-y-8">
            {endpoints.map((category, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="text-2xl">{category.category}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {category.routes.map((route, routeIdx) => (
                      <div
                        key={routeIdx}
                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex flex-wrap items-start gap-3 mb-2">
                          <Badge
                            variant={
                              route.method === "GET"
                                ? "default"
                                : route.method === "POST"
                                ? "secondary"
                                : "destructive"
                            }
                            className="font-mono"
                          >
                            {route.method}
                          </Badge>
                          <code className="text-sm flex-1 bg-muted px-3 py-1 rounded">
                            {route.path}
                          </code>
                          {route.auth && (
                            <Badge variant="outline" className="text-xs">
                              <Lock className="h-3 w-3 mr-1" />
                              Auth
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {route.desc}
                        </p>
                        {route.permission && (
                          <p className="text-xs text-muted-foreground">
                            <strong>Permissão:</strong>{" "}
                            <code>{route.permission}</code>
                          </p>
                        )}
                        {route.body && (
                          <p className="text-xs text-muted-foreground mt-1">
                            <strong>Body:</strong> <code>{route.body}</code>
                          </p>
                        )}
                        {route.note && (
                          <p className="text-xs text-orange-500 mt-1">
                            <strong>Nota:</strong> {route.note}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Rate Limiting */}
          <Card className="mt-8 border-yellow-500/20 bg-yellow-500/5">
            <CardHeader>
              <CardTitle>Rate Limiting (TODO)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Rate limiting ainda não está implementado. Planejamos adicionar:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>Limite de 100 requisições/minuto por IP</li>
                <li>Limite de 1000 requisições/hora por usuário</li>
                <li>Redis para armazenar contadores</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
