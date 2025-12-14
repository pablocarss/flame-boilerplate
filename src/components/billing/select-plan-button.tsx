"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShoppingCart } from "lucide-react";

interface SelectPlanButtonProps {
  organizationId: string;
  planSlug: string;
  variant?: "default" | "outline";
  children?: React.ReactNode;
}

export function SelectPlanButton({
  organizationId,
  planSlug,
  variant = "default",
  children,
}: SelectPlanButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSelectPlan = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId, planSlug }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao criar checkout");
      }

      if (result.url) {
        // Redireciona para o checkout do Stripe
        window.location.href = result.url;
      } else {
        toast({
          title: "Erro",
          description: "URL de checkout não disponível",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro ao criar checkout",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleSelectPlan} disabled={isLoading} variant={variant}>
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <ShoppingCart className="mr-2 h-4 w-4" />
      )}
      {children || "Selecionar Plano"}
    </Button>
  );
}
