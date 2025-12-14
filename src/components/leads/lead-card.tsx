"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Mail, Phone, Building2, User, DollarSign } from "lucide-react";

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
  createdAt: string;
}

interface LeadCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

const sourceLabels: Record<string, string> = {
  WEBSITE: "Website",
  REFERRAL: "Indicação",
  SOCIAL_MEDIA: "Redes Sociais",
  EMAIL_CAMPAIGN: "Email",
  COLD_CALL: "Ligação",
  EVENT: "Evento",
  PARTNER: "Parceiro",
  OTHER: "Outro",
};

export function LeadCard({ lead, onEdit, onDelete }: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="mb-3 cursor-move hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">{lead.name}</h3>
              {lead.company && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <Building2 className="h-3 w-3" />
                  <span>{lead.company}</span>
                </div>
              )}
              {lead.position && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{lead.position}</span>
                </div>
              )}
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(lead);
                }}
                title="Editar lead"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(lead);
                }}
                title="Deletar lead"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" />
            <span className="truncate">{lead.email}</span>
          </div>
          {lead.phone && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{lead.phone}</span>
            </div>
          )}
          {lead.value !== undefined && lead.value > 0 && (
            <div className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
              <DollarSign className="h-3 w-3" />
              <span>
                R$ {lead.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 pt-1">
            <Badge variant="outline" className="text-xs">
              {sourceLabels[lead.source] || lead.source}
            </Badge>
            {lead.tags.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                +{lead.tags.length}
              </Badge>
            )}
          </div>
          {lead.notes && (
            <p className="text-xs text-muted-foreground line-clamp-2 pt-1">
              {lead.notes}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
