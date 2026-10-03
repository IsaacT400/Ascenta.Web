# Architecture

## Estado actual

El prototipo es una aplicación TypeScript basada en React 19, rutas estilo Next.js y Vinext/Vite. Se ejecuta de forma local en perfil portable. Tailwind CSS define el sistema visual y los componentes accesibles provienen de la biblioteca UI incluida con el starter.

```text
app/                     Rutas y composición de páginas
components/              Componentes de producto reutilizables
components/ui/           Primitivos de interfaz vendorizados
public/                  Activos estáticos locales
db/                      Punto de extensión; sin modelo transaccional activo
scripts/                 Herramientas de ejecución/build del starter
```

## Capas

- **Presentation:** páginas y componentes responsivos.
- **UI primitives:** botones, inputs, tabs, selects, tables y sidebar.
- **Demo configuration/data:** arreglos claramente marcados en componentes durante la fase visual. Deben migrar a seeds/fuentes tipadas antes de persistencia.
- **Future domain:** reservas, usuarios, organizaciones, viajeros, roles, invoices y demás entidades se introducirán como una capa independiente.
- **Future integrations:** mapas, flight tracking, pagos, dispatch, CRM, email y SMS deberán pasar por adaptadores internos, nunca consumirse directamente desde páginas.

## Ruteo implementado

```text
/                       Sitio público / Home
/services               Catálogo provisional de servicios
/fleet                  Categorías provisionales de vehículos
/booking                Flujo local de cuatro pasos
/login                  Interfaz de acceso, sin autenticación
/dashboard              Portal individual simulado
/corporate              Portal corporativo simulado
/corporate/usage        Usage Matrix simulada
```

## Arquitectura objetivo recomendada

Mantener TypeScript end-to-end y añadir por fases:

- base de datos relacional con migraciones para datos transaccionales;
- servicios de dominio para reservaciones, pricing, billing y políticas;
- autenticación robusta y RBAC/ABAC aplicado en servidor;
- validación compartida en límites de entrada;
- audit logs para acciones sensibles;
- jobs/eventos para notificaciones e integraciones;
- storage privado para documentos, si llegara a habilitarse;
- observabilidad, backups y manejo seguro de errores.

La selección final de base de datos, proveedor de identidad, pagos y hosting queda abierta. La UI no depende de un proveedor específico.

## Modelo de dominio anticipado

Entidades principales: `users`, `organizations`, `memberships`, `roles`, `permissions`, `travelers`, `locations`, `airports`, `reservations`, `ride_segments`, `service_types`, `vehicle_classes`, `vehicles`, `chauffeurs`, `assignments`, `pricing_rules`, `quotes`, `payments`, `invoices`, `cost_centers`, `service_plans`, `subscriptions`, `notifications` y `audit_logs`.

Decisiones clave pendientes:

- relación con dispatch/CRM existente;
- services con instant booking vs quote/manual approval;
- mercados, aeropuertos y zonas de servicio;
- reglas de capacidad, pricing, espera, cancelación y autorización;
- jerarquía corporativa y visibilidad por rol;
- identidad, pagos, mapas, vuelos, comunicaciones y hosting.

## Seguridad

La interfaz de login actual es solo visual. Antes de manejar cuentas reales se requieren sesiones seguras, autorización de servidor, verificación/reset de email, rate limiting, protección CSRF/XSS/SQLi según aplique, cookies seguras, MFA-capable admin, audit logs y least privilege. Ascenta nunca debe almacenar números de tarjeta sin tokenizar; un proveedor compatible debe manejar ese dato.

## Datos y secretos

- Desarrollo solo con datos ficticios.
- Secretos exclusivamente en variables de entorno no versionadas.
- Variables públicas solo para valores seguros que puedan llegar al navegador.
- `.env.example` documentará nombres cuando se elijan proveedores, nunca valores reales.
