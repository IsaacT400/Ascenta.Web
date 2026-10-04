# Design System

## Tesis visual

Una sala de private aviation traducida a producto digital: silenciosa, precisa y hospitalaria. El lujo aparece en ritmo, materiales visuales y atención al detalle, no en ornamento excesivo.

## Identidad provisional

- Nombre: `ASCENTA EXECUTIVE`.
- Descriptor: `Private Chauffeur Service`.
- Marca actual: wordmark tipográfico reemplazable; no es un logo definitivo.

## Tokens principales

| Uso | Valor provisional |
| --- | --- |
| Midnight blue | `#071A24` |
| Deep blue | `#0D2A38` |
| Ocean blue | `#355B6D` |
| Ascenta blue | `#6F93A3` |
| Soft blue | `#B4C9D1` |
| Mist | `#DDE7EA` |
| Cloud | `#EEF2F1` |
| Ivory | `#F5F3EE` |
| White | `#FFFFFF` |
| Ink | `#15232A` |
| Champagne (acento restringido) | `#D2C19A` |

Los tokens se concentran en `app/globals.css`; al llegar la identidad final deben convertirse en la única fuente de verdad de marca.

## Tipografía

- Display: Playfair Display, para titulares editoriales.
- UI/body: Inter, para legibilidad y precisión.
- Escala fluida para hero con `clamp`; headings compactos y body de 14–20 px según contexto.
- Eyebrows en mayúsculas, 10–12 px y tracking amplio.

Ambas fuentes son temporales, gratuitas y reemplazables desde `app/layout.tsx`/tokens.

## Layout

- Contenedor principal: máximo aproximado de `1312–1440px` según composición.
- Gutter: 20 px móvil, 32 px tablet, 48–64 px desktop.
- Espaciado base: múltiplos de 4 px; secciones con respiración de 64–112 px.
- Breakpoints de Tailwind: `sm`, `md`, `lg`, `xl`.
- Mobile first; tablas reducen columnas secundarias y grids colapsan a una columna.

## Componentes

- Botón primario: deep blue sólido o ivory sobre fondos oscuros; altura 44–48 px; radio completo o 12 px.
- Botón secundario: outline sobrio, contraste AA y hover visible.
- Inputs: 48 px, borde neutral, label persistente y focus Ascenta blue con ring tenue.
- Cards: 16–24 px de radio, borde fino, sombra solo cuando ayuda a jerarquía.
- Tabs: píldoras para flujos; subrayado discreto para superficies densas.
- Dashboards: shell lateral, stat cards, tablas compactas, badges y visualizaciones accesibles.

## Movimiento

- Timings centralizados: `220 ms` para feedback rápido, `380 ms` para UI, `780 ms` para reveal editorial y `1100 ms` para imagen.
- Curva principal: `cubic-bezier(.22, 1, .36, 1)`; entradas suaves y desaceleración visible.
- Reveal de texto por máscara, media por `clip-path` y escalas de imagen contenidas; nada rebota ni compite con el contenido.
- El Journey Flow usa fotografía sticky solo en desktop. En móvil se convierte en una secuencia editorial estática.
- Las transiciones de página son sutiles y la navegación nunca queda bloqueada por motion.
- `prefers-reduced-motion` reduce la duración y elimina transformaciones no esenciales.

## Contenido e imágenes

- Copy breve, específico y calmado.
- No afirmar disponibilidad, certificaciones, cobertura ni políticas sin confirmar.
- Alt text describe la imagen representativa; la fotografía de Home y Fleet es temporal y procede de Pexels.
- Ratios recomendados para producción: hero 16:9/21:9, fleet 4:3 y cards 3:2, con variantes móviles.

## Accesibilidad

- HTML semántico, labels asociados y botones reales.
- Focus visible y controles operables por teclado.
- Contraste pensado para WCAG 2.2 AA.
- Gráficas acompañadas por etiquetas/valores legibles y `aria-label` descriptivo.
- Estados no dependen solo del color.
