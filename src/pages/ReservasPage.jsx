import { useEffect, useState } from 'react'
import { api, formatearFecha } from '../api'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import Badge from '../components/Badge'
import { useToast } from '../components/Toast'
import { useConfirm } from '../components/ConfirmDialog'

export default function ReservasPage() {
  const [reservas, setReservas] = useState(null)
  const [libros, setLibros] = useState([])
  const [clientes, setClientes] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ libroId: '', clienteId: '' })
  const [guardando, setGuardando] = useState(false)
  const toast = useToast()
  const confirmar = useConfirm()

  const cargar = () => api.get('/reservas').then(setReservas).catch((e) => toast.error(e.message))

  useEffect(() => { cargar() }, [])

  const abrirCrear = async () => {
    const [librosData, clientesData] = await Promise.all([api.get('/libros'), api.get('/clientes')])
    setLibros(librosData)
    setClientes(clientesData)
    setForm({ libroId: '', clienteId: '' })
    setModal(true)
  }

  const reservar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    try {
      await api.post('/reservas', { libroId: Number(form.libroId), clienteId: Number(form.clienteId) })
      toast.success('Reserva creada')
      setModal(false)
      cargar()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setGuardando(false)
    }
  }

  const confirmarReserva = (reserva) => {
    confirmar('Confirmar reserva', `¿Entregar "${reserva.tituloLibro || 'este libro'}" a ${reserva.nombreCliente || 'este cliente'}? Se generará un alquiler.`, async () => {
      try {
        await api.post(`/reservas/${reserva.id}/confirmar`)
        toast.success('Reserva confirmada y alquiler creado')
        cargar()
      } catch (err) {
        toast.error(err.message)
      }
    })
  }

  const cancelar = (reserva) => {
    confirmar('Cancelar reserva', '¿Seguro que quieres cancelar esta reserva?', async () => {
      try {
        await api.del(`/reservas/${reserva.id}`)
        toast.success('Reserva cancelada')
        cargar()
      } catch (err) {
        toast.error(err.message)
      }
    })
  }

  const selectClase = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

  return (
    <div>
      <PageHeader
        title="Reservas"
        description="Cola de espera para libros sin stock. Al devolverse un libro, la primera reserva se materializa automáticamente."
        action={
          <button onClick={abrirCrear} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Nueva reserva
          </button>
        }
      />

      {reservas === null ? (
        <Spinner />
      ) : reservas.length === 0 ? (
        <EmptyState mensaje="No hay reservas registradas" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Libro</th>
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Fecha reserva</th>
                <th className="px-5 py-3">Expira</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...reservas].reverse().map((reserva) => (
                <tr key={reserva.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">{reserva.tituloLibro || `Libro #${reserva.libroId}`}</td>
                  <td className="px-5 py-3 text-slate-600">{reserva.nombreCliente || `Cliente #${reserva.clienteId}`}</td>
                  <td className="px-5 py-3 text-slate-500">{formatearFecha(reserva.fechaReserva)}</td>
                  <td className="px-5 py-3 text-slate-500">{formatearFecha(reserva.fechaExpiracion)}</td>
                  <td className="px-5 py-3"><Badge estado={reserva.estado} /></td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      {reserva.estado === 'ACTIVA' && (
                        <>
                          <button onClick={() => confirmarReserva(reserva)} className="rounded-md px-2.5 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50">
                            Confirmar
                          </button>
                          <button onClick={() => cancelar(reserva)} className="rounded-md px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50">
                            Cancelar
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title="Nueva reserva" onClose={() => setModal(false)}>
          <form onSubmit={reservar} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Libro</label>
              <select required value={form.libroId} onChange={(e) => setForm({ ...form, libroId: e.target.value })} className={selectClase}>
                <option value="">Selecciona un libro...</option>
                {libros.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.titulo} — {l.autor} {l.stock <= 0 ? '(sin stock)' : `(stock: ${l.stock})`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Cliente</label>
              <select required value={form.clienteId} onChange={(e) => setForm({ ...form, clienteId: e.target.value })} className={selectClase}>
                <option value="">Selecciona un cliente...</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} — {c.email}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Cancelar
              </button>
              <button type="submit" disabled={guardando} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                {guardando ? 'Reservando...' : 'Crear reserva'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}