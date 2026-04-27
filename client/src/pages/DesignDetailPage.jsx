import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, TrendingUp, TrendingDown } from 'lucide-react'
import api from '../services/api'
import { PageLoader } from '../components/UI/LoadingSpinner'
import { formatCurrency, formatDate } from '../utils/helpers'
import Badge from '../components/UI/Badge'
import { Table, Thead, Th, Tbody, Tr, Td } from '../components/UI/Table'

export default function DesignDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [design, setDesign] = useState(null)
  const [stockEntries, setStockEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dRes, sRes] = await Promise.all([
          api.get(`/designs/${id}`),
          api.get(`/designs/${id}/stock`)
        ])
        setDesign(dRes.data.data)
        setStockEntries(sRes.data.data)
      } catch { navigate('/designs') }
      finally { setLoading(false) }
    }
    fetchData()
  }, [id])

  if (loading) return <PageLoader />
  if (!design) return null

  const totalInward = stockEntries.filter(e => e.type === 'inward').reduce((s, e) => s + e.quantity, 0)
  const totalOutward = stockEntries.filter(e => e.type === 'outward').reduce((s, e) => s + e.quantity, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/designs')} className="btn-secondary">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{design.name}</h1>
          <p className="text-gray-500 text-sm">{design.designNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="w-full h-56 bg-gray-100 rounded-xl overflow-hidden mb-4">
            {design.image ? (
              <img src={design.image} alt={design.name} className="w-full h-full object-cover" />
            ) : <div className="w-full h-full flex items-center justify-center"><Package className="w-16 h-16 text-gray-300" /></div>}
          </div>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-sm text-gray-500">Design No.</span><span className="font-mono font-semibold text-gray-900">{design.designNumber}</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-500">Fabric Type</span><span className="font-medium">{design.fabricType}</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-500">Price/Piece</span><span className="font-bold text-gray-900">{formatCurrency(design.pricePerPiece)}</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-500">GST Rate</span><span>{design.gstRate || 0}%</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-500">Category</span><span>{design.category}</span></div>
            {design.colors?.length > 0 && (
              <div><span className="text-sm text-gray-500">Colors</span>
                <div className="flex flex-wrap gap-1 mt-1">{design.colors.map(c => <span key={c} className="text-xs bg-gray-100 px-2 py-0.5 rounded">{c}</span>)}</div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="card bg-green-50 border-green-100">
              <div className="flex items-center gap-2 mb-1"><TrendingUp className="w-4 h-4 text-green-600" /><span className="text-xs text-green-700 font-medium">Total Inward</span></div>
              <p className="text-2xl font-bold text-green-700">{totalInward}</p>
              <p className="text-xs text-green-600">pieces received</p>
            </div>
            <div className="card bg-red-50 border-red-100">
              <div className="flex items-center gap-2 mb-1"><TrendingDown className="w-4 h-4 text-red-600" /><span className="text-xs text-red-700 font-medium">Total Outward</span></div>
              <p className="text-2xl font-bold text-red-700">{totalOutward}</p>
              <p className="text-xs text-red-600">pieces sold</p>
            </div>
            <div className="card bg-gray-50 border-gray-200">
              <div className="flex items-center gap-2 mb-1"><Package className="w-4 h-4 text-gray-600" /><span className="text-xs text-gray-700 font-medium">Available</span></div>
              <p className="text-2xl font-bold text-gray-900">{totalInward - totalOutward}</p>
              <p className="text-xs text-gray-500">pieces in stock</p>
            </div>
          </div>

          <div className="card p-0">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Stock History</h3>
            </div>
            <Table>
              <Thead>
                <Tr><Th>Date</Th><Th>Type</Th><Th>Qty</Th><Th>Color</Th><Th>Party</Th><Th>Notes</Th></Tr>
              </Thead>
              <Tbody>
                {stockEntries.length === 0 && (
                  <Tr><Td className="text-center text-gray-400 py-8" colSpan={6}>No stock entries</Td></Tr>
                )}
                {stockEntries.map(e => (
                  <Tr key={e._id}>
                    <Td>{formatDate(e.entryDate)}</Td>
                    <Td><Badge status={e.type} /></Td>
                    <Td className="font-semibold">{e.quantity}</Td>
                    <Td>{e.color || '-'}</Td>
                    <Td>{e.party?.name || '-'}</Td>
                    <Td className="text-gray-500">{e.notes || '-'}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}
