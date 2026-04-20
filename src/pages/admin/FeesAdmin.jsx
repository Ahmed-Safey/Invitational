import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useSite } from '../../lib/SiteContext'
import AdminLayout from '../../components/admin/AdminLayout'
import toast from 'react-hot-toast'

// Defined outside to keep identity stable across renders so inputs don't lose focus
function Field({ label, field, bank, setBank }) {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input value={bank[field] || ''} onChange={e => setBank({...bank, [field]: e.target.value})} className="admin-input" />
    </div>
  )
}

export default function FeesAdmin() {
  const { refetch } = useSite()

  const [bank, setBank] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('bank_details').select('*').single().then(({ data }) => { if (data) setBank(data) })
  }, [])

  const REQUIRED = ['bank_name','account_name','account_number','swift_iban','reference_format']
  const incomplete = REQUIRED.filter(k => {
    const v = (bank[k] || '').trim()
    return !v || v.toUpperCase() === 'TBC' || v.toUpperCase() === 'TBD'
  })

  const save = async () => {
    if (bank.is_published && incomplete.length > 0) {
      return toast.error(`Fill all bank fields before publishing. Missing: ${incomplete.join(', ')}`)
    }
    setSaving(true)
    const updates = {
      bank_name: bank.bank_name,
      account_name: bank.account_name,
      account_number: bank.account_number,
      swift_iban: bank.swift_iban,
      reference_format: bank.reference_format,
      is_published: bank.is_published,
    }
    const { error } = await supabase.from('bank_details').update(updates).eq('id', 1)
    if (error) toast.error(error.message)
    else { toast.success('Bank details saved'); refetch() }
    setSaving(false)
  }

  const fp = { bank, setBank }

  const content = (
    <div className="admin-card max-w-lg">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Bank Transfer Details</h3>
      <Field {...fp} label="Bank Name" field="bank_name" />
      <Field {...fp} label="Account Name" field="account_name" />
      <Field {...fp} label="Account Number" field="account_number" />
      <Field {...fp} label="SWIFT / IBAN" field="swift_iban" />
      <Field {...fp} label="Reference Format" field="reference_format" />
      <div className="mb-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={bank.is_published || false} onChange={e => setBank({...bank, is_published: e.target.checked})} />
          Show bank details on public site
        </label>
        {incomplete.length > 0 && (
          <p className="text-xs text-red-600 mt-2 bg-red-50 border border-red-200 rounded px-2 py-1.5">
            ⚠ Cannot publish yet — fill in: <strong>{incomplete.join(', ')}</strong>
          </p>
        )}
      </div>
      <button onClick={save} disabled={saving} className="admin-btn">{saving ? 'Saving...' : 'Save Bank Details'}</button>
    </div>
  )

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Fees</h1>
      <p className="text-sm text-gray-500 mb-6">Manage entry fee and bank details</p>
      {content}
    </AdminLayout>
  )
}
