import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../store/slices/authSlice'
import { toggleSidebar } from '../../store/slices/uiSlice'
import { useSettings } from '../../context/SettingsContext'
import { Bell, LogOut, Settings, ChevronDown, Menu } from 'lucide-react'
import api from '../../services/api'

export default function Header() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector(s => s.auth)
  const { settings } = useSettings()

  const [reminders, setReminders] = useState([])
  const [showNotif, setShowNotif] = useState(false)
  const [showUser,  setShowUser]  = useState(false)

  const notifRef = useRef(null)
  const userRef  = useRef(null)

  const businessName = settings?.businessName || 'Khodal Creation'

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false)
      if (userRef.current  && !userRef.current.contains(e.target))  setShowUser(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    fetchReminders()
    const id = setInterval(fetchReminders, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [])

  const fetchReminders = async () => {
    try {
      const res = await api.get('/dashboard/reminders')
      setReminders(res.data.data?.filter(r => !r.isRead) || [])
    } catch {}
  }

  const markRead = async (id) => {
    try {
      await api.patch(`/dashboard/reminders/${id}/read`)
      setReminders(prev => prev.filter(r => r._id !== id))
    } catch {}
  }

  const markAllRead = async () => {
    try {
      await api.patch('/dashboard/reminders/read-all')
      setReminders([])
    } catch {}
  }

  const handleSettings = () => { setShowUser(false); navigate('/settings') }
  const handleLogout   = () => { setShowUser(false); dispatch(logout()); navigate('/login') }

  return (
    <header className="h-14 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between flex-shrink-0 z-30 relative">

      {/* ── Left ── */}
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors -ml-1"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{businessName}</p>
          <p className="text-xs text-gray-400 hidden sm:block">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* ── Right ── */}
      <div className="flex items-center gap-1">

        {/* Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotif(v => !v); setShowUser(false) }}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Bell className="w-[18px] h-[18px] text-gray-600" />
            {reminders.length > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                {reminders.length > 9 ? '9+' : reminders.length}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-[100] overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="font-semibold text-sm text-gray-900">
                  Reminders
                  {reminders.length > 0 && <span className="text-gray-400 font-normal ml-1">({reminders.length})</span>}
                </span>
                {reminders.length > 0 && (
                  <button onClick={markAllRead} className="text-xs text-gray-500 hover:text-gray-900 transition-colors">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                {reminders.length === 0 ? (
                  <div className="py-8 text-center">
                    <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No pending reminders</p>
                  </div>
                ) : reminders.map(r => (
                  <div key={r._id} className="px-4 py-3 hover:bg-gray-50 flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 leading-relaxed">{r.message}</p>
                      {r.amount && <p className="text-xs font-semibold text-red-600 mt-0.5">₹{r.amount?.toLocaleString('en-IN')}</p>}
                    </div>
                    <button onClick={() => markRead(r._id)} className="text-gray-300 hover:text-gray-500 text-xs flex-shrink-0 mt-0.5">✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Settings shortcut — hidden on very small screens */}
        <button
          onClick={handleSettings}
          className="hidden sm:flex p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Settings"
        >
          <Settings className="w-[18px] h-[18px] text-gray-600" />
        </button>

        {/* User menu */}
        <div className="relative ml-1" ref={userRef}>
          <button
            onClick={() => { setShowUser(v => !v); setShowNotif(false) }}
            className="flex items-center gap-2 pl-2 pr-2 sm:pr-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold leading-none">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-gray-900 leading-tight">{user?.name || 'Admin'}</p>
              <p className="text-[10px] text-gray-400 capitalize leading-tight">{user?.role || 'admin'}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
          </button>

          {showUser && (
            <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-200 z-[100] py-1 overflow-hidden">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-900 truncate">{user?.name}</p>
                <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
              </div>
              <button onClick={handleSettings} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors">
                <Settings className="w-3.5 h-3.5" /> Settings
              </button>
              <hr className="border-gray-100 mx-2" />
              <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-red-600 hover:bg-red-50 transition-colors">
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  )
}
