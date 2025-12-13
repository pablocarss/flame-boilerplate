"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Plus,
  Eye,
  Trash2,
  TrendingUp,
  DollarSign,
  Mail,
  Phone,
  Building2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
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
  assignedTo?: string;
  lastContactAt?: string;
  nextFollowUpAt?: string;
  tags: string[];
  createdAt: string;
}

export default function LeadsPage() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  // Form state for new lead
  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    source: "WEBSITE",
    value: "",
    notes: "",
  });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (organizationId) {
      fetchLeads();
    }
  }, [organizationId, filterStatus]);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch("/api/organizations");
      if (response.ok) {
        const orgs = await response.json();
        if (orgs.length > 0) {
          setOrganizationId(orgs[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      let url = `/api/leads?organizationId=${organizationId}`;
      if (filterStatus !== "all") url += `&status=${filterStatus}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads);
        setStatusCounts(data.statusCounts || {});
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os leads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createLead = async () => {
    if (!newLead.name || !newLead.email) {
      toast({
        title: "Erro",
        description: "Nome e email são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          ...newLead,
          value: newLead.value ? parseFloat(newLead.value) : undefined,
        }),
      });

      if (response.ok) {
        setNewLead({
          name: "",
          email: "",
          phone: "",
          company: "",
          position: "",
          source: "WEBSITE",
          value: "",
          notes: "",
        });
        setIsCreateDialogOpen(false);
        fetchLeads();
        toast({
          title: "Sucesso",
          description: "Lead criado com sucesso",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Erro",
          description: error.error || "Não foi possível criar o lead",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating lead:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o lead",
        variant: "destructive",
      });
    }
  };

  const updateLeadStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchLeads();
        if (selectedLead && selectedLead.id === id) {
          setSelectedLead({ ...selectedLead, status });
        }
        toast({
          title: "Sucesso",
          description: "Status atualizado com sucesso",
        });
      }
    } catch (error) {
      console.error("Error updating lead:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive",
      });
    }
  };

  const deleteLead = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este lead?")) {
      return;
    }

    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchLeads();
        toast({
          title: "Sucesso",
          description: "Lead deletado com sucesso",
        });
      }
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar o lead",
        variant: "destructive",
      });
    }
  };

  const viewLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsViewDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      NEW: { label: "Novo", color: "bg-blue-500" },
      CONTACTED: { label: "Contatado", color: "bg-purple-500" },
      QUALIFIED: { label: "Qualificado", color: "bg-cyan-500" },
      PROPOSAL: { label: "Proposta", color: "bg-yellow-500" },
      NEGOTIATION: { label: "Negociação", color: "bg-orange-500" },
      WON: { label: "Ganho", color: "bg-green-500" },
      LOST: { label: "Perdido", color: "bg-red-500" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.NEW;

    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    );
  };

  const getSourceLabel = (source: string) => {
    const sources: { [key: string]: string } = {
      WEBSITE: "Website",
      REFERRAL: "Indicação",
      SOCIAL_MEDIA: "Redes Sociais",
      EMAIL_CAMPAIGN: "Campanha de Email",
      COLD_CALL: "Ligação Fria",
      EVENT: "Evento",
      PARTNER: "Parceiro",
      OTHER: "Outro",
    };
    return sources[source] || source;
  };

  const totalValue = leads
    .filter((l) => l.value)
    .reduce((sum, l) => sum + (l.value || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Leads</h1>
        <p className="text-muted-foreground">
          Gerencie seus leads e oportunidades de vendas
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Leads</CardDescription>
            <CardTitle className="text-3xl">{leads.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Novos</CardDescription>
            <CardTitle className="text-3xl">{statusCounts.NEW || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Em Negociação</CardDescription>
            <CardTitle className="text-3xl">
              {(statusCounts.PROPOSAL || 0) + (statusCounts.NEGOTIATION || 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Valor Total</CardDescription>
            <CardTitle className="text-3xl">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalValue)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Todos os Leads
              </CardTitle>
              <CardDescription>
                Visualize e gerencie todos os seus leads
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="NEW">Novo</SelectItem>
                  <SelectItem value="CONTACTED">Contatado</SelectItem>
                  <SelectItem value="QUALIFIED">Qualificado</SelectItem>
                  <SelectItem value="PROPOSAL">Proposta</SelectItem>
                  <SelectItem value="NEGOTIATION">Negociação</SelectItem>
                  <SelectItem value="WON">Ganho</SelectItem>
                  <SelectItem value="LOST">Perdido</SelectItem>
                </SelectContent>
              </Select>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Lead
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Lead</DialogTitle>
                    <DialogDescription>
                      Adicione um novo lead ao seu pipeline de vendas
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome *</Label>
                      <Input
                        id="name"
                        value={newLead.name}
                        onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newLead.email}
                        onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={newLead.phone}
                        onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Empresa</Label>
                      <Input
                        id="company"
                        value={newLead.company}
                        onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Cargo</Label>
                      <Input
                        id="position"
                        value={newLead.position}
                        onChange={(e) => setNewLead({ ...newLead, position: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="source">Origem</Label>
                      <Select value={newLead.source} onValueChange={(value) => setNewLead({ ...newLead, source: value })}>
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
                    <div className="space-y-2">
                      <Label htmlFor="value">Valor Estimado (R$)</Label>
                      <Input
                        id="value"
                        type="number"
                        step="0.01"
                        value={newLead.value}
                        onChange={(e) => setNewLead({ ...newLead, value: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="notes">Observações</Label>
                      <Textarea
                        id="notes"
                        value={newLead.notes}
                        onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={createLead}>Criar Lead</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Carregando...
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum lead encontrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">{lead.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{lead.company || "-"}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(lead.status)}</TableCell>
                    <TableCell className="text-sm">{getSourceLabel(lead.source)}</TableCell>
                    <TableCell>
                      {lead.value
                        ? new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(lead.value)
                        : "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(lead.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => viewLead(lead)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteLead(lead.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View/Edit Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Lead</DialogTitle>
            <DialogDescription>
              Visualize e atualize as informações do lead
            </DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Nome</Label>
                  <p className="font-medium">{selectedLead.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedLead.email}</p>
                </div>
                {selectedLead.phone && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Telefone</Label>
                    <p className="font-medium">{selectedLead.phone}</p>
                  </div>
                )}
                {selectedLead.company && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Empresa</Label>
                    <p className="font-medium">{selectedLead.company}</p>
                  </div>
                )}
                {selectedLead.position && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Cargo</Label>
                    <p className="font-medium">{selectedLead.position}</p>
                  </div>
                )}
                <div>
                  <Label className="text-sm text-muted-foreground">Origem</Label>
                  <p className="font-medium">{getSourceLabel(selectedLead.source)}</p>
                </div>
                {selectedLead.value && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Valor Estimado</Label>
                    <p className="font-medium">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(selectedLead.value)}
                    </p>
                  </div>
                )}
              </div>

              {selectedLead.notes && (
                <div>
                  <Label className="text-sm text-muted-foreground">Observações</Label>
                  <p className="mt-1 text-sm">{selectedLead.notes}</p>
                </div>
              )}

              <div>
                <Label htmlFor="lead-status">Atualizar Status</Label>
                <Select
                  defaultValue={selectedLead.status}
                  onValueChange={(value) => updateLeadStatus(selectedLead.id, value)}
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
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
