# Architecture

## Resultado de la migración

Ascenta es un monorepo pnpm con separación estricta entre presentación, contratos públicos, API y persistencia. El frontend aprobado permanece en React 19/Vinext para conservar SSR/prerender, metadatos, rutas y comportamiento visual. La API Node.js/Express no comparte credenciales ni cliente Prisma con el navegador.

```text
Browser
  └─ apps/web (React/Vinext)
       └─ HTTPS + cookie/CSRF → apps/api (/api/v1)
                                  ├─ repository interface
                                  ├─ MySqlRepository → packages/database → MySQL 8.4
                                  └─ DemoRepository (solo pruebas/revisión explícita)

packages/shared → esquemas Zod y DTO públicos consumidos por web/API
```

## Fronteras

- `apps/web`: páginas públicas, wizard, login y portales. Solo conoce `NEXT_PUBLIC_API_BASE_URL`.
- `apps/api`: validación, sesiones, autorización, CORS, rate limits, errores y orquestación HTTP.
- `packages/shared`: entradas/contratos serializables; no importa infraestructura privada.
- `packages/database`: Prisma, adaptador MySQL, migraciones y seed ficticio.
- `tests`: contratos, API e integración MySQL; visual conserva el checkpoint original como referencia recuperable.

## Seguridad

El login regenera un token opaco aleatorio por sesión y solo guarda su SHA-256 en base. La contraseña usa bcrypt. La cookie de sesión es HttpOnly, SameSite=Strict y Secure en producción; las mutaciones requieren un token CSRF independiente, conservado en una cookie legible y validado contra su hash de sesión. CORS acepta únicamente `WEB_ORIGIN`; Helmet, límite JSON y rate limit de login están activos. Los repositorios validan propiedad y membresía corporativa en servidor.

`DATA_MODE=mysql` es el valor por defecto. `DATA_MODE=demo` debe elegirse explícitamente y jamás funciona como fallback silencioso.

## Persistencia y tiempo

- Identificadores UUID y claves foráneas explícitas.
- Una reservación conserva `scheduled_at_utc` y la zona IANA original por separado.
- Reintentos usan `idempotency_key` única.
- Dinero previsto en `quotes` usa unidades menores enteras (`BigInt`), moneda ISO y margen en basis points; no hay aritmética flotante.
- Reglas de pricing son versionadas y fechadas, pero permanecen vacías hasta aprobación comercial.
- `audit_logs` está modelado; el cableado completo de auditoría es pendiente explícito.

## Rutas y autorización

Las rutas existentes se preservan. `/dashboard` y `/corporate` ejecutan un guard de sesión en el cliente; sus listas vienen de `/api/v1/reservations`. La recepción de operaciones está en `/admin` y su API exige `ASCENTA_ADMIN`. El guard del cliente mejora la experiencia; la API valida autenticación, rol y membresía.

## Identidad, verificación y compatibilidad

`POST /api/v1/auth/register` crea solo una cuenta CUSTOMER sin verificar. `POST /api/v1/auth/verify-email` consume un token hash de un solo uso con 30 minutos de vigencia. En `development` el token se muestra localmente para pruebas; no se envía correo. Producción falla cerrada hasta configurar entrega. No existe v2 ni una segunda familia de cookies o usuarios.

## Operaciones externas pendientes

No hay adaptadores activos de pagos, mapas/geocoding, flight tracking, dispatch, CRM, email o SMS. No se realizan cobros, mensajes, reservas operativas ni cambios en producción. Su selección requiere discovery y credenciales seguras posteriores.
