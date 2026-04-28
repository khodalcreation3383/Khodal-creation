import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Calculator } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { formatCurrency } from '../utils/helpers'

export default function CreateBillPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const preselectedPartyId = location.state?.partyId

  const [parties, setParties] = useState([])
  const [designs, setDesigns] = useState([])
  const [settings, setSettings] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  const [form, setForm] = useState({
    partyId: preselectedPartyId || '',
    billDate: new Date().toISOString().split('T')[0],
    gstEnabled: false,
    notes: '',
    termsAndConditions: '',
    commissionRate: '',
    commissionType: 'percentage',
    commissionNote: ''
  })

  const [items, setItems] = useState([{
    designId: '', fabricType: '', color: '', quantity: 1, pricePerPiece: 0, gstRate: 0
  }])

  const [selectedParty, setSelectedParty] = useState(null)

  useEffect(() => {
    setLoadingData(true)
    Promise.all([
      api.get('/parties', { params: { limit: 200, isActive: true } }),
      api.get('/designs', { params: { limit: 200, isActive: true } }),
      api.get('/settings')
    ]).then(([p, d, s]) => {
      setParties(p.data.data)
      setDesigns(d.data.data)
      setSettings(s.data.data)
      if (s.data.data?.invoice?.termsAndConditions) {
        setForm(prev => ({ ...prev, termsAndConditions: s.data.data.invoice.termsAndConditions }))
      }
    }).finally(() => setLoadingData(false))
  }, [])

  useEffect(() => {
    if (form.partyId) {
      const party = parties.find(p => p._id === form.partyId)
      setSelectedParty(party)
      if (party?.commissionRate) {
        setForm(prev => ({ ...prev, commissionRate: party.commissionRate, commissionType: party.commissionType }))
      }
    }
  }, [form.partyId, parties])

  const setItem = (idx, key, value) => {
    setItems(prev => {
      const updated = [...prev]
      updated[idx] = { ...updated[idx], [key]: value }
      if (key === 'designId') {
        const design = designs.find(d => d._id === value)
        if (design) {
          updated[idx].pricePerPiece = design.pricePerPiece
          updated[idx].fabricType = design.fabricType
          updated[idx].gstRate = design.gstRate || 0
        }
      }
      return updated
    })
  }

  const addItem = () => setItems(prev => [...prev, { designId: '', fabricType: '', color: '', quantity: 1, pricePerPiece: 0, gstRate: 0 }])
  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx))

  const calcItemTotal = (item) => (item.quantity || 0) * (item.pricePerPiece || 0)
  const calcItemGst = (item) => form.gstEnabled ? (calcItemTotal(item) * (item.gstRate || 0)) / 100 : 0
  const subtotal = items.reduce((s, i) => s + calcItemTotal(i), 0)
  const totalGst = items.reduce((s, i) => s + calcItemGst(i), 0)
  const grandTotal = subtotal + totalGst
  const commissionAmount = form.commissionRate
    ? form.commissionType === 'percentage'
      ? (grandTotal * parseFloat(form.commissionRate)) / 100
      : parseFloat(form.commissionRate)
    : 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.partyId) return toast.error('Please select a party')
    if (items.some(i => !i.designId || !i.quantity || !i.pricePerPiece)) return toast.error('Please fill all item details')
    setSaving(true)
    try {
      const res = await api.post('/bills', {
        ...form,
        items: items.map(i => ({ ...i, quantity: parseInt(i.quantity), pricePerPiece: parseFloat(i.pricePerPiece), gstRate: parseFloat(i.gstRate) || 0 })),
        commissionRate: parseFloat(form.commissionRate) || 0
      })
      toast.success('Bill created successfully!')
      navigate(`/bills/${res.data.data._id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create bill')
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/bills')} className="btn-secondary flex-shrink-0"><ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back</span></button>
        <div>
          <h1 className="page-title">Create New Bill</h1>
          <p className="page-subtitle">Generate a professional invoice</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Bill Details */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Bill Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="label">Party *</label>
              <div className="relative">
                <select
                  className="input-field"
                  value={form.partyId}
                  onChange={e => setForm(p => ({ ...p, partyId: e.target.value }))}
                  required
                  disabled={loadingData}
                >
                  <option value="">
                    {loadingData ? 'Loading parties...' : parties.length === 0 ? 'No parties found' : 'Select party'}
                  </option>
                  {parties.map(p => (
                    <option key={p._id} value={p._id}>{p.name} — {p.mobile}</option>
                  ))}
                </select>
                {loadingData && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin block" />
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="label">Bill Date</label>
              <input type="date" className="input-field" value={form.billDate} onChange={e => setForm(p => ({ ...p, billDate: e.target.value }))} />
            </div>
            <div className="flex items-center gap-3 sm:pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.gstEnabled} onChange={e => setForm(p => ({ ...p, gstEnabled: e.target.checked }))} className="w-4 h-4 rounded border-gray-300" />
                <span className="text-sm font-medium text-gray-700">Enable GST</span>
              </label>
            </div>
          </div>

          {selectedParty && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm border border-gray-200">
              <p className="font-medium text-gray-900">{selectedParty.name}</p>
              <p className="text-gray-500">{selectedParty.mobile} • {selectedParty.paymentTermsDays} days terms</p>
              {selectedParty.gstNumber && <p className="text-gray-500 font-mono text-xs">GST: {selectedParty.gstNumber}</p>}
            </div>
          )}
        </div>

        {/* Items */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Bill Items</h3>
            <button type="button" onClick={addItem} className="btn-secondary text-sm">
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => {
              const design = designs.find(d => d._id === item.designId)
              return (
                <div key={idx} className="border border-gray-200 rounded-xl p-3 sm:p-4 bg-gray-50">
                  {/* Design selector + image */}
                  <div className="flex items-start gap-3 mb-3">
                    {design?.image && (
                      <img src={design.image} alt="" className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <label className="label">Design *</label>
                      <div className="relative">
                        <select
                          className="input-field"
                          value={item.designId}
                          onChange={e => setItem(idx, 'designId', e.target.value)}
                          required
                          disabled={loadingData}
                        >
                          <option value="">
                            {loadingData ? 'Loading designs...' : designs.length === 0 ? 'No designs found' : 'Select design'}
                          </option>
                          {designs.map(d => (
                            <option key={d._id} value={d._id}>{d.designNumber} — {d.name} ({d.fabricType})</option>
                          ))}
                        </select>
                        {loadingData && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin block" />
                          </div>
                        )}
                      </div>
                    </div>
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(idx)} className="p-1.5 rounded hover:bg-red-50 text-red-400 flex-shrink-0 mt-5">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Item fields grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <div>
                      <label className="label">Fabric</label>
                      <input className="input-field" value={item.fabricType} onChange={e => setItem(idx, 'fabricType', e.target.value)} placeholder="Fabric" />
                    </div>
                    <div>
                      <label className="label">Color</label>
                      <input className="input-field" value={item.color} onChange={e => setItem(idx, 'color', e.target.value)} placeholder="Color" />
                    </div>
                    <div>
                      <label className="label">Qty *</label>
                      <input type="number" className="input-field" value={item.quantity} onChange={e => setItem(idx, 'quantity', e.target.value)} min="1" required />
                    </div>
                    <div>
                      <label className="label">Price/Pc *</label>
                      <input type="number" className="input-field" value={item.pricePerPiece} onChange={e => setItem(idx, 'pricePerPiece', e.target.value)} min="0" step="0.01" required />
                    </div>
                    {form.gstEnabled && (
                      <div>
                        <label className="label">GST %</label>
                        <input type="number" className="input-field" value={item.gstRate} onChange={e => setItem(idx, 'gstRate', e.target.value)} min="0" max="100" />
                      </div>
                    )}
                    <div className="flex items-end">
                      <div className="w-full p-2 bg-white rounded-lg border border-gray-200 text-center">
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="font-bold text-gray-900 text-sm">{formatCurrency(calcItemTotal(item))}</p>
                        {form.gstEnabled && item.gstRate > 0 && (
                          <p className="text-xs text-gray-400">+{formatCurrency(calcItemGst(item))}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Commission + Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-3">Commission <span className="text-xs font-normal text-gray-400">(Admin Only)</span></h3>
            <p className="text-xs text-orange-600 bg-orange-50 rounded-lg p-2 mb-3">⚠️ Not shown in PDF invoice</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Rate</label>
                <input type="number" className="input-field" value={form.commissionRate} onChange={e => setForm(p => ({ ...p, commissionRate: e.target.value }))} min="0" step="0.01" placeholder="0" />
              </div>
              <div>
                <label className="label">Type</label>
                <select className="input-field" value={form.commissionType} onChange={e => setForm(p => ({ ...p, commissionType: e.target.value }))}>
                  <option value="percentage">% Percentage</option>
                  <option value="fixed">₹ Fixed</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="label">Note</label>
                <input className="input-field" value={form.commissionNote} onChange={e => setForm(p => ({ ...p, commissionNote: e.target.value }))} placeholder="Optional note" />
              </div>
            </div>
            {commissionAmount > 0 && (
              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm font-semibold text-yellow-800">Commission: {formatCurrency(commissionAmount)}</p>
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Calculator className="w-4 h-4" /> Bill Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal</span><span className="font-medium">{formatCurrency(subtotal)}</span></div>
              {form.gstEnabled && <div className="flex justify-between text-sm"><span className="text-gray-600">GST</span><span className="font-medium">{formatCurrency(totalGst)}</span></div>}
              <div className="border-t border-gray-200 pt-2 flex justify-between">
                <span className="font-bold text-gray-900">Grand Total</span>
                <span className="font-bold text-xl text-gray-900">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Additional Details</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="label">Notes</label>
              <textarea className="input-field" rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Internal notes..." />
            </div>
            <div>
              <label className="label">Terms & Conditions</label>
              <textarea className="input-field" rows={2} value={form.termsAndConditions} onChange={e => setForm(p => ({ ...p, termsAndConditions: e.target.value }))} placeholder="Terms and conditions..." />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button type="submit" disabled={saving} className="btn-primary sm:px-8 py-3 justify-center flex-1 sm:flex-none">
            {saving ? 'Creating...' : 'Create Bill & Generate Invoice'}
          </button>
          <button type="button" onClick={() => navigate('/bills')} className="btn-secondary justify-center">Cancel</button>
        </div>
      </form>
    </div>
  )
}
