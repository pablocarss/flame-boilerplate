"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ExternalLink } from "lucide-react";

interface ManageSubscriptionButtonProps {
  organizationId: string;
  currentPlanSlug: string;
}

export function ManageSubscriptionButton({
  organizationId,
  currentPlanSlug,
}: ManageSubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleManage = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao abrir portal");
      }

      if (result.url) {
        window.open(result.url, "_blank");
      } else {
        toast({
          title: "Portal nao disponivel",
          description:
            "O portal de pagamentos nao esta configurado. Configure as credenciais do Stripe.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro ao abrir portal",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleManage} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <ExternalLink className="mr-2 h-4 w-4" />
      )}
      Gerenciar Pagamento
    </Button>
  );
}
