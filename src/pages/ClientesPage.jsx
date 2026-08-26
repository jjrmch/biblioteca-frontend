import { useEffect, useState } from 'react'
import { api } from '../api'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import { useToast } from '../components/Toast'
import { useConfirm } from '../components/ConfirmDialog'

const VACIO = { nombre: '', email: '', telefono: '' }

export default function ClientesPage() {
  const [clientes, setClientes] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(VACIO)
  const [guardando, setGuardando] = useState(false)
  const toast = useToast()
  const confirmar = useConfirm()

  const cargar = () => api.get('/clientes').then(setClientes).catch((e) => toast.error(e.message))

  useEffect(() => { cargar() }, [])

  const abrirCrear = () => { setForm(VACIO); setModal({ tipo: 'crear' }) }
  const abrirEditar = (cliente) => {
    setForm({ nombre: cliente.nombre, email: cliente.email, telefono: cliente.telefono })
    setModal({ tipo: 'editar', cliente })
  }

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    try {
      if (modal.tipo === 'crear') {
        await api.post('/clientes', form)
        toast.success('Cliente creado correctamente')
      } else {
        await api.put(`/clientes/${modal.cliente.id}`, form)
        toast.success('Cliente actualizado')
      }
      setModal(null)
      cargar()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = (cliente) => {
    confirmar('Eliminar cliente', `¿Seguro que quieres eliminar a "${cliente.nombre}"?`, async () => {
      try {
        await api.del(`/clientes/${cliente.id}`)
        toast.success('Cliente eliminado')
        cargar()
      } catch (err) {
        toast.error(err.message)
      }
    })
  }

  const filtrados = (clientes || []).filter((c) =>
    `${c.nombre} ${c.email}`.toLowerCase().includes(busqueda.toLowerCase())
  )

  const inputClase = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Gestión de los clientes de la biblioteca"
        action={
          <button onClick={abrirCrear} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Nuevo cliente
          </button>
        }
      />

      <input
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por nombre o email..."
        className="mb-4 w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
      />

      {clientes === null ? (
        <Spinner />
      ) : filtrados.length === 0 ? (
        <EmptyState mensaje="No hay clientes que coincidan con la búsqueda" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Nombre</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Teléfono</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtrados.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">{cliente.nombre}</td>
                  <td className="px-5 py-3 text-slate-600">{cliente.email}</td>
                  <td className="px-5 py-3 text-slate-600">{cliente.telefono || '—'}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => abrirEditar(cliente)} className="rounded-md px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50">
                        Editar
                      </button>
                      <button onClick={() => eliminar(cliente)} className="rounded-md px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50">
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

      {modal && (
        <Modal title={modal.tipo === 'crear' ? 'Nuevo cliente' : 'Editar cliente'} onClose={() => setModal(null)}>
          <form onSubmit={guardar} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Nombre</label>
              <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className={inputClase} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClase} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Teléfono</label>
              <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className={inputClase} />
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
    </div>
  )
}