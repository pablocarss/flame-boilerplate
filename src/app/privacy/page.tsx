"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function PrivacyPage() {
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
                  <Shield className="h-5 w-5 text-white" />
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
              <Shield className="h-4 w-4" />
              Última atualização: 13 de Janeiro de 2025
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              Política de Privacidade
            </h1>
          </div>

          {/* Content Sections */}
          <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                1. Informações que Coletamos
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                A Flame coleta informações que você nos fornece diretamente ao
                criar uma conta, usar nossos serviços ou entrar em contato
                conosco. Isso inclui:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  <strong>Informações de conta:</strong> nome, email, senha
                  (criptografada)
                </li>
                <li>
                  <strong>Informações de organização:</strong> nome da empresa,
                  membros da equipe
                </li>
                <li>
                  <strong>Informações de pagamento:</strong> gerenciadas de
                  forma segura pela Stripe
                </li>
                <li>
                  <strong>Informações de uso:</strong> como você interage com
                  nossa plataforma
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                2. Como Usamos Suas Informações
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Utilizamos as informações coletadas para:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Fornecer, manter e melhorar nossos serviços</li>
                <li>Processar transações e enviar notificações relacionadas</li>
                <li>Enviar emails técnicos e de suporte</li>
                <li>Responder a comentários, perguntas e solicitações</li>
                <li>
                  Proteger contra fraudes e uso não autorizado de nossos
                  serviços
                </li>
                <li>Cumprir obrigações legais</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                3. Compartilhamento de Informações
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Não vendemos suas informações pessoais. Compartilhamos suas
                informações apenas nas seguintes situações:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  <strong>Com prestadores de serviços:</strong> como Stripe
                  (pagamentos), AWS (hospedagem)
                </li>
                <li>
                  <strong>Por razões legais:</strong> quando exigido por lei ou
                  para proteger nossos direitos
                </li>
                <li>
                  <strong>Com seu consentimento:</strong> quando você nos
                  autoriza explicitamente
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                4. Segurança dos Dados
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Implementamos medidas de segurança técnicas e organizacionais
                para proteger suas informações pessoais:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Criptografia de dados em trânsito (HTTPS/TLS)</li>
                <li>Criptografia de senhas com bcrypt</li>
                <li>Autenticação com JWT tokens seguros</li>
                <li>Backups regulares e recuperação de desastres</li>
                <li>Monitoramento contínuo de segurança</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                5. Seus Direitos
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Você tem os seguintes direitos em relação às suas informações
                pessoais:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  <strong>Acesso:</strong> solicitar cópias de suas informações
                  pessoais
                </li>
                <li>
                  <strong>Correção:</strong> corrigir informações imprecisas ou
                  incompletas
                </li>
                <li>
                  <strong>Exclusão:</strong> solicitar a exclusão de suas
                  informações
                </li>
                <li>
                  <strong>Portabilidade:</strong> receber suas informações em
                  formato portátil
                </li>
                <li>
                  <strong>Objeção:</strong> opor-se ao processamento de suas
                  informações
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                6. Cookies e Tecnologias Similares
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Utilizamos cookies e tecnologias similares para:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Manter você autenticado</li>
                <li>Lembrar suas preferências (tema, idioma)</li>
                <li>Analisar o uso de nossos serviços</li>
                <li>Melhorar a experiência do usuário</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Você pode configurar seu navegador para recusar cookies, mas
                isso pode afetar a funcionalidade do serviço.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                7. Retenção de Dados
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Mantemos suas informações pessoais apenas pelo tempo necessário
                para cumprir os propósitos descritos nesta política, a menos
                que um período de retenção maior seja exigido ou permitido por
                lei.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                8. Transferências Internacionais
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Seus dados podem ser transferidos e mantidos em servidores
                localizados fora do seu país de residência. Ao usar nossos
                serviços, você consente com essa transferência.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                9. Alterações nesta Política
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Podemos atualizar esta política periodicamente. Notificaremos
                você sobre alterações significativas por email ou através de um
                aviso em nosso site.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                10. Entre em Contato
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Se você tiver dúvidas sobre esta Política de Privacidade ou
                sobre nossas práticas de dados, entre em contato:
              </p>
              <div className="bg-muted/50 rounded-lg p-6 space-y-2">
                <p className="text-foreground">
                  <strong>Email:</strong> privacy@flame.dev
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
              <Link href="/terms">
                <Button variant="outline">Termos de Uso</Button>
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
