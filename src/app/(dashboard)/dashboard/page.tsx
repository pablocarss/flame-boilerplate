import { getCurrentUser } from '@/infrastructure/services/auth/auth.service';
import { prisma } from "@/infrastructure/prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, Users, Mail, CreditCard, FileText, TrendingUp, DollarSign, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

async function getStats(userId: string) {
  const userOrgs = await prisma.organization.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    select: { id: true },
  });

  const orgIds = userOrgs.map(org => org.id);

  const [organizations, members, invites, submissions, leads, leadsStats] = await Promise.all([
    prisma.organization.count({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
    }),
    prisma.member.count({
      where: {
        organization: {
          members: {
            some: {
              userId,
              role: "ADMIN",
            },
          },
        },
      },
    }),
    prisma.invite.count({
      where: {
        sender: {
          id: userId,
        },
        status: "PENDING",
      },
    }),
    prisma.submission.count({
      where: {
        organizationId: {
          in: orgIds,
        },
      },
    }),
    prisma.lead.count({
      where: {
        organizationId: {
          in: orgIds,
        },
      },
    }),
    prisma.lead.groupBy({
      by: ['status'],
      where: {
        organizationId: {
          in: orgIds,
        },
      },
      _count: true,
      _sum: {
        value: true,
      },
    }),
  ]);

  const totalLeadValue = leadsStats.reduce((sum, stat) => sum + (stat._sum.value || 0), 0);
  const statusCounts = leadsStats.reduce((acc, stat) => {
    acc[stat.status] = stat._count;
    return acc;
  }, {} as Record<string, number>);

  return {
    organizations,
    members,
    invites,
    submissions,
    leads,
    totalLeadValue,
    statusCounts,
  };
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const stats = await getStats(user.id);

  const mainCards = [
    {
      title: "Total de Leads",
      value: stats.leads,
      description: "Leads cadastrados",
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Submissões",
      value: stats.submissions,
      description: "Formulários recebidos",
      icon: FileText,
      color: "text-purple-500",
    },
    {
      title: "Valor em Pipeline",
      value: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(stats.totalLeadValue),
      description: "Valor total estimado",
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      title: "Novos Leads",
      value: stats.statusCounts.NEW || 0,
      description: "Aguardando contato",
      icon: Target,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Olá, {user.name || "Usuário"}!
        </h2>
        <p className="text-muted-foreground">
          Aqui está um resumo do seu pipeline de vendas.
        </p>
      </div>

      {/* Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mainCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status dos Leads */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline de Vendas</CardTitle>
          <CardDescription>
            Distribuição dos leads por estágio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-7">
            {[
              { status: 'NEW', label: 'Novo', color: 'bg-blue-500' },
              { status: 'CONTACTED', label: 'Contatado', color: 'bg-purple-500' },
              { status: 'QUALIFIED', label: 'Qualificado', color: 'bg-cyan-500' },
              { status: 'PROPOSAL', label: 'Proposta', color: 'bg-yellow-500' },
              { status: 'NEGOTIATION', label: 'Negociação', color: 'bg-orange-500' },
              { status: 'WON', label: 'Ganho', color: 'bg-green-500' },
              { status: 'LOST', label: 'Perdido', color: 'bg-red-500' },
            ].map((item) => (
              <div key={item.status} className="flex flex-col items-center p-4 rounded-lg border">
                <div className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center text-white font-bold mb-2`}>
                  {stats.statusCounts[item.status] || 0}
                </div>
                <p className="text-xs font-medium text-center">{item.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Organização e Ações */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Conta</CardTitle>
            <CardDescription>
              Detalhes sobre sua organização
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Organizações</span>
              <Badge variant="secondary">{stats.organizations}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Membros Totais</span>
              <Badge variant="secondary">{stats.members}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Convites Pendentes</span>
              <Badge variant="secondary">{stats.invites}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge className="bg-green-500">Ativa</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Tarefas comuns que você pode fazer</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <a
              href="/dashboard/leads"
              className="flex items-center gap-2 text-sm text-primary hover:underline p-2 hover:bg-muted rounded-md transition-colors"
            >
              <Users className="h-4 w-4" />
              Gerenciar Leads
            </a>
            <a
              href="/dashboard/submissions"
              className="flex items-center gap-2 text-sm text-primary hover:underline p-2 hover:bg-muted rounded-md transition-colors"
            >
              <FileText className="h-4 w-4" />
              Ver Submissões
            </a>
            <a
              href="/dashboard/organizations/new"
              className="flex items-center gap-2 text-sm text-primary hover:underline p-2 hover:bg-muted rounded-md transition-colors"
            >
              <Building2 className="h-4 w-4" />
              Criar Nova Organização
            </a>
            <a
              href="/dashboard/billing"
              className="flex items-center gap-2 text-sm text-primary hover:underline p-2 hover:bg-muted rounded-md transition-colors"
            >
              <CreditCard className="h-4 w-4" />
              Gerenciar Assinatura
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
