"use client";

import { useState, FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  status: string;
  source: string;
  value?: number;
  notes?: string;
  tags: string[];
}

interface EditLeadDialogProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadUpdated: () => void;
}

export function EditLeadDialog({
  lead,
  open,
  onOpenChange,
  onLeadUpdated,
}: EditLeadDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<Lead>>(lead || {});

  // Update form data when lead changes
  useState(() => {
    if (lead) {
      setFormData({
        name: lead.name,
        email: lead.email,
        phone: lead.phone || "",
        company: lead.company || "",
        position: lead.position || "",
        status: lead.status,
        source: lead.source,
        value: lead.value,
        notes: lead.notes || "",
      });
    }
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!lead) return;

    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.email) {
        toast({
          title: "Erro de validação",
          description: "Nome e email são obrigatórios",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          company: formData.company || undefined,
          position: formData.position || undefined,
          status: formData.status,
          source: formData.source,
          value: formData.value ? parseFloat(String(formData.value)) : undefined,
          notes: formData.notes || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao atualizar lead");
      }

      toast({
        title: "Sucesso",
        description: "Lead atualizado com sucesso",
      });

      onOpenChange(false);
      onLeadUpdated();
    } catch (error) {
      console.error("Error updating lead:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível atualizar o lead",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Lead</DialogTitle>
          <DialogDescription>
            Atualize as informações do lead
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="edit-name">
                Nome <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-name"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="edit-email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Telefone</Label>
              <Input
                id="edit-phone"
                value={formData.phone || ""}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>

            {/* Empresa */}
            <div className="space-y-2">
              <Label htmlFor="edit-company">Empresa</Label>
              <Input
                id="edit-company"
                value={formData.company || ""}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
              />
            </div>

            {/* Cargo */}
            <div className="space-y-2">
              <Label htmlFor="edit-position">Cargo</Label>
              <Input
                id="edit-position"
                value={formData.position || ""}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW">Novo</SelectItem>
                  <SelectItem value="CONTACTED">Contatado</SelectItem>
                  <SelectItem value="QUALIFIED">Qualificado</SelectItem>
                  <SelectItem value="PROPOSAL">Proposta</SelectItem>
                  <SelectItem value="NEGOTIATION">Negociação</SelectItem>
                  <SelectItem value="WON">Ganho</SelectItem>
                  <SelectItem value="LOST">Perdido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Origem */}
            <div className="space-y-2">
              <Label htmlFor="edit-source">Origem</Label>
              <Select
                value={formData.source}
                onValueChange={(value) =>
                  setFormData({ ...formData, source: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEBSITE">Website</SelectItem>
                  <SelectItem value="REFERRAL">Indicação</SelectItem>
                  <SelectItem value="SOCIAL_MEDIA">Redes Sociais</SelectItem>
                  <SelectItem value="EMAIL_CAMPAIGN">Campanha de Email</SelectItem>
                  <SelectItem value="COLD_CALL">Ligação Fria</SelectItem>
                  <SelectItem value="EVENT">Evento</SelectItem>
                  <SelectItem value="PARTNER">Parceiro</SelectItem>
                  <SelectItem value="OTHER">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Valor */}
            <div className="space-y-2">
              <Label htmlFor="edit-value">Valor Estimado (R$)</Label>
              <Input
                id="edit-value"
                type="number"
                step="0.01"
                min="0"
                value={formData.value || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    value: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
              />
            </div>

            {/* Observações */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-notes">Observações</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes || ""}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={4}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
