"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createInviteSchema, type CreateInviteInput } from '@/application/validators/schemas';
import { Loader2 } from "lucide-react";

interface Organization {
  id: string;
  name: string;
  slug: string;
}

export default function NewInvitePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateInviteInput>({
    resolver: zodResolver(createInviteSchema),
    defaultValues: {
      role: "MEMBER",
    },
  });

  useEffect(() => {
    fetch("/api/organizations")
      .then((res) => res.json())
      .then((data) => {
        // Filter to only organizations where user is admin
        const adminOrgs = data.organizations?.filter((org: any) =>
          org.members.some((m: any) => m.role === "ADMIN")
        );
        setOrganizations(adminOrgs || []);
      })
      .catch(console.error);
  }, []);

  const onSubmit = async (data: CreateInviteInput) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao enviar convite");
      }

      toast({
        title: "Convite enviado!",
        description: "O convite foi enviado por email.",
      });

      router.push("/dashboard/invites");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro ao enviar convite",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Novo Convite</CardTitle>
          <CardDescription>
            Envie um convite para um novo membro da sua organizacao.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organizationId">Organizacao</Label>
              <Select
                onValueChange={(value) => setValue("organizationId", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma organizacao" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.organizationId && (
                <p className="text-sm text-destructive">
                  {errors.organizationId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="membro@email.com"
                {...register("email")}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Funcao</Label>
              <Select
                defaultValue="MEMBER"
                onValueChange={(value: "ADMIN" | "MEMBER") =>
                  setValue("role", value)
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma funcao" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">Membro</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Administradores podem gerenciar membros e configuracoes.
              </p>
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar Convite
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
