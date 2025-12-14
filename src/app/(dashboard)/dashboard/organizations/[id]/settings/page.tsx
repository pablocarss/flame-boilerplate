import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from '@/infrastructure/services/auth/auth.service';
import { prisma } from "@/infrastructure/prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Settings } from "lucide-react";

async function getOrganization(organizationId: string, userId: string) {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      members: {
        where: { userId },
      },
    },
  });

  if (!organization) return null;

  const member = organization.members[0];
  if (!member || member.role !== "ADMIN") {
    return null;
  }

  return organization;
}

export default async function OrganizationSettingsPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const organization = await getOrganization(params.id, user.id);
  if (!organization) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">
          Gerencie as configurações de {organization.name}
        </p>
      </div>

      <Card className="shadow-lg border-border/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Configurações da Organização
          </CardTitle>
          <CardDescription>
            Em breve você poderá editar as configurações aqui
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Esta página está em desenvolvimento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
