import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Eye, Edit2, Trash2, Phone, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { Table, Thead, Th, Tbody, Tr, Td } from '../components/UI/Table'
import Pagination from '../components/UI/Pagination'
import SearchFilter from '../components/UI/SearchFilter'
import Modal from '../components/UI/Modal'
import { PageLoader } from '../components/UI/LoadingSpinner'
import { formatCurrency } from '../utils/helpers'

function PartyForm({ party, onSave, onClose }) {
  const [form, setForm] = useState({
    name: party?.name || '',
    mobile: party?.mobile || '',
    alternativeMobile: party?.alternativeMobile || '',
    email: party?.email || '',
    'address.street': party?.address?.street || '',
    'address.city': party?.address?.city || '',
    'address.state': party?.address?.state || '',
    'address.pincode': party?.address?.pincode || '',
    gstNumber: party?.gstNumber || '',
    referredBy: party?.referredBy || '',
    paymentTermsDays: party?.paymentTermsDays || 30,
    commissionRate: party?.commissionRate || 0,
    commissionType: party?.commissionType || 'percentage',
    notes: party?.notes || '',
    mapUrl: party?.mapLocation?.mapUrl || ''
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.mobile) return toast.error('Name and mobile are required')
    setSaving(true)
    try {
      const payload = {
        name: form.name, mobile: form.mobile, alternativeMobile: form.alternativeMobile,
        email: form.email, gstNumber: form.gstNumber, referredBy: form.referredBy,
        paymentTermsDays: parseInt(form.paymentTermsDays),
        commissionRate: parseFloat(form.commissionRate) || 0,
        commissionType: form.commissionType,
        notes: form.notes,
        address: {
          street: form['address.street'], city: form['address.city'],
          state: form['address.state'], pincode: form['address.pincode']
        },
        mapLocation: form.mapUrl ? { mapUrl: form.mapUrl } : undefined
      }
      if (party?._id) {
        await api.put(`/parties/${party._id}`, payload)
        toast.success('Party updated!')
      } else {
        await api.post('/parties', payload)
        toast.success('Party created!')
      }
      onSave()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save party')
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Party Name *</label>
          <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Business/Person name" required />
        </div>
        <div>
          <label className="label">Mobile *</label>
          <input className="input-field" value={form.mobile} onChange={e => set('mobile', e.target.value)} placeholder="98765 43210" required />
        </div>
        <div>
          <label className="label">Alt. Mobile</label>
          <input className="input-field" value={form.alternativeMobile} onChange={e => set('alternativeMobile', e.target.value)} placeholder="Optional" />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input-field" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" />
        </div>
        <div>
          <label className="label">GST Number</label>
          <input className="input-field" value={form.gstNumber} onChange={e => set('gstNumber', e.target.value.toUpperCase())} placeholder="22XXXXX1234X1ZX" />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Address</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="label">Street</label>
            <input className="input-field" value={form['address.street']} onChange={e => set('address.street', e.target.value)} placeholder="Street address" />
          </div>
          <div>
            <label className="label">City</label>
            <input className="input-field" value={form['address.city']} onChange={e => set('address.city', e.target.value)} placeholder="City" />
          </div>
          <div>
            <label className="label">State</label>
            <input className="input-field" value={form['address.state']} onChange={e => set('address.state', e.target.value)} placeholder="State" />
          </div>
          <div>
            <label className="label">Pincode</label>
            <input className="input-field" value={form['address.pincode']} onChange={e => set('address.pincode', e.target.value)} placeholder="395001" />
          </div>
          <div>
            <label className="label">Map URL</label>
            <input className="input-field" value={form.mapUrl} onChange={e => set('mapUrl', e.target.value)} placeholder="Google Maps link" />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Business Terms</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Referred By</label>
            <input className="input-field" value={form.referredBy} onChange={e => set('referredBy', e.target.value)} placeholder="Who referred?" />
          </div>
          <div>
            <label className="label">Payment Terms (days)</label>
            <input type="number" className="input-field" value={form.paymentTermsDays} onChange={e => set('paymentTermsDays', e.target.value)} min="0" />
          </div>
          <div>
            <label className="label">Commission Rate</label>
            <input type="number" className="input-field" value={form.commissionRate} onChange={e => set('commissionRate', e.target.value)} min="0" step="0.01" placeholder="0" />
          </div>
          <div>
            <label className="label">Commission Type</label>
            <select className="input-field" value={form.commissionType} onChange={e => set('commissionType', e.target.value)}>
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (Rs.)</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea className="input-field" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any additional notes..." />
      </div>

      <div className="flex gap-3 pt-1 border-t border-gray-100">
        <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
          {saving ? 'Saving...' : party?._id ? 'Update Party' : 'Create Party'}
        </button>
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
      </div>
    </form>
  )
}

export default function PartiesPage() {
  const navigate = useNavigate()
  const [parties, setParties] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editParty, setEditParty] = useState(null)

  const fetchParties = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/parties', { params: { page, limit: 10, search } })
      setParties(res.data.data)
      setPagination(res.data.pagination)
    } catch { toast.error('Failed to load parties') }
    finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { fetchParties() }, [fetchParties])
  useEffect(() => { setPage(1) }, [search])

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this party?')) return
    try {
      await api.delete(`/parties/${id}`)
      toast.success('Party deactivated')
      fetchParties()
    } catch { toast.error('Failed') }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Parties</h1>
          <p className="page-subtitle">Manage customers and business partners</p>
        </div>
        <button onClick={() => { setEditParty(null); setShowModal(true) }} className="btn-primary flex-shrink-0">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Party</span>
        </button>
      </div>

      <div className="card p-3 sm:p-4">
        <SearchFilter value={search} onChange={setSearch} placeholder="Search by name, mobile, GST..." className="w-full sm:max-w-sm" />
      </div>

      {loading ? <PageLoader /> : (
        <div className="card p-0">
          {/* Mobile card view */}
          <div className="sm:hidden divide-y divide-gray-100">
            {parties.length === 0 && <p className="text-center text-gray-400 py-8 text-sm">No parties found</p>}
            {parties.map(party => (
              <div key={party._id} onClick={() => navigate(`/parties/${party._id}`)} className="p-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{party.name}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" />{party.mobile}</p>
                    {party.address?.city && <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{party.address.city}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(party.totalBilled)}</p>
                    <p className={`text-xs font-medium ${party.totalPending > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(party.totalPending)} pending</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3" onClick={e => e.stopPropagation()}>
                  <button onClick={() => navigate(`/parties/${party._id}`)} className="btn-secondary text-xs py-1 px-2 flex-1 justify-center"><Eye className="w-3.5 h-3.5" /> View</button>
                  <button onClick={() => { setEditParty(party); setShowModal(true) }} className="btn-secondary text-xs py-1 px-2 flex-1 justify-center"><Edit2 className="w-3.5 h-3.5" /> Edit</button>
                  <button onClick={() => handleDelete(party._id)} className="p-1.5 rounded hover:bg-red-50 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block">
            <Table>
              <Thead>
                <Tr>
                  <Th width="160px">Party Name</Th>
                  <Th width="130px">Contact</Th>
                  <Th width="160px">GST Number</Th>
                  <Th width="120px">Referred By</Th>
                  <Th width="70px" align="center">Terms</Th>
                  <Th width="110px" align="right">Total Billed</Th>
                  <Th width="110px" align="right">Pending</Th>
                  <Th width="90px" align="center">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {parties.length === 0 && (
                  <Tr><Td colSpan={8} className="text-center text-gray-400 py-10">No parties found</Td></Tr>
                )}
                {parties.map(party => (
                  <Tr key={party._id} onClick={() => navigate(`/parties/${party._id}`)}>
                    <Td>
                      <p className="font-semibold text-gray-900">{party.name}</p>
                      {party.address?.city && (
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />{party.address.city}
                        </p>
                      )}
                    </Td>
                    <Td>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-700">{party.mobile}</span>
                      </div>
                    </Td>
                    <Td>
                      <span className="font-mono text-xs text-gray-600 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                        {party.gstNumber || '—'}
                      </span>
                    </Td>
                    <Td>
                      <span className="text-sm text-gray-600">{party.referredBy || '—'}</span>
                    </Td>
                    <Td align="center">
                      <span className="text-sm font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                        {party.paymentTermsDays}d
                      </span>
                    </Td>
                    <Td align="right">
                      <span className="font-semibold text-gray-900">{formatCurrency(party.totalBilled)}</span>
                    </Td>
                    <Td align="right">
                      <span className={`font-semibold ${party.totalPending > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(party.totalPending)}
                      </span>
                    </Td>
                    <Td align="center">
                      <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
                        <button onClick={() => navigate(`/parties/${party._id}`)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700" title="View"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => { setEditParty(party); setShowModal(true) }} className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600" title="Edit"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(party._id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500" title="Delete"><Trash2 className="w-4 h-4" /></button>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editParty ? 'Edit Party' : 'Add New Party'} size="lg">
        <PartyForm party={editParty} onSave={() => { setShowModal(false); fetchParties() }} onClose={() => setShowModal(false)} />
      </Modal>
    </div>
  )
}
