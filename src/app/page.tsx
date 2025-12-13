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
  Flame,
  Shield,
  Users,
  CreditCard,
  Cloud,
  Zap,
  Check,
  Github,
  Twitter,
  Linkedin,
  ArrowRight,
  Loader2,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { CompanyLogos } from "@/components/company-logos";

const features = [
  {
    icon: Shield,
    title: "Autenticação Segura",
    description:
      "Sistema completo de autenticação com JWT, refresh tokens e recuperação de senha.",
  },
  {
    icon: Users,
    title: "Multi-tenant",
    description:
      "Suporte a múltiplas organizações com sistema de convites e gerenciamento de membros.",
  },
  {
    icon: CreditCard,
    title: "Pagamentos Integrados",
    description:
      "Integração com Stripe para assinaturas, webhooks e portal do cliente.",
  },
  {
    icon: Cloud,
    title: "Upload de Arquivos",
    description:
      "Sistema de upload com MinIO/S3, presigned URLs e gerenciamento de arquivos.",
  },
  {
    icon: Zap,
    title: "Performance",
    description:
      "Next.js 14 com App Router, Server Components e otimizações automáticas.",
  },
  {
    icon: Shield,
    title: "RBAC",
    description:
      "Sistema de roles e permissões com guards no frontend e backend.",
  },
];

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSelectPlan = async () => {
    setIsLoading(true);

    try {
      // First, check if user is logged in
      const meResponse = await fetch("/api/auth/me");

      if (!meResponse.ok) {
        // Not logged in, redirect to register
        window.location.href = "/auth/register";
        return;
      }

      const { user } = await meResponse.json();

      // Get user's organizations
      const orgsResponse = await fetch("/api/organizations");
      const { organizations } = await orgsResponse.json();

      if (!organizations || organizations.length === 0) {
        // No organization, redirect to create one
        toast({
          title: "Crie uma organização primeiro",
          description: "Você precisa ter uma organização para assinar um plano.",
        });
        window.location.href = "/dashboard/organizations/new";
        return;
      }

      // Use the first organization
      const organizationId = organizations[0].id;

      // Create checkout session
      const checkoutResponse = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          planSlug: "pro",
        }),
      });

      const result = await checkoutResponse.json();

      if (!checkoutResponse.ok) {
        throw new Error(result.error || "Erro ao criar checkout");
      }

      if (result.url) {
        // Redirect to Stripe checkout
        window.location.href = result.url;
      } else {
        toast({
          title: "Erro",
          description: "URL de checkout não disponível",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro ao criar checkout",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative">
              <Flame className="h-6 w-6 text-primary" />
              <Sparkles className="h-3 w-3 text-primary absolute -top-1 -right-1 animate-pulse" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Flame</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Preços
            </Link>
            <Link
              href="/docs"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Docs
            </Link>
            <Link
              href="/blog"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/auth/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Login
            </Link>
            <ThemeToggle />
            <Button asChild className="shadow-lg">
              <Link href="/auth/register">Começar Grátis</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container py-24 md:py-32">
          <div className="flex flex-col items-center text-center gap-8">
            <Badge variant="secondary" className="px-4 py-1">
              Next.js 14 + TypeScript + Prisma
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-4xl">
              Construa seu SaaS{" "}
              <span className="text-primary">mais rápido</span> com Flame
              Boilerplate
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Boilerplate completo com autenticação, pagamentos, organizações,
              uploads e muito mais. Tudo pronto para você começar a construir.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/auth/register">
                  Começar Agora <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link
                  href="https://github.com/pablocarss/flame-boilerplate"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="mr-2 h-4 w-4" /> Ver no GitHub
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="py-16 border-y bg-muted/30 backdrop-blur-sm overflow-hidden">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Tecnologias utilizadas por empresas líderes
            </p>
          </div>
          <div className="relative flex overflow-x-hidden">
            <div className="flex animate-marquee whitespace-nowrap py-4">
              {Object.entries(CompanyLogos).map(([name, Logo], index) => (
                <div
                  key={`first-${index}`}
                  className="mx-12 flex items-center justify-center text-muted-foreground/40 hover:text-foreground/60 transition-colors"
                >
                  <Logo />
                </div>
              ))}
            </div>
            <div className="absolute top-0 flex animate-marquee2 whitespace-nowrap py-4">
              {Object.entries(CompanyLogos).map(([name, Logo], index) => (
                <div
                  key={`second-${index}`}
                  className="mx-12 flex items-center justify-center text-muted-foreground/40 hover:text-foreground/60 transition-colors"
                >
                  <Logo />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container py-24 bg-muted/50">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tudo que você precisa
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Funcionalidades prontas para produção que você precisa em qualquer
              SaaS moderno.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-border/50 shadow-lg backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="container py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Plano simples e transparente
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comece agora e escale seu negócio. Sem surpresas, sem taxas
              escondidas.
            </p>
          </div>
          <div className="flex justify-center">
            <Card className="relative border-primary shadow-lg w-full max-w-md">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Melhor Escolha
              </Badge>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Pro</CardTitle>
                <CardDescription>Para equipes em crescimento</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">R$ 52,00</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Até 10 usuários</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">10GB de armazenamento</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Suporte prioritário</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Todas as funcionalidades</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Relatórios avançados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">API access</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={handleSelectPlan}
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Assinar Agora
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container py-24 bg-muted/50">
          <div className="flex flex-col items-center text-center gap-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Pronto para começar?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Crie sua conta gratuitamente e comece a construir seu SaaS hoje
              mesmo.
            </p>
            <Button size="lg" asChild>
              <Link href="/auth/register">
                Criar Conta Grátis <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Flame className="h-6 w-6 text-orange-500" />
                <span className="text-xl font-bold">Flame</span>
              </Link>
              <p className="text-muted-foreground mb-4 max-w-md">
                Boilerplate completo para construir seu SaaS com Next.js 14,
                TypeScript, Prisma e muito mais.
              </p>
              <div className="flex gap-4">
                <Link
                  href="https://github.com/pablocarss/flame-boilerplate"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Github className="h-5 w-5" />
                </Link>
                <Link
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </Link>
                <Link
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                </Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#features"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Preços
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Documentação
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/privacy"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Privacidade
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Termos de Uso
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Flame. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
