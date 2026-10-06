# API

Base local: `http://localhost:4000/api/v1`. El contrato formal está en [openapi.yaml](./openapi.yaml).

| Método | Ruta | Auth | Función |
| --- | --- | --- | --- |
| GET | `/health` | no | salud de API y dependencia de datos |
| POST | `/auth/login` | no | crea una sesión nueva |
| POST | `/auth/register` | no | crea cuenta CUSTOMER pendiente de verificación; token solo en desarrollo/test local |
| POST | `/auth/verify-email` | no | consume token de verificación de un solo uso |
| GET | `/auth/me` | cookie | usuario y roles actuales |
| POST | `/auth/logout` | cookie + CSRF | revoca la sesión |
| GET | `/catalog` | no | servicios y clases de vehículo activos |
| GET | `/reservations` | cookie | reservas propias o de organizaciones permitidas |
| POST | `/reservations` | cookie + CSRF | crea una solicitud idempotente |
| GET | `/admin/reservations` | cookie + rol ASCENTA_ADMIN | cola interna de solicitudes y datos de contacto necesarios |

Todas las respuestas incluyen `requestId`. Los errores siguen `{ error: { code, message, requestId, details? } }`; los detalles de validación solo describen campos, nunca credenciales o trazas. El login devuelve el token CSRF en el cuerpo y la sesión opaca en cookie HttpOnly.

No hay v2 activa: las cuentas, cookies, sesiones, CSRF, catálogos y solicitudes siguen en `/api/v1`. Las nuevas capacidades extienden ese contrato y no crean una segunda identidad. La migración de verificación conserva usuarios existentes como verificados; el alta nueva requiere verificación. En desarrollo el token local se devuelve por API/UI sin enviar correo y expira en 30 minutos; en producción el alta falla cerrada hasta configurar entrega externa.

Las solicitudes conservan una referencia pública, el contacto del pasajero y el hash del payload asociado a la clave de idempotencia. Filas heredadas reciben hash vacío para mantener su respuesta idempotente histórica. La recepción interna requiere `ASCENTA_ADMIN`. No se registran automáticamente acciones de operación porque esta pantalla solo lectura todavía no permite transiciones de estado.

No existen endpoints de pricing, disponibilidad, pagos, invoices, reset, dispatch o analytics porque sus reglas/proveedores no están aprobados.
