import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings')
      setSettings(res.data.data)
    } catch {
      // fallback defaults
      setSettings({ businessName: 'Khodal Creation', logo: null })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const refreshSettings = () => fetchSettings()

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
