import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { api, borrarSesion, guardarSesion, leerSesion } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(() => leerSesion())

  const login = useCallback(async (email, password) => {
    const datos = await api.post('/auth/login', { email, password })
    const nueva = { token: datos.token, nombre: datos.nombre, rol: datos.rol }
    guardarSesion(nueva)
    setSesion(nueva)
    return nueva
  }, [])

  const logout = useCallback(() => {
    borrarSesion()
    setSesion(null)
  }, [])

  const valor = useMemo(
    () => ({
      sesion,
      estaAutenticado: Boolean(sesion?.token),
      esStaff: sesion?.rol === 'ADMIN' || sesion?.rol === 'BIBLIOTECARIO',
      login,
      logout,
    }),
    [sesion, login, logout],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
