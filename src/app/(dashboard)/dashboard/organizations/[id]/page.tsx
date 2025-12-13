import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Users,
  CreditCard,
  Settings,
  Mail,
  Calendar,
  Crown,
  User,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

async function getOrganization(organizationId: string, userId: string) {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      subscription: {
        include: {
          plan: true,
        },
      },
    },
  });

  if (!organization) return null;

  // Check if user is a member
  const isMember = organization.members.some((m) => m.userId === userId);
  if (!isMember) return null;

  return organization;
}

export default async function OrganizationDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const organization = await getOrganization(params.id, user.id);
  if (!organization) {
    notFound();
  }

  const userMember = organization.members.find((m) => m.userId === user.id);
  const isAdmin = userMember?.role === "ADMIN";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm border border-primary/10 flex items-center justify-center">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-bold tracking-tight">
                {organization.name}
              </h2>
              {isAdmin && (
                <Badge variant="default" className="shadow-sm">
                  <Crown className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">{organization.slug}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/organizations">Voltar</Link>
          </Button>
          {isAdmin && (
            <Button asChild>
              <Link href={`/dashboard/organizations/${organization.id}/settings`}>
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Subscription Card */}
        <Card className="shadow-lg border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Assinatura
            </CardTitle>
            <CardDescription>Informações do plano atual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Plano</span>
              <Badge variant="outline" className="shadow-sm">
                {organization.subscription?.plan?.name || "Free"}
              </Badge>
            </div>
            {organization.subscription && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge
                      variant={
                        organization.subscription.status === "ACTIVE"
                          ? "default"
                          : "secondary"
                      }
                      className="shadow-sm"
                    >
                      {organization.subscription.status === "ACTIVE"
                        ? "Ativa"
                        : organization.subscription.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Período atual
                    </span>
                    <span className="font-medium">
                      {formatDate(organization.subscription.currentPeriodStart)}{" "}
                      - {formatDate(organization.subscription.currentPeriodEnd)}
                    </span>
                  </div>
                </div>
                <Separator />
                <Button variant="outline" className="w-full shadow-sm" asChild>
                  <Link href="/dashboard/billing">Gerenciar Assinatura</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card className="shadow-lg border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Estatísticas
            </CardTitle>
            <CardDescription>Visão geral da organização</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Total de Membros
              </span>
              <span className="text-2xl font-bold">
                {organization.members.length}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Administradores
              </span>
              <span className="text-2xl font-bold">
                {organization.members.filter((m) => m.role === "ADMIN").length}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Criada em</span>
              <span className="font-medium">
                {formatDate(organization.createdAt)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members List */}
      <Card className="shadow-lg border-border/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Membros
              </CardTitle>
              <CardDescription>
                {organization.members.length} membro(s) nesta organização
              </CardDescription>
            </div>
            {isAdmin && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/invites/new">
                  <Mail className="mr-2 h-4 w-4" />
                  Convidar Membro
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {organization.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{member.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={member.role === "ADMIN" ? "default" : "secondary"}
                    className="shadow-sm"
                  >
                    {member.role === "ADMIN" ? (
                      <>
                        <Crown className="h-3 w-3 mr-1" />
                        Admin
                      </>
                    ) : (
                      "Membro"
                    )}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(member.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
