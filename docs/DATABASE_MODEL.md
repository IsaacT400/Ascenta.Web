# Modelo de datos

MySQL 8.4.9 y Prisma 7.10.0. Fuente: packages/database/prisma/schema.prisma; despliegue mediante las dos migraciones SQL versionadas existentes.

Hay una familia de usuarios, tokens de verificación, sesiones, organizaciones, membresías, servicios, clases de vehículo, solicitudes, segmentos, planes de tarifa, reglas, cotizaciones y auditoría. No se duplican tablas al migrar el frontend.

Usuarios se relacionan con sesiones, membresías y solicitudes; las organizaciones agrupan membresías y solicitudes autorizadas. Email, hashes de tokens, referencia, claves de idempotencia y códigos de catálogo conservan unicidad. Las relaciones tienen claves foráneas e índices.

La solicitud conserva instante UTC y zona IANA. El frontend valida horas inexistentes/ambiguas por DST antes de convertirlas; los contratos validan campos. HOURLY requiere duración y admite destino ausente. El hash de payload permite detectar reintentos con la misma clave y contenido distinto.

La migración de verificación es aditiva: usuarios preexistentes permanecen verificados; las altas nuevas requieren token local de un solo uso. Sesiones guardan hashes, expiración y revocación; permisos de dueño/organización/administrador se aplican en Express y repositorio.

El seed normal instala cinco servicios y tres clases de vehículo sin crear personas, organizaciones ni solicitudes ficticias. seed-demo.ts permanece como opción explícita de desarrollo.

En este equipo, ascenta_local y ascenta_test residen en la instancia dedicada 127.0.0.1:3307, datadir persistente .local/mysql. El servicio original 3306 quedó intacto. Las pruebas exigen TEST_DATABASE_URL con nombre terminado en _test y eliminan únicamente las filas que ellas crean.

Nunca se usa un error MySQL para activar memoria. Los scripts no borran datadir ni volúmenes. Guarda una copia segura del datadir y de las credenciales privadas para respaldar datos; el punto Git de recuperación protege código, no la base.
