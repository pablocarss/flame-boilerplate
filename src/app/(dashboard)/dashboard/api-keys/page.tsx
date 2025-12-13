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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  Power,
  PowerOff,
  AlertTriangle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdBy: string;
  lastUsedAt?: string;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
}

export default function ApiKeysPage() {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState("");
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    // Get the first organization ID from the user
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch("/api/organizations");
      if (response.ok) {
        const orgs = await response.json();
        if (orgs.length > 0) {
          setOrganizationId(orgs[0].id);
          fetchApiKeys(orgs[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
  };

  const fetchApiKeys = async (orgId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/api-keys?organizationId=${orgId}`);
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data);
      }
    } catch (error) {
      console.error("Error fetching API keys:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as API keys",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Erro",
        description: "Digite um nome para a API key",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          name: newKeyName,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCreatedKey(data.key);
        setNewKeyName("");
        fetchApiKeys(organizationId);
        toast({
          title: "Sucesso",
          description: "API key criada com sucesso",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Erro",
          description: error.error || "Não foi possível criar a API key",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating API key:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a API key",
        variant: "destructive",
      });
    }
  };

  const deleteApiKey = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar esta API key?")) {
      return;
    }

    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchApiKeys(organizationId);
        toast({
          title: "Sucesso",
          description: "API key deletada com sucesso",
        });
      }
    } catch (error) {
      console.error("Error deleting API key:", error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar a API key",
        variant: "destructive",
      });
    }
  };

  const toggleApiKey = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        fetchApiKeys(organizationId);
        toast({
          title: "Sucesso",
          description: `API key ${!currentStatus ? "ativada" : "desativada"} com sucesso`,
        });
      }
    } catch (error) {
      console.error("Error toggling API key:", error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status da API key",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
    toast({
      title: "Copiado!",
      description: "API key copiada para a área de transferência",
    });
  };

  const handleCloseCreatedKey = () => {
    setCreatedKey(null);
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">API Keys</h1>
        <p className="text-muted-foreground">
          Gerencie as chaves de API para comunicação sistema-a-sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Suas API Keys
              </CardTitle>
              <CardDescription>
                Use API keys para autenticar requisições da sua aplicação
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova API Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova API Key</DialogTitle>
                  <DialogDescription>
                    Dê um nome descritivo para sua API key para facilitar a identificação
                  </DialogDescription>
                </DialogHeader>
                {createdKey ? (
                  <div className="space-y-4">
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Importante!</AlertTitle>
                      <AlertDescription>
                        Copie sua API key agora. Você não poderá vê-la novamente!
                      </AlertDescription>
                    </Alert>
                    <div className="space-y-2">
                      <Label>Sua nova API Key</Label>
                      <div className="flex gap-2">
                        <Input value={createdKey} readOnly className="font-mono text-sm" />
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => copyToClipboard(createdKey)}
                        >
                          {copiedKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome da API Key</Label>
                      <Input
                        id="name"
                        placeholder="Ex: Produção Frontend"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                      />
                    </div>
                  </div>
                )}
                <DialogFooter>
                  {createdKey ? (
                    <Button onClick={handleCloseCreatedKey}>Fechar</Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={createApiKey}>Criar API Key</Button>
                    </>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Carregando...
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma API key criada ainda</p>
              <p className="text-sm">Crie sua primeira API key para começar</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Último uso</TableHead>
                  <TableHead>Criada em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((apiKey) => (
                  <TableRow key={apiKey.id}>
                    <TableCell className="font-medium">{apiKey.name}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {apiKey.key}
                      </code>
                    </TableCell>
                    <TableCell>
                      {apiKey.isActive ? (
                        <Badge variant="default" className="bg-green-500">
                          Ativa
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inativa</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {apiKey.lastUsedAt
                        ? formatDistanceToNow(new Date(apiKey.lastUsedAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })
                        : "Nunca usada"}
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(apiKey.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleApiKey(apiKey.id, apiKey.isActive)}
                        >
                          {apiKey.isActive ? (
                            <PowerOff className="h-4 w-4" />
                          ) : (
                            <Power className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteApiKey(apiKey.id)}
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

      <Card>
        <CardHeader>
          <CardTitle>Como usar API Keys</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Autenticação</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Inclua sua API key no header Authorization de todas as requisições:
            </p>
            <div className="bg-muted rounded-lg p-4 font-mono text-sm">
              <pre>{`curl https://api.example.com/endpoint \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</pre>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Segurança</h4>
            <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
              <li>Nunca compartilhe suas API keys publicamente</li>
              <li>Use variáveis de ambiente para armazenar suas keys</li>
              <li>Revogue imediatamente keys comprometidas</li>
              <li>Use keys diferentes para desenvolvimento e produção</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
