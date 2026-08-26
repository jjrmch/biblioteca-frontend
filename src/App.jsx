import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { ToastProvider } from './components/Toast'
import { ConfirmProvider } from './components/ConfirmDialog'
import Dashboard from './pages/Dashboard'
import LibrosPage from './pages/LibrosPage'
import ClientesPage from './pages/ClientesPage'
import VentasPage from './pages/VentasPage'
import AlquileresPage from './pages/AlquileresPage'
import ReservasPage from './pages/ReservasPage'
import MultasPage from './pages/MultasPage'

export default function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/libros" element={<LibrosPage />} />
            <Route path="/clientes" element={<ClientesPage />} />
            <Route path="/ventas" element={<VentasPage />} />
            <Route path="/alquileres" element={<AlquileresPage />} />
            <Route path="/reservas" element={<ReservasPage />} />
            <Route path="/multas" element={<MultasPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </ConfirmProvider>
    </ToastProvider>
  )
}