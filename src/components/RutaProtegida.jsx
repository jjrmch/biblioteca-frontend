import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth'

export default function RutaProtegida({ soloStaff = false }) {
  const { estaAutenticado, esStaff } = useAuth()
  const location = useLocation()

  if (!estaAutenticado) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (soloStaff && !esStaff) {
    return <Navigate to="/libros" replace />
  }

  return <Outlet />
}
