export default function Badge({ status }) {
  const map = {
    pending:      'badge-pending',
    partial:      'badge-partial',
    paid:         'badge-paid',
    overdue:      'badge-overdue',
    cancelled:    'badge-cancelled',
    inward:       'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200',
    outward:      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200',
    cash:         'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200',
    bank_transfer:'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200',
    cheque:       'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200',
    upi:          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200',
    other:        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200',
    cleared:      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200',
    bounced:      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200',
  }
  const labels = {
    pending: 'Pending', partial: 'Partial', paid: 'Paid', overdue: 'Overdue',
    cancelled: 'Cancelled', inward: 'Inward (Aavyo)', outward: 'Outward (Gayo)',
    cash: 'Cash', bank_transfer: 'Bank Transfer', cheque: 'Cheque', upi: 'UPI', other: 'Other',
    cleared: 'Cleared', bounced: 'Bounced',
  }
  return (
    <span className={map[status] || 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200'}>
      {labels[status] || status}
    </span>
  )
}
