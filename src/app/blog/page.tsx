"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Flame,
  ArrowRight,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const blogPosts = [
  {
    title: "Como configurar autenticação JWT no Next.js 14",
    excerpt:
      "Aprenda a implementar um sistema completo de autenticação com JWT, incluindo access tokens, refresh tokens e recuperação de senha.",
    author: "Flame Team",
    date: "2025-01-15",
    readTime: "10 min",
    category: "Autenticação",
    image: "🔐",
  },
  {
    title: "Integração com Stripe: Guia completo",
    excerpt:
      "Tutorial passo a passo para integrar pagamentos recorrentes com Stripe, incluindo webhooks e customer portal.",
    author: "Flame Team",
    date: "2025-01-12",
    readTime: "15 min",
    category: "Pagamentos",
    image: "💳",
  },
  {
    title: "Sistema Multi-tenant com Prisma e PostgreSQL",
    excerpt:
      "Construa aplicações multi-tenant escaláveis usando Prisma ORM e PostgreSQL com isolamento de dados por organização.",
    author: "Flame Team",
    date: "2025-01-10",
    readTime: "12 min",
    category: "Banco de Dados",
    image: "🏢",
  },
  {
    title: "RBAC: Implementando controle de acesso baseado em roles",
    excerpt:
      "Aprenda a criar um sistema robusto de permissões com roles e guards no frontend e backend.",
    author: "Flame Team",
    date: "2025-01-08",
    readTime: "8 min",
    category: "Segurança",
    image: "🛡️",
  },
  {
    title: "Upload de arquivos com MinIO e S3",
    excerpt:
      "Como implementar upload de arquivos usando MinIO (S3-compatible) com presigned URLs e validação de arquivos.",
    author: "Flame Team",
    date: "2025-01-05",
    readTime: "10 min",
    category: "Storage",
    image: "☁️",
  },
  {
    title: "Deploy do Flame Boilerplate na Vercel",
    excerpt:
      "Guia completo de deploy: configure variáveis de ambiente, banco de dados e serviços externos para produção.",
    author: "Flame Team",
    date: "2025-01-03",
    readTime: "7 min",
    category: "Deploy",
    image: "🚀",
  },
];

const categories = [
  "Todos",
  "Autenticação",
  "Pagamentos",
  "Banco de Dados",
  "Segurança",
  "Storage",
  "Deploy",
];

export default function BlogPage() {
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
                  <Flame className="h-5 w-5 text-white" />
                </div>
                <span className="hidden sm:inline bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                  Flame Blog
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
            Blog
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
            Blog Flame
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Tutoriais, guias e artigos sobre desenvolvimento de aplicações SaaS
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={category === "Todos" ? "default" : "outline"}
              className={
                category === "Todos"
                  ? "bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 cursor-pointer"
                  : "cursor-pointer hover:bg-muted"
              }
            >
              {category}
            </Badge>
          ))}
        </div>
      </section>

      {/* Blog Posts */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {blogPosts.map((post, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-all cursor-pointer group flex flex-col"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="text-5xl">{post.image}</div>
                  <Badge variant="outline" className="text-xs">
                    {post.category}
                  </Badge>
                </div>
                <CardTitle className="text-xl mt-4 group-hover:text-orange-500 transition-colors">
                  {post.title}
                </CardTitle>
                <CardDescription className="mt-2 line-clamp-2">
                  {post.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {post.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(post.date).toLocaleDateString("pt-BR")}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="ghost"
                  className="w-full group-hover:bg-muted"
                >
                  Ler mais
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-16 max-w-2xl mx-auto">
          <Card className="bg-gradient-to-r from-orange-500/5 to-pink-500/5 border-orange-500/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                Receba novos artigos por email
              </CardTitle>
              <CardDescription>
                Fique por dentro das últimas novidades sobre desenvolvimento
                SaaS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="seu@email.com"
                  className="flex-1 px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 whitespace-nowrap">
                  Inscrever-se
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
