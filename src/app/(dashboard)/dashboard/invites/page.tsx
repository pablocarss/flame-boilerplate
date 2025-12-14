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
import { Plus, Mail, Clock, CheckCircle, XCircle } from "lucide-react";
import { formatDate } from '@/shared/utils/utils';
import { RevokeInviteButton } from "@/components/invites/revoke-button";

async function getInvites(userId: string) {
  // Get organizations where user is admin
  const adminOrgs = await prisma.organization.findMany({
    where: {
      members: {
        some: {
          userId,
          role: "ADMIN",
        },
      },
    },
    select: { id: true },
  });

  const orgIds = adminOrgs.map((org) => org.id);

  return prisma.invite.findMany({
    where: {
      organizationId: {
        in: orgIds,
      },
    },
    include: {
      organization: true,
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

const statusConfig = {
  PENDING: {
    label: "Pendente",
    variant: "warning" as const,
    icon: Clock,
  },
  ACCEPTED: {
    label: "Aceito",
    variant: "success" as const,
    icon: CheckCircle,
  },
  REVOKED: {
    label: "Revogado",
    variant: "destructive" as const,
    icon: XCircle,
  },
  EXPIRED: {
    label: "Expirado",
    variant: "secondary" as const,
    icon: Clock,
  },
};

export default async function InvitesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const invites = await getInvites(user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Convites</h2>
          <p className="text-muted-foreground">
            Gerencie os convites enviados para sua organizacao.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/invites/new">
            <Plus className="mr-2 h-4 w-4" /> Novo Convite
          </Link>
        </Button>
      </div>

      {invites.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhum convite enviado
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Convide membros para sua organizacao.
            </p>
            <Button asChild>
              <Link href="/dashboard/invites/new">
                <Plus className="mr-2 h-4 w-4" /> Enviar Convite
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Convites Enviados</CardTitle>
            <CardDescription>
              Lista de todos os convites enviados para suas organizacoes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invites.map((invite) => {
                const status = statusConfig[invite.status];
                const StatusIcon = status.icon;

                return (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{invite.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {invite.organization.name} - {invite.role}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge variant={status.variant}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(invite.createdAt)}
                        </p>
                      </div>
                      {invite.status === "PENDING" && (
                        <RevokeInviteButton inviteId={invite.id} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
