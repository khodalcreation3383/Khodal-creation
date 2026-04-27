import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.pages <= 1) return null
  const { page, pages, total, limit } = pagination
  const start = (page - 1) * limit + 1
  const end   = Math.min(page * limit, total)

  const getPages = () => {
    const arr = []
    const delta = 2
    for (let i = Math.max(1, page - delta); i <= Math.min(pages, page + delta); i++) arr.push(i)
    return arr
  }

  const Btn = ({ children, onClick, active, disabled }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-medium transition-all
        ${active
          ? 'bg-gray-900 text-white'
          : 'text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed'
        }`}
    >
      {children}
    </button>
  )

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <p className="text-xs text-gray-400">
        Showing <span className="font-medium text-gray-700">{start}–{end}</span> of <span className="font-medium text-gray-700">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <Btn onClick={() => onPageChange(page - 1)} disabled={page === 1}>
          <ChevronLeft className="w-3.5 h-3.5" />
        </Btn>

        {page > 3 && (
          <>
            <Btn onClick={() => onPageChange(1)}>1</Btn>
            <span className="text-gray-300 text-xs px-1">…</span>
          </>
        )}

        {getPages().map(p => (
          <Btn key={p} onClick={() => onPageChange(p)} active={p === page}>{p}</Btn>
        ))}

        {page < pages - 2 && (
          <>
            <span className="text-gray-300 text-xs px-1">…</span>
            <Btn onClick={() => onPageChange(pages)}>{pages}</Btn>
          </>
        )}

        <Btn onClick={() => onPageChange(page + 1)} disabled={page === pages}>
          <ChevronRight className="w-3.5 h-3.5" />
        </Btn>
      </div>
    </div>
  )
}
