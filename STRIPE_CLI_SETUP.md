# Configuração do Stripe CLI para Localhost

## Instalação do Stripe CLI no Windows

### Opção 1: Via Chocolatey (Recomendado)

Abra o PowerShell como **Administrador** e execute:

```powershell
choco install stripe-cli -y
```

### Opção 2: Download Manual

1. Baixe o instalador do Windows em: https://github.com/stripe/stripe-cli/releases/latest
2. Procure por `stripe_X.X.X_windows_x86_64.zip`
3. Extraia o arquivo e adicione ao PATH do sistema

### Opção 3: Via Scoop

```powershell
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

## Configuração Inicial

### 1. Fazer login na sua conta Stripe

```bash
stripe login
```

Isso abrirá seu navegador para autorizar o acesso. Após autorizar, o CLI estará conectado à sua conta Stripe.

### 2. Configurar Webhooks para Localhost

Para receber webhooks do Stripe no seu ambiente local, execute:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 3. Obter o Webhook Secret

Quando você executar `stripe listen`, o CLI exibirá um webhook signing secret. Copie esse valor e atualize seu arquivo `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Testando Pagamentos Localmente

### 1. Iniciar o servidor Next.js

```bash
pnpm dev
```

### 2. Em outro terminal, iniciar o Stripe listen

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 3. Testar um checkout

Acesse http://localhost:3000/dashboard/billing e selecione um plano.

### 4. Usar cartões de teste

Use estes números de cartão de teste do Stripe:

- **Sucesso**: `4242 4242 4242 4242`
- **Falha**: `4000 0000 0000 0002`
- **Requer autenticação**: `4000 0025 0000 3155`

Use qualquer:
- CVC: Qualquer 3 dígitos (ex: 123)
- Data de expiração: Qualquer data futura (ex: 12/34)
- CEP: Qualquer código (ex: 12345)

## Eventos do Stripe

O Stripe CLI encaminhará automaticamente estes eventos para sua aplicação:

- `checkout.session.completed` - Quando um checkout é concluído
- `customer.subscription.created` - Quando uma assinatura é criada
- `customer.subscription.updated` - Quando uma assinatura é atualizada
- `customer.subscription.deleted` - Quando uma assinatura é cancelada
- `invoice.payment_failed` - Quando um pagamento falha

## Comandos Úteis

### Testar um webhook manualmente

```bash
stripe trigger payment_intent.succeeded
```

### Ver todos os eventos

```bash
stripe events list
```

### Ver logs em tempo real

```bash
stripe logs tail
```

### Testar produtos e preços

```bash
# Listar produtos
stripe products list

# Listar preços
stripe prices list
```

## Troubleshooting

### Erro: "webhook signature verification failed"

Certifique-se de que o `STRIPE_WEBHOOK_SECRET` no `.env` corresponde ao secret exibido pelo `stripe listen`.

### Erro: "No Stripe customer found"

Verifique se você está criando um checkout session primeiro antes de tentar acessar o portal.

### Webhooks não estão sendo recebidos

1. Verifique se o `stripe listen` está rodando
2. Verifique se a URL de forward está correta: `localhost:3000/api/webhooks/stripe`
3. Certifique-se de que o servidor Next.js está rodando

## Próximos Passos

1. Configure seus planos no Stripe Dashboard
2. Atualize os `stripePriceId` no banco de dados (tabela `plans`)
3. Teste o fluxo completo de checkout
4. Configure o Stripe Customer Portal no Dashboard do Stripe

## Recursos

- [Documentação do Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Webhooks do Stripe](https://stripe.com/docs/webhooks)
- [Cartões de Teste](https://stripe.com/docs/testing)
- [Stripe Dashboard](https://dashboard.stripe.com)
