# Identidad visual de ASCENTA

La fuente efectiva de estilos es `apps/web/src/styles/ascenta.css`. La modernización del 7 de octubre de 2026 se aplica directamente a la aplicación React/TypeScript existente. Las capturas anteriores a la migración permanecen en `docs/evidence/reference`; las nuevas evidencias están en `docs/evidence/modernization`.

La paleta oficial se integra en las variables existentes: `#101B2C`, `#0192E5`, `#54C2E9`, `#E4E4E6`, `#545454` y `#3C3C3C`. El azul de los botones usa texto navy para mantener contraste; los enlaces sobre blanco usan el tono funcional `#006AA7`. Se conservan colores diferenciados para errores y confirmaciones.

Grift no está disponible como archivo completo autorizado para web; los subconjuntos del PDF no se usan como fuente de interfaz. Se conservan Arial para contenido y Georgia para títulos. Los logos son recursos gráficos del branding, sin reconstrucción tipográfica.

Los seis recursos anteriores se conservan bajo `apps/web/public/brand` para sus usos existentes y trazabilidad:

- journey-hero.webp: jet, SUV y viajero de la Home.
- arrival-detail.webp y vehicle-detail.webp: imágenes de las secciones.
- logo-lockup.png y logo-wordmark.png: marca ASCENTA.
- favicon.png: icono.

La portada usa la fotografía original de la pasajera dentro del vehículo, extraída del PDF de branding como `executive-journey.jpeg`. Las variantes `logo-wordmark-dark/light.png` y `logo-lockup-dark/light.png` proceden de la geometría vectorial aprobada y tienen transparencia real. El componente `Brand` elige explícitamente la variante; `Header` conserva su detección de tema al desplazarse. Footer y acceso usan la variante clara; el menú móvil usa la oscura.

El historial del inventario conserva el hash del CSS anterior, pero su obligación de igualdad de bytes se retira únicamente para ese archivo porque el rediseño cambia intencionadamente los estilos. No se modifican umbrales ni capturas históricas de comparación visual.

El formulario `JourneyStarter` conserva un solo DOM y el estado de `AppProvider`, el borrador de sesión de 30 minutos, las validaciones y la ruta `/booking`. En escritorio mantiene la barra horizontal y el selector centrado encima; en tablet y móvil reorganiza los mismos controles. La navegación pasa al menú modal a 1050 px. Se conservan las notificaciones y las animaciones existentes, y se respeta movimiento reducido.

No se cambian API, autenticación, esquema, datos ni servicios Node.js/MySQL. La prueba `node tests/browser/verify-modernization.mjs` verifica ambos modos, persistencia al continuar/regresar/recargar, rutas, logos, teclado, movimiento reducido y respuestas reales de salud/catálogo. No crea usuarios ni reservas; la persistencia de nuevas solicitudes en MySQL no se revalida mediante escritura en esta tarea.

## Archivos de la modernización

| Archivo | Cambio |
| --- | --- |
| `apps/web/src/components/ascenta/home.tsx` | Portada humana, nueva jerarquía, enlaces de servicios y fotografía del branding; lógica de `JourneyStarter` intacta. |
| `apps/web/src/components/ascenta/chrome.tsx` | Variantes del logo por tema, enlaces de flota/contacto y nombre accesible del menú modal. |
| `apps/web/src/components/ascenta/ui.tsx` | `Brand` con variantes clara/oscura y dimensiones reales de los nuevos recursos. |
| `apps/web/src/components/ascenta/auth.tsx` | Logo claro transparente sobre la fotografía de acceso. |
| `apps/web/src/styles/ascenta.css` | Paleta, portada, barra horizontal, navegación adaptable, foco y movimiento reducido. |
| `apps/web/public/brand/` | Fotografía original y cuatro variantes de logo en PNG transparente con sus fuentes SVG. |
| `docs/brand-asset-provenance.json` | Páginas del PDF, geometría, extracción, dimensiones y hashes de origen. |
| `docs/source-inventory.json` | Excepción documentada de igualdad histórica únicamente para el CSS modernizado. |
| `tests/browser/verify-modernization.mjs` | Verificación de la aplicación real mediante el navegador Edge existente. |
| `docs/evidence/modernization/` | Capturas reales y resultados detallados en `report.json`. |

Los cambios previos del usuario en `main.tsx` y `statement-heading.css` permanecen intactos. No se incorporan dependencias nuevas al proyecto.

## Comprobaciones locales

`pnpm --filter @ascenta/web build`, `pnpm --filter @ascenta/web lint` y `pnpm --filter @ascenta/web test` pasan; las dos suites del frontend suman 26 pruebas. Vite conserva un aviso de tamaño del bundle principal (aproximadamente 663 kB sin gzip), sin fallo de compilación.

`pnpm test:migration` pasa con los 214 mapeos y los seis recursos anteriores intactos. `pnpm test:visual:reference` confirma que las capturas históricas permanecen válidas. No se usa una comparación de píxeles contra el diseño anterior como criterio del rediseño.

La verificación de navegador genera `docs/evidence/modernization/report.json`, incluidas respuestas reales de salud/catálogo en modo MySQL, resultados de interacción y errores de consola. Las capturas `home-desktop.png`, `home-tablet.png` y `home-mobile.png` muestran el estado inicial; las capturas de modalidad y reserva muestran únicamente datos de prueba del navegador aislado.

Resultado final: **63 de 63 comprobaciones de navegador aprobadas**, 21 capturas, cero errores JavaScript/consola/red inesperados y cero mutaciones de API. Se verificaron ambas modalidades, volver y recargar el borrador, cambio de logo al desplazarse, menú por teclado, movimiento reducido y pantallas en inglés/español. La revisión adicional de navegación entre 320 y 1440 px no detectó solapamientos ni desbordamiento. Las peticiones 401 de consulta de sesión anónima se reconocen como comportamiento esperado.
