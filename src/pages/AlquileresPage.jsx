import { useEffect, useState } from 'react'
import { api, formatearFecha } from '../api'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import Badge from '../components/Badge'
import { useToast } from '../components/Toast'
import { useConfirm } from '../components/ConfirmDialog'

export default function AlquileresPage() {
  const [alquileres, setAlquileres] = useState(null)
  const [libros, setLibros] = useState([])
  const [clientes, setClientes] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ libroId: '', clienteId: '' })
  const [guardando, setGuardando] = useState(false)
  const toast = useToast()
  const confirmar = useConfirm()

  const cargar = () => api.get('/alquileres').then(setAlquileres).catch((e) => toast.error(e.message))

  useEffect(() => { cargar() }, [])

  const abrirCrear = async () => {
    const [librosData, clientesData] = await Promise.all([api.get('/libros'), api.get('/clientes')])
    setLibros(librosData)
    setClientes(clientesData)
    setForm({ libroId: '', clienteId: '' })
    setModal(true)
  }

  const alquilar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    try {
      await api.post('/alquileres', { libroId: Number(form.libroId), clienteId: Number(form.clienteId) })
      toast.success('Alquiler registrado')
      setModal(false)
      cargar()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setGuardando(false)
    }
  }

  const devolver = (alquiler) => {
    confirmar('Devolver libro', `¿Confirmas la devolución de "${alquiler.tituloLibro || 'este libro'}"? Si hay retraso se generará una multa.`, async () => {
      try {
        await api.post(`/alquileres/${alquiler.id}/devolucion`)
        toast.success('Devolución registrada')
        cargar()
      } catch (err) {
        toast.error(err.message)
      }
    })
  }

  const renovar = (alquiler) => {
    confirmar('Renovar alquiler', '¿Deseas extender la fecha límite de devolución (7 días)?', async () => {
      try {
        await api.post(`/alquileres/${alquiler.id}/renovacion`)
        toast.success('Alquiler renovado')
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
        title="Alquileres"
        description="Préstamos de libros con renovación y devolución"
        action={
          <button onClick={abrirCrear} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Nuevo alquiler
          </button>
        }
      />

      {alquileres === null ? (
        <Spinner />
      ) : alquileres.length === 0 ? (
        <EmptyState mensaje="No hay alquileres registrados" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Libro</th>
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Fecha alquiler</th>
                <th className="px-5 py-3">Fecha límite</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3">Renov.</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...alquileres].reverse().map((alquiler) => (
                <tr key={alquiler.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">{alquiler.tituloLibro || `Libro #${alquiler.libroId}`}</td>
                  <td className="px-5 py-3 text-slate-600">{alquiler.nombreCliente || `Cliente #${alquiler.clienteId}`}</td>
                  <td className="px-5 py-3 text-slate-500">{formatearFecha(alquiler.fechaAlquiler)}</td>
                  <td className="px-5 py-3 text-slate-500">{formatearFecha(alquiler.fechaLimiteDevolucion)}</td>
                  <td className="px-5 py-3"><Badge estado={alquiler.estado} /></td>
                  <td className="px-5 py-3 text-slate-600">{alquiler.renovaciones ?? 0}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      {alquiler.estado === 'ACTIVO' && (
                        <>
                          <button onClick={() => renovar(alquiler)} className="rounded-md px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50">
                            Renovar
                          </button>
                          <button onClick={() => devolver(alquiler)} className="rounded-md px-2.5 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50">
                            Devolver
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
        <Modal title="Nuevo alquiler" onClose={() => setModal(false)}>
          <form onSubmit={alquilar} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Libro</label>
              <select required value={form.libroId} onChange={(e) => setForm({ ...form, libroId: e.target.value })} className={selectClase}>
                <option value="">Selecciona un libro...</option>
                {libros.map((l) => (
                  <option key={l.id} value={l.id} disabled={l.stock <= 0}>
                    {l.titulo} — {l.autor} (stock: {l.stock})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-400">Los libros sin stock aparecen deshabilitados; puedes reservarlos desde Reservas.</p>
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
                {guardando ? 'Registrando...' : 'Registrar alquiler'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}