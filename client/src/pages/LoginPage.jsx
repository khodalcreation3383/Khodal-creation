import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { login, clearError } from '../store/slices/authSlice'
import { Eye, EyeOff, Lock, Mail, ArrowRight, Scissors } from 'lucide-react'
import toast from 'react-hot-toast'
import logo from '../assets/logo.png'

const YEAR = new Date().getFullYear()

export default function LoginPage() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { loading, error, isAuthenticated } = useSelector(s => s.auth)
  const [form, setForm]       = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)

  useEffect(() => { if (isAuthenticated) navigate('/dashboard') }, [isAuthenticated])
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()) } }, [error])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('Please fill all fields')
    const result = await dispatch(login(form))
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Welcome back!')
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL (branding) ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-950 flex-col justify-between p-12 relative overflow-hidden login-grid">
        {/* Decorative circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/3 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/3 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-white/5 pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-lg">
            <img src={logo} alt="Khodal Creation" className="w-full h-full object-contain p-0.5"
              onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
            <div className="hidden w-full h-full items-center justify-center">
              <Scissors className="w-5 h-5 text-gray-900" />
            </div>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Khodal Creation</span>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-white/8 border border-white/10 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/70 text-xs font-medium">Business Management System</span>
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Manage your<br />
              <span className="text-gray-400">textile business</span><br />
              with ease.
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Complete admin panel for stock, billing, parties, payments, and professional PDF invoices.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {['Stock Tracking', 'PDF Invoices', 'Party Ledger', 'Payment Reports', 'GST Support'].map(f => (
              <span key={f} className="text-xs bg-white/6 border border-white/10 text-white/60 px-3 py-1 rounded-full">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-gray-600 text-xs">© {YEAR} Khodal Creation. All rights reserved.</p>
        </div>
      </div>

      {/* ── RIGHT PANEL (form) ── */}
      <div className="flex-1 flex flex-col justify-center items-center bg-white px-6 py-12">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center overflow-hidden">
            <img src={logo} alt="Khodal Creation" className="w-full h-full object-contain p-0.5"
              onError={e => { e.target.style.display='none' }} />
          </div>
          <span className="font-bold text-gray-900 text-lg">Khodal Creation</span>
        </div>

        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Sign in</h2>
            <p className="text-gray-500 text-sm mt-1">Enter your credentials to access the admin panel</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="input-field pl-10"
                  placeholder="admin@khodalcreation.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary justify-center py-3 text-sm rounded-xl mt-2 group"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              © {YEAR} Khodal Creation · Admin Panel
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
