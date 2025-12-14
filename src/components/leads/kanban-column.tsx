"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { LeadCard } from "./lead-card";
import { Badge } from "@/components/ui/badge";

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

interface KanbanColumnProps {
  status: string;
  title: string;
  leads: Lead[];
  color: string;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (lead: Lead) => void;
}

export function KanbanColumn({
  status,
  title,
  leads,
  color,
  onEditLead,
  onDeleteLead,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const totalValue = leads.reduce((sum, lead) => sum + (lead.value || 0), 0);

  return (
    <div className="flex-shrink-0 w-80">
      <div className="bg-muted/50 rounded-lg p-4 h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${color}`}
              aria-hidden="true"
            />
            <h3 className="font-semibold text-sm">{title}</h3>
            <Badge variant="secondary" className="text-xs">
              {leads.length}
            </Badge>
          </div>
          {totalValue > 0 && (
            <span className="text-xs text-muted-foreground">
              R$ {totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          )}
        </div>

        <div
          ref={setNodeRef}
          className={`min-h-[200px] transition-colors rounded-md ${
            isOver ? "bg-muted" : ""
          }`}
        >
          <SortableContext
            items={leads.map((lead) => lead.id)}
            strategy={verticalListSortingStrategy}
          >
            {leads.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                Nenhum lead
              </div>
            ) : (
              leads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onEdit={onEditLead}
                  onDelete={onDeleteLead}
                />
              ))
            )}
          </SortableContext>
        </div>
      </div>
    </div>
  );
}
