"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Plug,
  Unplug,
  MessageSquare,
  Zap,
  Figma,
  FolderOpen,
  Calendar,
  MessageCircle,
  FileText,
  Github,
  GitBranch,
  Trello,
  Loader2,
  CheckCircle2,
} from "lucide-react";

type Integration = {
  id: string;
  provider: string;
  name: string;
  status: "ACTIVE" | "INACTIVE" | "ERROR";
  lastSyncAt: string | null;
  createdAt: string;
};

type PluginField = {
  name: string;
  label: string;
  placeholder: string;
  type: "text" | "password";
  required: boolean;
  description?: string;
};

type PluginConfig = {
  label: string;
  icon: any;
  description: string;
  color: string;
  fields: PluginField[];
};

const pluginConfigs: Record<string, PluginConfig> = {
  chatgpt: {
    label: "ChatGPT",
    icon: MessageSquare,
    description: "Integre com a API do OpenAI ChatGPT para respostas inteligentes",
    color: "from-green-500/20 to-green-500/5",
    fields: [
      {
        name: "apiKey",
        label: "API Key",
        placeholder: "sk-proj-...",
        type: "password",
        required: true,
        description: "Obtenha em: https://platform.openai.com/api-keys",
      },
      {
        name: "organizationId",
        label: "Organization ID (opcional)",
        placeholder: "org-...",
        type: "text",
        required: false,
        description: "ID da organização OpenAI (se aplicável)",
      },
    ],
  },
  zapier: {
    label: "Zapier",
    icon: Zap,
    description: "Automatize fluxos de trabalho com milhares de apps",
    color: "from-orange-500/20 to-orange-500/5",
    fields: [
      {
        name: "apiKey",
        label: "API Key",
        placeholder: "zapier_api_key_...",
        type: "password",
        required: true,
        description: "Obtenha em: https://zapier.com/app/settings/api",
      },
    ],
  },
  figma: {
    label: "Figma",
    icon: Figma,
    description: "Sincronize designs e protótipos do Figma",
    color: "from-purple-500/20 to-purple-500/5",
    fields: [
      {
        name: "accessToken",
        label: "Personal Access Token",
        placeholder: "figd_...",
        type: "password",
        required: true,
        description: "Obtenha em: Figma > Settings > Personal Access Tokens",
      },
    ],
  },
  "google-drive": {
    label: "Google Drive",
    icon: FolderOpen,
    description: "Acesse e gerencie arquivos do Google Drive",
    color: "from-blue-500/20 to-blue-500/5",
    fields: [
      {
        name: "accessToken",
        label: "Access Token",
        placeholder: "ya29...",
        type: "password",
        required: true,
        description: "Token OAuth2 do Google",
      },
      {
        name: "refreshToken",
        label: "Refresh Token",
        placeholder: "1//...",
        type: "password",
        required: false,
        description: "Token para renovação automática",
      },
    ],
  },
  calendar: {
    label: "Google Calendar",
    icon: Calendar,
    description: "Integre eventos e agendamentos do Google Calendar",
    color: "from-red-500/20 to-red-500/5",
    fields: [
      {
        name: "accessToken",
        label: "Access Token",
        placeholder: "ya29...",
        type: "password",
        required: true,
        description: "Token OAuth2 do Google",
      },
      {
        name: "refreshToken",
        label: "Refresh Token",
        placeholder: "1//...",
        type: "password",
        required: false,
        description: "Token para renovação automática",
      },
    ],
  },
  slack: {
    label: "Slack",
    icon: MessageCircle,
    description: "Conecte seu workspace do Slack para comunicação",
    color: "from-pink-500/20 to-pink-500/5",
    fields: [
      {
        name: "accessToken",
        label: "Bot Token",
        placeholder: "xoxb-...",
        type: "password",
        required: true,
        description: "Obtenha em: https://api.slack.com/apps",
      },
      {
        name: "webhookUrl",
        label: "Webhook URL (opcional)",
        placeholder: "https://hooks.slack.com/services/...",
        type: "text",
        required: false,
        description: "URL do webhook para notificações",
      },
    ],
  },
  notion: {
    label: "Notion",
    icon: FileText,
    description: "Sincronize páginas e databases do Notion",
    color: "from-gray-500/20 to-gray-500/5",
    fields: [
      {
        name: "accessToken",
        label: "Integration Token",
        placeholder: "secret_...",
        type: "password",
        required: true,
        description: "Obtenha em: https://www.notion.so/my-integrations",
      },
    ],
  },
  github: {
    label: "GitHub",
    icon: Github,
    description: "Integre com repositórios e projetos do GitHub",
    color: "from-slate-500/20 to-slate-500/5",
    fields: [
      {
        name: "accessToken",
        label: "Personal Access Token",
        placeholder: "ghp_...",
        type: "password",
        required: true,
        description: "Obtenha em: GitHub > Settings > Developer settings > Personal access tokens",
      },
    ],
  },
  gitlab: {
    label: "GitLab",
    icon: GitBranch,
    description: "Conecte com projetos e pipelines do GitLab",
    color: "from-orange-600/20 to-orange-600/5",
    fields: [
      {
        name: "accessToken",
        label: "Personal Access Token",
        placeholder: "glpat-...",
        type: "password",
        required: true,
        description: "Obtenha em: GitLab > Preferences > Access Tokens",
      },
      {
        name: "instanceUrl",
        label: "Instance URL (opcional)",
        placeholder: "https://gitlab.com",
        type: "text",
        required: false,
        description: "URL da instância (padrão: gitlab.com)",
      },
    ],
  },
  trello: {
    label: "Trello",
    icon: Trello,
    description: "Gerencie boards e cards do Trello",
    color: "from-blue-600/20 to-blue-600/5",
    fields: [
      {
        name: "apiKey",
        label: "API Key",
        placeholder: "...",
        type: "password",
        required: true,
        description: "Obtenha em: https://trello.com/app-key",
      },
      {
        name: "accessToken",
        label: "Token",
        placeholder: "...",
        type: "password",
        required: true,
        description: "Gere o token através do link da API Key",
      },
    ],
  },
};

export default function PluginsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrg) {
      loadIntegrations();
    }
  }, [selectedOrg]);

  const loadOrganizations = async () => {
    try {
      const response = await fetch("/api/organizations");
      const data = await response.json();

      if (response.ok && data.organizations.length > 0) {
        setOrganizations(data.organizations);
        setSelectedOrg(data.organizations[0].id);
      }
    } catch (error) {
      console.error("Failed to load organizations:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao carregar organizações",
      });
    }
  };

  const loadIntegrations = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/integrations?organizationId=${selectedOrg}`
      );
      const data = await response.json();

      if (response.ok) {
        setIntegrations(data.integrations);
      } else {
        toast({
          variant: "destructive",
          title: "Erro",
          description: data.error || "Falha ao carregar plugins",
        });
      }
    } catch (error) {
      console.error("Failed to load integrations:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao carregar plugins",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (pluginKey: string) => {
    setSelectedPlugin(pluginKey);
    const config = pluginConfigs[pluginKey];
    setFormData({ name: `${config.label} Integration` });
    setDialogOpen(true);
  };

  const handleConnect = async () => {
    if (!selectedPlugin) return;

    const config = pluginConfigs[selectedPlugin];
    const missingFields = config.fields
      .filter((field) => field.required && !formData[field.name])
      .map((field) => field.label);

    if (missingFields.length > 0) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: `Preencha os campos obrigatórios: ${missingFields.join(", ")}`,
      });
      return;
    }

    setCreating(true);
    try {
      const payload: any = {
        organizationId: selectedOrg,
        provider: selectedPlugin,
        name: formData.name || `${config.label} Integration`,
      };

      config.fields.forEach((field) => {
        if (formData[field.name]) {
          payload[field.name] = formData[field.name];
        }
      });

      const response = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: `${config.label} conectado com sucesso!`,
        });
        setDialogOpen(false);
        setSelectedPlugin("");
        setFormData({});
        loadIntegrations();
      } else {
        toast({
          variant: "destructive",
          title: "Erro",
          description: data.error || "Falha ao conectar plugin",
        });
      }
    } catch (error) {
      console.error("Failed to create integration:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao conectar plugin",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDisconnect = async (id: string, pluginName: string) => {
    setDeleting(id);
    try {
      const response = await fetch(`/api/integrations/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: `${pluginName} desconectado com sucesso`,
        });
        loadIntegrations();
      } else {
        toast({
          variant: "destructive",
          title: "Erro",
          description: data.error || "Falha ao desconectar plugin",
        });
      }
    } catch (error) {
      console.error("Failed to delete integration:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao desconectar plugin",
      });
    } finally {
      setDeleting(null);
    }
  };

  const getIntegrationByProvider = (provider: string) => {
    return integrations.find((int) => int.provider === provider);
  };

  const currentConfig = selectedPlugin ? pluginConfigs[selectedPlugin] : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Plugins</h2>
        <p className="text-muted-foreground">
          Conecte suas ferramentas favoritas e automatize seu trabalho.
        </p>
      </div>

      {organizations.length > 0 && (
        <div className="flex items-center gap-4">
          <Label>Organização:</Label>
          <Select value={selectedOrg} onValueChange={setSelectedOrg}>
            <SelectTrigger className="w-[280px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(pluginConfigs).map(([key, config]) => {
            const integration = getIntegrationByProvider(key);
            const isConnected = !!integration;
            const Icon = config.icon;

            return (
              <Card
                key={key}
                className="shadow-lg border-border/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
              >
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${config.color}`} />
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${config.color} border border-primary/10 flex items-center justify-center`}>
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{config.label}</CardTitle>
                        {isConnected && (
                          <div className="flex items-center gap-1 mt-1">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            <span className="text-xs text-green-500 font-medium">
                              Conectado
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground min-h-[40px]">
                    {config.description}
                  </p>

                  {isConnected ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                        <span className="font-medium">{integration.name}</span>
                        <Badge
                          variant={
                            integration.status === "ACTIVE"
                              ? "success"
                              : integration.status === "ERROR"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {integration.status === "ACTIVE"
                            ? "Ativo"
                            : integration.status === "ERROR"
                            ? "Erro"
                            : "Inativo"}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleDisconnect(integration.id, config.label)}
                        disabled={deleting === integration.id}
                      >
                        {deleting === integration.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Desconectando...
                          </>
                        ) : (
                          <>
                            <Unplug className="mr-2 h-4 w-4" />
                            Desconectar
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full shadow-md"
                      onClick={() => handleOpenDialog(key)}
                    >
                      <Plug className="mr-2 h-4 w-4" />
                      Conectar
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog de Configuração */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {currentConfig && (
                <>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentConfig.color} border border-primary/10 flex items-center justify-center`}>
                    <currentConfig.icon className="h-6 w-6 text-primary" />
                  </div>
                  Conectar {currentConfig.label}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {currentConfig?.description}
            </DialogDescription>
          </DialogHeader>

          {currentConfig && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Integração</Label>
                <Input
                  id="name"
                  placeholder={`Ex: ${currentConfig.label} da Empresa`}
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-4">Credenciais</h4>
                <div className="space-y-4">
                  {currentConfig.fields.map((field) => (
                    <div key={field.name} className="space-y-2">
                      <Label htmlFor={field.name}>
                        {field.label}
                        {field.required && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </Label>
                      <Input
                        id={field.name}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={formData[field.name] || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [field.name]: e.target.value,
                          })
                        }
                      />
                      {field.description && (
                        <p className="text-xs text-muted-foreground">
                          {field.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setSelectedPlugin("");
                setFormData({});
              }}
              disabled={creating}
            >
              Cancelar
            </Button>
            <Button onClick={handleConnect} disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <Plug className="mr-2 h-4 w-4" />
                  Conectar
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
