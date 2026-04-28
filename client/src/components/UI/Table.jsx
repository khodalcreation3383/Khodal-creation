import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

export function Table({ children, className = '' }) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table
        className="w-full text-sm"
        style={{ borderCollapse: 'collapse', tableLayout: 'fixed', width: '100%' }}
      >
        {children}
      </table>
    </div>
  )
}

// Use this to define column widths. Widths must add up to 100%.
// Example: <ColGroup cols={['20%','15%','15%','10%','10%','10%','10%','10%']} />
export function ColGroup({ cols = [] }) {
  return (
    <colgroup>
      {cols.map((w, i) => (
        <col key={i} style={{ width: w }} />
      ))}
    </colgroup>
  )
}

export function Thead({ children }) {
  return (
    <thead style={{ backgroundColor: '#F9FAFB' }}>
      <tr style={{ borderBottom: '2px solid #E5E7EB' }}>{children}</tr>
    </thead>
  )
}

export function Th({ children, sortKey, currentSort, onSort, className = '', align = 'left' }) {
  const isActive = currentSort?.key === sortKey
  const textAlign = align === 'right' ? 'right' : align === 'center' ? 'center' : 'left'
  return (
    <th
      onClick={() => sortKey && onSort && onSort(sortKey)}
      style={{
        padding: '10px 12px',
        fontSize: '11px',
        fontWeight: 600,
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        backgroundColor: '#F9FAFB',
        textAlign,
        overflow: 'hidden',
        cursor: sortKey ? 'pointer' : 'default',
        whiteSpace: 'nowrap',
      }}
      className={className}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: textAlign === 'right' ? 'flex-end' : textAlign === 'center' ? 'center' : 'flex-start' }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{children}</span>
        {sortKey && (
          <span style={{ color: '#D1D5DB', flexShrink: 0 }}>
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
  return <tbody style={{ backgroundColor: '#FFFFFF' }}>{children}</tbody>
}

export function Tr({ children, onClick, className = '' }) {
  return (
    <tr
      onClick={onClick}
      style={{ borderBottom: '1px solid #F3F4F6', cursor: onClick ? 'pointer' : 'default' }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.backgroundColor = '#F9FAFB' }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
      className={className}
    >
      {children}
    </tr>
  )
}

export function Td({ children, className = '', colSpan, align = 'left' }) {
  const textAlign = align === 'right' ? 'right' : align === 'center' ? 'center' : 'left'
  return (
    <td
      colSpan={colSpan}
      style={{
        padding: '10px 12px',
        fontSize: '13px',
        color: '#374151',
        verticalAlign: 'middle',
        textAlign,
        overflow: 'hidden',
      }}
      className={className}
    >
      {children}
    </td>
  )
}

export function TableSkeleton({ cols = 5, rows = 5 }) {
  return (
    <Tbody>
      {Array.from({ length: rows }).map((_, i) => (
        <Tr key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <Td key={j}>
              <div className="h-4 bg-gray-100 rounded animate-pulse" />
            </Td>
          ))}
        </Tr>
      ))}
    </Tbody>
  )
}
