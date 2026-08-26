import { useEffect, useState } from 'react'
import { api, formatearFecha, formatearMoneda } from '../api'
import PageHeader from '../components/PageHeader'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import Badge from '../components/Badge'
import { useToast } from '../components/Toast'
import { useConfirm } from '../components/ConfirmDialog'

export default function MultasPage() {
  const [multas, setMultas] = useState(null)
  const toast = useToast()
  const confirmar = useConfirm()

  const cargar = () => api.get('/multas').then(setMultas).catch((e) => toast.error(e.message))

  useEffect(() => { cargar() }, [])

  const pagar = (multa) => {
    confirmar('Registrar pago', `¿Confirmas el pago de ${formatearMoneda(multa.monto)} de ${multa.nombreCliente || 'este cliente'}?`, async () => {
      try {
        await api.post(`/multas/${multa.id}/pago`)
        toast.success('Multa pagada')
        cargar()
      } catch (err) {
        toast.error(err.message)
      }
    })
  }

  if (multas === null) return <Spinner />

  const totalPendiente = multas.filter((m) => m.estado === 'PENDIENTE').reduce((s, m) => s + (m.monto ?? 0), 0)

  return (
    <div>
      <PageHeader title="Multas" description="Sanciones por devoluciones fuera de plazo" />

      {totalPendiente > 0 && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-sm text-amber-800">
            Total pendiente de cobro: <strong>{formatearMoneda(totalPendiente)}</strong>
          </p>
        </div>
      )}

      {multas.length === 0 ? (
        <EmptyState mensaje="No hay multas registradas" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Motivo</th>
                <th className="px-5 py-3">Días retraso</th>
                <th className="px-5 py-3">Monto</th>
                <th className="px-5 py-3">Fecha</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...multas].reverse().map((multa) => (
                <tr key={multa.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">{multa.nombreCliente || `Cliente #${multa.clienteId}`}</td>
                  <td className="px-5 py-3 text-slate-600">{multa.motivo}</td>
                  <td className="px-5 py-3 text-slate-600">{multa.diasRetraso}</td>
                  <td className="px-5 py-3 font-semibold text-amber-600">{formatearMoneda(multa.monto)}</td>
                  <td className="px-5 py-3 text-slate-500">{formatearFecha(multa.fechaCreacion)}</td>
                  <td className="px-5 py-3"><Badge estado={multa.estado} /></td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end">
                      {multa.estado === 'PENDIENTE' && (
                        <button onClick={() => pagar(multa)} className="rounded-md px-2.5 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50">
                          Registrar pago
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}