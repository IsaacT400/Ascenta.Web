# Decisions

Registro de decisiones arquitectónicas y de producto. Fecha inicial: **2026-09-17**.

## D-001 — Prototipo local antes de producción

- **Decisión:** construir y validar localmente; no desplegar ni tocar DNS.
- **Razón:** permite evaluar UX/visual sin fijar hosting, políticas o integraciones.
- **Alternativas:** despliegue temporal público.
- **Reversible:** sí.

## D-002 — React + TypeScript con Vinext/Vite

- **Decisión:** usar el starter de Sites en perfil portable, con rutas estilo Next.js.
- **Razón:** componentes reutilizables, SSR-ready, rendimiento de desarrollo y ruta clara hacia una aplicación full-stack.
- **Alternativas:** Next.js tradicional, Remix, SPA Vite, Webflow/Framer.
- **Reversible:** moderadamente; los componentes React/TypeScript son portables.

## D-003 — Identidad visual provisional tokenizada

- **Decisión:** wordmark tipográfico, navy/ivory/champagne y Playfair + Inter.
- **Razón:** expresa quiet luxury sin simular una identidad definitiva.
- **Alternativas:** paleta monocroma pura, sans-serif editorial, diseño de logo provisional.
- **Reversible:** sí; tokens, fuentes y assets están centralizados.

## D-004 — Booking progresivo de cuatro pasos

- **Decisión:** Route → Trip details → Vehicle → Review.
- **Razón:** revela campos por contexto y evita un formulario inicial abrumador.
- **Alternativas:** formulario largo de una pantalla; wizard por página.
- **Reversible:** sí.

## D-005 — Datos y business rules explícitamente provisionales

- **Decisión:** marcar valores como `DEMO DATA`, `PLACEHOLDER` o `TO BE CONFIRMED`.
- **Razón:** evita convertir supuestos de prototipo en compromisos operativos.
- **Alternativas:** ocultar valores no confirmados; inventar reglas completas.
- **Reversible:** no aplica; es una salvaguarda continua.

## D-006 — Un acceso visual, autorización futura por roles

- **Decisión:** una entrada de login conceptual; permisos distintos para individual, traveler, booker, corporate admin y billing.
- **Razón:** simplifica la experiencia sin confundir autenticación con autorización.
- **Alternativas:** portales/login separados.
- **Reversible:** sí, pero el enforcement de servidor es obligatorio antes de producción.

## D-007 — Visualizaciones locales sin dependencia de chart runtime

- **Decisión:** usar SVG/CSS responsivo para las gráficas iniciales de la Usage Matrix.
- **Razón:** evita una incompatibilidad de módulos detectada en el runtime portable, reduce JavaScript y conserva accesibilidad/control visual.
- **Alternativas:** Recharts, otra biblioteca de gráficas.
- **Reversible:** sí; la capa visual puede cambiar cuando exista un modelo analítico real.

## D-008 — Sin proveedor externo elegido

- **Decisión:** no seleccionar todavía auth, mapas, flight tracking, pagos, dispatch, CRM, comunicaciones, base de datos ni hosting.
- **Razón:** faltan requisitos operativos y decisiones del negocio.
- **Alternativas:** adoptar proveedores por defecto.
- **Reversible:** deliberadamente abierta.

## D-009 — Refinar Home antes de propagar el lenguaje visual

- **Decisión:** aplicar la dirección Phase 3 únicamente a Home y someterla a revisión antes de modificar Services, Fleet, Booking o dashboards.
- **Razón:** Home funciona como prototipo de ritmo, color, fotografía y movimiento sin introducir cambios masivos prematuros.
- **Alternativas:** actualizar todas las rutas en una sola entrega.
- **Reversible:** sí.

## D-010 — Modo prototipo explícito y discreto

- **Decisión:** controlar las etiquetas provisionales con `NEXT_PUBLIC_PROTOTYPE_MODE`; el modo está activo salvo que se defina explícitamente como `false`.
- **Razón:** mantiene claras las limitaciones del prototipo sin convertirlas en banners visualmente dominantes y permite una presentación limpia al cliente.
- **Alternativas:** mantener warnings permanentes o eliminar toda indicación de provisionalidad.
- **Reversible:** sí.

## D-011 — Motion editorial sin sumar dependencias

- **Decisión:** construir reveals, contadores, Journey Flow y transiciones de página con CSS, IntersectionObserver y el carrusel Embla ya instalado.
- **Razón:** reduce peso y riesgo, conserva control de accesibilidad y cubre la narrativa solicitada.
- **Alternativas:** incorporar GSAP, Framer Motion u otra librería de animación.
- **Reversible:** sí.
