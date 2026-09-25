const BASE = import.meta.env.VITE_API_URL || '/api'
const CLAVE_SESION = 'biblioteca.sesion'

export function leerSesion() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_SESION))
  } catch {
    return null
  }
}

export function guardarSesion(sesion) {
  localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion))
}

export function borrarSesion() {
  localStorage.removeItem(CLAVE_SESION)
}

async function request(path, { method = 'GET', body } = {}) {
  const sesion = leerSesion()
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'
  if (sesion?.token) headers.Authorization = `Bearer ${sesion.token}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: Object.keys(headers).length > 0 ? headers : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 204) return null

  const data = await res.json().catch(() => null)

  if (res.status === 401 && !path.startsWith('/auth/login')) {
    borrarSesion()
    if (window.location.pathname !== '/login') {
      window.location.assign('/login')
    }
    const error = new Error('La sesión ha expirado, vuelve a iniciar sesión')
    error.status = 401
    throw error
  }

  if (!res.ok) {
    const error = new Error(data?.mensaje || `Error ${res.status}`)
    error.status = res.status
    error.errores = data?.errores
    throw error
  }

  return data
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  del: (path) => request(path, { method: 'DELETE' }),
}

export const formatearFecha = (fecha) => {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatearMoneda = (valor) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(valor ?? 0)
