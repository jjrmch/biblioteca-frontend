# Biblioteca Frontend

Panel de gestión web para el sistema de microservicios de la biblioteca (Spring Cloud). Frontend en **React + Vite + Tailwind CSS** que consume la API a través del **gateway-service** (`localhost:8080`).

## Funcionalidades

- **Dashboard**: KPIs del sistema (libros, stock, clientes, ventas e ingresos, alquileres activos, multas pendientes, reservas)
- **Libros**: CRUD completo, búsqueda por título/autor/ISBN y ajuste de stock
- **Clientes**: CRUD completo
- **Ventas**: registro de ventas (valida stock disponible)
- **Alquileres**: préstamos, renovación (máx 2) y devolución con multa automática por retraso
- **Reservas**: cola de espera para libros sin stock, confirmación y cancelación (materialización automática al devolver el libro)
- **Multas**: listado y registro de pagos

## Arquitectura

- Las peticiones van a `/api/...`:
  - **Desarrollo**: proxy de Vite hacia `http://localhost:8080`
  - **Producción**: nginx sirve el build y proxifica `/api` hacia el gateway
- Backend: catálogo, transacciones, clientes, discovery (Eureka) y gateway (Spring Cloud Gateway)

## Requisitos

- Node.js 20+
- Stack de microservicios levantado (ver `biblioteca-deploy`) con el gateway en `localhost:8080`

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:5173
```

## Producción (Docker)

```bash
docker build -t biblioteca-frontend .
docker run -p 3000:80 biblioteca-frontend   # http://localhost:3000
```

O directamente con docker-compose desde `biblioteca-deploy`:

```bash
docker compose up -d frontend
```

## Estructura

```
src/
├── api.js                  # Cliente HTTP + utilidades de formato
├── components/             # Layout, Modal, Badge, Toast, ConfirmDialog, Spinner...
└── pages/                  # Dashboard, Libros, Clientes, Ventas, Alquileres, Reservas, Multas
```