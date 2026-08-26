import { useEffect, useState } from 'react'
import { api, formatearFecha, formatearMoneda } from '../api'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import { useToast } from '../components/Toast'

export default function VentasPage() {
  const [ventas, setVentas] = useState(null)
  const [libros, setLibros] = useState([])
  const [clientes, setClientes] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ libroId: '', cantidad: '', clienteId: '' })
  const [guardando, setGuardando] = useState(false)
  const toast = useToast()

  const cargar = () => api.get('/ventas').then(setVentas).catch((e) => toast.error(e.message))

  useEffect(() => { cargar() }, [])

  const abrirCrear = async () => {
    const [librosData, clientesData] = await Promise.all([api.get('/libros'), api.get('/clientes')])
    setLibros(librosData)
    setClientes(clientesData)
    setForm({ libroId: '', cantidad: '', clienteId: '' })
    setModal(true)
  }

  const libroSeleccionado = libros.find((l) => String(l.id) === String(form.libroId))
  const clienteSeleccionado = clientes.find((c) => String(c.id) === String(form.clienteId))

  const vender = async (e) => {
    e.preventDefault()
    setGuardando(true)
    try {
      await api.post('/ventas', {
        libroId: Number(form.libroId),
        cantidad: Number(form.cantidad),
        clienteId: Number(form.clienteId),
      })
      toast.success('Venta registrada correctamente')
      setModal(false)
      cargar()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setGuardando(false)
    }
  }

  const selectClase = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

  return (
    <div>
      <PageHeader
        title="Ventas"
        description="Registro de ventas de libros"
        action={
          <button onClick={abrirCrear} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Nueva venta
          </button>
        }
      />

      {ventas === null ? (
        <Spinner />
      ) : ventas.length === 0 ? (
        <EmptyState mensaje="Todavía no hay ventas registradas" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Libro</th>
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Cantidad</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...ventas].reverse().map((venta) => (
                <tr key={venta.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">{venta.tituloLibro || `Libro #${venta.libroId}`}</td>
                  <td className="px-5 py-3 text-slate-600">{venta.nombreCliente || `Cliente #${venta.clienteId}`}</td>
                  <td className="px-5 py-3 text-slate-600">{venta.cantidad}</td>
                  <td className="px-5 py-3 font-semibold text-emerald-600">{formatearMoneda(venta.precioTotal)}</td>
                  <td className="px-5 py-3 text-slate-500">{formatearFecha(venta.fecha)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title="Nueva venta" onClose={() => setModal(false)}>
          <form onSubmit={vender} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Libro</label>
              <select required value={form.libroId} onChange={(e) => setForm({ ...form, libroId: e.target.value })} className={selectClase}>
                <option value="">Selecciona un libro...</option>
                {libros.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.titulo} — {l.autor} (stock: {l.stock})
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
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Cantidad</label>
              <input required type="number" min="1" value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: e.target.value })} className={selectClase} />
            </div>
            {libroSeleccionado && clienteSeleccionado && (
              <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                Total estimado:{' '}
                <strong className="text-slate-800">{formatearMoneda(libroSeleccionado.precio * (Number(form.cantidad) || 0))}</strong>
              </p>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Cancelar
              </button>
              <button type="submit" disabled={guardando} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                {guardando ? 'Registrando...' : 'Registrar venta'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}