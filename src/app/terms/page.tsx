"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function TermsPage() {
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
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <span className="hidden sm:inline bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                  Flame
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

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center space-y-6 mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-500 text-sm font-medium">
              <FileText className="h-4 w-4" />
              Última atualização: 13 de Janeiro de 2025
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              Termos de Uso
            </h1>
          </div>

          {/* Content Sections */}
          <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                1. Aceitação dos Termos
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Ao acessar e usar o Flame, você concorda em cumprir e estar
                vinculado a estes Termos de Uso. Se você não concordar com
                alguma parte destes termos, não use nossos serviços.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                2. Descrição do Serviço
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                O Flame é uma plataforma SaaS (Software as a Service) que
                fornece ferramentas e recursos para desenvolvimento de
                aplicações web. Nossos serviços incluem:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Sistema de autenticação e gerenciamento de usuários</li>
                <li>Gerenciamento de organizações e equipes</li>
                <li>Processamento de pagamentos via Stripe</li>
                <li>Armazenamento de arquivos</li>
                <li>Integrações com serviços terceiros</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                3. Registro de Conta
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Para usar nossos serviços, você deve:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Ter pelo menos 18 anos de idade</li>
                <li>Fornecer informações precisas e completas</li>
                <li>Manter a segurança de sua conta e senha</li>
                <li>
                  Notificar-nos imediatamente sobre qualquer uso não autorizado
                </li>
                <li>Ser responsável por todas as atividades em sua conta</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                4. Planos e Pagamentos
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p className="leading-relaxed">
                  <strong>4.1 Planos de Assinatura:</strong> Oferecemos
                  diferentes planos de assinatura com recursos variados. Os
                  detalhes de cada plano estão disponíveis em nossa página de
                  preços.
                </p>
                <p className="leading-relaxed">
                  <strong>4.2 Pagamento:</strong> Os pagamentos são processados
                  pela Stripe. Você concorda em fornecer informações de
                  pagamento válidas e autoriza cobranças recorrentes.
                </p>
                <p className="leading-relaxed">
                  <strong>4.3 Cancelamento:</strong> Você pode cancelar sua
                  assinatura a qualquer momento. O cancelamento entrará em vigor
                  no final do período de cobrança atual.
                </p>
                <p className="leading-relaxed">
                  <strong>4.4 Reembolsos:</strong> Não oferecemos reembolsos
                  para períodos parciais ou não utilizados, exceto quando
                  exigido por lei.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                5. Uso Aceitável
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Você concorda em NÃO:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  Violar leis, regulamentos ou direitos de terceiros
                </li>
                <li>
                  Usar nossos serviços para atividades fraudulentas ou ilegais
                </li>
                <li>
                  Tentar obter acesso não autorizado a nossos sistemas
                </li>
                <li>
                  Interferir ou interromper a integridade ou desempenho do
                  serviço
                </li>
                <li>Usar nossos serviços para enviar spam ou malware</li>
                <li>
                  Fazer engenharia reversa ou tentar extrair código-fonte
                </li>
                <li>
                  Revender ou redistribuir nossos serviços sem autorização
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                6. Propriedade Intelectual
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p className="leading-relaxed">
                  <strong>6.1 Nossos Direitos:</strong> O Flame e todos os seus
                  componentes (código, design, conteúdo) são propriedade nossa
                  ou de nossos licenciadores e são protegidos por leis de
                  propriedade intelectual.
                </p>
                <p className="leading-relaxed">
                  <strong>6.2 Seus Direitos:</strong> Você mantém todos os
                  direitos sobre o conteúdo que você carrega ou cria usando
                  nossos serviços. Ao usar nossos serviços, você nos concede uma
                  licença para hospedar e processar esse conteúdo.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                7. Privacidade e Dados
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Sua privacidade é importante para nós. Nossa{" "}
                <Link
                  href="/privacy"
                  className="text-orange-500 hover:underline"
                >
                  Política de Privacidade
                </Link>{" "}
                explica como coletamos, usamos e protegemos suas informações.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                8. Disponibilidade do Serviço
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Embora nos esforcemos para manter nossos serviços disponíveis
                24/7, não garantimos operação ininterrupta. Podemos suspender o
                serviço para manutenção, atualizações ou por razões de segurança.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                9. Limitação de Responsabilidade
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Na máxima extensão permitida por lei:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  Nossos serviços são fornecidos "como estão" sem garantias
                </li>
                <li>
                  Não somos responsáveis por danos indiretos, incidentais ou
                  consequenciais
                </li>
                <li>
                  Nossa responsabilidade total não excederá o valor pago por
                  você nos últimos 12 meses
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                10. Modificações dos Termos
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Podemos modificar estes termos a qualquer momento. Notificaremos
                você sobre mudanças significativas por email ou através de nosso
                serviço. O uso continuado após as alterações constitui
                aceitação dos novos termos.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                11. Rescisão
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Podemos suspender ou encerrar sua conta se você violar estes
                termos. Você pode cancelar sua conta a qualquer momento através
                das configurações.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                12. Lei Aplicável
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Estes termos são regidos pelas leis do Brasil. Quaisquer
                disputas serão resolvidas nos tribunais competentes do Brasil.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                13. Contato
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Para perguntas sobre estes Termos de Uso, entre em contato:
              </p>
              <div className="bg-muted/50 rounded-lg p-6 space-y-2">
                <p className="text-foreground">
                  <strong>Email:</strong> legal@flame.dev
                </p>
                <p className="text-foreground">
                  <strong>Endereço:</strong> [Seu Endereço]
                </p>
              </div>
            </section>
          </div>

          {/* Related Links */}
          <div className="mt-12 pt-8 border-t">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/privacy">
                <Button variant="outline">Política de Privacidade</Button>
              </Link>
              <Link href="/docs">
                <Button variant="outline">Documentação</Button>
              </Link>
              <Link href="/">
                <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
                  Voltar ao Início
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
