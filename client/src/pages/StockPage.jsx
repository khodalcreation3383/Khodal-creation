import { useState, useEffect, useCallback } from 'react'
import { Plus, TrendingUp, TrendingDown, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { Table, Thead, Th, Tbody, Tr, Td, ColGroup } from '../components/UI/Table'
import Pagination from '../components/UI/Pagination'
import Modal from '../components/UI/Modal'
import { PageLoader } from '../components/UI/LoadingSpinner'
import { formatCurrency, formatDate } from '../utils/helpers'
import Badge from '../components/UI/Badge'
import StatCard from '../components/UI/StatCard'

function AddStockForm({ onSave, onClose }) {
  const [designs, setDesigns] = useState([])
  const [parties, setParties] = useState([])
  const [form, setForm] = useState({ designId: '', type: 'inward', quantity: '', color: '', fabricType: '', notes: '', party: '', referenceType: 'purchase' })
  const [saving, setSaving] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    setLoadingData(true)
    Promise.all([
      api.get('/designs', { params: { limit: 100, isActive: true } }),
      api.get('/parties', { params: { limit: 100, isActive: true } })
    ]).then(([d, p]) => {
      setDesigns(d.data.data)
      setParties(p.data.data)
    }).finally(() => setLoadingData(false))
  }, [])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.designId || !form.quantity) return toast.error('Design and quantity are required')
    setSaving(true)
    try {
      await api.post('/stock', { ...form, quantity: parseInt(form.quantity) })
      toast.success('Stock entry added!')
      onSave()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add entry')
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="label">Design *</label>
          <div className="relative">
            <select
              className="input-field"
              value={form.designId}
              onChange={e => set('designId', e.target.value)}
              required
              disabled={loadingData}
            >
              <option value="">
                {loadingData ? 'Loading designs...' : designs.length === 0 ? 'No designs found' : 'Select design'}
              </option>
              {designs.map(d => (
                <option key={d._id} value={d._id}>{d.designNumber} - {d.name}</option>
              ))}
            </select>
            {loadingData && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin block" />
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="label">Type *</label>
          <select className="input-field" value={form.type} onChange={e => set('type', e.target.value)}>
            <option value="inward">Inward (Aavyo)</option>
            <option value="outward">Outward (Gayo)</option>
          </select>
        </div>
        <div>
          <label className="label">Quantity *</label>
          <input type="number" className="input-field" value={form.quantity} onChange={e => set('quantity', e.target.value)} min="1" required />
        </div>
        <div>
          <label className="label">Color</label>
          <input className="input-field" value={form.color} onChange={e => set('color', e.target.value)} placeholder="e.g. Red" />
        </div>
        <div>
          <label className="label">Fabric Type</label>
          <input className="input-field" value={form.fabricType} onChange={e => set('fabricType', e.target.value)} placeholder="Override fabric type" />
        </div>
        <div>
          <label className="label">Reference Type</label>
          <select className="input-field" value={form.referenceType} onChange={e => set('referenceType', e.target.value)}>
            <option value="purchase">Purchase</option>
            <option value="sale">Sale</option>
            <option value="return">Return</option>
            <option value="adjustment">Adjustment</option>
            <option value="opening">Opening Stock</option>
          </select>
        </div>
        <div>
          <label className="label">Party (optional)</label>
          <div className="relative">
            <select
              className="input-field"
              value={form.party}
              onChange={e => set('party', e.target.value)}
              disabled={loadingData}
            >
              <option value="">
                {loadingData ? 'Loading parties...' : 'Select party (optional)'}
              </option>
              {parties.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
            {loadingData && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin block" />
              </div>
            )}
          </div>
        </div>
        <div className="col-span-2">
          <label className="label">Notes</label>
          <input className="input-field" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Optional notes" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving || loadingData} className="btn-primary flex-1 justify-center">
          {saving ? 'Adding...' : 'Add Stock Entry'}
        </button>
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
      </div>
    </form>
  )
}

export default function StockPage() {
  const [entries, setEntries] = useState([])
  const [summary, setSummary] = useState(null)
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState('entries')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [eRes, sRes] = await Promise.all([
        api.get('/stock', { params: { page, limit: 20, type: typeFilter || undefined } }),
        api.get('/stock/summary')
      ])
      setEntries(eRes.data.data)
      setPagination(eRes.data.pagination)
      setSummary(sRes.data.data)
    } catch { toast.error('Failed to load stock') }
    finally { setLoading(false) }
  }, [page, typeFilter])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
          <p className="text-gray-500 text-sm mt-1">Track inward (Aavyo) and outward (Gayo) stock</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Entry
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Total Inward" value={`${summary.totalInward} pcs`} icon={TrendingUp} color="green" />
          <StatCard title="Total Outward" value={`${summary.totalOutward} pcs`} icon={TrendingDown} color="red" />
          <StatCard title="Available Stock" value={`${summary.totalAvailable} pcs`} subtitle={`Value: ${formatCurrency(summary.totalStockValue)}`} icon={Package} color="primary" />
        </div>
      )}

      {/* Tabs */}
      <div className="card p-0">
        <div className="flex items-center justify-between border-b border-gray-100 px-4">
          <div className="flex">
            {['entries', 'summary'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                {tab === 'entries' ? 'Stock Entries' : 'Design Summary'}
              </button>
            ))}
          </div>
          {activeTab === 'entries' && (
            <select className="input-field w-40 text-sm" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="">All Types</option>
              <option value="inward">Inward (Aavyo)</option>
              <option value="outward">Outward (Gayo)</option>
            </select>
          )}
        </div>

        {loading ? <PageLoader /> : activeTab === 'entries' ? (
          <>
            <Table>
              <ColGroup cols={['100px', '190px', '110px', '60px', '90px', '110px', '130px', 'auto']} />
              <Thead>
                <Tr>
                  <Th>Date</Th>
                  <Th>Design</Th>
                  <Th align="center">Type</Th>
                  <Th align="center">Qty</Th>
                  <Th>Color</Th>
                  <Th>Fabric</Th>
                  <Th>Party</Th>
                  <Th>Notes</Th>
                </Tr>
              </Thead>
              <Tbody>
                {entries.length === 0 && <Tr><Td className="text-center text-gray-400 py-10" colSpan={8}>No entries found</Td></Tr>}
                {entries.map(e => (
                  <Tr key={e._id}>
                    <Td><span className="text-sm text-gray-700 whitespace-nowrap">{formatDate(e.entryDate)}</span></Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        {e.design?.image && <img src={e.design.image} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />}
                        <div>
                          <p className="text-xs font-mono text-gray-400">{e.design?.designNumber}</p>
                          <p className="text-sm font-medium text-gray-900">{e.design?.name}</p>
                        </div>
                      </div>
                    </Td>
                    <Td align="center"><Badge status={e.type} /></Td>
                    <Td align="center"><span className="font-bold text-lg text-gray-900">{e.quantity}</span></Td>
                    <Td><span className="text-sm text-gray-700">{e.color || '—'}</span></Td>
                    <Td><span className="text-sm text-gray-700">{e.fabricType || e.design?.fabricType || '—'}</span></Td>
                    <Td><span className="text-sm text-gray-700">{e.party?.name || '—'}</span></Td>
                    <Td><span className="text-xs text-gray-500">{e.notes || '—'}</span></Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        ) : (
          <Table>
            <ColGroup cols={['180px', '110px', '100px', '110px', '110px', '90px', '110px']} />
            <Thead>
              <Tr>
                <Th>Design</Th>
                <Th>Fabric</Th>
                <Th align="right">Price/Pc</Th>
                <Th align="center">Total Inward</Th>
                <Th align="center">Total Outward</Th>
                <Th align="center">Available</Th>
                <Th align="right">Stock Value</Th>
              </Tr>
            </Thead>
            <Tbody>
              {summary?.summary?.length === 0 && <Tr><Td className="text-center text-gray-400 py-8" colSpan={7}>No designs</Td></Tr>}
              {summary?.summary?.map(item => (
                <Tr key={item.design._id}>
                  <Td>
                    <div className="flex items-center gap-2">
                      {item.design.image && <img src={item.design.image} alt="" className="w-8 h-8 rounded object-cover" />}
                      <div>
                        <p className="text-xs font-mono text-gray-500">{item.design.designNumber}</p>
                        <p className="text-sm font-medium">{item.design.name}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>{item.design.fabricType}</Td>
                  <Td>{formatCurrency(item.design.pricePerPiece)}</Td>
                  <Td className="text-green-600 font-semibold">{item.totalInward}</Td>
                  <Td className="text-red-600 font-semibold">{item.totalOutward}</Td>
                  <Td>
                    <span className={`font-bold text-lg ${item.available > 0 ? 'text-gray-900' : 'text-red-500'}`}>{item.available}</span>
                  </Td>
                  <Td className="font-semibold">{formatCurrency(item.stockValue)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Stock Entry" size="lg">
        <AddStockForm onSave={() => { setShowModal(false); fetchData() }} onClose={() => setShowModal(false)} />
      </Modal>
    </div>
  )
}
