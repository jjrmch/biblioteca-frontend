import { createContext, useCallback, useContext, useState } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const notify = useCallback(
    (tipo, mensaje) => {
      const id = Date.now() + Math.random()
      setToasts((prev) => [...prev, { id, tipo, mensaje }])
      setTimeout(() => remove(id), 4500)
    },
    [remove],
  )

  const toast = {
    success: (mensaje) => notify('success', mensaje),
    error: (mensaje) => notify('error', mensaje),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`min-w-72 max-w-md rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
              t.tipo === 'success' ? 'bg-emerald-600' : 'bg-red-600'
            }`}
          >
            {t.mensaje}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}