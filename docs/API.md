# API

Base local: `http://localhost:4000/api/v1`. El contrato formal está en [openapi.yaml](./openapi.yaml).

| Método | Ruta | Auth | Función |
| --- | --- | --- | --- |
| GET | `/health` | no | salud de API y dependencia de datos |
| POST | `/auth/login` | no | crea una sesión nueva |
| GET | `/auth/me` | cookie | usuario y roles actuales |
| POST | `/auth/logout` | cookie + CSRF | revoca la sesión |
| GET | `/catalog` | no | servicios y clases de vehículo activos |
| GET | `/reservations` | cookie | reservas propias o de organizaciones permitidas |
| POST | `/reservations` | cookie + CSRF | crea una solicitud idempotente |

Todas las respuestas incluyen `requestId`. Los errores siguen `{ error: { code, message, requestId, details? } }`; los detalles de validación solo describen campos, nunca credenciales o trazas. El login devuelve el token CSRF en el cuerpo y la sesión opaca en cookie HttpOnly.

No existen endpoints de pricing, disponibilidad, pagos, invoices, create-account, reset, dispatch o analytics porque sus reglas/proveedores no están aprobados.
