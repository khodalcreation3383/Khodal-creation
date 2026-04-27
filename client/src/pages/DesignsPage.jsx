import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, Eye, Image, Package, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import Pagination from '../components/UI/Pagination'
import Modal from '../components/UI/Modal'
import { PageLoader } from '../components/UI/LoadingSpinner'
import { formatCurrency } from '../utils/helpers'

const FABRIC_TYPES = ['Cotton', 'Silk', 'Polyester', 'Linen', 'Wool', 'Rayon', 'Chiffon', 'Georgette', 'Crepe', 'Satin', 'Other']

/* ─── Design Form ─────────────────────────────────────────────── */
function DesignForm({ design, onSave, onClose }) {
  const [form, setForm] = useState({
    name:         design?.name         || '',
    fabricType:   design?.fabricType   || '',
    fabricDetails:design?.fabricDetails|| '',
    colors:       design?.colors?.join(', ') || '',
    pricePerPiece:design?.pricePerPiece|| '',
    gstRate:      design?.gstRate      || 0,
    description:  design?.description  || '',
    category:     design?.category     || 'General',
    isActive:     design?.isActive !== false,
  })
  const [imageFile,    setImageFile]    = useState(null)
  const [imagePreview, setImagePreview] = useState(design?.image || null)
  const [saving,       setSaving]       = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.fabricType || !form.pricePerPiece) {
      return toast.error('Name, fabric type and price are required')
    }
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (imageFile) fd.append('image', imageFile)

      if (design?._id) {
        await api.put(`/designs/${design._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Design updated!')
      } else {
        await api.post('/designs', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Design created!')
      }
      onSave()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save design')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Image */}
      <div className="flex items-center gap-4">
        <div className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden flex items-center justify-center bg-gray-50 flex-shrink-0">
          {imagePreview
            ? <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
            : <Image className="w-8 h-8 text-gray-300" />
          }
        </div>
        <div>
          <label className="btn-secondary cursor-pointer text-sm">
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            <Image className="w-4 h-4" /> Upload Image
          </label>
          <p className="text-xs text-gray-400 mt-1.5">JPG, PNG up to 5 MB</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 sm:col-span-1">
          <label className="label">Design Name *</label>
          <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Floral Print" required />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="label">Fabric Type *</label>
          <select className="input-field" value={form.fabricType} onChange={e => set('fabricType', e.target.value)} required>
            <option value="">Select fabric</option>
            {FABRIC_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Price Per Piece (₹) *</label>
          <input type="number" className="input-field" value={form.pricePerPiece} onChange={e => set('pricePerPiece', e.target.value)} placeholder="0.00" min="0" step="0.01" required />
        </div>
        <div>
          <label className="label">GST Rate (%)</label>
          <input type="number" className="input-field" value={form.gstRate} onChange={e => set('gstRate', e.target.value)} placeholder="0" min="0" max="100" />
        </div>
        <div>
          <label className="label">Colors (comma separated)</label>
          <input className="input-field" value={form.colors} onChange={e => set('colors', e.target.value)} placeholder="Red, Blue, Green" />
        </div>
        <div>
          <label className="label">Category</label>
          <input className="input-field" value={form.category} onChange={e => set('category', e.target.value)} placeholder="General" />
        </div>
      </div>

      <div>
        <label className="label">Fabric Details</label>
        <input className="input-field" value={form.fabricDetails} onChange={e => set('fabricDetails', e.target.value)} placeholder="Additional fabric details" />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea className="input-field" rows={2} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Optional description" />
      </div>

      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
          {saving ? 'Saving...' : design?._id ? 'Update Design' : 'Create Design'}
        </button>
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
      </div>
    </form>
  )
}

/* ─── Designs Page ────────────────────────────────────────────── */
export default function DesignsPage() {
  const navigate = useNavigate()
  const [designs,    setDesigns]    = useState([])
  const [pagination, setPagination] = useState({})
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [page,       setPage]       = useState(1)
  const [showModal,  setShowModal]  = useState(false)
  const [editDesign, setEditDesign] = useState(null)

  const fetchDesigns = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/designs', { params: { page, limit: 12, search: search || undefined } })
      setDesigns(res.data.data || [])
      setPagination(res.data.pagination || {})
    } catch {
      toast.error('Failed to load designs')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchDesigns() }, [fetchDesigns])
  useEffect(() => { setPage(1) }, [search])

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!window.confirm('Deactivate this design?')) return
    try {
      await api.delete(`/designs/${id}`)
      toast.success('Design deactivated')
      fetchDesigns()
    } catch {
      toast.error('Failed to deactivate')
    }
  }

  const openAdd = () => { setEditDesign(null); setShowModal(true) }
  const openEdit = (e, design) => { e.stopPropagation(); setEditDesign(design); setShowModal(true) }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Designs</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage fabric designs and pricing</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Design
        </button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, design number, fabric…"
            className="input-field pl-9"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? <PageLoader /> : (
        <>
          {designs.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-gray-300" />
              </div>
              <p className="font-semibold text-gray-700">No designs found</p>
              <p className="text-sm text-gray-400 mt-1">
                {search ? 'Try a different search term' : 'Click "Add Design" to create your first design'}
              </p>
              {!search && (
                <button onClick={openAdd} className="btn-primary mt-4">
                  <Plus className="w-4 h-4" /> Add Design
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {designs.map(design => (
                <div
                  key={design._id}
                  onClick={() => navigate(`/designs/${design._id}`)}
                  className="card-hover group p-0 overflow-hidden"
                >
                  {/* Image */}
                  <div className="w-full h-44 bg-gray-100 overflow-hidden relative">
                    {design.image ? (
                      <img
                        src={design.image}
                        alt={design.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="w-10 h-10 text-gray-300" />
                      </div>
                    )}
                    {!design.isActive && (
                      <span className="absolute top-2 right-2 text-xs bg-red-100 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-medium">
                        Inactive
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-2">
                    <div>
                      <span className="text-[10px] font-mono font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                        {design.designNumber}
                      </span>
                      <h3 className="font-semibold text-gray-900 mt-1.5 text-sm leading-tight">{design.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{design.fabricType}</p>
                    </div>

                    {design.colors?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {design.colors.slice(0, 3).map(c => (
                          <span key={c} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{c}</span>
                        ))}
                        {design.colors.length > 3 && (
                          <span className="text-[10px] text-gray-400">+{design.colors.length - 3}</span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                      <span className="font-bold text-gray-900 text-sm">{formatCurrency(design.pricePerPiece)}<span className="text-xs font-normal text-gray-400">/pc</span></span>
                      <span className="text-xs text-gray-400">Stock: <span className="font-semibold text-gray-700">{design.totalStock || 0}</span></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-4 pb-4 flex gap-2">
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/designs/${design._id}`) }}
                      className="flex-1 btn-secondary text-xs py-1.5 justify-center"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                    <button
                      onClick={e => openEdit(e, design)}
                      className="flex-1 btn-secondary text-xs py-1.5 justify-center"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={e => handleDelete(e, design._id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors border border-gray-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pagination?.pages > 1 && (
            <div className="card p-0">
              <Pagination pagination={pagination} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editDesign ? 'Edit Design' : 'Add New Design'}
        size="lg"
      >
        <DesignForm
          design={editDesign}
          onSave={() => { setShowModal(false); fetchDesigns() }}
          onClose={() => setShowModal(false)}
        />
      </Modal>
    </div>
  )
}
