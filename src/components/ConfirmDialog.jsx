import { createContext, useContext, useState } from 'react'
import Modal from './Modal'

const ConfirmContext = createContext(null)

export function ConfirmProvider({ children }) {
  const [dialogo, setDialogo] = useState(null)

  const confirmar = (titulo, mensaje, onConfirmar) => {
    setDialogo({ titulo, mensaje, onConfirmar })
  }

  const cerrar = () => setDialogo(null)

  const aceptar = () => {
    dialogo?.onConfirmar()
    cerrar()
  }

  return (
    <ConfirmContext.Provider value={confirmar}>
      {children}
      {dialogo && (
        <Modal title={dialogo.titulo} onClose={cerrar}>
          <p className="text-sm text-slate-600">{dialogo.mensaje}</p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={cerrar}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              onClick={aceptar}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Aceptar
            </button>
          </div>
        </Modal>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  return useContext(ConfirmContext)
}