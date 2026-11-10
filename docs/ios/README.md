# F-Insight — exploratory iOS candidate (Phase 1 only)

The inspected `f-insight` repository contains a Vite/React frontend and does not expose a known existing Android/Expo/Capacitor mobile project on its default branch. The separate `finsight` repository must also be reconciled with the app actually published to Google Play.

This branch adds a **candidate** Capacitor simulator build to verify the UI can be packaged for iOS. This is NOT proof that this source matches the released Android app.

The identifier `br.com.alternativeventures.finsight.ioscandidate` is temporary and must not be registered in Apple Developer.

Before Phase 2: confirm live Google Play package, legal product name, login/auth and backend/API URLs; verify that app workflows work in WebKit on an iPhone; assess Apple functionality/review requirements, user account deletion, payments/entitlements, privacy, screenshots and signing. Do not replace the running Android version or merge this work without explicit QA.

**No TestFlight upload, certificate usage, App Store listing or submission is authorized in Phase 1.**
