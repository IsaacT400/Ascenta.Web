# Ascenta Executive

Migración local del proyecto aprobado de **Ascenta Executive · Private Chauffeur Service** a un monorepo React + Node.js + MySQL. La interfaz, navegación, copy, responsive y motion existentes se conservan; la nueva API añade sesiones, permisos y solicitudes de reserva reales sin inventar precios, disponibilidad ni condiciones comerciales.

## Stack fijado

- Node.js 24 LTS, pnpm 11 y TypeScript 5.9.
- Frontend React 19 con rutas Next-style, Vinext/Vite y Tailwind CSS 4.
- API Express 5 bajo `/api/v1`.
- MySQL 8.4 LTS y Prisma 7.
- Vitest/Supertest para contratos e integración.

## Estructura

```text
apps/web/              interfaz React conservada
apps/api/              API Node/Express
packages/shared/       contratos Zod y tipos públicos
packages/database/     esquema, cliente, migraciones y seed Prisma
tests/integration/     flujos HTTP demo y MySQL
tests/visual/          referencia y evidencia de regresión visual
docs/                  inventario, matriz, API, datos y reporte
```

## Ejecución local

Requisitos: Node 24, pnpm 11 y Docker compatible con Compose, o un servidor MySQL 8.4 accesible.

```bash
cp .env.example .env
pnpm install --frozen-lockfile
docker compose up -d mysql
pnpm db:migrate:deploy
pnpm db:seed
pnpm dev
```

- Web: `http://localhost:5173`
- API: `http://localhost:4000/api/v1`
- Salud: `http://localhost:4000/api/v1/health`

Sin Docker, cree una base MySQL 8.4, copie las variables `DATABASE_*`/`DATABASE_URL` de `.env.example`, y ejecute las mismas migraciones y seed. El volumen `ascenta_mysql_data` preserva los datos entre reinicios de Compose.

Para revisar solo la interfaz y API con memoria efímera claramente identificada, use `DATA_MODE=demo`. Este modo no es una sustitución de MySQL, no se activa automáticamente ante errores y solo se admite para pruebas o evaluación local.

## Cuentas ficticias de desarrollo

El seed crea `demo.customer@ascenta.local`, `demo.corporate@ascenta.local` y `demo.admin@ascenta.local`, todas con la contraseña local `AscentaDemo!2026`. El seed se bloquea cuando `NODE_ENV=production`.

## Comandos del proyecto

```bash
pnpm dev
pnpm build
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e
pnpm test:visual
pnpm db:validate
pnpm db:generate
pnpm db:migrate
pnpm db:migrate:deploy
pnpm db:seed
```

`db:migrate` crea migraciones durante desarrollo; `db:migrate:deploy` aplica únicamente migraciones versionadas. Nunca ejecute el seed ficticio contra producción.

## Estado funcional

- Sign-in real con contraseña bcrypt, cookie HttpOnly, expiración/revocación y CSRF.
- Catálogo público desde API.
- Creación y listado de reservas con idempotencia y aislamiento por usuario/organización.
- Portales con comprobación de sesión/rol; su contenido analítico continúa identificado como `DEMO DATA` hasta tener fuentes operativas.
- Create Account, Reset, facturación, pagos, disponibilidad, tarifas, dispatch, mapas y tracking de vuelos siguen pendientes: no se simulan como operaciones terminadas.
- Fotografías Pexels y datos de flota/servicios siguen provisionales según la aprobación visual previa.

## Documentación

- [Inventario](./docs/PROJECT_INVENTORY.md)
- [Matriz de migración](./docs/MIGRATION_MATRIX.md)
- [Arquitectura](./ARCHITECTURE.md)
- [API y OpenAPI](./docs/API.md)
- [Modelo de datos](./docs/DATABASE_MODEL.md)
- [Reporte de migración](./docs/MIGRATION_REPORT.md)
- [Sistema visual](./DESIGN_SYSTEM.md)
- [Decisiones](./DECISIONS.md)

No hay despliegue ni acceso al repositorio remoto. La publicación a GitHub se reserva para la instrucción explícita `PUBLICAR EN GITHUB`.
