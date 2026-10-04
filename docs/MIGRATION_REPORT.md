# Migration Report

Fecha de cierre de etapa A: 2026-10-04. Rama local: `migration/react-node-mysql`. Al cerrar esta etapa todavía no se había configurado remoto, hecho push ni desplegado.

## Protección y fuente de verdad

- Estado original preservado en commit `1d2ca8b` y tag `checkpoint/pre-react-node-mysql`.
- El proyecto no era un repositorio Git antes del checkpoint de esta sesión.
- La interfaz aprobada se movió mecánicamente a `apps/web`; no se sustituyeron páginas, estilos, componentes ni activos.
- La comparación visual usa el tag original en un worktree aislado y la migración en la misma sesión Chromium/Playwright. La evidencia y digests de cada PNG están en `tests/visual/validation-2026-10-04.json`.

## Stack anterior y final

**Anterior:** React 19 + TypeScript, rutas Next-style sobre Vinext/Vite, Tailwind/Shadcn; ocho rutas navegables, datos demo hard-coded, sin API, autenticación o base transaccional real. Había puntos heredados Drizzle/D1 sin uso operativo.

**Final:** monorepo pnpm con el mismo frontend en `apps/web`, API Express 5/TypeScript en `apps/api`, contratos Zod en `packages/shared`, Prisma 7 + MySQL 8.4 en `packages/database`, migración SQL, seed ficticio, Compose y CI. Node 24 LTS y pnpm 11 están fijados.

## Conservado y modificado

- Conservado íntegramente: Home, Services, Fleet, layout, navegación, footer, booking visual, dashboards, Usage Matrix, UI primitives, CSS, motion, breakpoints e imágenes aprobadas. La única variación de copy visible está documentada en Login.
- Modificado con alcance funcional: Sign in, Booking Review/submit y guards de portales.
- Añadido: API `/api/v1`, sesión/CSRF/RBAC, repositorios MySQL/demo, esquema/migración/seed, Compose, OpenAPI, pruebas, documentación y workflow CI.
- Aislado pero no borrado: código Drizzle/D1 heredado dentro de `apps/web`; Prisma/MySQL es la persistencia activa.

## Implementación real

- Login con bcrypt, token de sesión aleatorio, hash persistido, expiración, revocación, cookies y CSRF.
- Permisos customer/corporate/admin; propiedad de reservas y membresía organizacional comprobadas en servidor.
- Catálogo, listado y creación de reserva. La clave idempotente evita duplicados, incluso ante carrera de inserción.
- MySQL modela usuarios, sesiones, organizaciones, membresías, catálogo, reservas/segmentos, rate plans/rules, quotes exactas y audit logs.
- No se inventaron tarifas, availability, fees, cancellation, pagos ni dispatch.

## Verificación ejecutada

| Verificación | Resultado real |
| --- | --- |
| `pnpm install` | correcto; lockfile actualizado |
| `pnpm db:validate` / `db:generate` | correcto; schema válido y cliente generado |
| `pnpm typecheck` | correcto en web, API, shared y database |
| `pnpm lint` | correcto |
| `pnpm test` | 2 pruebas de contrato pasan; paquetes sin unit tests adicionales salen explícitamente sin tests |
| MySQL 8.4.11 real | migración SQL y seed correctos; 3 usuarios, 3 clases y 2 reservas persistieron tras reiniciar el servicio |
| `pnpm test:e2e` | 5 pruebas pasan, incluida integración real con MySQL mediante `TEST_DATABASE_URL` |
| `pnpm build` | correcto; API compilada y las 8 rutas web generadas |
| API compilada | arranque local y `/health` 200 verificados en modo demo explícito |
| `pnpm audit --prod` | sin vulnerabilidades conocidas tras actualizar Next/rate-limit y transitivos parcheados |
| Browser local | login corporate y creación de reserva completados; 8 rutas sin overflow en 390×844, 768×1024, 1024×768, 1440×900 y 1920×1080 |
| Consola browser | sin errores/warnings capturados |
| Comparación visual | Home, Services y Fleet coinciden byte por byte en 5 viewports; Booking y los 3 portales coinciden en móvil/escritorio; Login conserva composición con diferencia funcional documentada |
| `pnpm test:visual` | manifiesto, tag original y evidencia de comparación validados |

## Diferencias pendientes no bloqueantes

1. Login difiere de la referencia solo donde la integración lo exige: credenciales ficticias visibles, estados reales y copy veraz de autenticación. La composición responsive fue revisada en 390×844 y 1440×900.
2. Create Account/Reset, dashboards analíticos, invoices, saved locations y Usage Matrix continúan como demo identificado.
3. Auth en memoria es solo `DATA_MODE=demo`; producción/local integrado usa MySQL y nunca hace fallback automático.
4. Las fotos Pexels, flota, servicios y copy provisional conservan su estado previo de confirmación/licencia.
5. Audit log está modelado pero su escritura exhaustiva, MFA/admin y rate limiting distribuido son pendientes de production hardening.

## Dependencias externas

No se conectaron ni contrataron servicios. Pagos, mapas/geocoding, flight tracking, dispatch/CRM, email, SMS y analytics permanecen sin proveedor. No se enviaron mensajes, cobros o reservas operativas.

## Recuperación

El código original puede inspeccionarse de forma no destructiva con `git show checkpoint/pre-react-node-mysql:<ruta>` o recuperarse creando una nueva rama desde ese tag. No use `reset --hard`. MySQL local vive en el volumen `ascenta_mysql_data`; el código no incluye ni borra backups de datos.

## Estado de entrega

La migración, estructura, persistencia MySQL real y validación visual contra el tag original están comprobadas. **ETAPA A VALIDADA. LISTO PARA REVISIÓN ANTES DE GITHUB.** La publicación no autoriza merge ni despliegue.
