import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getMe } from './store/slices/authSlice'
import Layout from './components/Layout/Layout'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import DesignsPage from './pages/DesignsPage'
import DesignDetailPage from './pages/DesignDetailPage'
import PartiesPage from './pages/PartiesPage'
import PartyDetailPage from './pages/PartyDetailPage'
import StockPage from './pages/StockPage'
import BillsPage from './pages/BillsPage'
import BillDetailPage from './pages/BillDetailPage'
import CreateBillPage from './pages/CreateBillPage'
import PaymentsPage from './pages/PaymentsPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(s => s.auth)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
  const dispatch = useDispatch()
  const { token } = useSelector(s => s.auth)

  useEffect(() => {
    if (token) dispatch(getMe())
  }, [token])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="designs" element={<DesignsPage />} />
        <Route path="designs/:id" element={<DesignDetailPage />} />
        <Route path="parties" element={<PartiesPage />} />
        <Route path="parties/:id" element={<PartyDetailPage />} />
        <Route path="stock" element={<StockPage />} />
        <Route path="bills" element={<BillsPage />} />
        <Route path="bills/create" element={<CreateBillPage />} />
        <Route path="bills/:id" element={<BillDetailPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
