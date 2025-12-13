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
import {
  ArrowLeft,
  BookOpen,
  Code,
  Zap,
  Shield,
  Database,
  Mail,
  CreditCard,
  Users,
  Settings,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const sections = [
  {
    icon: Zap,
    title: "Início Rápido",
    description: "Configure seu projeto em minutos",
    items: [
      "Instalação e configuração",
      "Primeiro projeto",
      "Variáveis de ambiente",
      "Docker setup",
    ],
  },
  {
    icon: Shield,
    title: "Autenticação",
    description: "Sistema completo de autenticação JWT",
    items: [
      "Registro de usuários",
      "Login e logout",
      "Refresh tokens",
      "Recuperação de senha",
      "Proteção de rotas",
    ],
  },
  {
    icon: Users,
    title: "Organizações & Membros",
    description: "Sistema multi-tenant",
    items: [
      "Criar organizações",
      "Gerenciar membros",
      "Sistema de convites",
      "Roles e permissões (RBAC)",
    ],
  },
  {
    icon: CreditCard,
    title: "Pagamentos (Stripe)",
    description: "Integração completa com Stripe",
    items: [
      "Configurar Stripe",
      "Checkout session",
      "Customer portal",
      "Webhooks",
      "Gerenciar planos",
    ],
  },
  {
    icon: Database,
    title: "Banco de Dados",
    description: "Prisma ORM + PostgreSQL",
    items: [
      "Schema do banco",
      "Migrations",
      "Seeds",
      "Prisma Studio",
      "Queries e relations",
    ],
  },
  {
    icon: Mail,
    title: "Email",
    description: "Sistema de envio de emails",
    items: [
      "Configurar Resend",
      "Templates de email",
      "MailHog (desenvolvimento)",
      "Envio de convites",
      "Reset de senha",
    ],
  },
  {
    icon: Code,
    title: "API Reference",
    description: "Documentação completa da API",
    items: [
      "Endpoints de autenticação",
      "Endpoints de organizações",
      "Endpoints de billing",
      "Endpoints de integrações",
      "Webhooks",
    ],
  },
  {
    icon: Settings,
    title: "Deploy",
    description: "Como fazer deploy do projeto",
    items: [
      "Deploy com Docker",
      "Deploy na Vercel",
      "Variáveis de ambiente",
      "Banco de dados (produção)",
      "Segurança",
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="flex items-center gap-2 font-bold text-xl"
              >
                <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-2 rounded-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="hidden sm:inline bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                  Flame Docs
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Voltar ao site</span>
                  <span className="sm:hidden">Voltar</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-500 text-sm font-medium">
            <BookOpen className="h-4 w-4" />
            Documentação
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
            Documentação Flame
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Tudo que você precisa saber para construir sua aplicação SaaS com
            o Flame Boilerplate
          </p>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {sections.map((section, index) => (
            <Link
              key={index}
              href={
                section.title === "Início Rápido"
                  ? "/docs/getting-started"
                  : section.title === "API Reference"
                  ? "/docs/api"
                  : "#"
              }
            >
            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer group h-full"
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500/10 to-pink-500/10 group-hover:from-orange-500/20 group-hover:to-pink-500/20 transition-colors">
                    <section.icon className="h-6 w-6 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">{section.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {section.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.items.map((item, i) => (
                    <li
                      key={i}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                    >
                      <div className="h-1 w-1 rounded-full bg-orange-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            </Link>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-orange-500/5 to-pink-500/5 border-orange-500/20">
            <CardHeader>
              <CardTitle>Links Úteis</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="https://github.com/pablocarss/flame-boilerplate"
                target="_blank"
                className="flex items-center gap-3 p-4 rounded-lg border bg-background hover:bg-muted transition-colors"
              >
                <Code className="h-5 w-5 text-orange-500" />
                <div>
                  <div className="font-medium">GitHub</div>
                  <div className="text-sm text-muted-foreground">
                    Código fonte
                  </div>
                </div>
              </Link>
              <Link
                href="/blog"
                className="flex items-center gap-3 p-4 rounded-lg border bg-background hover:bg-muted transition-colors"
              >
                <BookOpen className="h-5 w-5 text-orange-500" />
                <div>
                  <div className="font-medium">Blog</div>
                  <div className="text-sm text-muted-foreground">
                    Tutoriais e artigos
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
