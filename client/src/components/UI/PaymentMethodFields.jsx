/**
 * PaymentMethodFields
 * Renders the payment method selector + conditional extra fields.
 * When "other" is selected, a free-text "Specify method" field appears.
 *
 * Props:
 *   form   – current form state object
 *   set    – (key, value) => void  setter
 *   compact – bool (smaller layout for inline use)
 */
export default function PaymentMethodFields({ form, set, compact = false }) {
  const gap = compact ? 'gap-3' : 'gap-4'

  return (
    <div className={`space-y-${compact ? '3' : '4'}`}>
      {/* ── Method selector ── */}
      <div className={`grid grid-cols-2 ${gap}`}>
        <div>
          <label className="label">Amount (₹) *</label>
          <input
            type="number"
            className="input-field"
            value={form.amount}
            onChange={e => set('amount', e.target.value)}
            min="0.01"
            step="0.01"
            required
          />
        </div>
        <div>
          <label className="label">Payment Method *</label>
          <select
            className="input-field"
            value={form.method}
            onChange={e => set('method', e.target.value)}
          >
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cheque">Cheque</option>
            <option value="upi">UPI</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* ── Other → custom description ── */}
      {form.method === 'other' && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Specify Payment Method</p>
          <div>
            <label className="label">Method Name *</label>
            <input
              className="input-field bg-white"
              value={form.otherMethodName || ''}
              onChange={e => set('otherMethodName', e.target.value)}
              placeholder="e.g. NEFT, RTGS, Demand Draft, Barter…"
              required
            />
          </div>
          <div>
            <label className="label">Reference / Details</label>
            <input
              className="input-field bg-white"
              value={form.otherReference || ''}
              onChange={e => set('otherReference', e.target.value)}
              placeholder="Transaction ID, DD number, etc."
            />
          </div>
        </div>
      )}

      {/* ── Bank Transfer ── */}
      {form.method === 'bank_transfer' && (
        <div className={`grid grid-cols-2 ${gap}`}>
          <div>
            <label className="label">Transaction ID</label>
            <input
              className="input-field"
              value={form.transactionId || ''}
              onChange={e => set('transactionId', e.target.value)}
              placeholder="UTR / Ref number"
            />
          </div>
          <div>
            <label className="label">Bank Name</label>
            <input
              className="input-field"
              value={form.bankName || ''}
              onChange={e => set('bankName', e.target.value)}
              placeholder="e.g. SBI, HDFC"
            />
          </div>
        </div>
      )}

      {/* ── Cheque ── */}
      {form.method === 'cheque' && (
        <div className={`grid grid-cols-2 ${gap}`}>
          <div>
            <label className="label">Cheque Number *</label>
            <input
              className="input-field"
              value={form.chequeNumber || ''}
              onChange={e => set('chequeNumber', e.target.value)}
              placeholder="123456"
              required
            />
          </div>
          <div>
            <label className="label">Cheque Date</label>
            <input
              type="date"
              className="input-field"
              value={form.chequeDate || ''}
              onChange={e => set('chequeDate', e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <label className="label">Bank Name</label>
            <input
              className="input-field"
              value={form.chequeBank || ''}
              onChange={e => set('chequeBank', e.target.value)}
              placeholder="e.g. ICICI Bank"
            />
          </div>
        </div>
      )}

      {/* ── UPI ── */}
      {form.method === 'upi' && (
        <div className={`grid grid-cols-2 ${gap}`}>
          <div>
            <label className="label">UPI ID</label>
            <input
              className="input-field"
              value={form.upiId || ''}
              onChange={e => set('upiId', e.target.value)}
              placeholder="name@upi"
            />
          </div>
          <div>
            <label className="label">UPI Reference No.</label>
            <input
              className="input-field"
              value={form.upiRef || ''}
              onChange={e => set('upiRef', e.target.value)}
              placeholder="12-digit ref"
            />
          </div>
        </div>
      )}
    </div>
  )
}
