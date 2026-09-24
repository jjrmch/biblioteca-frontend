import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import RutaProtegida from './components/RutaProtegida'
import { ToastProvider } from './components/Toast'
import { ConfirmProvider } from './components/ConfirmDialog'
import { AuthProvider } from './auth'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import LibrosPage from './pages/LibrosPage'
import ClientesPage from './pages/ClientesPage'
import VentasPage from './pages/VentasPage'
import AlquileresPage from './pages/AlquileresPage'
import ReservasPage from './pages/ReservasPage'
import MultasPage from './pages/MultasPage'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ConfirmProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<RutaProtegida />}>
              <Route element={<Layout />}>
                <Route path="/libros" element={<LibrosPage />} />
                <Route element={<RutaProtegida soloStaff />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/clientes" element={<ClientesPage />} />
                  <Route path="/ventas" element={<VentasPage />} />
                  <Route path="/alquileres" element={<AlquileresPage />} />
                  <Route path="/reservas" element={<ReservasPage />} />
                  <Route path="/multas" element={<MultasPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
          </Routes>
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  )
}
