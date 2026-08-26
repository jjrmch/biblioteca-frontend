import { useEffect, useState } from 'react'
import { api, formatearFecha, formatearMoneda } from '../api'
import PageHeader from '../components/PageHeader'
import Spinner from '../components/Spinner'
import Badge from '../components/Badge'

export default function Dashboard() {
  const [datos, setDatos] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/libros'),
      api.get('/clientes'),
      api.get('/ventas'),
      api.get('/alquileres'),
      api.get('/reservas'),
      api.get('/multas'),
    ]).then(([libros, clientes, ventas, alquileres, reservas, multas]) => {
      setDatos({ libros, clientes, ventas, alquileres, reservas, multas })
    }).catch(() => setDatos([]))
  }, [])

  if (!datos) return <Spinner />

  const stockTotal = datos.libros.reduce((s, l) => s + (l.stock ?? 0), 0)
  const ingresos = datos.ventas.reduce((s, v) => s + (v.precioTotal ?? 0), 0)
  const alquileresActivos = datos.alquileres.filter((a) => a.estado === 'ACTIVO')
  const multasPendientes = datos.multas.filter((m) => m.estado === 'PENDIENTE')
  const montoMultas = multasPendientes.reduce((s, m) => s + (m.monto ?? 0), 0)
  const reservasActivas = datos.reservas.filter((r) => r.estado === 'ACTIVA')

  const kpis = [
    { label: 'Libros en catálogo', valor: datos.libros.length, sub: `${stockTotal} ejemplares en stock`, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Clientes', valor: datos.clientes.length, sub: 'registrados', color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Ventas', valor: datos.ventas.length, sub: `Ingresos: ${formatearMoneda(ingresos)}`, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Alquileres activos', valor: alquileresActivos.length, sub: `${datos.alquileres.length} en total`, color: 'text-violet-600', bg: 'bg-violet-100' },
    { label: 'Multas pendientes', valor: multasPendientes.length, sub: `${formatearMoneda(montoMultas)} por cobrar`, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Reservas activas', valor: reservasActivas.length, sub: 'en cola de espera', color: 'text-rose-600', bg: 'bg-rose-100' },
  ]

  const ultimasVentas = [...datos.ventas].reverse().slice(0, 5)
  const ultimasMultas = [...datos.multas].reverse().slice(0, 5)

  return (
    <div>
      <PageHeader title="Dashboard" description="Resumen general de la biblioteca" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${kpi.bg}`}>
                <span className={`text-lg font-bold ${kpi.color}`}>{kpi.valor}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">{kpi.label}</p>
                <p className="text-xs text-slate-500">{kpi.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Últimas ventas</h2>
          {ultimasVentas.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Todavía no hay ventas</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {ultimasVentas.map((v) => (
                <li key={v.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{v.tituloLibro || `Libro #${v.libroId}`}</p>
                    <p className="text-xs text-slate-500">{v.nombreCliente || `Cliente #${v.clienteId}`} · {v.cantidad} uds · {formatearFecha(v.fecha)}</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">{formatearMoneda(v.precioTotal)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Últimas multas</h2>
          {ultimasMultas.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No hay multas registradas</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {ultimasMultas.map((m) => (
                <li key={m.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{m.nombreCliente || `Cliente #${m.clienteId}`}</p>
                    <p className="text-xs text-slate-500">{m.motivo} · {m.diasRetraso} días · {formatearFecha(m.fechaCreacion)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-amber-600">{formatearMoneda(m.monto)}</span>
                    <Badge estado={m.estado} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Alquileres activos</h2>
        {alquileresActivos.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">No hay alquileres activos</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="pb-2 pr-4">Libro</th>
                  <th className="pb-2 pr-4">Cliente</th>
                  <th className="pb-2 pr-4">Fecha alquiler</th>
                  <th className="pb-2 pr-4">Fecha límite</th>
                  <th className="pb-2">Renovaciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {alquileresActivos.map((a) => (
                  <tr key={a.id}>
                    <td className="py-2.5 pr-4 font-medium text-slate-800">{a.tituloLibro || `Libro #${a.libroId}`}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{a.nombreCliente || `Cliente #${a.clienteId}`}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{formatearFecha(a.fechaAlquiler)}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{formatearFecha(a.fechaLimiteDevolucion)}</td>
                    <td className="py-2.5">{a.renovaciones ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}