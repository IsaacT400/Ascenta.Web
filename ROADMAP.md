# Roadmap

## Estado actual — Fase visual local

Completado:

- foundation TypeScript y sistema visual;
- navegación desktop/mobile;
- homepage, services y fleet;
- booking interactivo de cuatro pasos;
- login conceptual;
- dashboards individual/corporativo;
- Usage Matrix visual y exportación CSV demo;
- documentación base y QA responsive local.

En revisión:

- Home Phase 3 con paleta Ascenta Blue, composición editorial y fotografía inmersiva;
- Journey Flow narrativo, rail horizontal de servicios y carrusel de flota;
- sistema de motion con alternativa `prefers-reduced-motion`;
- modo prototipo configurable y avisos discretos.

La dirección se mantiene intencionalmente limitada a Home hasta recibir aprobación. Tras validarla, se propagará de forma sistemática a Services, Fleet, Booking y portales.

## Próximo hito — Discovery operacional confirmada

Antes de introducir lógica real:

1. confirmar identidad, mercados, aeropuertos, servicios y fleet;
2. definir instant booking vs request a quote/manual approval;
3. documentar pricing, tolls, airport fees, gratuity, waiting y cancellations;
4. confirmar dispatch/CRM/contabilidad existentes;
5. definir roles, aprobaciones, facturación y reportes corporativos;
6. aprobar proveedor/estrategia de auth y datos.

## Fase 2 — Dominio y datos

- Modelo relacional, migraciones y seed data ficticia.
- Catálogos configurables: services, markets, airports, vehicle classes y statuses.
- Reservation aggregate con segmentos, viajeros, stops, referencias y requisitos.
- Validación compartida, logging y manejo de errores.
- Tests unitarios del dominio y tests de integración de datos.

## Fase 3 — Reservación funcional

- Address autocomplete y validación de áreas mediante adaptadores.
- Quote vs instant booking por service/market.
- Disponibilidad, vehicle selection y pricing confirmado.
- Drafts, loading/empty/error states y confirmación.
- Flights/FBO, multi-stop, round trip, hourly, groups y accessibility requests.

## Fase 4 — Cuentas y seguridad

- Auth real, verificación/reset y sesiones seguras.
- RBAC/ABAC de servidor, MFA-capable admin y audit logs.
- Perfiles, saved locations, travelers, preferencias y notificaciones.
- Protección y pruebas contra acceso horizontal/vertical indebido.

## Fase 5 — Corporate + Usage Matrix

- Organizations, departments, cost centers, references y policies.
- Book for others, approval flows y centralized billing.
- Filtros/exports autorizados por rol.
- Definiciones financieras aprobadas y reconciliación con invoices.

## Fase 6 — Operaciones, billing e integraciones

- Admin, reservations, dispatch, fleet y chauffeur workflows.
- Payment provider tokenizado; invoices, refunds y corporate billing.
- Email/SMS, dispatch/CRM/accounting y flight tracking mediante adaptadores.
- Idempotencia, retries, webhooks verificados y observabilidad.

## Fase 7 — Readiness de producción

- Contenido definitivo, fotografía, legal y SEO/local markets.
- WCAG 2.2 AA audit, performance budgets y browser/device QA.
- Threat modeling, penetration testing, backups y disaster recovery.
- Selección de hosting, staging, CI/CD, monitoring y plan de rollback.
- Solo entonces: deployment y cambios DNS aprobados.

## Fuera de alcance actual

Deployment público, DNS, pagos, APIs pagadas, datos reales, reglas financieras, disponibilidad real, legal/policies definitivas y promesas de servicio no confirmadas.
