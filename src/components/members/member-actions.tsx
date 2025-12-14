"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal, Shield, User, UserMinus, Loader2 } from "lucide-react";
import type { Role } from "@prisma/client";

interface MemberActionsProps {
  memberId: string;
  memberName: string;
  currentRole: Role;
  organizationId: string;
}

export function MemberActions({
  memberId,
  memberName,
  currentRole,
  organizationId,
}: MemberActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleUpdateRole = async (newRole: Role) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/members/${memberId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole, organizationId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao atualizar funcao");
      }

      toast({
        title: "Funcao atualizada",
        description: `${memberName} agora e ${
          newRole === "ADMIN" ? "Administrador" : "Membro"
        }.`,
      });

      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro ao atualizar funcao",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/members/${memberId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao remover membro");
      }

      toast({
        title: "Membro removido",
        description: `${memberName} foi removido da organizacao.`,
      });

      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro ao remover membro",
      });
    } finally {
      setIsLoading(false);
      setShowRemoveDialog(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acoes</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {currentRole === "MEMBER" ? (
            <DropdownMenuItem onClick={() => handleUpdateRole("ADMIN")}>
              <Shield className="mr-2 h-4 w-4" />
              Promover a Admin
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => handleUpdateRole("MEMBER")}>
              <User className="mr-2 h-4 w-4" />
              Rebaixar a Membro
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setShowRemoveDialog(true)}
          >
            <UserMinus className="mr-2 h-4 w-4" />
            Remover da Organizacao
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Membro</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{memberName}</strong> da
              organizacao? Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
