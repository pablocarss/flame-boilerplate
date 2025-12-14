"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { KanbanColumn } from "./kanban-column";
import { LeadCard } from "./lead-card";
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
  createdAt: string;
}

interface KanbanBoardProps {
  leads: Lead[];
  onLeadsChange: () => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (lead: Lead) => void;
}

const COLUMNS = [
  { status: "NEW", title: "Novo", color: "bg-blue-500" },
  { status: "CONTACTED", title: "Contatado", color: "bg-purple-500" },
  { status: "QUALIFIED", title: "Qualificado", color: "bg-cyan-500" },
  { status: "PROPOSAL", title: "Proposta", color: "bg-yellow-500" },
  { status: "NEGOTIATION", title: "Negociação", color: "bg-orange-500" },
  { status: "WON", title: "Ganho", color: "bg-green-500" },
  { status: "LOST", title: "Perdido", color: "bg-red-500" },
];

export function KanbanBoard({
  leads,
  onLeadsChange,
  onEditLead,
  onDeleteLead,
}: KanbanBoardProps) {
  const { toast } = useToast();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [localLeads, setLocalLeads] = useState(leads);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const leadId = active.id as string;
    const newStatus = over.id as string;

    const lead = localLeads.find((l) => l.id === leadId);
    if (!lead || lead.status === newStatus) return;

    // Optimistic update
    setLocalLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );

    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar status do lead");
      }

      toast({
        title: "Lead movido",
        description: `Status atualizado para ${
          COLUMNS.find((c) => c.status === newStatus)?.title
        }`,
      });

      onLeadsChange();
    } catch (error) {
      // Revert optimistic update on error
      setLocalLeads(leads);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do lead",
        variant: "destructive",
      });
    }
  };

  const activeLead = activeId
    ? localLeads.find((lead) => lead.id === activeId)
    : null;

  // Update local leads when prop changes
  if (leads !== localLeads) {
    setLocalLeads(leads);
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((column) => {
          const columnLeads = localLeads.filter(
            (lead) => lead.status === column.status
          );
          return (
            <KanbanColumn
              key={column.status}
              status={column.status}
              title={column.title}
              leads={columnLeads}
              color={column.color}
              onEditLead={onEditLead}
              onDeleteLead={onDeleteLead}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeLead ? (
          <div className="rotate-3 opacity-80">
            <LeadCard
              lead={activeLead}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
