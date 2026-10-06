# ASCENTA WEB - estado de ejecucion

Actualizado: 2026-10-06

## Base y proteccion

- Repositorio original `IsaacT400/Ascenta.Web`; base local/remota `migration/react-node-mysql` en `f4f8b48d54972b26bbb4861c5e31e1ce2afbda9f`.
- Rama `feature/ascenta-integracion-v1`; commits locales: `8b37355` (implementacion) y el commit de estado que sigue a este archivo.
- No habia commits posteriores en la base. `main` no se uso.
- Antes de editar: cambio local en `apps/web/components/booking-panel.tsx` y DOCX maestro no rastreado. El ajuste de booking se reconcilio; el DOCX se mantiene sin seguimiento y excluido.
- No se encontro `AGENTS.md` aplicable. Se encontro/extrajo `01_ASCENTA_SCRIPT_MAESTRO_CODEX_v2.docx` a `work/` para lectura. El paquete secundario no estaba completo: no se encontraron Markdown operativo, documentos de `02_REFERENCIAS`, `03_IMAGENES`, `04_CODIGO_REFERENCIA` ni Site local; esas fuentes no se publicaron ni se declaran revisadas.
- El logo extraido del maestro coincide con el SHA-256 indicado para el original aprobado.

## Decisiones y alcance A-H

- A: base, HEAD, rama, cambios locales y aislamiento revisados.
- B-C: logo original, descriptor `EXECUTIVE TRANSPORTATION`, paleta `#001030`, `#3270BF`, `#92BEF2`, `#C6DEFC`, metadatos y viewport; Home y rutas publicas integradas a React/Vinext/Vite, sin app/HTML/runtime paralelo.
- D: borrador versionado de 30 min, Home -> booking, modos condicionales, catalogo API, pasajero, idempotencia y POST v1.
- E: alta y verificacion local de un solo uso, login y retorno seguro al borrador con la familia de usuarios/sesiones v1. No hay API v2 ni email externo; el alta de produccion queda deshabilitada sin proveedor.
- F: portal de cliente y cola `/admin` comparten solicitud/referencia; permisos de administrador validados en Express. Demo es memoria de proceso; MySQL cuenta con migracion aditiva.
- G: portal de empresa muestra solo solicitudes autorizadas; no afirma metricas, pagos, tarifas, cobertura, proveedores o capacidades no verificadas.
- H: validaciones nativas ejecutadas; MySQL aislado no disponible. El hero conserva fondo marino y foto temporal externa con sustitucion/licencia pendientes.

## Verificacion nueva

Runtime: Node `v24.21.0`, pnpm `11.19.0` desde `work/tooling`.

- `pnpm lint`: paso limpio despues del ajuste final.
- `pnpm typecheck`: paso en database, shared, API y web despues de cambios de viewport.
- `pnpm test`: shared 2/2; api y web no tienen suites unitarias.
- `pnpm test:e2e`: 7 aprobadas, 1 omitida (integracion MySQL sin `TEST_DATABASE_URL` aislada).
- `pnpm db:validate`: esquema Prisma valido.
- `pnpm build`: build completo API + Vinext/Vite del workspace, con rutas `/`, `/admin`, `/booking`, `/business`, `/corporate`, `/corporate/usage`, `/dashboard`, `/fleet`, `/login`, `/services`.
- Pruebas HTTP verifican alta/verificacion local, misma referencia en portal/operaciones e idempotencia/conflicto. El codigo UI conecta Home, booking, login, portal y cola. No hubo automatizacion E2E de navegador que complete el recorrido visible.
- Capturas nuevas inspeccionadas: `work/evidence/home-desktop.png`, `work/evidence/login-desktop.png`. Capturas headless de 390px no emulan bien el viewport Edge disponible; no contarlas como comprobacion movil. Las capturas se quedan locales/ignoradas y no entran al repo.
- No se ejecuto migracion: faltan `DATABASE_URL`/`TEST_DATABASE_URL` aisladas y Docker. No apuntar a `ascenta_dev`.

## Publicacion y reanudacion

- GitHub autentica como `IsaacT400`, permiso repo `push=true`; base remota confirmada en SHA auditado. La rama feature se publicara con push ordinario y se releera su SHA remoto.
- `.env`, DOCX y `work/evidence` excluidos de commits. `.env.example` es plantilla.
- Comandos locales tras checkout e instalacion: `$env:DATA_MODE='demo'`; `pnpm dev`; web `http://localhost:5173`, API `http://localhost:4000/api/v1`. En demo la solicitud desaparece al reiniciar el proceso; MySQL requiere configurar una base aislada y aplicar migracion.
- Sin merge en `main`, sin force-push y sin despliegue comercial.
