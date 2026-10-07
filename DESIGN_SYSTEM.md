# Referencia visual conservada

La fuente efectiva de estilos es apps/web/src/styles/ascenta.css, copiada sin cambios de la aplicación local. Las capturas anteriores a la migración están en docs/evidence/reference.

La marca, paleta, overlays, escalas, navbar y composiciones se conservan. Los títulos usan la fuente efectiva Georgia y el cuerpo Arial; las variables de fuentes de la versión anterior no cargaban tipografías externas.

Assets originales bajo apps/web/public/brand:

- journey-hero.webp: jet, SUV y viajero de la Home.
- arrival-detail.webp y vehicle-detail.webp: imágenes de las secciones.
- logo-lockup.png y logo-wordmark.png: marca ASCENTA.
- favicon.png: icono.

No se generan imágenes nuevas ni se cambian proporciones o calidad. Las verificaciones de hashes y navegador se registran en la matriz.

Se preservan menú modal accesible, notificaciones, selector One way / By the hour, formularios, animaciones con IntersectionObserver/requestAnimationFrame, reduced motion y breakpoints de 900/640 px. Los efectos tienen limpieza para soportar React StrictMode.
