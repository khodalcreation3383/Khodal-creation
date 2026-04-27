export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount || 0)
}

export const formatDate = (date, options = {}) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', ...options
  })
}

export const formatDateTime = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export const getImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return path
}

export const truncate = (str, n = 30) => {
  if (!str) return ''
  return str.length > n ? str.substring(0, n) + '...' : str
}

export const paymentMethodLabel = {
  cash: 'Cash',
  bank_transfer: 'Bank Transfer',
  cheque: 'Cheque',
  upi: 'UPI',
  other: 'Other'
}
