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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Archive,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface Submission {
  id: string;
  formType: string;
  data: any;
  status: string;
  notes?: string;
  source?: string;
  ipAddress?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export default function SubmissionsPage() {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterFormType, setFilterFormType] = useState<string>("all");

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (organizationId) {
      fetchSubmissions();
    }
  }, [organizationId, filterStatus, filterFormType]);

  const fetchOrganizations = async () => {
    try {
      console.log("Fetching organizations...");
      const response = await fetch("/api/organizations");
      console.log("Organizations response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Organizations data:", data);
        const orgs = data.organizations || [];
        console.log("Organizations array:", orgs);

        if (orgs.length > 0) {
          console.log("Setting organization ID:", orgs[0].id);
          setOrganizationId(orgs[0].id);
        } else {
          setLoading(false);
          toast({
            title: "Aviso",
            description: "Nenhuma organização encontrada. Crie uma organização primeiro.",
            variant: "destructive",
          });
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Organizations error:", errorData);
        setLoading(false);
        toast({
          title: "Erro",
          description: errorData.error || "Não foi possível carregar as organizações",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
      setLoading(false);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as organizações",
        variant: "destructive",
      });
    }
  };

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      let url = `/api/submissions?organizationId=${organizationId}`;
      if (filterStatus !== "all") url += `&status=${filterStatus}`;
      if (filterFormType !== "all") url += `&formType=${filterFormType}`;

      console.log("Fetching submissions from:", url);
      const response = await fetch(url);
      console.log("Submissions response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Submissions data:", data);
        setSubmissions(data.submissions || []);
      } else {
        const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }));
        console.error("Submissions error:", errorData);
        toast({
          title: "Erro",
          description: errorData.error || "Não foi possível carregar as submissões",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as submissões",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSubmissionStatus = async (id: string, status: string, notes?: string) => {
    try {
      const response = await fetch(`/api/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });

      if (response.ok) {
        fetchSubmissions();
        toast({
          title: "Sucesso",
          description: "Status atualizado com sucesso",
        });
        setIsViewDialogOpen(false);
      }
    } catch (error) {
      console.error("Error updating submission:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive",
      });
    }
  };

  const deleteSubmission = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar esta submissão?")) {
      return;
    }

    try {
      const response = await fetch(`/api/submissions/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchSubmissions();
        toast({
          title: "Sucesso",
          description: "Submissão deletada com sucesso",
        });
      }
    } catch (error) {
      console.error("Error deleting submission:", error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar a submissão",
        variant: "destructive",
      });
    }
  };

  const viewSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setIsViewDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: "Pendente", variant: "secondary" as const, icon: Clock },
      REVIEWED: { label: "Revisado", variant: "default" as const, icon: Eye },
      APPROVED: { label: "Aprovado", variant: "default" as const, icon: CheckCircle },
      REJECTED: { label: "Rejeitado", variant: "destructive" as const, icon: XCircle },
      ARCHIVED: { label: "Arquivado", variant: "secondary" as const, icon: Archive },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getFormTypeLabel = (formType: string) => {
    const types: { [key: string]: string } = {
      contact: "Contato",
      lead: "Lead",
      support: "Suporte",
      custom: "Personalizado",
    };
    return types[formType] || formType;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Submissões</h1>
        <p className="text-muted-foreground">
          Gerencie todas as submissões de formulários
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Todas as Submissões
              </CardTitle>
              <CardDescription>
                Visualize e gerencie submissões de formulários
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="PENDING">Pendente</SelectItem>
                  <SelectItem value="REVIEWED">Revisado</SelectItem>
                  <SelectItem value="APPROVED">Aprovado</SelectItem>
                  <SelectItem value="REJECTED">Rejeitado</SelectItem>
                  <SelectItem value="ARCHIVED">Arquivado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterFormType} onValueChange={setFilterFormType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="contact">Contato</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="support">Suporte</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Carregando...
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma submissão encontrada</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">
                      {getFormTypeLabel(submission.formType)}
                    </TableCell>
                    <TableCell>{getStatusBadge(submission.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {submission.source || "web"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(submission.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => viewSubmission(submission)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteSubmission(submission.id)}
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
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Submissão</DialogTitle>
            <DialogDescription>
              Visualize e atualize o status da submissão
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Tipo</Label>
                  <p className="font-medium">{getFormTypeLabel(selectedSubmission.formType)}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Status Atual</Label>
                  <div className="mt-1">{getStatusBadge(selectedSubmission.status)}</div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Origem</Label>
                  <p className="font-medium">{selectedSubmission.source || "web"}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">IP</Label>
                  <p className="font-mono text-sm">{selectedSubmission.ipAddress || "N/A"}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Dados Enviados</Label>
                <div className="mt-2 bg-muted rounded-lg p-4">
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(selectedSubmission.data, null, 2)}
                  </pre>
                </div>
              </div>

              {selectedSubmission.notes && (
                <div>
                  <Label className="text-sm text-muted-foreground">Notas</Label>
                  <p className="mt-1 text-sm">{selectedSubmission.notes}</p>
                </div>
              )}

              <div>
                <Label htmlFor="status">Atualizar Status</Label>
                <Select
                  defaultValue={selectedSubmission.status}
                  onValueChange={(value) => {
                    setSelectedSubmission({ ...selectedSubmission, status: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pendente</SelectItem>
                    <SelectItem value="REVIEWED">Revisado</SelectItem>
                    <SelectItem value="APPROVED">Aprovado</SelectItem>
                    <SelectItem value="REJECTED">Rejeitado</SelectItem>
                    <SelectItem value="ARCHIVED">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Adicionar Notas</Label>
                <Textarea
                  id="notes"
                  placeholder="Adicione observações sobre esta submissão..."
                  defaultValue={selectedSubmission.notes || ""}
                  onChange={(e) => {
                    setSelectedSubmission({ ...selectedSubmission, notes: e.target.value });
                  }}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fechar
            </Button>
            <Button
              onClick={() => {
                if (selectedSubmission) {
                  updateSubmissionStatus(
                    selectedSubmission.id,
                    selectedSubmission.status,
                    selectedSubmission.notes
                  );
                }
              }}
            >
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
