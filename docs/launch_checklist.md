# F-Insight - checklist de lançamento

## Posicionamento

F-Insight é uma plataforma white-label para escritórios de investimento entregarem inteligência de mercado, conteúdo educativo, relatórios e relacionamento digital para clientes finais.

Não vender como:

- corretora
- custódia
- extrato
- carteira real
- recomendação automática
- gestão de recursos

Vender como:

- portal white-label
- relacionamento digital
- conteúdo e inteligência de mercado
- relatórios educativos
- cockpit de próximas ações para assessores

## Cobrança Woovi

Antes da cobrança real:

1. Rodar `supabase/billing_woovi_mvp.sql` no Supabase.
2. Configurar no Render:

```txt
WOOVI_API_KEY=sua_chave_woovi
WOOVI_BASE_URL=https://api.woovi.com
APP_URL=https://f-insight.netlify.app
```

3. Opcional para preços:

```txt
BILLING_BASIC_CENTS=49700
BILLING_PRO_CENTS=99700
BILLING_PREMIUM_CENTS=199700
```

4. Deploy backend com cache limpo.
5. Deploy frontend com cache limpo.
6. Testar `/admin/cobranca`.

## Rotas principais para demo

- `/` - home comercial
- `/precos` - página pública de preços
- `/demo` - alternar visão Admin / Assessor / Cliente
- `/admin` - operação do escritório
- `/assessor` - workspace do assessor
- `/cliente` - portal do cliente final
- `/contato` - comunicação assessor-cliente
- `/admin/acompanhamentos` - cockpit de relacionamento
- `/admin/cobranca` - cobrança Pix
- `/onboarding` - implantação do escritório
- `/termos` - termos e aviso educacional

## Oferta recomendada

Para os primeiros clientes:

- Setup: R$ 1.500 a R$ 5.000
- Mensalidade Basic: R$ 497
- Mensalidade Pro: R$ 997
- Mensalidade Premium: R$ 1.997

Nome comercial do piloto:

**Founder Offices F-Insight**

Promessa:

> Plataforma com a marca do escritório para entregar inteligência, conteúdo e relacionamento digital aos clientes.
