import Link from "next/link";
import { getCurrentUser } from '@/infrastructure/services/auth/auth.service';
import { prisma } from "@/infrastructure/prisma/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, Users, Settings } from "lucide-react";

async function getOrganizations(userId: string) {
  return prisma.organization.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      subscription: {
        include: {
          plan: true,
        },
      },
      _count: {
        select: {
          members: true,
        },
      },
    },
  });
}

export default async function OrganizationsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const organizations = await getOrganizations(user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Organizacoes</h2>
          <p className="text-muted-foreground">
            Gerencie suas organizacoes e equipes.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/organizations/new">
            <Plus className="mr-2 h-4 w-4" /> Nova Organizacao
          </Link>
        </Button>
      </div>

      {organizations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhuma organizacao encontrada
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Crie sua primeira organizacao para comecar a colaborar com sua
              equipe.
            </p>
            <Button asChild>
              <Link href="/dashboard/organizations/new">
                <Plus className="mr-2 h-4 w-4" /> Criar Organizacao
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => {
            const userMember = org.members.find((m) => m.userId === user.id);
            const isAdmin = userMember?.role === "ADMIN";

            return (
              <Card key={org.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {org.name}
                        {isAdmin && (
                          <Badge variant="secondary" className="text-xs">
                            Admin
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{org.slug}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{org._count.members} membros</span>
                    </div>
                    <Badge variant="outline">
                      {org.subscription?.plan?.name || "Free"}
                    </Badge>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/dashboard/organizations/${org.id}`}>
                        Ver detalhes
                      </Link>
                    </Button>
                    {isAdmin && (
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/organizations/${org.id}/settings`}>
                          <Settings className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
