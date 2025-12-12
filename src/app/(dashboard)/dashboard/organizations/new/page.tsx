"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  createOrganizationSchema,
  type CreateOrganizationInput,
} from "@/lib/validations";
import { generateSlug } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function NewOrganizationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateOrganizationInput>({
    resolver: zodResolver(createOrganizationSchema),
  });

  const name = watch("name");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setValue("name", newName);
    setValue("slug", generateSlug(newName));
  };

  const onSubmit = async (data: CreateOrganizationInput) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao criar organizacao");
      }

      toast({
        title: "Organizacao criada!",
        description: "Sua organizacao foi criada com sucesso.",
      });

      router.push(`/dashboard/organizations/${result.organization.id}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro ao criar organizacao",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Nova Organizacao</CardTitle>
          <CardDescription>
            Crie uma nova organizacao para colaborar com sua equipe.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Organizacao</Label>
              <Input
                id="name"
                placeholder="Minha Empresa"
                {...register("name")}
                onChange={handleNameChange}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                placeholder="minha-empresa"
                {...register("slug")}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                O slug sera usado na URL da organizacao.
              </p>
              {errors.slug && (
                <p className="text-sm text-destructive">{errors.slug.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Organizacao
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
