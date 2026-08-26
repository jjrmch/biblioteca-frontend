import { useEffect, useState } from 'react'
import { api, formatearMoneda } from '../api'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import { useToast } from '../components/Toast'
import { useConfirm } from '../components/ConfirmDialog'

const VACIO = { titulo: '', autor: '', isbn: '', precio: '', stock: '' }

export default function LibrosPage() {
  const [libros, setLibros] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [modal, setModal] = useState(null) // null | { tipo: 'crear' } | { tipo: 'editar', libro } | { tipo: 'stock', libro }
  const [form, setForm] = useState(VACIO)
  const [guardando, setGuardando] = useState(false)
  const toast = useToast()
  const confirmar = useConfirm()

  const cargar = () => api.get('/libros').then(setLibros).catch((e) => toast.error(e.message))

  useEffect(() => { cargar() }, [])

  const abrirCrear = () => { setForm(VACIO); setModal({ tipo: 'crear' }) }
  const abrirEditar = (libro) => {
    setForm({ titulo: libro.titulo, autor: libro.autor, isbn: libro.isbn, precio: libro.precio, stock: libro.stock })
    setModal({ tipo: 'editar', libro })
  }
  const abrirStock = (libro) => { setForm({ cantidad: '' }); setModal({ tipo: 'stock', libro }) }

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    try {
      if (modal.tipo === 'crear') {
        const body = { titulo: form.titulo, autor: form.autor, isbn: form.isbn, precio: Number(form.precio), stock: Number(form.stock) }
        await api.post('/libros', body)
        toast.success('Libro creado correctamente')
      } else {
        const body = { titulo: form.titulo, autor: form.autor, isbn: form.isbn, precio: Number(form.precio), stock: Number(form.stock) }
        await api.put(`/libros/${modal.libro.id}`, body)
        toast.success('Libro actualizado')
      }
      setModal(null)
      cargar()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setGuardando(false)
    }
  }

  const ajustarStock = async (e) => {
    e.preventDefault()
    setGuardando(true)
    try {
      await api.patch(`/libros/${modal.libro.id}/stock`, { cantidad: Number(form.cantidad) })
      toast.success('Stock actualizado')
      setModal(null)
      cargar()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = (libro) => {
    confirmar('Eliminar libro', `¿Seguro que quieres eliminar "${libro.titulo}"? Esta acción no se puede deshacer.`, async () => {
      try {
        await api.del(`/libros/${libro.id}`)
        toast.success('Libro eliminado')
        cargar()
      } catch (err) {
        toast.error(err.message)
      }
    })
  }

  const filtrados = (libros || []).filter((l) =>
    `${l.titulo} ${l.autor} ${l.isbn}`.toLowerCase().includes(busqueda.toLowerCase())
  )

  const inputClase = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

  return (
    <div>
      <PageHeader
        title="Libros"
        description="Catálogo e inventario de la biblioteca"
        action={
          <button onClick={abrirCrear} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Nuevo libro
          </button>
        }
      />

      <input
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por título, autor o ISBN..."
        className="mb-4 w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
      />

      {libros === null ? (
        <Spinner />
      ) : filtrados.length === 0 ? (
        <EmptyState mensaje="No hay libros que coincidan con la búsqueda" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Título</th>
                <th className="px-5 py-3">Autor</th>
                <th className="px-5 py-3">ISBN</th>
                <th className="px-5 py-3">Precio</th>
                <th className="px-5 py-3">Stock</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtrados.map((libro) => (
                <tr key={libro.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">{libro.titulo}</td>
                  <td className="px-5 py-3 text-slate-600">{libro.autor}</td>
                  <td className="px-5 py-3 text-slate-500">{libro.isbn}</td>
                  <td className="px-5 py-3 text-slate-700">{formatearMoneda(libro.precio)}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${libro.stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {libro.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => abrirStock(libro)} className="rounded-md px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50">
                        Stock
                      </button>
                      <button onClick={() => abrirEditar(libro)} className="rounded-md px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50">
                        Editar
                      </button>
                      <button onClick={() => eliminar(libro)} className="rounded-md px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50">
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal?.tipo !== 'stock' && modal && (
        <Modal title={modal.tipo === 'crear' ? 'Nuevo libro' : 'Editar libro'} onClose={() => setModal(null)}>
          <form onSubmit={guardar} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Título</label>
              <input required value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} className={inputClase} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Autor</label>
              <input required value={form.autor} onChange={(e) => setForm({ ...form, autor: e.target.value })} className={inputClase} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">ISBN</label>
              <input required value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} className={inputClase} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Precio (€)</label>
                <input required type="number" min="0" step="0.01" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} className={inputClase} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Stock inicial</label>
                <input required type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className={inputClase} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Cancelar
              </button>
              <button type="submit" disabled={guardando} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal?.tipo === 'stock' && (
        <Modal title={`Ajustar stock — ${modal.libro.titulo}`} onClose={() => setModal(null)}>
          <form onSubmit={ajustarStock} className="space-y-4">
            <p className="text-sm text-slate-600">
              Stock actual: <strong>{modal.libro.stock}</strong>. Indica una cantidad positiva para añadir o negativa para restar.
            </p>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Cantidad</label>
              <input
                required
                type="number"
                value={form.cantidad}
                onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
                placeholder="Ej: 5 o -3"
                className={inputClase}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Cancelar
              </button>
              <button type="submit" disabled={guardando} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                {guardando ? 'Guardando...' : 'Ajustar stock'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}