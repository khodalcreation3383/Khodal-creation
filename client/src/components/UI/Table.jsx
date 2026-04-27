import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

export function Table({ children, className = '' }) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-sm">{children}</table>
    </div>
  )
}

export function Thead({ children }) {
  return (
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr>{children}</tr>
    </thead>
  )
}

export function Th({ children, sortKey, currentSort, onSort, className = '' }) {
  const isActive = currentSort?.key === sortKey
  return (
    <th
      className={`table-header ${sortKey ? 'cursor-pointer hover:bg-gray-100 select-none' : ''} ${className}`}
      onClick={() => sortKey && onSort && onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortKey && (
          <span className="text-gray-300">
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
  return <tbody className="divide-y divide-gray-100">{children}</tbody>
}

export function Tr({ children, onClick, className = '' }) {
  return (
    <tr
      className={`hover:bg-gray-50 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

export function Td({ children, className = '', colSpan }) {
  return <td className={`table-cell ${className}`} colSpan={colSpan}>{children}</td>
}
