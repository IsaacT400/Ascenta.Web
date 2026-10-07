# Matriz de migración ASCENTA

Referencia local: aplicación de `Ascenta.Web` servida en http://localhost:5175 el 2026-10-07; commit base 0e3177e con cambios locales. Recuperación: rama `recovery/local-reference`, commit f1cacb3 y respaldo externo indicado en el informe.

El [inventario por archivo](source-inventory.json) enumera las 214 fuentes originales con SHA256, tamaño, destino y disposición. Esta matriz agrupa sus responsabilidades; no identifica una función pendiente como implementada. “Eliminado” se refiere a la ubicación sustituida, no a perder su comportamiento.

| Archivo/módulo original | Responsabilidad | Destino | Dependencias | Comportamientos conservados | Verificación realizada | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| apps/web/app/layout.tsx | Documento, metadata, provider y shell | apps/web/index.html; src/main.tsx; src/components/ascenta/App.tsx | React, router | Título, viewport, favicon, shell global | Typecheck/build; referencia navegador | verificado |
| app/page.tsx y components/ascenta/home.tsx | Home | src/App.tsx; src/components/ascenta/home.tsx | Contexto, UI, imágenes | Hero jet/SUV/viajero, CTA, formulario inicial, secciones | Unit/build; comparación visual en informe | verificado |
| app/services/page.tsx | Servicios | src/App.tsx; components/ascenta/pages.tsx | CSS, catálogos | Contenido y enlaces | Acceso directo/recarga en navegador | verificado |
| app/fleet/page.tsx | Flota | src/App.tsx; components/ascenta/pages.tsx | Imágenes originales, CSS | Tarjetas, capacidades y estados | Acceso directo/recarga; capturas | verificado |
| app/business/page.tsx | Empresas | src/App.tsx; components/ascenta/pages.tsx | Router | CTA y contenido | Navegador desktop/móvil | verificado |
| app/contact/page.tsx | Contacto | src/App.tsx; components/ascenta/pages.tsx | useLocation.search | Tema de consulta por URL; aviso de envío pendiente | Navegador; botón deshabilitado conservado | verificado |
| app/help/page.tsx | Ayuda | src/App.tsx; components/ascenta/pages.tsx | HTML details | Acordeones y navegación | Interacción navegador | verificado |
| app/privacy/page.tsx; app/terms/page.tsx | Políticas | src/App.tsx; components/ascenta/pages.tsx | Shell | Contenido legal existente, sin inventar condiciones | Capturas y acceso directo | verificado |
| app/not-found.tsx | URL desconocida | src/App.tsx wildcard; NotFoundPage | React Router | Página no encontrada y regreso | Router y build | verificado |
| components/ascenta/chrome.tsx | Navbar, menú, footer | src/components/ascenta/chrome.tsx | Contexto, rAF | Navbar por fondo, diálogo móvil, Escape/foco, links | Navegador y limpieza de listeners | verificado |
| components/ascenta/ui.tsx | Controles, iconos, modales y avisos | src/components/ascenta/ui.tsx | React, CSS | Formularios accesibles, toast de 7 s, estados | Unit/lint, navegador | verificado |
| components/ascenta/context.tsx | Estado global y navegación | src/components/ascenta/context.tsx | React Router; API | Idioma EN/ES localStorage, auth multitab, draft | Typecheck y flujos navegador | verificado |
| next/link; next/navigation | Navegación y parámetros | RouterLink/useNavigate/useLocation; routes/navigation-effects.tsx | React Router | URLs, search, hash, atrás/adelante, foco/scroll | Pruebas navegador registradas en informe | verificado |
| components/ascenta/auth.tsx | Registro/verificación/login/logout | src/components/ascenta/auth.tsx | /auth v1 | Verificación local, retorno seguro, token retirado URL | 13 pruebas HTTP/MySQL; navegador real | verificado |
| Pantallas forgot/reset | Recuperación de cuenta pendiente | AuthPage | Sin API de recuperación | Aviso explícito; no simula correo enviado | Inspección + navegador | verificado |
| components/ascenta/booking.tsx | Formulario de viaje | src/components/ascenta/booking.tsx | Contexto; catálogo; API | 4 pasos, regreso, pasajeros, equipaje, contacto, consentimiento | Unit; MySQL; flujo navegador | verificado |
| components/ascenta/platform.ts | Validaciones y utilidades | src/components/ascenta/platform.ts | Intl, contratos | Zonas horarias/DST, límites, retorno seguro, CSV | Pruebas unitarias | verificado |
| Borrador sessionStorage | Viaje entre Home/auth/booking | AppProvider + booking | UUID, TTL 30 min | Transferencia, recarga, expiración, bloqueo incertidumbre | Pruebas unitarias + navegador | verificado |
| components/ascenta/portal.tsx; dashboard/account | Portal propietario | src/components/ascenta/portal.tsx; rutas explícitas | /auth/me; /reservations | Filtros, búsqueda, detalle, recarga, vacío/error | MySQL aislamiento y navegador | verificado |
| corporate; corporate/usage | Portal corporativo y exportación | JourneysPage corporate | Membresías/API | Solo datos autorizados, CSV, avisos pendientes | MySQL permisos y guards navegador | verificado |
| components/ascenta/operations.tsx; admin | Administración de lectura | src/components/ascenta/operations.tsx | /admin/reservations; ASCENTA_ADMIN | Cola y detalle autorizados | MySQL rol admin y no autorizado | verificado |
| components/ascenta/types.ts | Tipos públicos web | src/components/ascenta/types.ts | shared | Contratos compatibles | Typecheck | verificado |
| components/ascenta/adapter-api.ts | Adaptación de contratos | src/components/ascenta/adapter-api.ts | fetch, cookie CSRF, shared | Mismo /api/v1, errores y payload | Tests adapter + HTTP | verificado |
| NEXT_PUBLIC_* | Variables públicas | VITE_API_BASE_URL; VITE_CSRF_COOKIE_NAME | import.meta.env | Solo URL API y nombre público cookie | Build y chequeo de secretos en dist | verificado |
| app/ascenta.css | Estilos, overlays, responsive y motion | src/styles/ascenta.css | CSS; Georgia/Arial efectivos | Colores, proporciones, 900/640 px, reduced motion | SHA256 original idéntico; capturas | verificado |
| public/brand/* | Seis imágenes y logos | apps/web/public/brand/* | URLs /brand | Archivos originales exactos, alt/dimensiones/carga | 6 SHA256 exactos; navegador | verificado |
| Reveal/ScrollStatement/menú | Animaciones y efectos | Componentes React existentes | IntersectionObserver/rAF | Transiciones, scroll y limpieza StrictMode | Lint, revisión effects, navegador | verificado |
| apps/api/src/app.ts | API HTTP y validación | Misma ruta | Express, Zod, repositorio | Contratos, errores, salud, rate limits | 13 tests integración | verificado |
| security.ts; config.ts; server.ts | Autenticación y entorno | Misma API; dotenv raíz | bcrypt; cookies; CSRF | Hashes, expiración, revocación, origen local | MySQL y HTTP; arranque real | verificado |
| mysql-repository.ts; repository.ts | Datos/permisos/idempotencia | Mismos módulos | Prisma/MySQL | Aislamiento por dueño/organización, permisos servidor | Tests MySQL y reinicio API real | verificado |
| demo-repository.ts | Fixtures explícitos en memoria | Mismo módulo solo DATA_MODE=demo | API | Opción desarrollo; sin fallback | HTTP demo; MySQL modo normal | verificado |
| packages/shared/src/* | DTO y validaciones compartidas | Misma ubicación | Zod | Una familia de contratos web/API | Unit/typecheck | verificado |
| schema.prisma; 2 migraciones | Modelo relacional | packages/database/prisma | MySQL 8.4/Prisma 7 | Usuarios, sesiones, organizaciones, solicitudes, índices/FKs | Ambas migraciones aplicadas en dos bases nuevas | verificado |
| prisma/seed.ts | Seed antes mezclaba fixtures | seed.ts + seed-catalog.ts; seed-demo.ts explícito | Prisma | Catálogos idempotentes; demo opt-in | Conteos y repetición de seed | verificado |
| .env; conexión DB | Configuración privada | .env raíz ignorado | dotenv; instancia :3307 | MySQL real; configuración externa respetada | SELECT/health sin mostrar secretos | verificado |
| tests/integration/* | Tests API | tests/integration/* actualizados | Vitest/Supertest; MySQL aislado | Auth/CSRF/roles/idempotencia/aislamiento/reinicio | 13/13 aprobados | verificado |
| components/ascenta/*.test.ts | Tests UI lógica/adaptador | src/components/ascenta/*.test.ts | Vitest | DST, borrador, CSRF, notas/contratos | 26/26 aprobados | verificado |
| Tests browser-check y capturas previas | QA navegador | tests/browser; docs/evidence | Edge/CDP, Node built-ins | Rutas, visual, interacciones y errores | Referencia previa y comparación nueva | verificado |
| tests/visual JSON 2026-10-04 | Evidencia de versión distinta | Capturas reales 2026-10-07 y comparación PNG | Node zlib/crypto | Evidencia verificable actual | Manifest valida PNG/dimensiones/hash | verificado |
| Iniciar/Detener-Ascenta.ps1 | Lanzadores | Scripts raíz + scripts/server-processes.ps1 | Node24/pnpm; .local | Rutas con espacios, PID/fecha/comando, readiness, browser | Inicio real; reinicio final en informe | verificado |
| work/tooling externo | Herramientas portátiles | .tools + scripts/Instalar-Herramientas.ps1 | Distribuciones Node/pnpm verificadas | Versiones fijadas; independiente del origen | node --version; pnpm --version; instalación | verificado |
| html-migration/stage y backup | Duplicados de componentes/fuentes | apps/web; API/shared/tests activos | Backup externo + Git | Stage activo idéntico por SHA; copias sustituidas | Inventario y chequeo final estructura | eliminado |
| html-migration/extracted; convert/sync/source scripts | Extracción y sincronización antiguas | Componentes React mantenibles | Ninguna herramienta antigua necesaria | Misma aplicación, sin DOM externo/iframe | Build y test:migration | eliminado |
| runtime/ | PIDs y logs lanzador viejo | .local/servers.json y logs | Scripts finales | Control exclusivo instancias nuevas | Proceso viejo detenido por identidad | eliminado |
| Perfiles bajo browser-check | Sesiones temporales navegador | os.tmpdir y cleanup en CDP | Edge | Pruebas aisladas, sin perfiles en repositorio | Inspección final estructura | eliminado |
| app antiguo/componentes alternativos/shadcn | Árbol no activo de interfaz | Árbol src/components/ascenta | React | Solo UI efectiva local | Auditoría imports; sin consumidores | eliminado |
| next.config; Vinext/SSR/RSC; Sites/Cloudflare adapters | Renderer y hosting anteriores | vite.config.ts; index.html | Vite + plugin-react | SPA local y proxy /api | Build/typecheck; no imports antiguos | eliminado |
| Drizzle/D1/examples/db | Persistencia no activa anterior | Prisma/MySQL en backend | Una sola base/esquema | Ningún acceso DB desde navegador | Inventario/imports/lockfile | eliminado |
| Dependencias UI/framework reemplazadas | Paquetes sin consumidores | package.json y lockfile reducidos | pnpm | Dependencias efectivamente usadas | Install + check-migration | eliminado |
| Docs de adaptación/ejecución anterior | Contexto e informe obsoleto | Esta matriz; MIGRATION_REPORT; README | Evidencias nuevas | Historial en Git/respaldo | Revisión de rutas documentadas | eliminado |

Pendientes de producto preservados: envío de contacto, recuperación de contraseña, edición de perfil, cotizaciones/tarifas, pagos/facturación, disponibilidad, despacho, cancelación y transiciones de estado. No constituyen regresiones de esta migración.
