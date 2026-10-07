# ASCENTA

Aplicación local única: React 19 + Vite 8 + React Router, API Node.js 24/Express 5 y MySQL 8.4 con Prisma 7. Se conserva la interfaz local de referencia, sus imágenes, estilos, idiomas y flujos implementados.

## Inicio en Windows

Desde esta carpeta:

```powershell
.\Iniciar-Ascenta.ps1
.\Detener-Ascenta.ps1
```

El inicio espera a web y API, abre http://localhost:5175/ y detecta instancias existentes. La API está en http://localhost:4000/api/v1 y su salud en /api/v1/health. Los procesos se identifican por PID, fecha de creación, ejecutable y archivo de entrada; los scripts no detienen otras aplicaciones.

Node 24 y pnpm 11.19.0 están disponibles en herramientas locales ignoradas por Git. Para preparar un clon nuevo sin esas herramientas:

```powershell
.\scripts\Instalar-Herramientas.ps1
. .\scripts\toolchain.ps1
Invoke-AscentaPnpm install --frozen-lockfile
.\Iniciar-Ascenta.ps1
```

También se admiten Node 24 y pnpm 11.19.0 instalados en PATH. Las rutas se resuelven desde los scripts; admiten espacios. No hace falta usar la carpeta de la aplicación anterior.

## MySQL real

El inicio normal usa MySQL; no existe fallback automático a demo. En este equipo se utilizan los binarios de MySQL 8.4 instalados en Program Files para una instancia dedicada en 127.0.0.1:3307. No se modifica el servicio preexistente en 3306.

- Datos persistentes: `.local/mysql`.
- Base de la aplicación: `ascenta_local`.
- Base aislada para pruebas: `ascenta_test`.
- Credenciales aleatorias locales: `.env` y `.local/mysql-credentials.json`, ignorados por Git.
- `scripts/db-start.ps1` solo inicializa un directorio nuevo; no recrea datos existentes.
- El seed normal instala únicamente catálogos. Las cuentas y reservas demo requieren `pnpm db:seed:demo` explícito.
- `.\Detener-Ascenta.ps1 -IncluirBaseDeDatos` también apaga esta instancia, conservando los datos.

En otro equipo instala MySQL Community 8.4 o indica su directorio bin con `ASCENTA_MYSQL_BIN`. Para una base externa, configura `DATABASE_URL` en `.env`; el script respeta ese destino. Revisa el host y nombre de base antes de aplicar migraciones. Como alternativa, `docker compose up -d mysql` usa un volumen persistente; ajusta la conexión según `.env.example`. No borres el volumen para reiniciar.

`.\Iniciar-Ascenta.ps1 -Demo` activa de forma explícita la API en memoria. Sus cuentas ficticias no pertenecen a la base MySQL normal.

## Comandos

Con Node/pnpm en PATH, utiliza `pnpm`; con herramientas locales, carga `. .\scripts\toolchain.ps1` y sustituye `pnpm` por `Invoke-AscentaPnpm`.

| Comando | Función |
| --- | --- |
| `pnpm install --frozen-lockfile` | Instalación reproducible |
| `pnpm dev` | API y Vite; requiere conexión configurada y migrada |
| `pnpm build` | Paquetes, API compilada y frontend estático |
| `pnpm typecheck` | Tipos de todos los paquetes |
| `pnpm lint` | Reglas de código |
| `pnpm test` | Pruebas unitarias |
| `pnpm test:e2e` | API HTTP y MySQL aislado, incluyendo reinicio |
| `pnpm test:browser` | Captura rutas e interacciones de la instancia activa con Edge |
| `pnpm test:browser:flow` | Registro/verificación/viaje real contra MySQL local |
| `pnpm test:visual` | Compara PNG guardados en el mismo modo de datos que la referencia |
| `pnpm test:migration` | Comprueba limpieza, 214 destinos, assets exactos y secretos fuera de web |
| `pnpm db:generate` | Cliente Prisma |
| `pnpm db:validate` | Esquema Prisma |
| `pnpm db:migrate:deploy` | Aplica migraciones SQL versionadas |
| `pnpm db:seed` | Catálogos idempotentes |

El frontend de producción está en `apps/web/dist`; su servidor debe devolver `index.html` para rutas del cliente. `pnpm --filter @ascenta/web start` ofrece una previsualización local con fallback SPA. La API compilada se inicia con `pnpm --filter @ascenta/api start`. Esta tarea no despliega nada.

La comparación visual usa capturas de la referencia y de la nueva aplicación en modo demo explícito para comparar los mismos avisos y contenido. Las capturas normales MySQL y su flujo real se conservan por separado. `test:visual` verifica esas evidencias guardadas; para generar capturas nuevas consulta [las instrucciones de navegador](tests/visual/README.md).

## Estructura

```text
apps/web/src/              páginas, router, componentes, contexto y estilos
apps/web/public/brand/     seis assets originales
apps/api/src/              Express, autenticación y repositorios
packages/shared/          contratos y validaciones Zod
packages/database/prisma/ esquema y migraciones MySQL
scripts/                  herramientas y control local de procesos
tests/                    unitarias, integración y navegador
docs/                     matriz, contratos y evidencias
```

Solo las variables `VITE_*` públicas llegan al navegador. Las credenciales MySQL permanecen en el backend. Sesiones HttpOnly, CSRF, expiración, roles, aislamiento por usuario/organización e idempotencia se aplican en la API.

Registro, verificación local, login/logout, borrador de viaje, solicitud persistida, portal personal, corporativo y administración de lectura están implementados. En desarrollo, la verificación muestra un enlace local y no envía correo externo. Contacto, recuperación de contraseña, edición de perfil, cotización, pago, despacho y cambios operativos continúan pendientes; la interfaz no simula éxito.

Consulta [la matriz](docs/MIGRATION_MATRIX.md), [el informe de verificación](docs/MIGRATION_REPORT.md), [el contrato API](docs/API.md) y [el esquema de datos](docs/DATABASE_MODEL.md).
