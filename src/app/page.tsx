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
} from "lucide-react";

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
      "Integração com AbacatePay para assinaturas, webhooks e portal do cliente.",
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

const plans = [
  {
    name: "Free",
    description: "Para começar sua jornada",
    price: "R$ 0",
    interval: "/mês",
    features: [
      "1 usuário",
      "100MB de armazenamento",
      "Suporte por email",
      "Funcionalidades básicas",
    ],
    cta: "Começar Grátis",
    popular: false,
  },
  {
    name: "Pro",
    description: "Para equipes em crescimento",
    price: "R$ 49,90",
    interval: "/mês",
    features: [
      "Até 10 usuários",
      "10GB de armazenamento",
      "Suporte prioritário",
      "Todas as funcionalidades",
      "Relatórios avançados",
      "API access",
    ],
    cta: "Assinar Pro",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "Para grandes organizações",
    price: "R$ 199,90",
    interval: "/mês",
    features: [
      "Usuários ilimitados",
      "Armazenamento ilimitado",
      "Suporte 24/7",
      "Todas as funcionalidades",
      "Relatórios customizados",
      "API access",
      "SSO/SAML",
      "SLA garantido",
    ],
    cta: "Falar com Vendas",
    popular: false,
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-500" />
            <span className="text-xl font-bold">Flame</span>
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
              href="/auth/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Login
            </Link>
            <Button asChild>
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
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="mr-2 h-4 w-4" /> Ver no GitHub
                </Link>
              </Button>
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
              <Card key={index} className="border-0 shadow-sm">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
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
              Planos simples e transparentes
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Escolha o plano ideal para o seu negócio. Sem surpresas, sem taxas
              escondidas.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${
                  plan.popular ? "border-primary shadow-lg scale-105" : ""
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Mais Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">
                      {plan.interval}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link href="/auth/register">{plan.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
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
                  href="https://github.com"
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
