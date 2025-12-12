import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, Users, Mail, CreditCard } from "lucide-react";

async function getStats(userId: string) {
  const [organizations, members, invites] = await Promise.all([
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
  ]);

  return { organizations, members, invites };
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const stats = await getStats(user.id);

  const cards = [
    {
      title: "Organizacoes",
      value: stats.organizations,
      description: "Organizacoes que voce participa",
      icon: Building2,
    },
    {
      title: "Membros",
      value: stats.members,
      description: "Total de membros nas suas orgs",
      icon: Users,
    },
    {
      title: "Convites Pendentes",
      value: stats.invites,
      description: "Convites aguardando resposta",
      icon: Mail,
    },
    {
      title: "Assinatura",
      value: "Ativa",
      description: "Status da sua assinatura",
      icon: CreditCard,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Ola, {user.name || "Usuario"}!
        </h2>
        <p className="text-muted-foreground">
          Aqui esta um resumo da sua conta.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              Suas acoes mais recentes na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Nenhuma atividade recente.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Acoes Rapidas</CardTitle>
            <CardDescription>Tarefas comuns que voce pode fazer</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <a
              href="/dashboard/organizations/new"
              className="text-sm text-primary hover:underline"
            >
              Criar nova organizacao
            </a>
            <a
              href="/dashboard/invites/new"
              className="text-sm text-primary hover:underline"
            >
              Convidar novo membro
            </a>
            <a
              href="/dashboard/billing"
              className="text-sm text-primary hover:underline"
            >
              Gerenciar assinatura
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
