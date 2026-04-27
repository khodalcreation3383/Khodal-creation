import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setSidebarOpen } from '../../store/slices/uiSlice'
import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout() {
  const dispatch = useDispatch()
  const { sidebarCollapsed, sidebarOpen } = useSelector(s => s.ui)
  const location = useLocation()

  // Close mobile sidebar on route change
  useEffect(() => {
    dispatch(setSidebarOpen(false))
  }, [location.pathname])

  // Desktop: offset main content by sidebar width
  // Mobile: no offset (sidebar is an overlay drawer)
  const mainStyle = {
    marginLeft: 0,
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── Mobile backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}

      {/* ── Sidebar (fixed) ── */}
      <Sidebar />

      {/* ── Main content ── */}
      {/* On mobile: full width (sidebar overlays)
          On desktop: offset by sidebar width using margin */}
      <div
        className={`
          flex-1 flex flex-col overflow-hidden transition-[margin] duration-300
          ml-0
          ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'}
        `}
      >
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-4 sm:p-6 page-enter">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  )
}
