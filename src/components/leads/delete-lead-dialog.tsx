"use client";

import { useState } from "react";
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

interface Lead {
  id: string;
  name: string;
  email: string;
  company?: string;
}

interface DeleteLeadDialogProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadDeleted: () => void;
}

export function DeleteLeadDialog({
  lead,
  open,
  onOpenChange,
  onLeadDeleted,
}: DeleteLeadDialogProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!lead) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao deletar lead");
      }

      toast({
        title: "Sucesso",
        description: "Lead deletado com sucesso",
      });

      onOpenChange(false);
      onLeadDeleted();
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível deletar o lead",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!lead) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tem certeza que deseja deletar este lead?</AlertDialogTitle>
          <AlertDialogDescription>
            Você está prestes a deletar o lead <strong>{lead.name}</strong>
            {lead.company && ` da empresa ${lead.company}`}.
            <br />
            <br />
            Esta ação não pode ser desfeita. Todos os dados relacionados a este lead serão
            permanentemente removidos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? "Deletando..." : "Deletar Lead"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
