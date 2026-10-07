# Inventario y procedencia

Entorno: Windows, PowerShell; carpeta de trabajo C:\Users\isaac\OneDrive\Desktop\Ascenta. No se encontraron AGENTS.md aplicables en ancestros ni fuentes.

La carpeta inicial no era un repositorio. Contenía Iniciar-Ascenta.ps1, Detener-Ascenta.ps1, runtime/, browser-check/ y html-migration/. El lanzador apuntaba a C:\Users\isaac\OneDrive\Desktop\Ascenta.Web, repositorio en feature/ascenta-integracion-v1, commit 0e3177e. Se identificaron modificaciones locales de API, páginas, shared y tests, y componentes/assets/documentación sin seguimiento. Todos se recuperaron desde fuentes locales.

El proceso original del puerto 5175 era Node PID 25740 con scripts/run-framework.mjs dev --port 5175 desde apps/web. La API era Node PID 17600, tsx src/server.ts desde apps/api, puerto 4000. Su padre registrado era el lanzador PID 21064. Se verificaron comando, ejecutable y fecha antes de detener ese árbol. Su modo de datos era demo.

La interfaz activa no procedía de HTML servido directamente: 15 rutas montaban components/ascenta y app/ascenta.css. Los módulos, CSS y seis assets coincidían con html-migration/stage. Los árboles extracted/backup y scripts de conversión eran auxiliares/copias.

Había MySQL 8.4.9 instalado y un servicio en 3306. No se alteró: se preparó una instancia independiente 3307 y se reutilizó el esquema Prisma existente. La API demo anterior tenía cero solicitudes cuando se auditó. No existía archivo transaccional que migrar. La API no expone el inventario interno de cuentas efímeras, por lo que no se afirma haber migrado cuentas de memoria; los fixtures son recuperables por código.

El remoto de referencia es https://github.com/IsaacT400/Ascenta.Web.git. No se hizo fetch de la red, push, merge ni despliegue: el historial y el árbol local constituyeron la fuente de la consolidación.

El detalle completo de 214 archivos originales está en source-inventory.json. Responsabilidades, destinos y eliminaciones están en MIGRATION_MATRIX.md; resultados ejecutados en MIGRATION_REPORT.md.
