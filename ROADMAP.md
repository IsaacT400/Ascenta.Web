# Capacidades y pendientes

La aplicación conserva páginas públicas, navegación adaptable, idiomas EN/ES, efectos de scroll, borrador de viaje, validación de horario y capacidad, registro/verificación local, sesiones, solicitudes idempotentes, portal personal/corporativo y administración de lectura.

La persistencia normal es MySQL; las verificaciones ejecutadas se registran en docs/MIGRATION_REPORT.md.

Pendientes de implementación y definición de producto:

- Entrega de correo y recuperación de contraseña; el registro en producción permanece cerrado sin proveedor de verificación.
- Envío de contacto y edición de perfil.
- Tarifas, cotización, disponibilidad, pagos y facturación.
- Despacho, cancelación y transiciones de estado.
- Analítica corporativa e integraciones de operación.

Estos pendientes ya existían en la versión local. No se han convertido en simulaciones de éxito durante la migración.
