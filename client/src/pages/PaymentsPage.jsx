import { useState, useEffect, useCallback } from 'react'
import { Filter, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { Table, Thead, Th, Tbody, Tr, Td } from '../components/UI/Table'
import Pagination from '../components/UI/Pagination'
import { PageLoader } from '../components/UI/LoadingSpinner'
import { formatCurrency, formatDate, paymentMethodLabel } from '../utils/helpers'
import Badge from '../components/UI/Badge'
import StatCard from '../components/UI/StatCard'

export default function PaymentsPage() {
  const [payments, setPayments] = useState([])
  const [pagination, setPagination] = useState({})
  const [summary, setSummary] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [methodFilter, setMethodFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    try {
      const [pRes, sRes] = await Promise.all([
        api.get('/payments', { params: { page, limit: 20, method: methodFilter || undefined, startDate: startDate || undefined, endDate: endDate || undefined } }),
        api.get('/payments/summary', { params: { startDate: startDate || undefined, endDate: endDate || undefined } })
      ])
      setPayments(pRes.data.data)
      setPagination(pRes.data.pagination)
      setSummary(sRes.data.data)
    } catch { toast.error('Failed to load payments') }
    finally { setLoading(false) }
  }, [page, methodFilter, startDate, endDate])

  useEffect(() => { fetchPayments() }, [fetchPayments])

  const updateChequeStatus = async (paymentId, status) => {
    try {
      await api.patch(`/payments/${paymentId}/cheque-status`, { status })
      toast.success('Cheque status updated')
      fetchPayments()
    } catch { toast.error('Failed to update') }
  }

  const totalAmount = summary?.total || 0
  const methodSummary = summary?.summary || []

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="page-title">Payments</h1>
        <p className="page-subtitle">Track all payment transactions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title="Total Received" value={formatCurrency(totalAmount)} icon={CreditCard} color="green" />
        {methodSummary.slice(0, 3).map(m => (
          <StatCard key={m._id} title={paymentMethodLabel[m._id] || m._id} value={formatCurrency(m.totalAmount)} subtitle={`${m.count} txns`} color="primary" />
        ))}
      </div>

      {/* Filters */}
      <div className="card p-3 sm:p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <select className="input-field w-36 sm:w-40" value={methodFilter} onChange={e => setMethodFilter(e.target.value)}>
            <option value="">All Methods</option>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cheque">Cheque</option>
            <option value="upi">UPI</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 whitespace-nowrap">From:</label>
          <input type="date" className="input-field w-36 sm:w-40" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 whitespace-nowrap">To:</label>
          <input type="date" className="input-field w-36 sm:w-40" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        {(methodFilter || startDate || endDate) && (
          <button onClick={() => { setMethodFilter(''); setStartDate(''); setEndDate('') }} className="text-sm text-red-500 hover:underline">Clear</button>
        )}
      </div>

      {loading ? <PageLoader /> : (
        <div className="card p-0">
          {/* Mobile card view */}
          <div className="sm:hidden divide-y divide-gray-100">
            {payments.length === 0 && <p className="text-center text-gray-400 py-8 text-sm">No payments found</p>}
            {payments.map(pmt => (
              <div key={pmt._id} className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{pmt.party?.name}</p>
                    <p className="text-xs text-gray-400">{formatDate(pmt.paymentDate)}</p>
                    <p className="text-xs font-mono text-gray-500">{pmt.bill?.billNumber || '-'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-green-700">{formatCurrency(pmt.amount)}</p>
                    <Badge status={pmt.method} />
                  </div>
                </div>
                {pmt.method === 'cheque' && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">Cheque status:</span>
                    <select value={pmt.chequeStatus || 'pending'} onChange={e => updateChequeStatus(pmt._id, e.target.value)}
                      className="text-xs border border-gray-200 rounded px-2 py-1">
                      <option value="pending">Pending</option>
                      <option value="cleared">Cleared</option>
                      <option value="bounced">Bounced</option>
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <Thead>
                <Tr>
                  <Th width="110px">Date</Th>
                  <Th width="180px">Party</Th>
                  <Th width="120px">Bill No.</Th>
                  <Th width="110px" align="center">Method</Th>
                  <Th width="120px" align="right">Amount</Th>
                  <Th width="140px">Reference</Th>
                  <Th width="130px" align="center">Cheque Status</Th>
                  <Th>Notes</Th>
                </Tr>
              </Thead>
              <Tbody>
                {payments.length === 0 && <Tr><Td className="text-center text-gray-400 py-10" colSpan={8}>No payments found</Td></Tr>}
                {payments.map(pmt => (
                  <Tr key={pmt._id}>
                    <Td><span className="text-sm text-gray-700 whitespace-nowrap">{formatDate(pmt.paymentDate)}</span></Td>
                    <Td>
                      <p className="font-medium text-gray-900">{pmt.party?.name}</p>
                      <p className="text-xs text-gray-400">{pmt.party?.mobile}</p>
                    </Td>
                    <Td><span className="font-mono text-xs text-gray-700 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{pmt.bill?.billNumber || '—'}</span></Td>
                    <Td align="center"><Badge status={pmt.method} /></Td>
                    <Td align="right"><span className="font-bold text-green-700">{formatCurrency(pmt.amount)}</span></Td>
                    <Td><span className="text-xs font-mono text-gray-600">{pmt.chequeNumber || pmt.transactionId || pmt.upiRef || '—'}</span></Td>
                    <Td align="center">
                      {pmt.method === 'cheque' ? (
                        <select
                          value={pmt.chequeStatus || 'pending'}
                          onChange={e => updateChequeStatus(pmt._id, e.target.value)}
                          className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
                          onClick={e => e.stopPropagation()}
                        >
                          <option value="pending">Pending</option>
                          <option value="cleared">Cleared</option>
                          <option value="bounced">Bounced</option>
                        </select>
                      ) : <span className="text-gray-300">—</span>}
                    </Td>
                    <Td><span className="text-xs text-gray-500">{pmt.notes || '—'}</span></Td>
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
