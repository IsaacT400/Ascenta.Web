# Migration Matrix

| Elemento original | Destino final | API / entidad | Prueba o evidencia | Estado |
| --- | --- | --- | --- | --- |
| Home y motion | `apps/web/app/page.tsx`, `components/home-*` | ninguno | comparación PNG exacta en 5 viewports, build | conservado y verificado |
| Services | `apps/web/app/services/page.tsx` | `GET /catalog`, `ServiceType` | contrato/API | visual conservado; copy provisional |
| Fleet | `apps/web/app/fleet/page.tsx` | `GET /catalog`, `VehicleClass` | contrato/API | visual conservado; flota provisional |
| Booking wizard | `components/booking-wizard.tsx` | `POST /reservations`, `Reservation` | API idempotency test | integrado para solicitud; sin quote/payment |
| Login visual | `app/login/page.tsx` | `/auth/login`, `User`, `Session` | auth integration test | sign-in integrado |
| Create account / Reset | pestañas de login | no endpoint | inventario | aprobado como concepto, pendiente |
| Customer dashboard | `app/dashboard/page.tsx` + `auth-gate` | `/auth/me`, `/reservations` | unauthorized/auth tests | guard real; datos visuales demo |
| Corporate dashboard | `app/corporate/page.tsx` + `auth-gate` | membership/org | guard manual; prueba MySQL real | guard real; datos visuales demo |
| Usage Matrix | `app/corporate/usage`, `usage-matrix` | no analytics endpoint | visual/export manual | demo preservado |
| CSV demo | `usage-matrix.tsx` | cliente solamente | revisión manual | preservado; ficticio |
| Navegación/footer/UI | `apps/web/components`, `components/ui` | ninguno | build/lint/visual | conservado |
| Datos hard-coded | seed + catálogos Prisma donde aplica | modelos MySQL | migration/seed tests | migrado solo cuando existe contrato real |
| Antiguo punto Drizzle/D1 | `apps/web/db`, `apps/web/drizzle` | ninguno | inventario | legado aislado; no es persistencia activa |
| Errores HTTP | `apps/api/src/app.ts` | envelope uniforme | integration tests | implementado |
| Roles/permisos | repository + API middleware | `Membership`, session roles | auth demo e integración MySQL pasan | implementado para alcance API |
| Pricing/money | schema versionado | `RatePlan`, `PricingRule`, `Quote` | schema validation | preparado, sin reglas inventadas |
| Admin/subscriptions/billing | no pantalla operativa original | no endpoint | inventario | no especificado / pendiente |

La preservación visual se rastrea contra el commit original, no contra capturas regeneradas desde la migración. “Conservado” no significa que el contenido demo se haya convertido en una integración operativa.
