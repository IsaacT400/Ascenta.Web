# Ascenta Executive — Local Experience Prototype

Prototipo local navegable para **Ascenta Executive · Private Chauffeur Service**. Esta entrega valida dirección visual, navegación, comportamiento móvil, flujo inicial de reservación y conceptos de portal. No está desplegada públicamente, no procesa pagos y no contiene datos reales de clientes.

## Incluido

- Sitio público: Home, Services y Fleet.
- Reservación progresiva: One Way, Airport Transfer, Hourly, Round Trip y City-to-City.
- Login visual con Sign In, Create Account y Reset.
- Dashboard individual con viajes, ubicaciones y recibos simulados.
- Dashboard corporativo con reservaciones, facturación y uso simulado.
- Ascenta Transportation Usage Matrix con filtros visuales, gráficas, tablas y exportación CSV de demostración.
- Sistema de diseño responsivo y documentación de producto/técnica.
- Home Phase 3: narrativa editorial, Journey Flow, services rail, hospitality, fleet carousel, business metrics y motion accesible.

Rutas principales:

| Área | Ruta |
| --- | --- |
| Home | `/` |
| Book a Ride | `/booking` |
| Services | `/services` |
| Fleet | `/fleet` |
| Login | `/login` |
| Customer Dashboard | `/dashboard` |
| Corporate Dashboard | `/corporate` |
| Usage Matrix | `/corporate/usage` |

## Ejecutar localmente

Requiere Node.js `>=22.13.0`.

```bash
pnpm install
pnpm dev
```

Abrir `http://localhost:5173`.

Verificaciones:

```bash
pnpm lint
pnpm build
```

El proyecto usa Vinext/Vite con compatibilidad de rutas estilo Next.js. No se requiere base de datos para esta etapa. El archivo `.env` es opcional:

```bash
NEXT_PUBLIC_PROTOTYPE_MODE=true
```

El modo prototipo está activo por defecto y muestra etiquetas provisionales discretas. Para una presentación limpia al cliente, usar `NEXT_PUBLIC_PROTOTYPE_MODE=false` y reiniciar el servidor.

## Estado y límites

- `DEMO DATA`: nombres, fechas, viajes, rutas, cantidades y valores financieros.
- `PLACEHOLDER`: identidad tipográfica, copy, imágenes, categorías y capacidades.
- `TO BE CONFIRMED`: flota real, cobertura, precios, políticas, reglas operativas y permisos.
- Las imágenes son recursos temporales de Pexels. En Home se utilizan fotografías de David Guerrero, Pavel Danilyuk y Gustavo Rodrigues; deben sustituirse o licenciarse según el plan de producción aprobado.
- Los controles de login no autentican. Los dashboards no aplican aún autorización de servidor.
- La reserva termina en un resumen local; no crea una reservación ni consulta disponibilidad.
- No se han conectado mapas, flight tracking, dispatch, CRM, email, SMS, pagos ni analítica.

## Documentación

- [PROJECT_BRIEF.md](./PROJECT_BRIEF.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
- [DECISIONS.md](./DECISIONS.md)
- [ROADMAP.md](./ROADMAP.md)

## Seguridad

No agregar secretos, credenciales ni información personal real. Cuando se seleccionen integraciones, las credenciales deberán entrar únicamente mediante variables de entorno locales/seguras y nunca al repositorio o a datos enviados al navegador.
