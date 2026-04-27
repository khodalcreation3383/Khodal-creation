import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Plus, CreditCard, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { PageLoader } from '../components/UI/LoadingSpinner'
import { formatCurrency, formatDate, paymentMethodLabel } from '../utils/helpers'
import Badge from '../components/UI/Badge'
import Modal from '../components/UI/Modal'
import { Table, Thead, Th, Tbody, Tr, Td } from '../components/UI/Table'
import PaymentMethodFields from '../components/UI/PaymentMethodFields'

function AddPaymentForm({ bill, onSave, onClose }) {
  const [form, setForm] = useState({
    amount: bill.pendingAmount || '',
    method: 'cash',
    transactionId: '',
    bankName: '',
    chequeNumber: '',
    chequeDate: '',
    chequeBank: '',
    upiId: '',
    upiRef: '',
    otherMethodName: '',
    otherReference: '',
    notes: '',
    isAdvance: false,
    advancePercentage: ''
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.amount || parseFloat(form.amount) <= 0) return toast.error('Enter valid amount')
    if (form.method === 'other' && !form.otherMethodName?.trim()) return toast.error('Please specify the payment method')
    setSaving(true)
    try {
      const payload = {
        billId: bill._id,
        amount: parseFloat(form.amount),
        method: form.method,
        transactionId: form.method === 'other' ? (form.otherReference || form.otherMethodName) : form.transactionId,
        bankName: form.bankName,
        chequeNumber: form.chequeNumber,
        chequeDate: form.chequeDate,
        chequeBank: form.chequeBank,
        upiId: form.upiId,
        upiRef: form.upiRef,
        notes: form.method === 'other'
          ? `${form.otherMethodName}${form.otherReference ? ' - ' + form.otherReference : ''}${form.notes ? ' | ' + form.notes : ''}`
          : form.notes,
        isAdvance: form.isAdvance,
        advancePercentage: form.advancePercentage
      }
      await api.post('/payments', payload)
      toast.success('Payment recorded!')
      onSave()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment')
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm">
        <p className="font-semibold text-gray-900">Bill: {bill.billNumber}</p>
        <p className="text-gray-500 mt-0.5">Pending: <span className="font-bold text-gray-900">{formatCurrency(bill.pendingAmount)}</span></p>
      </div>

      <PaymentMethodFields form={form} set={set} />

      <div className="flex items-center gap-3 pt-1">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isAdvance} onChange={e => set('isAdvance', e.target.checked)} className="w-4 h-4 rounded border-gray-300" />
          <span className="text-sm text-gray-700 font-medium">Advance payment</span>
        </label>
        {form.isAdvance && (
          <div className="flex items-center gap-2">
            <input type="number" className="input-field w-24" value={form.advancePercentage} onChange={e => set('advancePercentage', e.target.value)} placeholder="%" min="0" max="100" />
            <span className="text-xs text-gray-400">% of total</span>
          </div>
        )}
      </div>

      <div>
        <label className="label">Notes</label>
        <input className="input-field" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Optional notes" />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
          {saving ? 'Recording...' : 'Record Payment'}
        </button>
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
      </div>
    </form>
  )
}

export default function BillDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const fetchBill = async () => {
    try {
      const res = await api.get(`/bills/${id}`)
      setData(res.data.data)
    } catch { navigate('/bills') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchBill() }, [id])

  const handleDownloadPDF = async () => {
    setDownloading(true)
    try {
      const res = await api.get(`/bills/${id}/pdf`, { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `Invoice-${data.bill.billNumber}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('PDF downloaded!')
    } catch { toast.error('Failed to download PDF') }
    finally { setDownloading(false) }
  }

  if (loading) return <PageLoader />
  if (!data) return null

  const { bill, payments } = data

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => navigate('/bills')} className="btn-secondary flex-shrink-0"><ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back</span></button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{bill.billNumber}</h1>
          <p className="text-gray-500 text-sm truncate">{bill.party?.name} • {formatDate(bill.billDate)}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {bill.status !== 'paid' && bill.status !== 'cancelled' && (
            <button onClick={() => setShowPaymentModal(true)} className="btn-primary text-sm">
              <CreditCard className="w-4 h-4" /> <span className="hidden sm:inline">Add Payment</span>
            </button>
          )}
          <button onClick={handleDownloadPDF} disabled={downloading} className="btn-secondary text-sm">
            {downloading ? <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /> : <Download className="w-4 h-4" />}
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>
      </div>

      {/* Bill Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="card p-4">
          <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Bill To</p>
          <p className="font-bold text-gray-900">{bill.party?.name}</p>
          <p className="text-sm text-gray-600">{bill.party?.mobile}</p>
          {bill.party?.gstNumber && <p className="text-xs text-gray-500 font-mono mt-1">GST: {bill.party.gstNumber}</p>}
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Bill Details</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Date</span><span>{formatDate(bill.billDate)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Due</span><span className={bill.status === 'overdue' ? 'text-red-600 font-medium' : ''}>{formatDate(bill.dueDate)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Status</span><Badge status={bill.status} /></div>
          </div>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Payment</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-bold">{formatCurrency(bill.grandTotal)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Paid</span><span className="text-green-600 font-semibold">{formatCurrency(bill.paidAmount)}</span></div>
            <div className="flex justify-between border-t border-gray-100 pt-1"><span className="font-semibold">Pending</span><span className={`font-bold ${bill.pendingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(bill.pendingAmount)}</span></div>
          </div>
        </div>
      </div>

      {/* Commission */}
      {bill.commissionAmount > 0 && (
        <div className="card p-4 bg-yellow-50 border-yellow-200">
          <p className="text-sm font-semibold text-yellow-800 mb-1">Commission (Admin Only - Not in PDF)</p>
          <div className="flex flex-wrap gap-4 text-sm text-yellow-700">
            <span>Rate: {bill.commissionRate}{bill.commissionType === 'percentage' ? '%' : ' ₹'}</span>
            <span>Amount: <strong>{formatCurrency(bill.commissionAmount)}</strong></span>
            {bill.commissionNote && <span>Note: {bill.commissionNote}</span>}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="card p-0">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Bill Items</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <Thead>
              <Tr><Th>#</Th><Th>Design</Th><Th>Fabric</Th><Th>Color</Th><Th>Qty</Th><Th>Price/Pc</Th>{bill.gstEnabled && <Th>GST</Th>}<Th>Total</Th></Tr>
            </Thead>
            <Tbody>
              {bill.items?.map((item, i) => (
                <Tr key={i}>
                  <Td>{i + 1}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      {item.designImage && <img src={item.designImage} alt="" className="w-8 h-8 sm:w-10 sm:h-10 rounded object-cover flex-shrink-0" />}
                      <div>
                        <p className="text-xs font-mono text-gray-500">{item.designNumber}</p>
                        <p className="text-sm font-medium whitespace-nowrap">{item.designName}</p>
                      </div>
                    </div>
                  </Td>
                  <Td className="whitespace-nowrap">{item.fabricType || '-'}</Td>
                  <Td className="whitespace-nowrap">{item.color || '-'}</Td>
                  <Td className="font-semibold">{item.quantity}</Td>
                  <Td className="whitespace-nowrap">{formatCurrency(item.pricePerPiece)}</Td>
                  {bill.gstEnabled && <Td>{item.gstRate || 0}%</Td>}
                  <Td className="font-bold whitespace-nowrap">{formatCurrency(item.totalAmount + (bill.gstEnabled ? item.gstAmount : 0))}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </div>
        <div className="p-4 border-t border-gray-100">
          <div className="ml-auto w-full sm:w-64 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal</span><span>{formatCurrency(bill.subtotal)}</span></div>
            {bill.gstEnabled && <div className="flex justify-between text-sm"><span className="text-gray-600">GST</span><span>{formatCurrency(bill.totalGst)}</span></div>}
            <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-2"><span>Grand Total</span><span className="text-gray-900">{formatCurrency(bill.grandTotal)}</span></div>
          </div>
        </div>
      </div>

      {/* Payments */}
      <div className="card p-0">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Payment History</h3>
          {bill.status !== 'paid' && bill.status !== 'cancelled' && (
            <button onClick={() => setShowPaymentModal(true)} className="btn-primary text-sm py-1.5">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <Table>
            <Thead><Tr><Th>Date</Th><Th>Method</Th><Th>Amount</Th><Th>Reference</Th><Th>Notes</Th></Tr></Thead>
            <Tbody>
              {payments.length === 0 && <Tr><Td className="text-center text-gray-400 py-6" colSpan={5}>No payments recorded</Td></Tr>}
              {payments.map(pmt => (
                <Tr key={pmt._id}>
                  <Td className="whitespace-nowrap">{formatDate(pmt.paymentDate)}</Td>
                  <Td><Badge status={pmt.method} /></Td>
                  <Td className="font-bold text-green-700 whitespace-nowrap">{formatCurrency(pmt.amount)}</Td>
                  <Td className="text-xs font-mono">{pmt.chequeNumber || pmt.transactionId || pmt.upiRef || '-'}</Td>
                  <Td className="text-xs text-gray-500">{pmt.notes || '-'}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </div>
      </div>

      <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Record Payment" size="md">
        <AddPaymentForm bill={bill} onSave={() => { setShowPaymentModal(false); fetchBill() }} onClose={() => setShowPaymentModal(false)} />
      </Modal>
    </div>
  )
}
