# Changelog

Todos los cambios relevantes de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y este proyecto sigue [Semantic Versioning](https://semver.org/lang/es/).

## [1.0.0] - 2026-10-05

### Añadido

- Login contra auth-service con JWT guardado en `localStorage` y cierre de sesión automático al recibir un 401
- Dashboard con KPIs del sistema (libros, stock, clientes, ventas e ingresos, alquileres activos, multas pendientes y reservas)
- Gestión de libros (CRUD, búsqueda y ajuste de stock) y de clientes (CRUD)
- Ventas, alquileres (renovación y devolución), reservas y multas (registro de pagos)
- Interfaz según rol: `ADMIN` / `BIBLIOTECARIO` ven todo y `CLIENTE` solo el catálogo en modo lectura, con rutas protegidas
- Proxy de Vite en desarrollo y nginx con proxy `/api` hacia el gateway en producción
- Build multi-stage con Docker
