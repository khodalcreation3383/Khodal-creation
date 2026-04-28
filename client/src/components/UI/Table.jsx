import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

export function Table({ children, className = '' }) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full text-sm border-collapse min-w-full">{children}</table>
    </div>
  )
}

export function Thead({ children }) {
  return (
    <thead className="bg-gray-50 border-b-2 border-gray-200 sticky top-0 z-10">
      <tr>{children}</tr>
    </thead>
  )
}

export function Th({ children, sortKey, currentSort, onSort, className = '', align = 'left', width }) {
  const isActive = currentSort?.key === sortKey
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
  return (
    <th
      style={width ? { width } : undefined}
      className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 whitespace-nowrap ${alignClass} ${sortKey ? 'cursor-pointer hover:bg-gray-100 select-none' : ''} ${className}`}
      onClick={() => sortKey && onSort && onSort(sortKey)}
    >
      <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : ''}`}>
        {children}
        {sortKey && (
          <span className="text-gray-300 flex-shrink-0">
            {isActive
              ? currentSort.order === 'asc'
                ? <ChevronUp className="w-3 h-3" />
                : <ChevronDown className="w-3 h-3" />
              : <ChevronsUpDown className="w-3 h-3" />
            }
          </span>
        )}
      </div>
    </th>
  )
}

export function Tbody({ children }) {
  return <tbody className="divide-y divide-gray-100 bg-white">{children}</tbody>
}

export function Tr({ children, onClick, className = '' }) {
  return (
    <tr
      className={`hover:bg-blue-50/30 transition-colors duration-100 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

export function Td({ children, className = '', colSpan, align = 'left' }) {
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
  return (
    <td
      className={`px-4 py-3 text-sm text-gray-700 align-middle ${alignClass} ${className}`}
      colSpan={colSpan}
    >
      {children}
    </td>
  )
}

// Skeleton loader row for tables
export function TableSkeleton({ cols = 5, rows = 5 }) {
  return (
    <Tbody>
      {Array.from({ length: rows }).map((_, i) => (
        <Tr key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <Td key={j}>
              <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${60 + (j * 13) % 35}%` }} />
            </Td>
          ))}
        </Tr>
      ))}
    </Tbody>
  )
}
