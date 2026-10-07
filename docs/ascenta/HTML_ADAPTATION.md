# Adaptación del diseño HTML a ASCENTA

El diseño entregado como `ASCENTA-Site-Local.html` se trasladó a componentes React y TypeScript en `apps/web/components/ascenta`. Las rutas siguen perteneciendo a Vinext/Vite; la aplicación usa la versión de React del monorepo. No se incrusta el HTML ni su runtime React compilado.

## Presentación y rutas

- `app/ascenta.css` conserva la composición, paleta, transiciones y reglas responsive del HTML. Las imágenes embebidas se extrajeron a `public/brand` sin alterar su contenido.
- Inicio, servicios, flota, empresas, reservas, acceso, cuenta, panel de viajes, panel corporativo y operaciones usan el nuevo diseño.
- Contacto, ayuda, privacidad y aviso de solicitud tienen rutas propias. El idioma inglés/español se conserva como preferencia local.
- El borrador de viaje vive en el proveedor React y en sessionStorage durante 30 minutos; no incluye contraseñas ni tokens de sesión. Permanece al navegar al acceso y volver a la reserva.

## Conexión con la plataforma existente

`adapter-api.ts` traduce los campos visuales al contrato Express `/api/v1`. Conserva cookies de sesión HttpOnly, credenciales CORS y validación CSRF. La autorización de clientes, empresas y administradores sigue en el servidor.

La duración se convierte de minutos a `durationHours`. Equipaje, vuelo y regreso solicitado se agregan con etiquetas a `notes`, junto con las notas del pasajero. No se truncan los datos: se rechaza un texto combinado de más de 2.000 caracteres. Los repositorios demo y Prisma/MySQL devuelven estas notas al cliente y al operador autorizados. No cambió el esquema Prisma ni se requirieron migraciones.

`auth/login` y `auth/me` devuelven las membresías de organización y el estado real de verificación del usuario. Los identificadores de organización se muestran como referencias, ya que el contrato actual no devuelve nombres de empresas.

## Límites de la API conservados

La API existente permite registro local, verificación, acceso, cierre de sesión, catálogo, creación y consulta de solicitudes. El registro local muestra el token devuelto por el servidor para verificar explícitamente la cuenta; no simula un correo enviado. En producción se mantiene la restricción de registro hasta conectar un proveedor de correo.

Contacto, recuperación de contraseña, edición del perfil, cotización, cambios de estado, pagos y despacho no tienen endpoints en esta versión. La interfaz informa de ello y no muestra éxitos ficticios. El archivo HTML portable tampoco se utiliza como un servidor alternativo.

## Ejecución y validación

Se mantienen Node 24, pnpm 11.19.0, React/TypeScript, Express y Prisma/MySQL. Los scripts del monorepo siguen siendo `pnpm dev`, `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:e2e` y `pnpm build`.

Las pruebas añadidas cubren cambios de horario de verano, redirecciones de retorno, conversión de los campos del viaje, protección de campos internos, notas completas, membresías y aislamiento entre cuentas. La ejecución local usa `DATA_MODE=demo`; sus solicitudes se pierden al reiniciar el proceso de API. Las comprobaciones de esta adaptación no ejecutan migraciones ni seed y no validan una conexión MySQL activa.

Validación local de la adaptación:

- Compilación de paquetes, API y frontend completada; compilación final del frontend con salida 0.
- Comprobación TypeScript del frontend y lint sin errores. Lint conserva siete avisos por las etiquetas de imagen nativas utilizadas para reproducir el HTML.
- 28 pruebas unitarias y 9 de integración aprobadas; la prueba que requiere MySQL se omite en modo demo.
- Navegador Edge: diseño de escritorio y móvil, cambio de idioma, menú, registro, verificación local, acceso, recarga de sesión y solicitud de viaje completa hasta su consulta en el panel. También se comprobaron restricciones de los paneles corporativo y administrativo, conservación del contenido de un envío incierto, inicio explícito de otra solicitud y cierre de sesión. Se verificaron las respuestas reales de la API y se guardaron capturas durante la revisión.

Referencia visual: HTML proporcionado por el usuario en esta sesión. Las fotografías y marcas se reutilizan del mismo archivo; no se incorporaron recursos externos.
