# Decisiones de la consolidación — 2026-10-07

1. La fuente de verdad es la aplicación local que servía localhost:5175. El historial remoto se conserva como referencia; no sobrescribe los cambios locales.
2. Se reutilizan los componentes React activos, CSS y seis assets originales. No se rediseña la interfaz.
3. React Router sustituye el enrutamiento anterior; Vite sirve y compila una SPA. Express conserva los contratos /api/v1.
4. Prisma/MySQL es la persistencia normal. Se reutilizan modelos y migraciones; no se duplica la identidad ni se reinicializan bases existentes.
5. La instancia MySQL instalada en 3306 queda intacta. La instancia dedicada en 3307 guarda sus datos persistentes bajo .local/mysql y separa ascenta_local de ascenta_test.
6. Los catálogos y fixtures se separan. No se introducen usuarios demo silenciosamente en la base normal.
7. Node 24 y pnpm 11.19.0 permanecen fijados. Las herramientas portátiles están bajo .tools y se pueden reconstruir con el instalador; no dependen de la carpeta anterior.
8. Las fuentes sustituidas se eliminan de la aplicación final tras verificar sus reemplazos. El punto Git recovery/local-reference y el respaldo externo conservan recuperación.
9. La entrega es exclusivamente local: sin push, merge ni despliegue.
