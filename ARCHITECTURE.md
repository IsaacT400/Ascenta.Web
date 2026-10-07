# Arquitectura

Un monorepo pnpm con un frontend y una API. El navegador ejecuta React mediante Vite y React Router; todas las operaciones privadas pasan por Express y Prisma/MySQL.

```text
Navegador → apps/web (Vite/React Router)
              → /api/v1 → apps/api (Express)
                            → MySqlRepository
                              → packages/database (Prisma) → MySQL 8.4
packages/shared → contratos Zod públicos para frontend y backend
```

El proxy Vite permite usar /api/v1 en desarrollo. La API acepta WEB_ORIGIN=http://localhost:5175. Las rutas son explícitas, permiten acceso directo y recarga mediante fallback SPA. No existe renderer de servidor ni una segunda implementación de interfaz.

La API conserva bcrypt, sesiones opacas cuyo hash se persiste, cookies HttpOnly/SameSite, CSRF, expiración y revocación. Roles y membresías se verifican en servidor. La clave idempotente está asociada al contenido de la solicitud. No se importa Prisma ni configuración privada en web.

DATA_MODE=mysql es normal y exige conexión real. DATA_MODE=demo es una opción explícita para desarrollo/pruebas; un fallo de MySQL devuelve error y nunca selecciona el repositorio en memoria.

El esquema conserva una familia de usuarios, sesiones, organizaciones y solicitudes. Las dos migraciones existentes son aditivas. El seed normal contiene solo catálogos; fixtures demo se ejecutan aparte. Las pruebas se limitan a una base terminada en _test.

Estado temporal de procesos, logs, herramientas portátiles y datos locales están en .local y .tools, ignorados por Git. Los scripts resuelven la raíz desde su ubicación y comprueban la identidad de procesos antes de detenerlos.
