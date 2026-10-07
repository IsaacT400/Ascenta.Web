# Informe de migración — 2026-10-07

## Resultado

Proyecto único en `C:\Users\isaac\OneDrive\Desktop\Ascenta`, rama `refactor/ascenta-react-node-mysql`.

- Frontend: React 19.2.6, Vite 8.0.13 y React Router 7.18.4.
- Backend: Node 24.21.0, Express 5.2.1 y TypeScript.
- Persistencia normal: MySQL Community 8.4.9 mediante Prisma 7.10.0.
- Gestor conservado: pnpm 11.19.0.
- Web: http://localhost:5175/; API: http://localhost:4000/api/v1.
- Inicio: `.\Iniciar-Ascenta.ps1`; parada: `.\Detener-Ascenta.ps1`. Para apagar también MySQL dedicado: `-IncluirBaseDeDatos`.

La aplicación se entrega iniciada en modo MySQL y se abre su ventana local. No hubo push, merge ni despliegue remoto.

## Fuente y recuperación

La carpeta inicial era un lanzador, sin Git propio. Se identificó la aplicación real en `Ascenta.Web`, rama `feature/ascenta-integracion-v1`, commit `0e3177e`, con cambios locales y componentes/assets sin seguimiento. Los scripts y procesos confirmaron que esa aplicación servía el puerto 5175.

Se importó su historial local y se conservaron las fuentes actuales en el commit `f1cacb3`, rama `recovery/local-reference`, antes de modificarlas. Se guardó un respaldo externo en:

`C:\Users\isaac\OneDrive\Desktop\Ascenta-recovery-20261007-145218`

El respaldo contiene fuentes, herramientas/evidencias de la adaptación y un bundle Git; excluye perfiles del navegador del snapshot. Tras verificar la nueva estructura, la carpeta de trabajo anterior se retiró a `original-worktree` dentro de ese respaldo externo, conservando su estado local completo. No existe una segunda aplicación antigua dentro del proyecto final. Las credenciales nuevas, datos MySQL, herramientas y perfiles de pruebas no se incluyen en commits.

El inventario [source-inventory.json](source-inventory.json) registra 214 archivos originales con tamaño, SHA256, destino y disposición. [MIGRATION_MATRIX.md](MIGRATION_MATRIX.md) detalla responsabilidades, dependencias, comportamiento y verificación.

## Funciones conservadas

Las 15 rutas existentes, más la página 404: Home, servicios, flota, empresas, booking, login, dashboard, cuenta, corporate, corporate/usage, administración, contacto, ayuda, privacidad y términos.

Se conservan enlaces y menús, foco/Escape, navegación atrás/adelante, anclas y scroll, imágenes originales, tipografía efectiva Georgia/Arial, overlays, navbar por fondo, selector One way/By the hour, formularios, validación, notificaciones, animaciones, reduced motion, responsive, EN/ES y preferencias.

El borrador de 30 minutos sigue en sessionStorage y atraviesa autenticación/recarga. Registro y verificación local, login/logout, solicitud idempotente, portal del propietario, portal corporativo con CSV y administración de lectura mantienen los contratos v1. Hashes de contraseñas/sesiones, CSRF, expiración, revocación, roles y aislamiento se verifican en servidor.

Se preserva explícitamente el estado pendiente de contacto, recuperación de contraseña, edición de perfil, tarifas/cotización, disponibilidad, pagos/facturación, despacho, cancelación y cambios operativos. El registro local no envía correo externo; en producción se mantiene bloqueado sin proveedor de verificación. La migración no presenta estas capacidades como implementadas.

## Eliminaciones completadas

- `html-migration/`: stage, backup, extracted, HTML/JS fuente de conversión, scripts convert/sync y logs.
- `runtime/`: registro y logs del lanzador anterior; los procesos finales usan `.local/`.
- `browser-check/`: scripts útiles sustituidos por tests/browser y evidencias en docs/evidence; perfiles eliminados. Los nuevos perfiles se crean fuera del proyecto y se limpian.
- `apps/web/app/` y árbol anterior de componentes: fuentes activas trasladadas a src; componentes alternativos/inactivos y shadcn sin consumidores eliminados.
- Configuración/renderer Next/Vinext/RSC, scripts/adaptadores de Sites/Cloudflare, Drizzle/D1, ejemplos, tipos y estilos no activos.
- Dependencias y lockfile de esas implementaciones: Next, Vinext, Wrangler, paquetes Cloudflare/RSC, Drizzle, Tailwind y UI sin consumidores.
- Informes anteriores de docs/ascenta y validación visual declarativa de otra versión, sustituidos por evidencia actual.

Los seis archivos /brand y el CSS activo conservan SHA256 exacto. No se usaron iframe, dangerouslySetInnerHTML ni reconstrucción externa de la aplicación. La pequeña creación de un enlace DOM para descargar CSV permanece como efecto del botón, no como renderer.

## Verificaciones ejecutadas

| Verificación | Resultado real |
| --- | --- |
| Instalación pnpm con lockfile después de retirar la estructura antigua | Aprobada |
| Build paquetes, API y frontend final | Aprobado |
| Typecheck de los cuatro paquetes | Aprobado |
| Lint | Aprobado |
| Unitarias shared/web | 28/28: 2 shared y 26 web |
| Integración API | 13/13, sin omitidas: 9 HTTP demo y 4 MySQL |
| Prisma generate y validate | Aprobados |
| Migraciones versionadas | 2/2 en ascenta_local y ascenta_test |
| Seed normal idempotente | 5 servicios y 3 vehículos; no introduce cuentas demo |
| Recorrido navegador MySQL | 40 capturas; 15 rutas desktop/móvil, 10 interacciones aprobadas; una comprobación con cuenta preexistente omitida explícitamente y sustituida por el flujo de alta real |
| Registro/verificación/login/viaje/portal/logout reales en navegador | 19/19, contra MySQL |
| Portales corporativo/admin, filtros, CSV y responsive | 16/16, en modo demo explícito; permisos reales MySQL probados por integración |
| Navegación anclas/atrás/adelante y 404 con recarga | Aprobada |
| Comparación visual en condiciones equivalentes | 21/21, 19 capturas idénticas, sin máscaras |
| Inicio, detección de instancia, parada y reinicio con scripts finales | Aprobados |
| Rechazo de cambio silencioso de modo y conservación del entorno de consola | Aprobados |
| Limpieza/imports/dependencias/destinos/secretos públicos | test:migration aprobado |

El build avisa que el bundle JavaScript principal supera 500 kB: 660.71 kB minificado, 186.76 kB gzip. Es un aviso de optimización, no un error de compilación.

Evidencias:

- [Referencia anterior](evidence/reference/report.json) y [capturas normales MySQL](evidence/current/report.json).
- [Comparación PNG](evidence/comparison.json): 20 capturas públicas desktop/móvil más footer; las otras dos diferencias tienen error medio menor de 0.002 niveles RGB y ningún píxel supera la tolerancia de canal.
- [Flujo MySQL real](evidence/user-flow/report.json), [portales](evidence/portals/report.json), [navegación](evidence/navigation/report.json).
- [API/MySQL e inventario](evidence/backend-verification.json) y [persistencia tras reinicio](evidence/restart.json).
- [Estado final](evidence/final-runtime.json): HTTP 200, API/proxy en MySQL, procesos de la raíz nueva y ventana Edge de ASCENTA abierta.

La comparación visual usa el MISMO frontend migrado con demo seleccionado explícitamente, igual que la referencia anterior. No usa copias del código antiguo ni máscaras. Se conservan por separado las capturas normales MySQL: allí desaparecen los avisos demo según la lógica original. Tras la prueba se restaura MySQL como modo normal.

Se corrigieron las regresiones detectadas: posición del scroll al volver a anclas y orden del catálogo entre demo/MySQL. También se corrigió un problema del entorno de pruebas: la suite ahora fuerza NODE_ENV=test y comprueba la base real antes de escribir, incluso si la consola proviene de desarrollo. Los únicos fixtures de la ejecución fallida se identificaron por UUID y eliminaron de la base de pruebas.

## MySQL y persistencia

La instancia preexistente en 3306 no se modificó. Una instancia dedicada de los binarios instalados escucha en `127.0.0.1:3307`, con datadir persistente `.local/mysql`. Las credenciales aleatorias permanecen únicamente en archivos locales ignorados.

No se borraron/recrearon bases existentes ni se añadió una familia paralela de tablas. Se reutilizó el esquema y sus dos migraciones. La base normal `ascenta_local` conserva una cuenta y una solicitud identificadas como fixture de navegador; `ascenta_test` quedó sin usuarios/reservas de la suite y mantiene su catálogo.

La solicitud `ASC-ADD3E00969124EA9`, creada desde el navegador, mantiene el mismo hash del registro y su propietario antes y después de detener y reiniciar web, API y MySQL con los scripts finales. Además, la suite aislada comprueba que una sesión existente sigue autenticada y ve la misma reserva tras reiniciar un proceso API real.

La API demo anterior tenía cero solicitudes cuando se auditó. No había archivos transaccionales que importar. No se afirma haber exportado cuentas volátiles de memoria, ya que la API antigua no ofrecía ese inventario; sus fixtures se conservan en el modo demo explícito.

## Estado de entrega

Sin bloqueos de migración. Las capacidades de producto pendientes enumeradas arriba permanecen pendientes. El proyecto final arranca exclusivamente desde su estructura nueva y conserva recuperación externa/Git sin depender de ella.
