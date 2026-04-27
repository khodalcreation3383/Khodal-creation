import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, MapPin, FileText, CreditCard, ExternalLink } from 'lucide-react'
import api from '../services/api'
import { PageLoader } from '../components/UI/LoadingSpinner'
import { formatCurrency, formatDate } from '../utils/helpers'
import Badge from '../components/UI/Badge'
import { Table, Thead, Th, Tbody, Tr, Td } from '../components/UI/Table'
import StatCard from '../components/UI/StatCard'

export default function PartyDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('bills')

  useEffect(() => {
    api.get(`/parties/${id}`)
      .then(res => setData(res.data.data))
      .catch(() => navigate('/parties'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <PageLoader />
  if (!data) return null

  const { party, bills, payments, summary } = data
  const addr = party.address || {}
  const addrStr = [addr.street, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/parties')} className="btn-secondary"><ArrowLeft className="w-4 h-4" /> Back</button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{party.name}</h1>
          <p className="text-gray-500 text-sm">Party Details & Ledger</p>
        </div>
        <button onClick={() => navigate('/bills/create', { state: { partyId: party._id } })} className="btn-primary ml-auto">
          <FileText className="w-4 h-4" /> Create Bill
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Party Info */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-800 border-b border-gray-100 pb-2">Party Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-gray-400" /><span>{party.mobile}</span></div>
            {party.alternativeMobile && <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-gray-400" /><span>{party.alternativeMobile}</span></div>}
            {addrStr && <div className="flex items-start gap-2 text-sm"><MapPin className="w-4 h-4 text-gray-400 mt-0.5" /><span>{addrStr}</span></div>}
            {party.mapLocation?.mapUrl && (
              <a href={party.mapLocation.mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 hover:underline">
                <ExternalLink className="w-4 h-4" /> View on Map
              </a>
            )}
            {party.gstNumber && <div className="text-sm"><span className="text-gray-500">GST: </span><span className="font-mono font-medium">{party.gstNumber}</span></div>}
            {party.referredBy && <div className="text-sm"><span className="text-gray-500">Referred by: </span><span className="font-medium">{party.referredBy}</span></div>}
            <div className="text-sm"><span className="text-gray-500">Payment Terms: </span><span className="font-medium">{party.paymentTermsDays} days</span></div>
            {party.commissionRate > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-yellow-800">Commission (Admin Only)</p>
                <p className="text-sm text-yellow-700">{party.commissionRate}{party.commissionType === 'percentage' ? '%' : ' ₹'} per bill</p>
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <StatCard title="Total Billed" value={formatCurrency(summary.totalBilled)} icon={FileText} color="primary" />
          <StatCard title="Total Paid" value={formatCurrency(summary.totalPaid)} icon={CreditCard} color="green" />
          <StatCard title="Pending Amount" value={formatCurrency(summary.totalPending)} color={summary.totalPending > 0 ? 'orange' : 'green'} />
          <div className="card">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Bill Status</p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm"><span className="text-gray-600">Pending</span><span className="font-semibold text-yellow-600">{summary.pendingBills}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">Partial</span><span className="font-semibold text-orange-600">{summary.partialBills}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">Paid</span><span className="font-semibold text-green-600">{summary.paidBills}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">Overdue</span><span className="font-semibold text-red-600">{summary.overdueBills}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card p-0">
        <div className="flex border-b border-gray-100">
          {['bills', 'payments'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              {tab} ({tab === 'bills' ? bills.length : payments.length})
            </button>
          ))}
        </div>

        {activeTab === 'bills' && (
          <Table>
            <Thead><Tr><Th>Bill No.</Th><Th>Date</Th><Th>Due Date</Th><Th>Amount</Th><Th>Paid</Th><Th>Pending</Th><Th>Status</Th><Th>Action</Th></Tr></Thead>
            <Tbody>
              {bills.length === 0 && <Tr><Td className="text-center text-gray-400 py-8" colSpan={8}>No bills</Td></Tr>}
              {bills.map(bill => (
                <Tr key={bill._id}>
                  <Td><span className="font-mono text-sm font-medium text-gray-900">{bill.billNumber}</span></Td>
                  <Td>{formatDate(bill.billDate)}</Td>
                  <Td>{formatDate(bill.dueDate)}</Td>
                  <Td className="font-semibold">{formatCurrency(bill.grandTotal)}</Td>
                  <Td className="text-green-600">{formatCurrency(bill.paidAmount)}</Td>
                  <Td className={bill.pendingAmount > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>{formatCurrency(bill.pendingAmount)}</Td>
                  <Td><Badge status={bill.status} /></Td>
                  <Td><button onClick={() => navigate(`/bills/${bill._id}`)} className="text-xs text-gray-600 hover:text-gray-900 hover:underline font-medium">View</button></Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}

        {activeTab === 'payments' && (
          <Table>
            <Thead><Tr><Th>Date</Th><Th>Bill No.</Th><Th>Method</Th><Th>Amount</Th><Th>Reference</Th></Tr></Thead>
            <Tbody>
              {payments.length === 0 && <Tr><Td className="text-center text-gray-400 py-8" colSpan={5}>No payments</Td></Tr>}
              {payments.map(pmt => (
                <Tr key={pmt._id}>
                  <Td>{formatDate(pmt.paymentDate)}</Td>
                  <Td><span className="font-mono text-xs">{pmt.bill?.billNumber || '-'}</span></Td>
                  <Td><Badge status={pmt.method} /></Td>
                  <Td className="font-semibold text-green-700">{formatCurrency(pmt.amount)}</Td>
                  <Td className="text-xs text-gray-500">{pmt.chequeNumber || pmt.transactionId || pmt.upiRef || '-'}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </div>
    </div>
  )
}
