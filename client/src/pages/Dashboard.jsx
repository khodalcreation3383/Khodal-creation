import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp, Users, Package, FileText, CreditCard,
  AlertCircle, IndianRupee, Clock, CheckCircle
} from 'lucide-react'
import { Bar, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import api from '../services/api'
import { useSettings } from '../context/SettingsContext'
import StatCard from '../components/UI/StatCard'
import { PageLoader } from '../components/UI/LoadingSpinner'
import { formatCurrency, formatDate } from '../utils/helpers'
import Badge from '../components/UI/Badge'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const CURRENT_YEAR = new Date().getFullYear()

export default function Dashboard() {
  const navigate = useNavigate()
  const { settings } = useSettings()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats')
      setStats(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <PageLoader />

  const billStatusMap = {}
  stats?.bills?.statusCounts?.forEach(s => { billStatusMap[s._id] = s.count })

  const monthlyData = {
    labels: stats?.monthlyRevenue?.map(m => MONTHS[m._id.month - 1]) || [],
    datasets: [
      {
        label: 'Revenue',
        data: stats?.monthlyRevenue?.map(m => m.revenue) || [],
        backgroundColor: 'rgba(17, 24, 39, 0.85)',
        borderRadius: 5,
      },
      {
        label: 'Collected',
        data: stats?.monthlyRevenue?.map(m => m.paid) || [],
        backgroundColor: 'rgba(17, 24, 39, 0.25)',
        borderRadius: 5,
      }
    ]
  }

  const paymentMethodData = {
    labels: stats?.paymentMethods?.map(p => ({ cash: 'Cash', bank_transfer: 'Bank', cheque: 'Cheque', upi: 'UPI', other: 'Other' }[p._id] || p._id)) || [],
    datasets: [{
      data: stats?.paymentMethods?.map(p => p.total) || [],
      backgroundColor: ['#111827', '#374151', '#6b7280', '#9ca3af', '#d1d5db'],
      borderWidth: 0,
    }]
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          {settings?.businessName || 'Khodal Creation'} — Business Overview {CURRENT_YEAR}
        </p>
      </div>

      {/* Reminders */}
      {stats?.reminders?.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
            <span className="font-semibold text-orange-800 text-sm">Payment Reminders ({stats.reminders.length})</span>
          </div>
          <div className="space-y-2">
            {stats.reminders.slice(0, 3).map(r => (
              <div key={r._id} className="flex items-start justify-between bg-white rounded-lg px-3 py-2 gap-2">
                <p className="text-sm text-gray-700 flex-1">{r.message}</p>
                {r.amount && <span className="text-sm font-semibold text-red-600 flex-shrink-0">{formatCurrency(r.amount)}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title="Total Revenue"    value={formatCurrency(stats?.revenue?.total)}         subtitle={`This month: ${formatCurrency(stats?.revenue?.month)}`} icon={IndianRupee} color="primary" />
        <StatCard title="Collected"        value={formatCurrency(stats?.payments?.totalPaid)}    subtitle="Total received"                                          icon={CheckCircle} color="green" />
        <StatCard title="Pending"          value={formatCurrency(stats?.payments?.totalPending)} subtitle={`${billStatusMap['overdue'] || 0} overdue`}              icon={Clock}       color="orange" />
        <StatCard title="Parties"          value={stats?.parties?.active || 0}                   subtitle={`${stats?.parties?.total || 0} total`}                   icon={Users}       color="blue" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title="Designs"        value={stats?.designs?.total || 0}                                                                                        icon={Package}     color="purple" />
        <StatCard title="Pending Bills"  value={billStatusMap['pending'] || 0}                                                                                     icon={FileText}    color="orange" />
        <StatCard title="Partial Bills"  value={billStatusMap['partial'] || 0}                                                                                     icon={CreditCard}  color="blue" />
        <StatCard title="Stock"          value={`${stats?.stock?.available || 0}`}               subtitle={`In: ${stats?.stock?.totalInward || 0} | Out: ${stats?.stock?.totalOutward || 0}`} icon={Package} color="green" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 card">
          <h3 className="font-semibold text-gray-800 mb-4 text-sm sm:text-base">Monthly Revenue vs Collections ({CURRENT_YEAR})</h3>
          {stats?.monthlyRevenue?.length > 0 ? (
            <Bar data={monthlyData} options={{
              responsive: true,
              plugins: { legend: { position: 'top', labels: { font: { size: 11 } } } },
              scales: { y: { beginAtZero: true, ticks: { callback: v => '₹' + (v/1000).toFixed(0) + 'k', font: { size: 10 } } } }
            }} />
          ) : <p className="text-gray-400 text-sm text-center py-8">No data available</p>}
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4 text-sm sm:text-base">Payment Methods</h3>
          {stats?.paymentMethods?.length > 0 ? (
            <Doughnut data={paymentMethodData} options={{
              responsive: true,
              plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } },
              cutout: '65%'
            }} />
          ) : <p className="text-gray-400 text-sm text-center py-8">No payments yet</p>}
        </div>
      </div>

      {/* Recent Bills & Top Parties */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Recent Bills</h3>
            <button onClick={() => navigate('/bills')} className="text-xs text-gray-500 hover:text-gray-900 hover:underline font-medium">View all</button>
          </div>
          <div className="space-y-2">
            {stats?.bills?.recent?.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No bills yet</p>}
            {stats?.bills?.recent?.map(bill => (
              <div key={bill._id} onClick={() => navigate(`/bills/${bill._id}`)}
                className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{bill.billNumber}</p>
                  <p className="text-xs text-gray-500 truncate">{bill.party?.name} • {formatDate(bill.billDate)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(bill.grandTotal)}</p>
                  <Badge status={bill.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Top Parties</h3>
            <button onClick={() => navigate('/parties')} className="text-xs text-gray-500 hover:text-gray-900 hover:underline font-medium">View all</button>
          </div>
          <div className="space-y-2">
            {stats?.topParties?.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No parties yet</p>}
            {stats?.topParties?.map((item, i) => (
              <div key={item._id} onClick={() => navigate(`/parties/${item._id}`)}
                className="flex items-center gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.party?.name}</p>
                  <p className="text-xs text-gray-500">{item.billCount} bills</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(item.totalBilled)}</p>
                  <p className="text-xs text-green-600">{formatCurrency(item.totalPaid)} paid</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
