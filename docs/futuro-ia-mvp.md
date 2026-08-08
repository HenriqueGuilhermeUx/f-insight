# F-Insight Futuro IA — MVP

## Visão

O F-Insight deixa de ser apenas radar de mercado e passa a ter um módulo Premium de vida financeira: **Meu Futuro IA**.

A tese do produto é simples: o usuário não precisa apenas saber quanto gastou. Ele precisa entender o que o dinheiro dele revela sobre a vida que está construindo.

## Promessa

> Descubra se seu dinheiro está financiando seus objetivos ou sabotando sua vida.

## O que foi implementado no MVP mobile

- Nova aba **Futuro IA** no app Android.
- Onboarding por objetivo:
  - Sair do vermelho
  - Montar reserva
  - Acumular patrimônio
  - Aposentar com renda
  - Comprar imóvel
  - Organizar família
- Classificação da realidade atual:
  - Falta dinheiro
  - Não sobra
  - Sobra e não guardo
  - Guardo, mas sem plano
  - Invisto sem objetivo
  - Tenho patrimônio
- Inputs de diagnóstico:
  - idade
  - dependentes
  - renda líquida mensal
  - gastos mensais
  - dívidas totais
  - valor guardado por mês
  - meta financeira
  - prazo em anos
  - texto colado de extrato ou fatura
- Motor local de diagnóstico educativo:
  - perfil financeiro
  - a real
  - saúde financeira 0-100
  - sobra real
  - taxa de poupança
  - horas de vida recuperáveis
  - oportunidades
  - missão de 7 dias
  - plano de 90 dias
  - cenários conservador, base e acelerado
- Persistência local do último relatório em AsyncStorage.

## Perfis do diagnóstico

### Sangria

Gasta mais do que ganha ou está pressionado por dívida. A prioridade é estancar o buraco.

### Malabarista

A renda apenas mantém o mês em pé. Qualquer imprevisto vira crise.

### Vazamento Silencioso

Sobra dinheiro, mas ele some em conveniência, recorrências e decisões pequenas.

### Poupador Fraco

Guarda algum valor, mas abaixo da ambição e sem plano forte.

### Construtor

Já poupa e começa a transformar dinheiro em futuro, mas precisa de metas claras.

### Estrategista

Tem disciplina e/ou patrimônio. O foco passa a ser proteção, otimização, sucessão e liberdade.

## O que o módulo não faz

- Não recomenda ações.
- Não recomenda ativos específicos.
- Não promete rentabilidade.
- Não movimenta dinheiro.
- Não substitui consultoria individualizada.

## Roadmap próximo

### Fase 1 — Manual estruturado

- Melhorar UI do Futuro IA.
- Salvar múltiplos relatórios mensais.
- Criar histórico de evolução.
- Permitir usuário editar diagnóstico.

### Fase 2 — Upload de extrato/fatura

- Upload PDF, CSV e OFX.
- Parser de texto/transações.
- Detecção de categorias, assinaturas, juros e recorrências.
- Relatório mais provocativo com base em dados reais.

### Fase 3 — IA real no backend

- Endpoint de análise no backend F-Insight API.
- System prompt do Mentor Financeiro.
- Sanitização/anônimização antes de enviar para o modelo.
- Resposta estruturada em JSON.

### Fase 4 — Open Finance consentido

- Pluggy/Klavi para leitura de contas, cartões e transações.
- Consentimento claro do usuário.
- Diagnóstico mensal vivo.
- Alertas automáticos quando o comportamento muda.

### Fase 5 — Ações assistidas

- Efí/Open Finance/PISP ou parceiros para ações consentidas.
- Criar caixinhas/metas.
- Gerar lembretes de pagamento.
- Sugerir renegociação/portabilidade sem executar sem consentimento.

## Diretriz de linguagem

O app deve falar como um mentor direto, não como gerente de banco.

Errado:

> Seu gasto com alimentação excedeu 10% do orçamento.

Certo:

> Você está trocando paz de espírito por conveniência. Se esse padrão continuar, sua meta atrasa e o banco ganha mais do que o seu futuro.

## Pitch interno

F-Insight Premium não é apenas IA de mercado. É IA para construir vida financeira de longo prazo.
