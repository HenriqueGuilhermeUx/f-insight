# F-Insight Agent — Radar IA + Futuro IA

## Visão

O F-Insight Agent é a evolução natural do app após publicação na Google Play: um agente educativo que combina mercado, objetivos pessoais, simulações e, no futuro, Open Finance consentido.

A inspiração é o modelo de agentes de pesquisa e backtesting em linguagem natural, mas o F-Insight não deve virar robô de trade. O foco é consciência financeira, longo prazo, simulação e decisão melhor informada.

## Posicionamento

> A IA que entende seu dinheiro, seus objetivos e o mercado — sem prometer milagre.

## Módulos

### 1. Futuro IA

Ajuda o usuário a responder: minha vida financeira está indo para onde?

Entradas:
- objetivo de vida
- renda
- gastos
- dívidas
- dependentes
- prazo
- meta financeira
- extrato/fatura por upload, texto colado ou Open Finance no futuro

Saídas:
- perfil financeiro
- a real
- score de liberdade
- vazamentos
- horas de vida recuperáveis
- missão de 7 dias
- plano de 90 dias
- cenários conservador, base e acelerado

### 2. Radar IA

Ajuda o usuário a responder: como entender mercado sem cair em palpite?

Entradas:
- pergunta em linguagem natural
- ativo/índice/cripto opcional
- horizonte de análise
- objetivo do usuário

Saídas:
- resumo educativo
- pontos a verificar
- plano de simulação/backtest
- riscos e limitações
- perguntas que conectam mercado com objetivo pessoal

### 3. Backtest Educativo

Simulação de hipóteses, não promessa de ganho.

Entradas:
- ticker/índice
- aporte mensal
- prazo
- cenário

Saídas:
- retorno simulado
- drawdown quando houver série histórica real
- meses negativos
- comparação com aportes regulares
- limitações claras

## Guardrails

O agente deve sempre respeitar:

- Não recomendar compra ou venda de ativos.
- Não executar ordens.
- Não prometer rentabilidade.
- Não substituir consultoria individualizada.
- Sempre exibir premissas e limitações.
- Sempre distinguir simulação de realidade.

## Backend iniciado

No backend `f-insight-api`, foi iniciado o serviço `src/services/agentService.js` com:

- `buildRadarAgent()`
- `buildFinancialProfile()`
- `buildBacktest()`

Também foi criada uma primeira rota em `src/routes/finsightAgent.js` para expor:

- `GET /health`
- `POST /radar`
- `POST /life-plan`
- `POST /backtest`

Próximo passo técnico: conectar a rota no `src/server.js`, por exemplo em `/api/mentor` ou `/api/agent`.

## Roadmap técnico

### Fase 1 — Motor determinístico seguro

- Rodar simulações sem IA externa.
- Gerar relatório estruturado.
- Usar no app e site como MVP.

### Fase 2 — IA real no backend

- Adicionar endpoint com LLM.
- Enviar prompt sanitizado.
- Receber resposta JSON validada.
- Bloquear linguagem de recomendação direta.

### Fase 3 — Upload de extrato/fatura

- PDF/CSV/OFX.
- Parser de transações.
- Detecção de recorrências, juros, taxas, delivery e vazamentos.

### Fase 4 — Open Finance

- Pluggy/Klavi para leitura consentida.
- Efí/Open Finance/PISP para ações assistidas futuras.
- Diagnóstico vivo mensal.

### Fase 5 — Experiência premium

- Chat em linguagem natural.
- Histórico de relatórios.
- Check-in mensal.
- Alertas de comportamento.
- Integração com metas/caixinhas.
