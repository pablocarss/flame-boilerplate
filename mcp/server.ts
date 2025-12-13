/**
 * Model Context Protocol (MCP) Server
 *
 * Este servidor MCP expõe as funcionalidades do Flame Boilerplate para
 * assistentes de IA e outras ferramentas compatíveis com MCP.
 *
 * Recursos disponíveis:
 * - Criar e gerenciar organizações
 * - Gerenciar membros e convites
 * - Criar e atualizar leads
 * - Gerenciar submissões de formulários
 * - Criar notificações
 * - Gerenciar API keys
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { prisma } from "../src/lib/prisma";

const server = new Server(
  {
    name: "flame-boilerplate-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Lista de ferramentas disponíveis
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "create_organization",
        description: "Criar uma nova organização",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Nome da organização",
            },
            slug: {
              type: "string",
              description: "Slug único da organização",
            },
            userId: {
              type: "string",
              description: "ID do usuário que será admin",
            },
          },
          required: ["name", "slug", "userId"],
        },
      },
      {
        name: "create_lead",
        description: "Criar um novo lead no CRM",
        inputSchema: {
          type: "object",
          properties: {
            organizationId: {
              type: "string",
              description: "ID da organização",
            },
            name: {
              type: "string",
              description: "Nome do lead",
            },
            email: {
              type: "string",
              description: "Email do lead",
            },
            phone: {
              type: "string",
              description: "Telefone do lead",
            },
            company: {
              type: "string",
              description: "Empresa do lead",
            },
            source: {
              type: "string",
              enum: ["WEBSITE", "REFERRAL", "SOCIAL_MEDIA", "EMAIL_CAMPAIGN", "COLD_CALL", "EVENT", "PARTNER", "OTHER"],
              description: "Origem do lead",
            },
            value: {
              type: "number",
              description: "Valor estimado do negócio",
            },
          },
          required: ["organizationId", "name", "email"],
        },
      },
      {
        name: "list_leads",
        description: "Listar leads de uma organização",
        inputSchema: {
          type: "object",
          properties: {
            organizationId: {
              type: "string",
              description: "ID da organização",
            },
            status: {
              type: "string",
              enum: ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"],
              description: "Filtrar por status",
            },
          },
          required: ["organizationId"],
        },
      },
      {
        name: "update_lead_status",
        description: "Atualizar o status de um lead",
        inputSchema: {
          type: "object",
          properties: {
            leadId: {
              type: "string",
              description: "ID do lead",
            },
            status: {
              type: "string",
              enum: ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"],
              description: "Novo status do lead",
            },
          },
          required: ["leadId", "status"],
        },
      },
      {
        name: "create_notification",
        description: "Criar uma notificação para um usuário",
        inputSchema: {
          type: "object",
          properties: {
            userId: {
              type: "string",
              description: "ID do usuário",
            },
            type: {
              type: "string",
              enum: ["INVITE", "MEMBER_ADDED", "MEMBER_REMOVED", "ROLE_CHANGED", "SUBSCRIPTION_CREATED", "SUBSCRIPTION_CANCELED", "INTEGRATION_CONNECTED", "INTEGRATION_ERROR", "GENERAL"],
              description: "Tipo da notificação",
            },
            title: {
              type: "string",
              description: "Título da notificação",
            },
            message: {
              type: "string",
              description: "Mensagem da notificação",
            },
            actionUrl: {
              type: "string",
              description: "URL de ação (opcional)",
            },
          },
          required: ["userId", "title", "message"],
        },
      },
      {
        name: "list_submissions",
        description: "Listar submissões de formulários",
        inputSchema: {
          type: "object",
          properties: {
            organizationId: {
              type: "string",
              description: "ID da organização",
            },
            status: {
              type: "string",
              enum: ["PENDING", "REVIEWED", "APPROVED", "REJECTED", "ARCHIVED"],
              description: "Filtrar por status",
            },
            formType: {
              type: "string",
              description: "Filtrar por tipo de formulário",
            },
          },
          required: ["organizationId"],
        },
      },
      {
        name: "get_organization_stats",
        description: "Obter estatísticas de uma organização",
        inputSchema: {
          type: "object",
          properties: {
            organizationId: {
              type: "string",
              description: "ID da organização",
            },
          },
          required: ["organizationId"],
        },
      },
    ],
  };
});

// Handler para executar ferramentas
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case "create_organization": {
        const { name, slug, userId } = args as any;

        const organization = await prisma.organization.create({
          data: { name, slug },
        });

        await prisma.member.create({
          data: {
            userId,
            organizationId: organization.id,
            role: "ADMIN",
          },
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(organization, null, 2),
            },
          ],
        };
      }

      case "create_lead": {
        const { organizationId, name, email, phone, company, source, value } = args as any;

        const lead = await prisma.lead.create({
          data: {
            organizationId,
            name,
            email,
            phone,
            company,
            source: source || "WEBSITE",
            value,
          },
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(lead, null, 2),
            },
          ],
        };
      }

      case "list_leads": {
        const { organizationId, status } = args as any;

        const where: any = { organizationId };
        if (status) where.status = status;

        const leads = await prisma.lead.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: 50,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(leads, null, 2),
            },
          ],
        };
      }

      case "update_lead_status": {
        const { leadId, status } = args as any;

        const lead = await prisma.lead.update({
          where: { id: leadId },
          data: {
            status,
            ...(status === "WON" && { convertedAt: new Date() }),
          },
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(lead, null, 2),
            },
          ],
        };
      }

      case "create_notification": {
        const { userId, type, title, message, actionUrl } = args as any;

        const notification = await prisma.notification.create({
          data: {
            userId,
            type: type || "GENERAL",
            title,
            message,
            actionUrl,
          },
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(notification, null, 2),
            },
          ],
        };
      }

      case "list_submissions": {
        const { organizationId, status, formType } = args as any;

        const where: any = { organizationId };
        if (status) where.status = status;
        if (formType) where.formType = formType;

        const submissions = await prisma.submission.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: 50,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(submissions, null, 2),
            },
          ],
        };
      }

      case "get_organization_stats": {
        const { organizationId } = args as any;

        const [
          membersCount,
          leadsCount,
          submissionsCount,
          organization,
        ] = await Promise.all([
          prisma.member.count({ where: { organizationId } }),
          prisma.lead.count({ where: { organizationId } }),
          prisma.submission.count({ where: { organizationId } }),
          prisma.organization.findUnique({
            where: { id: organizationId },
            include: {
              subscription: {
                include: { plan: true },
              },
            },
          }),
        ]);

        const stats = {
          organization: organization?.name,
          members: membersCount,
          leads: leadsCount,
          submissions: submissionsCount,
          subscription: organization?.subscription?.plan?.name || "Free",
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(stats, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Iniciar servidor
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Flame Boilerplate MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
