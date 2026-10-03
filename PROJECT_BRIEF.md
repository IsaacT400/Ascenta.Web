# Project Brief

## Producto

Ascenta Executive se concibe como una plataforma de transporte ejecutivo premium, no solo como un sitio informativo. Debe unir una experiencia pública de alta conversión con reservaciones, cuentas individuales, programas corporativos y, más adelante, operaciones administrativas.

Posicionamiento provisional: **Private Chauffeur Service**.

Dirección de experiencia: **Quiet Luxury + Modern Technology + Executive Hospitality**.

## Objetivo de esta etapa

Entregar un prototipo local navegable con suficiente fidelidad para evaluar:

1. dirección visual y jerarquía;
2. navegación desktop/mobile;
3. experiencia de reservación progresiva;
4. presentación de servicios y vehículos;
5. concepto de autenticación;
6. dashboards individual y corporativo;
7. utilidad y presentación inicial de la Usage Matrix.

## Audiencias prioritarias

- Ejecutivos y viajeros corporativos.
- Clientes individuales, familias y viajeros de ocio premium.
- Executive assistants y corporate bookers.
- Travel managers, billing managers y administradores corporativos.
- Hoteles, agencias, private aviation/FBO y event planners.

## Principios

- El cliente percibe simplicidad; la complejidad operacional permanece detrás.
- Reservar transporte es la acción primaria del sitio público.
- La experiencia móvil recibe la misma prioridad que desktop.
- Ningún dato provisional se convierte en regla de negocio.
- Capacidades, precios, cobertura, políticas y promesas de servicio requieren confirmación.
- Roles futuros deben limitar datos y acciones en el servidor, no solo en la interfaz.
- Integraciones deben poder cambiar de proveedor sin reconstruir el producto.

## Alcance implementado

Se implementó el front-end local descrito en el README. La versión actual no incluye persistencia, backend transaccional, autenticación, cotización, pagos, dispatch, integraciones ni producción.

## Supuestos explícitos

Todos los nombres, fechas, rutas, cifras de uso y valores financieros son `DEMO DATA`. La marca tipográfica, copy, imágenes, vehículos, capacidades y amenidades son `PLACEHOLDER`. Mercados, tarifas, condiciones, disponibilidad, normas de cancelación y controles de permisos están `TO BE CONFIRMED`.

## Criterios de éxito de la etapa

- Todas las rutas principales cargan localmente.
- El booking permite completar cuatro pasos y cambiar modalidad/vehículo.
- Las interfaces se adaptan a móvil sin desbordamiento horizontal.
- Los estados temporales están identificados visualmente y en documentación.
- La base es reutilizable y TypeScript, no un mockup gráfico desechable.
