# F-Insight Mobile

Aplicativo mobile Android do F-Insight criado com Expo/React Native.

## O que o app entrega

- Cockpit financeiro diário
- Radar de ativos com dados da API F-Insight
- Lista de acompanhamento
- Sinais simples de mercado
- Ferramenta educativa de margem de segurança
- Simulador de impacto do dólar
- Checklist antes de decidir
- Relatórios e estudos
- Aprendizado financeiro
- Modo Público, Cliente e Assessor

## Rodar localmente

```bash
cd mobile
npm install
npm run start
```

## Gerar APK e AAB pelo GitHub

No GitHub:

1. Abra `Actions`
2. Escolha `F-Insight Mobile Android Build`
3. Clique em `Run workflow`
4. Escolha `both`, `apk` ou `aab`
5. Aguarde finalizar
6. Baixe os artifacts:
   - `finsight-android-apk`
   - `finsight-android-aab`

O workflow usa Expo prebuild + Gradle no GitHub Actions. Ele não depende de conta Expo para gerar artifacts Android de teste.

## Build via EAS

Para builds com assinatura e publicação:

```bash
cd mobile
npm install -g eas-cli
npm install
eas login
eas init
eas build --platform android --profile preview     # APK interno
eas build --platform android --profile production  # AAB Play Store
```

Também é possível usar o `eas.json` já configurado:

- `preview`: gera APK
- `production`: gera AAB

## Variáveis

A API e o site podem ser trocados por ambiente:

```bash
EXPO_PUBLIC_API_URL=https://f-insight-api.onrender.com
EXPO_PUBLIC_WEB_URL=https://f-insight.netlify.app
```

## Observação regulatória

O app é educativo e informativo. Não mostra custódia, saldo, patrimônio, extrato ou carteira real. Não executa ordens e não gera recomendação individual automática.
