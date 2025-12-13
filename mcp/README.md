# Model Context Protocol (MCP) - Flame Boilerplate

O Flame Boilerplate implementa um servidor MCP (Model Context Protocol) que permite que assistentes de IA e outras ferramentas interajam com as funcionalidades da plataforma de forma estruturada.

## O que é MCP?

Model Context Protocol (MCP) é um protocolo aberto desenvolvido pela Anthropic que permite que aplicações de IA se conectem a diferentes fontes de dados e ferramentas de forma padronizada.

## Recursos Disponíveis

O servidor MCP do Flame expõe as seguintes ferramentas:

### Organizações
- `create_organization` - Criar nova organização
- `get_organization_stats` - Obter estatísticas da organização

### Leads (CRM)
- `create_lead` - Criar novo lead
- `list_leads` - Listar leads com filtros
- `update_lead_status` - Atualizar status de um lead

### Notificações
- `create_notification` - Criar notificação para usuário

### Submissões
- `list_submissions` - Listar submissões de formulários

## Instalação

### 1. Instalar dependências MCP

```bash
pnpm add @modelcontextprotocol/sdk
```

### 2. Compilar o servidor MCP

```bash
# Compilar o TypeScript para JavaScript
npx tsc mcp/server.ts --outDir mcp --module commonjs --target es2020 --moduleResolution node --esModuleInterop
```

### 3. Configurar no Claude Desktop

Adicione ao arquivo de configuração do Claude Desktop (`~/Library/Application Support/Claude/claude_desktop_config.json` no macOS):

```json
{
  "mcpServers": {
    "flame-boilerplate": {
      "command": "node",
      "args": ["/caminho/para/flame-boilerplate/mcp/server.js"],
      "env": {
        "DATABASE_URL": "postgresql://postgres:postgres@localhost:5433/flame_db?schema=public"
      }
    }
  }
}
```

## Exemplos de Uso

### Criar um novo lead

```
Crie um novo lead chamado "João Silva" com email joao@empresa.com
para a organização [organization-id]
```

O MCP irá executar:
```typescript
create_lead({
  organizationId: "...",
  name: "João Silva",
  email: "joao@empresa.com",
  source: "WEBSITE"
})
```

### Listar leads em negociação

```
Liste todos os leads em negociação da organização [organization-id]
```

O MCP irá executar:
```typescript
list_leads({
  organizationId: "...",
  status: "NEGOTIATION"
})
```

### Criar notificação

```
Crie uma notificação para o usuário [user-id] informando sobre nova assinatura
```

O MCP irá executar:
```typescript
create_notification({
  userId: "...",
  type: "SUBSCRIPTION_CREATED",
  title: "Nova assinatura ativada",
  message: "Sua assinatura foi ativada com sucesso!"
})
```

### Obter estatísticas

```
Mostre as estatísticas da organização [organization-id]
```

O MCP irá executar:
```typescript
get_organization_stats({
  organizationId: "..."
})
```

## Desenvolvimento

### Adicionar nova ferramenta

Para adicionar uma nova ferramenta ao MCP:

1. **Defina a ferramenta** em `ListToolsRequestSchema`:

```typescript
{
  name: "minha_ferramenta",
  description: "Descrição da ferramenta",
  inputSchema: {
    type: "object",
    properties: {
      // ... parâmetros
    },
    required: ["parametros_obrigatorios"]
  }
}
```

2. **Implemente o handler** em `CallToolRequestSchema`:

```typescript
case "minha_ferramenta": {
  const { parametros } = args as any;

  // Lógica da ferramenta
  const resultado = await prisma.model.create({ ... });

  return {
    content: [{
      type: "text",
      text: JSON.stringify(resultado, null, 2)
    }]
  };
}
```

## Segurança

⚠️ **IMPORTANTE**: O servidor MCP tem acesso direto ao banco de dados. Certifique-se de:

- Executar apenas em ambientes confiáveis
- Não expor o servidor MCP publicamente
- Validar todas as entradas de usuário
- Implementar rate limiting se necessário
- Usar em conjunto com autenticação apropriada

## Recursos Adicionais

- [Documentação oficial do MCP](https://modelcontextprotocol.io)
- [SDK do MCP](https://github.com/modelcontextprotocol/sdk)
- [Exemplos de servidores MCP](https://github.com/modelcontextprotocol/servers)

## Troubleshooting

### Servidor não inicia
- Verifique se as dependências estão instaladas: `pnpm install`
- Compile o TypeScript: `npx tsc mcp/server.ts`
- Verifique se a DATABASE_URL está configurada corretamente

### Ferramentas não aparecem no Claude
- Reinicie o Claude Desktop
- Verifique o arquivo de configuração `claude_desktop_config.json`
- Verifique os logs em `~/Library/Logs/Claude/`

### Erros de conexão com banco
- Confirme que o PostgreSQL está rodando
- Verifique a string de conexão DATABASE_URL
- Execute `pnpm db:push` para sincronizar o schema
