# Capturas de pantalla requeridas — Grain Store

> **Documento histórico — fase anterior del proyecto.**
> Este archivo corresponde a una versión anterior de la evidencia GA8-220501096-AA1-EV02,
> elaborada antes del despliegue definitivo del sistema y antes de implementar las
> pruebas automatizadas. Se conserva como registro histórico y no debe usarse como
> referencia del estado actual del proyecto.
>
> La documentación oficial y vigente para la entrega de esta evidencia se encuentra en
> [`GA8-220501096-AA1-EV02/`](../GA8-220501096-AA1-EV02/README_EVIDENCIA.md).

**Nota importante:** este análisis se realizó de forma automatizada sobre el código
y, para las pruebas de integración, sobre un navegador controlado por herramientas
de automatización — no se generaron archivos de imagen (`.png`/`.jpg`) guardados en
disco que se puedan adjuntar directamente a esta carpeta. Este documento es un
**checklist de las capturas que debes tomar manualmente** (es rápido: cada pantalla
ya fue verificada funcionalmente en la sección de pruebas, solo falta el registro
visual) antes de entregar la evidencia al instructor.

## Cómo tomar las capturas

1. Levanta el backend (`cd backend && npm run dev`) y el frontend (`npm run dev`)
   siguiendo [`../MANUAL_INSTALACION.md`](../MANUAL_INSTALACION.md).
2. Abre `http://localhost:5173` en el navegador.
3. Sigue la lista de abajo en orden; guarda cada captura en esta misma carpeta
   (`evidencia/`) con el nombre de archivo sugerido (formato `NN_nombre.png`).
4. Al terminar, actualiza este archivo marcando cada casilla `[x]` y, si quieres,
   enlaza las imágenes desde aquí con `![descripción](nombre_archivo.png)`.

## Checklist

### Autenticación
- [ ] `01_login.png` — Pantalla de login con el formulario y los 3 usuarios de
      demostración visibles.
- [ ] `02_login_admin_dashboard.png` — Dashboard justo después de iniciar sesión
      como Administrador.
- [ ] `03_login_vendedor_dashboard.png` — Dashboard como Vendedor (menú lateral
      acotado: sin Egresos/Reportes/Configuración).
- [ ] `04_login_contador_dashboard.png` — Dashboard como Contador (menú lateral
      acotado: sin Ventas/Productos).

### Clientes
- [ ] `05_clientes_lista.png` — Listado de clientes con los contadores (Total,
      Activos, Pendientes, Inactivos).
- [ ] `06_clientes_crear.png` — Formulario "Nuevo Cliente" lleno, antes de enviar.

### Productos
- [ ] `07_productos_lista.png` — Listado de productos mostrando los distintos
      estados (Normal / Bajo stock / Agotado).

### Ventas
- [ ] `08_ventas_lista.png` — Listado de ventas con sus estados (Pagada, Pendiente).
- [ ] `09_venta_nueva.png` — Formulario "Nueva Venta" lleno, antes de enviar.
- [ ] `10_venta_detalle.png` — Modal de detalle de una venta, mostrando sus ítems.
- [ ] `11_producto_stock_antes_despues.png` — (opcional, dos capturas o una
      compuesta) stock de un producto antes y después de registrar una venta, para
      evidenciar el descuento automático.

### Egresos
- [ ] `12_egresos_lista.png` — Listado de egresos.
- [ ] `13_egreso_crear.png` — Formulario "Registrar Egreso" lleno.

### Reportes
- [ ] `14_reportes.png` — Página de Reportes completa (estadísticas, gráfica,
      tabla de resumen financiero mensual).

### Configuración
- [ ] `15_config_perfil.png` — Pestaña "Mi Perfil".
- [ ] `16_config_tienda.png` — Pestaña "Mi Tienda".
- [ ] `17_config_sistema.png` — Pestaña "Sistema" (solo lectura).
- [ ] `18_config_usuarios.png` — Pestaña "Usuarios" (solo Administrador), con el
      formulario de creación y el listado.

### Backend / API
- [ ] `19_api_health.png` — Respuesta de `GET http://localhost:4000/api/health` en
      el navegador o en un cliente HTTP (Postman/Insomnia/curl).
- [ ] `20_api_login_response.png` — Respuesta JSON de `POST /api/auth/login`
      (puede ocultarse el token completo por seguridad si se comparte
      públicamente).

### Base de datos
- [ ] `21_prisma_studio.png` — `npx prisma studio` (dentro de `backend/`) mostrando
      las tablas con datos reales.

### Repositorio
- [ ] `22_github_repo.png` — Vista del repositorio en GitHub (URL, commits,
      estructura de carpetas visible).
- [ ] `23_github_commits.png` — Historial de commits en GitHub mostrando la
      progresión por fases.

## Estado de este checklist

**PENDIENTE** — ninguna captura ha sido tomada aún como parte de este análisis
automatizado. Todas las funcionalidades listadas arriba **ya fueron verificadas
funcionalmente y en vivo** durante el desarrollo (ver
[`pruebas.md`](pruebas.md)); lo único pendiente es el registro visual en imagen
para adjuntar al entregable.
