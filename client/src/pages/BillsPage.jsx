import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Download, Eye, XCircle, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { Table, Thead, Th, Tbody, Tr, Td } from '../components/UI/Table'
import Pagination from '../components/UI/Pagination'
import SearchFilter from '../components/UI/SearchFilter'
import { PageLoader } from '../components/UI/LoadingSpinner'
import { formatCurrency, formatDate } from '../utils/helpers'
import Badge from '../components/UI/Badge'

export default function BillsPage() {
  const navigate = useNavigate()
  const [bills, setBills] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [downloading, setDownloading] = useState(null)

  const fetchBills = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/bills', { params: { page, limit: 10, search, status: statusFilter || undefined } })
      setBills(res.data.data)
      setPagination(res.data.pagination)
    } catch { toast.error('Failed to load bills') }
    finally { setLoading(false) }
  }, [page, search, statusFilter])

  useEffect(() => { fetchBills() }, [fetchBills])
  useEffect(() => { setPage(1) }, [search, statusFilter])

  const handleDownloadPDF = async (e, billId, billNumber) => {
    e.stopPropagation()
    setDownloading(billId)
    try {
      const res = await api.get(`/bills/${billId}/pdf`, { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `Invoice-${billNumber}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('PDF downloaded!')
    } catch { toast.error('Failed to download PDF') }
    finally { setDownloading(null) }
  }

  const handleCancel = async (e, billId) => {
    e.stopPropagation()
    if (!confirm('Cancel this bill?')) return
    try {
      await api.patch(`/bills/${billId}/cancel`)
      toast.success('Bill cancelled')
      fetchBills()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to cancel') }
  }

  const statusOptions = ['', 'pending', 'partial', 'paid', 'overdue', 'cancelled']

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Bills & Invoices</h1>
          <p className="page-subtitle">Manage all your invoices and billing</p>
        </div>
        <button onClick={() => navigate('/bills/create')} className="btn-primary flex-shrink-0">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Create Bill</span>
        </button>
      </div>

      <div className="card p-3 sm:p-4 flex flex-wrap gap-3">
        <SearchFilter value={search} onChange={setSearch} placeholder="Search bill number..." className="flex-1 min-w-36" />
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <select className="input-field w-32 sm:w-40" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            {statusOptions.map(s => <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Status'}</option>)}
          </select>
        </div>
      </div>

      {loading ? <PageLoader /> : (
        <div className="card p-0">
          {/* Mobile card view */}
          <div className="sm:hidden divide-y divide-gray-100">
            {bills.length === 0 && <p className="text-center text-gray-400 py-8 text-sm">No bills found</p>}
            {bills.map(bill => (
              <div key={bill._id} onClick={() => navigate(`/bills/${bill._id}`)} className="p-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="font-mono font-semibold text-gray-900 text-sm">{bill.billNumber}</p>
                    <p className="text-xs text-gray-500 truncate">{bill.party?.name}</p>
                    <p className="text-xs text-gray-400">{formatDate(bill.billDate)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-gray-900">{formatCurrency(bill.grandTotal)}</p>
                    <Badge status={bill.status} />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-green-600">Paid: {formatCurrency(bill.paidAmount)}</span>
                  <span className={bill.pendingAmount > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                    Pending: {formatCurrency(bill.pendingAmount)}
                  </span>
                </div>
                <div className="flex gap-2 mt-3" onClick={e => e.stopPropagation()}>
                  <button onClick={e => handleDownloadPDF(e, bill._id, bill.billNumber)} disabled={downloading === bill._id}
                    className="btn-secondary text-xs py-1 px-2 flex-1 justify-center">
                    {downloading === bill._id ? <span className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    PDF
                  </button>
                  {bill.status !== 'cancelled' && bill.status !== 'paid' && (
                    <button onClick={e => handleCancel(e, bill._id)} className="btn-secondary text-xs py-1 px-2 text-red-500 justify-center">
                      <XCircle className="w-3.5 h-3.5" /> Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <Thead>
                <Tr>
                  <Th>Bill No.</Th><Th>Party</Th><Th>Bill Date</Th><Th>Due Date</Th>
                  <Th>Amount</Th><Th>Paid</Th><Th>Pending</Th><Th>Status</Th><Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {bills.length === 0 && <Tr><Td className="text-center text-gray-400 py-8" colSpan={9}>No bills found</Td></Tr>}
                {bills.map(bill => (
                  <Tr key={bill._id} onClick={() => navigate(`/bills/${bill._id}`)}>
                    <Td><span className="font-mono text-sm font-semibold text-gray-900">{bill.billNumber}</span></Td>
                    <Td>
                      <div>
                        <p className="font-medium text-gray-900">{bill.party?.name}</p>
                        <p className="text-xs text-gray-400">{bill.party?.mobile}</p>
                      </div>
                    </Td>
                    <Td>{formatDate(bill.billDate)}</Td>
                    <Td><span className={bill.status === 'overdue' ? 'text-red-600 font-medium' : ''}>{formatDate(bill.dueDate)}</span></Td>
                    <Td className="font-semibold">{formatCurrency(bill.grandTotal)}</Td>
                    <Td className="text-green-600">{formatCurrency(bill.paidAmount)}</Td>
                    <Td className={bill.pendingAmount > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>{formatCurrency(bill.pendingAmount)}</Td>
                    <Td><Badge status={bill.status} /></Td>
                    <Td>
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <button onClick={() => navigate(`/bills/${bill._id}`)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Eye className="w-4 h-4" /></button>
                        <button onClick={e => handleDownloadPDF(e, bill._id, bill.billNumber)} disabled={downloading === bill._id} className="p-1.5 rounded hover:bg-blue-50 text-blue-500">
                          {downloading === bill._id ? <span className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin block" /> : <Download className="w-4 h-4" />}
                        </button>
                        {bill.status !== 'cancelled' && bill.status !== 'paid' && (
                          <button onClick={e => handleCancel(e, bill._id)} className="p-1.5 rounded hover:bg-red-50 text-red-400"><XCircle className="w-4 h-4" /></button>
                        )}
                      </div>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
