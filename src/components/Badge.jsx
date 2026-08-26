const ESTILOS = {
  ACTIVO: 'bg-emerald-100 text-emerald-700',
  DEVUELTO: 'bg-slate-200 text-slate-600',
  ACTIVA: 'bg-blue-100 text-blue-700',
  CANCELADA: 'bg-slate-200 text-slate-500',
  CUMPLIDA: 'bg-emerald-100 text-emerald-700',
  EXPIRADA: 'bg-red-100 text-red-700',
  PENDIENTE: 'bg-amber-100 text-amber-700',
  PAGADA: 'bg-emerald-100 text-emerald-700',
}

export default function Badge({ estado }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        ESTILOS[estado] || 'bg-slate-100 text-slate-600'
      }`}
    >
      {estado}
    </span>
  )
}