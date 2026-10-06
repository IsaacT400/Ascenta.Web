# Database Model

MySQL 8.4 LTS con Prisma 7. El esquema fuente está en `packages/database/prisma/schema.prisma`; las migraciones SQL versionadas son la única vía de despliegue.

## Relaciones

- `users` 1—N `sessions`, `reservations`, `memberships`, `audit_logs`; an account may have one `email_verification_tokens` row.
- `organizations` N—N `users` mediante `memberships`; 1—N `reservations` y `rate_plans`.
- `reservations` pertenece a creador, service type y vehicle class; puede pertenecer a organization y tener segmentos/quotes.
- `rate_plans` contiene `pricing_rules` versionadas y puede ser público/corporativo/contractual.
- `quotes` guarda snapshot reproducible, moneda, venta/costo en unidades menores y margen en basis points.

## Integridad

Email, token hash, reference, idempotency key y códigos de catálogo son únicos. Las relaciones principales tienen FKs e índices para usuario/organización/fecha. Las sesiones caducan y pueden revocarse. La API comprueba membresía antes de aceptar `organizationId`.

`scheduled_at_utc` guarda el instante; `scheduled_time_zone` conserva la zona IANA que dio significado a la hora local. La cobertura específica de cambios DST queda pendiente de una librería/regla operativa aprobada.

La migración aditiva conserva los usuarios existentes como verificados, agrega verificación de alta y los datos opcionales de pasajero/duración. `destination_address` solo es nullable para solicitudes `HOURLY`, donde se requiere `duration_hours`; no se deriva una tarifa o mínimo comercial. Las solicitudes nuevas guardan `request_hash` con su clave idempotente. Las filas anteriores conservan hash vacío y su comportamiento v1 previo.

## Seed y recuperación

El seed es reproducible, usa solo personas/organizaciones ficticias y se niega a correr en `NODE_ENV=production`. Antes de migrar datos existentes futuros se requerirán backup, mapeo, conteos, checksums/integridad y rollback; hoy no existe un dataset real accesible que migrar.

Compose usa un volumen persistente. Para recuperar el código previo a esta migración: `git switch --detach checkpoint/pre-react-node-mysql` o cree una rama desde ese tag. Esto no modifica ni elimina la base local actual.
