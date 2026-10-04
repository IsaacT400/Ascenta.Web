# Project Inventory

Inventario levantado del checkpoint original `checkpoint/pre-react-node-mysql` y reconciliado con la migración local. Los estados significan: **existente** (ya estaba implementado), **integrado** (ahora usa backend real), **demo** (presentación ficticia preservada) y **pendiente** (no especificado o sin reglas/servicio aprobado).

## Pantallas y rutas

| Ruta | Pantalla y secciones | Interacciones/estados | Estado real |
| --- | --- | --- | --- |
| `/` | Hero fotográfico “Arrive ready for what matters”, frase “Elevate the way you arrive”, booking panel, Journey Flow, rail de servicios, hospitality, carrusel de flota, corporate, métricas, CTA y footer | scroll reveal/parallax, contadores, carruseles, hover/focus, menú responsive, reduced motion | existente y preservado; servicios/flota/imágenes provisionales |
| `/services` | Hero, grid One Way/Airport Transfer/Hourly/Round Trip/City-to-City, CTA y aviso | links de planificación, hover y responsive | demo; reglas/cobertura pendientes |
| `/fleet` | Hero y tres categorías con imagen, capacidad, amenities y CTA | cards alternadas y responsive | demo; inventario/capacidades pendientes |
| `/booking` | Wizard Route → Trip details → Vehicle → Review | pasos, modos, inputs, selección, back/continue, loading/error/success de envío | solicitud integrada; precio/disponibilidad/pago pendientes |
| `/login` | Sign in, Create account, Reset y panel editorial | login loading/error/success, acceso demo customer/corporate | Sign in integrado; Create/Reset permanecen demo/pending |
| `/dashboard` | KPIs, viaje próximo, historial, ubicaciones | guard de sesión, navegación lateral/móvil, tables/buttons | guard integrado; contenido demo |
| `/corporate` | KPIs, Usage Matrix teaser, utilización, reservaciones e invoices | guard `CORPORATE_ADMIN`, tablas y links | autorización integrada; contenido demo |
| `/corporate/usage` | filtros, spend chart, service mix, departamentos, rutas, upcoming y export CSV | guard corporativo, selectores, export | visual/demo; analítica real pendiente |

No existe pantalla de administración, suscripciones, historial completo ni billing operativo. El proyecto solo contiene referencias conceptuales o controles no conectados; no se declaran migrados.

## Componentes de producto conservados

- Navegación y marca: `site-header`, `site-footer`, `page-transition`, `page-hero`.
- Home: `home-experience`, `home-scroll-motion`, `booking-panel`, `reveal`, `count-metric`.
- Reserva: `booking-wizard`.
- Portales: `dashboard-shell`, `stat-card`, `usage-matrix`, nuevo `auth-gate`.
- Primitivos: biblioteca local en `components/ui` (buttons, forms, tabs, table, sidebar, carousel, dialog y otros).

## Recursos y estilos

- `app/globals.css`: tokens, tipografía, reset, motion, colores y responsive global.
- Fuentes Playfair Display/Inter cargadas por la configuración existente.
- `public/favicon.svg` y SVG genéricos del starter.
- Fotografías remotas Pexels en Home/Fleet; son referencias provisionales y requieren confirmación de licencia/uso final.
- Paleta aprobada: navy/Ascenta blue, ivory, champagne y neutrales; no se reemplazó la librería visual.

## Estados y validación

- **Loading:** login, guard de sesión y envío de reserva.
- **Error:** credenciales/API/CSRF, sesión ausente, rol insuficiente y error de reserva.
- **Success:** login con redirección y reserva guardada con referencia.
- **Empty:** endpoints devuelven listas vacías; diseño específico de empty state para historial/usage aún pendiente.
- **Disabled:** botones de navegación del wizard y envíos en progreso/completados.
- **Validación:** Zod en login/reserva; HTML labels/focus existentes; errores uniformes de API.
- **Autenticación/permisos:** sesiones reales; customer/corporate/admin modelados; reservas aisladas por creador/organización. UI administrativa no existe.

## Responsive y accesibilidad

Breakpoints Tailwind existentes cubren menú móvil, columnas, tarjetas/tablas ocultables y carruseles. La matriz requerida para QA es 390×844, 768×1024, 1024×768, 1440×900 y 1920×1080. Se conservan HTML semántico, labels, keyboard controls heredados y `prefers-reduced-motion`. La auditoría WCAG completa y pruebas en dispositivos físicos no se han realizado.

## Backend y datos inventariados

- Implementados: health, login/logout/me, catálogo, listar/crear reservas.
- Persistencia: users, sessions, organizations, memberships, service types, vehicle classes, reservations, ride segments, rate plans, pricing rules, quotes y audit logs.
- Pendientes por falta de definición: disponibilidad, precios/taxes/fees, pagos, cancelaciones, invoices, travelers, saved locations, departments/cost centers, subscriptions, dispatch/fleet/chauffeurs y proveedores externos.
