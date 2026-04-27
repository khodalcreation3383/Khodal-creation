import { useState, useEffect } from 'react'
import { Save, Upload, Building, Phone, FileText, Bell, Lock, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useSettings } from '../context/SettingsContext'
import { PageLoader } from '../components/UI/LoadingSpinner'
import logoFallback from '../assets/logo.png'

const CURRENT_YEAR = new Date().getFullYear()

export default function SettingsPage() {
  const { settings: globalSettings, refreshSettings } = useSettings()
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [activeTab, setActiveTab] = useState('business')
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  useEffect(() => {
    api.get('/settings').then(res => {
      setSettings(res.data.data)
      setLogoPreview(res.data.data?.logo || null)
    }).finally(() => setLoading(false))
  }, [])

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const uploadLogo = async () => {
    if (!logoFile) return null
    const formData = new FormData()
    formData.append('logo', logoFile)
    const res = await api.post('/settings/logo', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    return res.data.data.logo
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      let updatedSettings = { ...settings }
      if (logoFile) {
        const newLogoPath = await uploadLogo()
        if (newLogoPath) {
          updatedSettings.logo = newLogoPath
          setLogoFile(null)
        }
      }
      await api.put('/settings', updatedSettings)
      // Refresh global settings so logo/name updates everywhere instantly
      await refreshSettings()
      toast.success('Settings saved! Changes applied everywhere.')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return toast.error('Passwords do not match')
    if (passwordForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters')
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      toast.success('Password changed successfully!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    }
  }

  const set = (path, value) => {
    setSettings(prev => {
      const keys = path.split('.')
      const updated = { ...prev }
      let obj = updated
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...(obj[keys[i]] || {}) }
        obj = obj[keys[i]]
      }
      obj[keys[keys.length - 1]] = value
      return updated
    })
  }

  if (loading) return <PageLoader />

  const tabs = [
    { key: 'business', label: 'Business Info', icon: Building },
    { key: 'invoice', label: 'Invoice Settings', icon: FileText },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'security', label: 'Security', icon: Lock }
  ]

  const currentLogoDisplay = logoPreview || logoFallback

  return (
    <div className="space-y-6 max-w-8xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Configure your business and system settings</p>
        </div>
        {activeTab !== 'security' && (
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* ── BUSINESS INFO ── */}
      {activeTab === 'business' && (
        <div className="space-y-6">
          {/* Logo Upload */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">Business Logo</h3>
            <div className="flex items-center gap-6">
              {/* Logo preview */}
              <div className="w-28 h-28 border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden flex items-center justify-center bg-gray-50 flex-shrink-0">
                <img
                  src={currentLogoDisplay}
                  alt="Business Logo"
                  className="w-full h-full object-contain p-2"
                  onError={e => { e.target.src = logoFallback }}
                />
              </div>
              <div className="space-y-2">
                <label className="btn-secondary cursor-pointer inline-flex">
                  <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                  <Upload className="w-4 h-4" /> Choose Logo
                </label>
                {logoFile && (
                  <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                    <CheckCircle className="w-3.5 h-3.5" />
                    New logo selected — click Save Changes to apply
                  </div>
                )}
                <p className="text-xs text-gray-400">PNG, JPG up to 2MB</p>
                <p className="text-xs text-gray-400">This logo appears on the sidebar, header, login page, and all PDF invoices.</p>
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">Business Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Business Name *</label>
                <input
                  className="input-field"
                  value={settings?.businessName || ''}
                  onChange={e => set('businessName', e.target.value)}
                  placeholder="Khodal Creation"
                />
              </div>
              <div className="col-span-2">
                <label className="label">Street Address</label>
                <input className="input-field" value={settings?.address?.street || ''} onChange={e => set('address.street', e.target.value)} placeholder="Street address" />
              </div>
              <div>
                <label className="label">City</label>
                <input className="input-field" value={settings?.address?.city || ''} onChange={e => set('address.city', e.target.value)} placeholder="Surat" />
              </div>
              <div>
                <label className="label">State</label>
                <input className="input-field" value={settings?.address?.state || ''} onChange={e => set('address.state', e.target.value)} placeholder="Gujarat" />
              </div>
              <div>
                <label className="label">Pincode</label>
                <input className="input-field" value={settings?.address?.pincode || ''} onChange={e => set('address.pincode', e.target.value)} placeholder="395001" />
              </div>
              <div>
                <label className="label">Country</label>
                <input className="input-field" value={settings?.address?.country || 'India'} onChange={e => set('address.country', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Phone</label>
                <input className="input-field" value={settings?.contact?.phone || ''} onChange={e => set('contact.phone', e.target.value)} placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="label">Mobile</label>
                <input className="input-field" value={settings?.contact?.mobile || ''} onChange={e => set('contact.mobile', e.target.value)} placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input-field" value={settings?.contact?.email || ''} onChange={e => set('contact.email', e.target.value)} placeholder="info@khodalcreation.com" />
              </div>
              <div>
                <label className="label">Website</label>
                <input className="input-field" value={settings?.contact?.website || ''} onChange={e => set('contact.website', e.target.value)} placeholder="www.khodalcreation.com" />
              </div>
            </div>
          </div>

          {/* GST */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">GST Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings?.gst?.enabled || false}
                    onChange={e => set('gst.enabled', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable GST by default on new bills</span>
                </label>
              </div>
              <div>
                <label className="label">GST Number</label>
                <input
                  className="input-field font-mono"
                  value={settings?.gst?.number || ''}
                  onChange={e => set('gst.number', e.target.value.toUpperCase())}
                  placeholder="24XXXXX1234X1ZX"
                />
              </div>
              <div>
                <label className="label">Default GST Rate (%)</label>
                <input
                  type="number"
                  className="input-field"
                  value={settings?.gst?.defaultRate ?? 5}
                  onChange={e => set('gst.defaultRate', parseFloat(e.target.value))}
                  min="0" max="100"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── INVOICE SETTINGS ── */}
      {activeTab === 'invoice' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">Invoice Configuration</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Invoice Prefix</label>
                <input className="input-field" value={settings?.invoice?.prefix || 'BILL'} onChange={e => set('invoice.prefix', e.target.value)} placeholder="BILL" />
              </div>
              <div>
                <label className="label">Default Payment Terms (days)</label>
                <input type="number" className="input-field" value={settings?.payment?.defaultTermsDays || 30} onChange={e => set('payment.defaultTermsDays', parseInt(e.target.value))} min="0" />
              </div>
              <div>
                <label className="label">Reminder Days Before Due</label>
                <input type="number" className="input-field" value={settings?.payment?.reminderDaysBefore || 5} onChange={e => set('payment.reminderDaysBefore', parseInt(e.target.value))} min="1" />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings?.invoice?.showLogo !== false}
                    onChange={e => set('invoice.showLogo', e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Show logo in PDF invoices</span>
                </label>
              </div>
              <div className="col-span-2">
                <label className="label">Terms & Conditions (default)</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={settings?.invoice?.termsAndConditions || ''}
                  onChange={e => set('invoice.termsAndConditions', e.target.value)}
                  placeholder="Goods once sold will not be taken back. Payment due as per agreed terms."
                />
              </div>
              <div className="col-span-2">
                <label className="label">Invoice Footer Text</label>
                <input
                  className="input-field"
                  value={settings?.invoice?.footer || ''}
                  onChange={e => set('invoice.footer', e.target.value)}
                  placeholder={`Thank you for your business! | ${settings?.businessName || 'Khodal Creation'}`}
                />
              </div>
            </div>
          </div>

          {/* PDF Preview hint */}
          <div className="card bg-gray-50 border-gray-200">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-800">PDF Invoice Preview</p>
                <p className="text-xs text-gray-500 mt-1">
                  Your logo, business name, address, contact, and GST number will appear at the top of every generated PDF invoice.
                  The footer text and terms will appear at the bottom.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── NOTIFICATIONS ── */}
      {activeTab === 'notifications' && (
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Notification Settings</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.notifications?.emailEnabled || false}
                onChange={e => set('notifications.emailEnabled', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <div>
                <p className="text-sm font-medium text-gray-700">Email Notifications</p>
                <p className="text-xs text-gray-400">Receive email alerts for payment reminders</p>
              </div>
            </label>
            <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-700 space-y-1">
              <p className="font-semibold">Dashboard Reminders (Always Active)</p>
              <p className="text-xs">
                Payment reminders automatically appear in the bell icon{' '}
                <strong>{settings?.payment?.reminderDaysBefore || 5} days</strong> before the due date,
                calculated from bill date + party payment terms.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── SECURITY ── */}
      {activeTab === 'security' && (
        <div className="card max-w-md">
          <h3 className="font-semibold text-gray-800 mb-4">Change Password</h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input
                type="password"
                className="input-field"
                value={passwordForm.currentPassword}
                onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">New Password</label>
              <input
                type="password"
                className="input-field"
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input
                type="password"
                className="input-field"
                value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full justify-center">
              <Lock className="w-4 h-4" /> Change Password
            </button>
          </form>
        </div>
      )}

      {/* Footer copyright */}
      <p className="text-center text-gray-400 text-xs pt-4 border-t border-gray-100">
        © {CURRENT_YEAR} {settings?.businessName || 'Khodal Creation'}. All rights reserved.
      </p>
    </div>
  )
}
