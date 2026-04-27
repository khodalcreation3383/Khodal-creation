import { useState } from 'react'
import { Download, FileText, Package, BarChart3 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { formatCurrency, formatDate } from '../utils/helpers'
import Badge from '../components/UI/Badge'
import { Table, Thead, Th, Tbody, Tr, Td } from '../components/UI/Table'
import { PageLoader } from '../components/UI/LoadingSpinner'

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('sales')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)

  const fetchReport = async () => {
    setLoading(true)
    try {
      const endpoint = activeTab === 'sales' ? '/reports/sales' : '/reports/stock'
      const res = await api.get(endpoint, { params: { startDate: startDate || undefined, endDate: endDate || undefined } })
      setReportData(res.data.data)
    } catch { toast.error('Failed to generate report') }
    finally { setLoading(false) }
  }

  const exportCSV = async (type) => {
    setExporting(true)
    try {
      const res = await api.get('/reports/export', {
        params: { type, startDate: startDate || undefined, endDate: endDate || undefined },
        responseType: 'blob'
      })
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('CSV exported!')
    } catch { toast.error('Export failed') }
    finally { setExporting(false) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500 text-sm mt-1">Generate and export business reports</p>
      </div>

      {/* Tabs */}
      <div className="card p-0">
        <div className="flex border-b border-gray-100">
          {[
            { key: 'sales', label: 'Sales Report', icon: FileText },
            { key: 'stock', label: 'Stock Report', icon: Package }
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => { setActiveTab(key); setReportData(null) }}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${activeTab === key ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        <div className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="label">From Date</label>
              <input type="date" className="input-field w-40" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="label">To Date</label>
              <input type="date" className="input-field w-40" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            <button onClick={fetchReport} disabled={loading} className="btn-primary">
              <BarChart3 className="w-4 h-4" /> Generate Report
            </button>
            <button onClick={() => exportCSV(activeTab === 'sales' ? 'bills' : 'stock')} disabled={exporting} className="btn-secondary">
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button onClick={() => exportCSV('payments')} disabled={exporting} className="btn-secondary">
              <Download className="w-4 h-4" /> Export Payments CSV
            </button>
          </div>
        </div>
      </div>

      {loading && <PageLoader />}

      {reportData && !loading && activeTab === 'sales' && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card bg-gray-50 border-gray-200">
              <p className="text-xs text-gray-600 font-semibold uppercase">Total Bills</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.summary?.totalBills}</p>
            </div>
            <div className="card bg-green-50 border-green-100">
              <p className="text-xs text-green-700 font-semibold uppercase">Total Revenue</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(reportData.summary?.totalRevenue)}</p>
            </div>
            <div className="card bg-blue-50 border-blue-100">
              <p className="text-xs text-blue-700 font-semibold uppercase">Total Paid</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(reportData.summary?.totalPaid)}</p>
            </div>
            <div className="card bg-red-50 border-red-100">
              <p className="text-xs text-red-700 font-semibold uppercase">Total Pending</p>
              <p className="text-2xl font-bold text-red-900">{formatCurrency(reportData.summary?.totalPending)}</p>
            </div>
          </div>

          <div className="card p-0">
            <Table>
              <Thead><Tr><Th>Bill No.</Th><Th>Party</Th><Th>Date</Th><Th>Amount</Th><Th>Paid</Th><Th>Pending</Th><Th>Status</Th></Tr></Thead>
              <Tbody>
                {reportData.bills?.map(bill => (
                  <Tr key={bill._id}>
                    <Td><span className="font-mono text-sm text-gray-700">{bill.billNumber}</span></Td>
                    <Td>{bill.party?.name}</Td>
                    <Td>{formatDate(bill.billDate)}</Td>
                    <Td className="font-semibold">{formatCurrency(bill.grandTotal)}</Td>
                    <Td className="text-green-600">{formatCurrency(bill.paidAmount)}</Td>
                    <Td className={bill.pendingAmount > 0 ? 'text-red-600' : 'text-green-600'}>{formatCurrency(bill.pendingAmount)}</Td>
                    <Td><Badge status={bill.status} /></Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </div>
        </div>
      )}

      {reportData && !loading && activeTab === 'stock' && (
        <div className="card p-0">
          <Table>
            <Thead><Tr><Th>Design No.</Th><Th>Name</Th><Th>Fabric</Th><Th>Price/Pc</Th><Th>Inward</Th><Th>Outward</Th><Th>Available</Th><Th>Stock Value</Th></Tr></Thead>
            <Tbody>
              {reportData.map((item, i) => (
                <Tr key={i}>
                  <Td><span className="font-mono text-xs text-gray-600">{item.designNumber}</span></Td>
                  <Td className="font-medium">{item.name}</Td>
                  <Td>{item.fabricType}</Td>
                  <Td>{formatCurrency(item.pricePerPiece)}</Td>
                  <Td className="text-green-600 font-semibold">{item.totalInward}</Td>
                  <Td className="text-red-600 font-semibold">{item.totalOutward}</Td>
                  <Td><span className={`font-bold ${item.available > 0 ? 'text-gray-900' : 'text-red-500'}`}>{item.available}</span></Td>
                  <Td className="font-semibold">{formatCurrency(item.stockValue)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </div>
      )}
    </div>
  )
}
