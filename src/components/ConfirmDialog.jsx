import { createContext, useCallback, useContext, useState } from 'react'
import Modal from './Modal'

const ConfirmContext = createContext(null)

export function ConfirmProvider({ children }) {
  const [dialogo, setDialogo] = useState(null)
  const [procesando, setProcesando] = useState(false)

  const confirmar = useCallback((titulo, mensaje, onConfirmar) => {
    setProcesando(false)
    setDialogo({ titulo, mensaje, onConfirmar })
  }, [])

  const cerrar = () => {
    if (procesando) return
    setDialogo(null)
  }

  const aceptar = async () => {
    if (procesando || !dialogo) return
    setProcesando(true)
    try {
      await dialogo.onConfirmar()
    } catch {
      // cada página notifica sus propios errores con toast
    } finally {
      setProcesando(false)
      setDialogo(null)
    }
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
              disabled={procesando}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={aceptar}
              disabled={procesando}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {procesando ? 'Procesando...' : 'Aceptar'}
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