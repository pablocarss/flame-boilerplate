import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
import { formatCurrency, formatDate } from "@/lib/utils";
import { Check, CreditCard, Building2 } from "lucide-react";
import { ManageSubscriptionButton } from "@/components/billing/manage-subscription-button";

async function getSubscriptions(userId: string) {
  const memberships = await prisma.member.findMany({
    where: {
      userId,
      role: "ADMIN",
    },
    include: {
      organization: {
        include: {
          subscription: {
            include: {
              plan: true,
            },
          },
        },
      },
    },
  });

  return memberships;
}

async function getPlans() {
  return prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export default async function BillingPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [memberships, plans] = await Promise.all([
    getSubscriptions(user.id),
    getPlans(),
  ]);

  const subscriptions = memberships.filter(
    (m) => m.organization.subscription
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Assinaturas</h2>
        <p className="text-muted-foreground">
          Gerencie as assinaturas das suas organizacoes.
        </p>
      </div>

      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhuma assinatura encontrada
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Crie uma organizacao para comecar a usar nossos planos.
            </p>
            <Button asChild>
              <Link href="/dashboard/organizations/new">
                Criar Organizacao
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {subscriptions.map((membership) => {
            const org = membership.organization;
            const subscription = org.subscription!;
            const plan = subscription.plan;

            return (
              <Card key={org.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle>{org.name}</CardTitle>
                        <CardDescription>{org.slug}</CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant={
                        subscription.status === "ACTIVE"
                          ? "success"
                          : subscription.status === "PAST_DUE"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {subscription.status === "ACTIVE"
                        ? "Ativa"
                        : subscription.status === "PAST_DUE"
                        ? "Pagamento Pendente"
                        : subscription.status === "CANCELED"
                        ? "Cancelada"
                        : subscription.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{plan.name}</span>
                      <span className="text-2xl font-bold">
                        {formatCurrency(plan.price)}
                        <span className="text-sm font-normal text-muted-foreground">
                          /{plan.interval === "month" ? "mes" : "ano"}
                        </span>
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {plan.description}
                    </p>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Check className="h-4 w-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Inicio do periodo</p>
                      <p className="font-medium">
                        {formatDate(subscription.currentPeriodStart)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Fim do periodo</p>
                      <p className="font-medium">
                        {formatDate(subscription.currentPeriodEnd)}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-4">
                  <ManageSubscriptionButton
                    organizationId={org.id}
                    currentPlanSlug={plan.slug}
                  />
                  <Button variant="outline" asChild>
                    <Link href={`/dashboard/billing/${org.id}/change-plan`}>
                      Alterar Plano
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Available Plans */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold mb-4">Planos Disponiveis</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-2">
                  <span className="text-3xl font-bold">
                    {formatCurrency(plan.price)}
                  </span>
                  <span className="text-muted-foreground">
                    /{plan.interval === "month" ? "mes" : "ano"}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
