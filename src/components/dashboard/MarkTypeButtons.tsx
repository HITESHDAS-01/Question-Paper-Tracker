'use client'

interface MarkTypeButtonsProps {
  onMark: (itemType: string) => void
  label: string
}

const buttons = [
  { type: 'qp', label: 'QP', color: 'from-emerald-500 to-green-600', hoverColor: 'hover:from-emerald-600 hover:to-green-700', shadow: 'shadow-emerald-500/25' },
  { type: 'bp', label: 'BP', color: 'from-blue-500 to-indigo-600', hoverColor: 'hover:from-blue-600 hover:to-indigo-700', shadow: 'shadow-blue-500/25' },
  { type: 'ms', label: 'MS', color: 'from-purple-500 to-pink-600', hoverColor: 'hover:from-purple-600 hover:to-pink-700', shadow: 'shadow-purple-500/25' },
]

export default function MarkTypeButtons({ onMark, label }: MarkTypeButtonsProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mr-1">{label}:</span>
      {buttons.map(b => (
        <button
          key={b.type}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold text-white bg-gradient-to-r ${b.color} ${b.hoverColor} shadow-md ${b.shadow} hover:shadow-lg transition-all duration-200 active:scale-95`}
          onClick={() => onMark(b.type)}
        >
          {b.label}
        </button>
      ))}
    </div>
  )
}
