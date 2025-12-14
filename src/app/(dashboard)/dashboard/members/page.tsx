import { getCurrentUser } from '@/infrastructure/services/auth/auth.service';
import { prisma } from "@/infrastructure/prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from '@/shared/utils/utils';
import { Users } from "lucide-react";
import { MemberActions } from "@/components/members/member-actions";

async function getMembers(userId: string) {
  // Get organizations where user is member
  const memberships = await prisma.member.findMany({
    where: { userId },
    include: {
      organization: {
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
          },
        },
      },
    },
  });

  return memberships;
}

export default async function MembersPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const memberships = await getMembers(user.id);

  if (memberships.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Membros</h2>
          <p className="text-muted-foreground">
            Gerencie os membros das suas organizacoes.
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhuma organizacao encontrada
            </h3>
            <p className="text-muted-foreground text-center">
              Crie ou participe de uma organizacao para ver seus membros.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Membros</h2>
        <p className="text-muted-foreground">
          Gerencie os membros das suas organizacoes.
        </p>
      </div>

      {memberships.map((membership) => {
        const isAdmin = membership.role === "ADMIN";
        const org = membership.organization;

        return (
          <Card key={org.id}>
            <CardHeader>
              <CardTitle>{org.name}</CardTitle>
              <CardDescription>
                {org.members.length} membro{org.members.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {org.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage
                          src={member.user.avatarUrl || undefined}
                          alt={member.user.name || ""}
                        />
                        <AvatarFallback>
                          {getInitials(member.user.name || member.user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {member.user.name || "Sem nome"}
                          {member.userId === user.id && (
                            <span className="text-muted-foreground ml-2">
                              (voce)
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {member.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        variant={
                          member.role === "ADMIN" ? "default" : "secondary"
                        }
                      >
                        {member.role === "ADMIN" ? "Administrador" : "Membro"}
                      </Badge>
                      {isAdmin && member.userId !== user.id && (
                        <MemberActions
                          memberId={member.id}
                          memberName={member.user.name || member.user.email}
                          currentRole={member.role}
                          organizationId={org.id}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
