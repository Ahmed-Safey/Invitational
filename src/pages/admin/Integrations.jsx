import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useSite } from '../../lib/SiteContext'
import AdminLayout from '../../components/admin/AdminLayout'
import toast from 'react-hot-toast'

// Defined outside to keep identity stable across renders so inputs don't lose focus
function UrlField({ label, field, hint, form, setForm }) {
  return (
    <div className="admin-card mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-gray-900">{label}</h3>
        <span className={form[field] ? 'status-active' : 'status-inactive'}>{form[field] ? 'Active' : 'Not Set'}</span>
      </div>
      {hint && <p className="text-xs text-gray-400 mb-2">{hint}</p>}
      <div className="flex gap-2">
        <input value={form[field] || ''} onChange={e => setForm({...form, [field]: e.target.value})} placeholder="Paste URL..." className="admin-input flex-1" />
        {form[field] && <button onClick={() => setForm({...form, [field]: ''})} className="admin-btn-outline text-xs">Clear</button>}
      </div>
    </div>
  )
}

export default function Integrations() {
  const { refetch } = useSite()
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('site_settings')
      .select('results_url, stream_url, google_form_url, google_form_embed_url, meet_info_pdf_url, entry_form_url')
      .single().then(({ data }) => { if (data) setForm(data) })
  }, [])

  const save = async () => {
    setSaving(true)
    const { error } = await supabase.from('site_settings').update(form).eq('id', 1)
    if (error) toast.error(error.message)
    else { toast.success('Integrations saved'); refetch() }
    setSaving(false)
  }

  const fp = { form, setForm }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Integrations</h1>
      <p className="text-sm text-gray-500 mb-6">Set live results, stream, form, and PDF URLs</p>
      <div className="max-w-2xl">
        <UrlField {...fp} label="Results PDF URL" field="results_url" hint="Google Drive link to post-session results PDF" />
        <UrlField {...fp} label="Live Stream URL" field="stream_url" hint="YouTube embed URL (e.g. https://www.youtube.com/embed/VIDEO_ID)" />
        <UrlField {...fp} label="Interest Form URL" field="google_form_url" hint="Google Form URL for school registration" />
        <UrlField {...fp} label="Interest Form Embed URL" field="google_form_embed_url" hint="Same form URL + ?embedded=true" />
        <UrlField {...fp} label="Meet Info PDF URL" field="meet_info_pdf_url" hint="Google Drive link to meet information package PDF" />
        <UrlField {...fp} label="Entry Submission Form URL" field="entry_form_url" hint="Google Form with file upload for team entry submissions (.hy3 files)" />
        <button onClick={save} disabled={saving} className="admin-btn mt-4">{saving ? 'Saving...' : 'Save All Integrations'}</button>
      </div>
    </AdminLayout>
  )
}
