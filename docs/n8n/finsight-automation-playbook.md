# F-Insight + n8n Automation Playbook

Este playbook descreve os fluxos iniciais para rodar no n8n hospedado na Oracle Cloud.

## Arquitetura

- F-Insight Frontend: Netlify
- F-Insight API: Render
- Banco: Supabase
- Automação: n8n Oracle Cloud
- Cobrança: Woovi

## Endpoints F-Insight para n8n

```txt
GET  https://f-insight-api.onrender.com/api/automation/health
POST https://f-insight-api.onrender.com/api/automation/log
POST https://f-insight-api.onrender.com/api/automation/office-activated
POST https://f-insight-api.onrender.com/api/automation/client-alert
POST https://f-insight-api.onrender.com/api/billing/webhooks/woovi
```

## Fluxo 1 — Woovi pago → ativar escritório

Objetivo: transformar pagamento aprovado em onboarding automático.

Nodes sugeridos:

1. Webhook n8n: `/webhook/finsight/woovi-paid`
2. HTTP Request para API F-Insight:
   - POST `https://f-insight-api.onrender.com/api/billing/webhooks/woovi`
   - Body: payload recebido da Woovi
3. IF: status pago/confirmado
4. HTTP Request:
   - POST `https://f-insight-api.onrender.com/api/automation/office-activated`
5. Enviar e-mail/WhatsApp:
   - Boas-vindas
   - Link `/admin/onboarding`
   - Próximos passos
6. HTTP Request:
   - POST `/api/automation/log`
   - eventType: `woovi_paid_activation`

Mensagem sugerida:

```txt
Pagamento confirmado. Sua implantação F-Insight foi iniciada.
Próximo passo: acesse o onboarding e configure a marca do escritório.
```

## Fluxo 2 — Cliente perguntou → alertar assessor

Objetivo: reduzir atraso de resposta.

Nodes sugeridos:

1. Schedule Trigger: a cada 1 hora
2. Supabase query ou HTTP Request no banco:
   - Buscar mensagens `sender_role = client` das últimas 24h
3. Buscar follow-ups abertos relacionados
4. IF: existe dúvida sem retorno
5. Enviar alerta para assessor/admin
6. POST `/api/automation/client-alert`

Mensagem sugerida:

```txt
Novo cliente pediu ajuda no app F-Insight.
Abra o cockpit de relacionamento e responda a próxima ação.
```

## Fluxo 3 — Novo relatório/conteúdo → avisar cliente

Objetivo: aumentar uso do app do cliente.

Nodes sugeridos:

1. Schedule Trigger: a cada 30 minutos ou webhook futuro do app
2. Buscar relatórios/conteúdos publicados nas últimas horas
3. Enviar aviso ao cliente:
   - E-mail
   - WhatsApp
   - Telegram interno do escritório
4. Link principal: `https://f-insight.netlify.app/app`
5. POST `/api/automation/log`

Mensagem sugerida:

```txt
Seu assessor liberou um novo material no portal.
Acesse o app F-Insight para ler e enviar dúvidas.
```

## Fluxo 4 — Resumo semanal do escritório

Objetivo: criar percepção de valor para o admin do escritório.

Nodes sugeridos:

1. Schedule Trigger: segunda-feira 08h
2. Consultar Supabase:
   - mensagens enviadas
   - dúvidas de clientes
   - relatórios publicados
   - ações abertas
   - ações concluídas
3. Montar resumo HTML/texto
4. Enviar para admin do escritório
5. POST `/api/automation/log`

Resumo sugerido:

```txt
Resumo semanal F-Insight
- Mensagens registradas
- Dúvidas recebidas
- Relatórios liberados
- Ações abertas
- Clientes que precisam de atenção
```

## Fluxo 5 — Health check operacional

Objetivo: saber antes do cliente quando algo caiu.

Nodes sugeridos:

1. Schedule Trigger: a cada 1 hora
2. HTTP Request:
   - GET `https://f-insight-api.onrender.com/api/health`
   - GET `https://f-insight-api.onrender.com/api/live/status`
   - GET `https://f-insight-api.onrender.com/api/automation/health`
3. IF: algum endpoint falhou
4. Enviar alerta para você
5. POST `/api/automation/log`

Mensagem sugerida:

```txt
Atenção: health check F-Insight falhou.
Verificar Render, Supabase ou dados ao vivo.
```

## Ordem de implantação recomendada

1. Rodar `supabase/n8n_automation_foundation.sql`
2. Fazer deploy da API no Render
3. Testar `GET /api/automation/health`
4. Criar fluxo Health Check no n8n
5. Criar fluxo Woovi pago → onboarding
6. Criar fluxo Cliente perguntou → assessor
7. Criar resumo semanal

## Segurança

Para MVP, os endpoints aceitam payload simples para acelerar implantação.
Antes de escalar, adicionar:

- segredo em header `X-FINSIGHT-AUTOMATION-SECRET`
- validação de assinatura da Woovi
- políticas RLS por tenant
- logs por usuário/escritório
