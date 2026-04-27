import { NavLink, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toggleSidebarCollapse, setSidebarOpen } from '../../store/slices/uiSlice'
import { useSettings } from '../../context/SettingsContext'
import {
  LayoutDashboard, Palette, Users, Package, FileText,
  CreditCard, BarChart3, Settings, ChevronLeft, ChevronRight, X
} from 'lucide-react'
import logoFallback from '../../assets/logo.png'

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/designs',   icon: Palette,         label: 'Designs' },
  { path: '/parties',   icon: Users,           label: 'Parties' },
  { path: '/stock',     icon: Package,         label: 'Stock' },
  { path: '/bills',     icon: FileText,        label: 'Bills & Invoices' },
  { path: '/payments',  icon: CreditCard,      label: 'Payments' },
  { path: '/reports',   icon: BarChart3,       label: 'Reports' },
  { path: '/settings',  icon: Settings,        label: 'Settings' },
]

export default function Sidebar() {
  const dispatch = useDispatch()
  const { sidebarCollapsed, sidebarOpen } = useSelector(s => s.ui)
  const location = useLocation()
  const { settings } = useSettings()

  const logoSrc      = settings?.logo || logoFallback
  const businessName = settings?.businessName || 'Khodal Creation'

  return (
    <aside
      className={`
        fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-40 flex flex-col shadow-sm
        transition-all duration-300
        /* Mobile: slide in/out as drawer */
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        /* Desktop: always visible, width based on collapsed state */
        lg:translate-x-0
        ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-60'}
        w-64
      `}
    >
      {/* ── Brand ── */}
      <div className="flex items-center justify-between border-b border-gray-100 flex-shrink-0 h-14 px-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200">
            <img
              src={logoSrc}
              alt={businessName}
              className="w-full h-full object-contain"
              onError={e => {
                e.target.style.display = 'none'
                e.target.parentNode.innerHTML = `<span class="text-gray-700 font-bold text-sm">${businessName.charAt(0)}</span>`
              }}
            />
          </div>
          {/* Show name: always on mobile, only when not collapsed on desktop */}
          <div className={`min-w-0 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
            <p className="font-semibold text-sm text-gray-900 leading-tight truncate">{businessName}</p>
            <p className="text-gray-400 text-xs">Admin Panel</p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={() => dispatch(setSidebarOpen(false))}
          className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path || location.pathname.startsWith(path + '/')
          return (
            <NavLink
              key={path}
              to={path}
              title={sidebarCollapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group
                ${isActive
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
              <Icon className={`flex-shrink-0 w-[18px] h-[18px] ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-700'}`} />
              {/* Show label: always on mobile, only when not collapsed on desktop */}
              <span className={`truncate ${sidebarCollapsed ? 'lg:hidden' : ''}`}>{label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* ── Collapse toggle (desktop only) ── */}
      <div className="hidden lg:block p-2 border-t border-gray-100 flex-shrink-0">
        <button
          onClick={() => dispatch(toggleSidebarCollapse())}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg
                     text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all text-xs font-medium"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed
            ? <ChevronRight className="w-4 h-4" />
            : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>
          }
        </button>
      </div>
    </aside>
  )
}
