# Real browser evidence

The original application was captured at localhost:5175 on October 7, 2026, before its server was replaced. `docs/evidence/reference/report.json` records screenshots, routes, assets, typography, form fields, interactions, and browser errors. Browser profiles are temporary directories outside the project and are removed after each run.

Run from the project root with Node 22 or newer and Microsoft Edge installed:

```powershell
node tests/visual/check-baseline-manifest.mjs
node tests/browser/capture-reference.mjs docs/evidence/current
node tests/browser/verify-user-flow.mjs
```

`ASCENTA_WEB_URL`, `ASCENTA_API_URL`, and `ASCENTA_EDGE_PATH` override the local web/API/browser locations. Never capture a migrated application into `docs/evidence/reference`.

The browser capture covers all 15 routes at 390×844 and 1440×1000, direct navigation, mobile menus, English/Spanish, hourly journey drafts, contact availability, help, account screens, scroll states, hash navigation, browser history, and authentication query modes. Its existing-account check accepts `ASCENTA_BROWSER_EMAIL` and `ASCENTA_BROWSER_PASSWORD`; it uses demo credentials only when the API explicitly reports demo mode and otherwise reports that check as skipped.

`verify-user-flow.mjs` requires MySQL and loopback web/API URLs. It creates one named local account at `example.invalid`, verifies it using the app's local verification UI, signs in, creates a journey request, checks the authenticated desktop/mobile dashboard and full reload, and signs out. It records the test email and journey reference so fixtures can be identified. Passwords and verification tokens are never saved in evidence. This verifies the actual registration and booking flow without requiring pre-existing demo accounts.

For the verified full restart check, run `node tests/integration/verify-local-persistence.mjs before` after the browser flow, stop/start with the root PowerShell scripts, then run `node tests/integration/verify-local-persistence.mjs after`. It checks the same MySQL account/journey record hash and the final API data mode without saving login credentials. The isolated MySQL integration suite separately verifies an existing session and journey across a real API process restart.

The original reference ran in explicit demo mode. Normal MySQL mode correctly omits the existing demo badges/disclaimers; this also moves content below those notices. Keep the normal MySQL captures as runtime evidence. For a strict visual comparison in the same mode, temporarily restart the same application in explicit demo mode, capture it, then restore normal MySQL mode:

```powershell
.\Detener-Ascenta.ps1
.\Iniciar-Ascenta.ps1 -Demo -NoAbrir
node tests/browser/capture-reference.mjs docs/evidence/visual-equivalent
node tests/browser/verify-portals.mjs
node tests/visual/compare.mjs
.\Detener-Ascenta.ps1
.\Iniciar-Ascenta.ps1 -NoAbrir
```

The pixel comparison decodes the actual PNG files using only Node built-ins. It compares all ten public routes at both viewports plus the desktop footer, checks viewport dimensions and visible image loading, and records both screenshot hashes, changed-pixel ratios, and mean channel error in `docs/evidence/comparison.json`. It defaults to `reference` versus `visual-equivalent`; explicit directory arguments can compare other captures. There are no pixel masks. Its small tolerance allows browser antialiasing and animation timing differences; a successful manifest check alone does not claim visual fidelity. Any failure requires investigation. Changes to thresholds must be justified, never made solely to turn a failure into a pass.

`verify-portals.mjs` runs only in explicit demo mode. It creates an organization request and a personal request for existing demo fixtures, checks authorized corporate/admin views and filters on desktop/mobile, downloads the corporate selection as CSV, verifies spreadsheet formula escaping, and confirms corporate users cannot see the admin queue. Its fixtures disappear when demo is stopped; normal MySQL data is untouched.

The superseded October 4 JSON declaration has been removed. It did not compare the currently running local application's screenshot files.
