import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useSite } from '../../lib/SiteContext'
import AdminLayout from '../../components/admin/AdminLayout'
import toast from 'react-hot-toast'

// Defined outside to keep identity stable across renders so inputs don't lose focus
function Field({ label, field, type = 'text', form, setForm }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {type === 'textarea' ? (
        <textarea value={form[field] || ''} onChange={e => setForm({...form, [field]: e.target.value})} className="admin-input h-20" />
      ) : (
        <input type={type} value={form[field] || ''} onChange={e => setForm({...form, [field]: e.target.value})} className="admin-input" />
      )}
    </div>
  )
}

export default function Settings() {
  const { refetch } = useSite()
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('site_settings').select('*').single().then(({ data }) => {
      if (data) setForm(data)
    })
  }, [])

  const save = async () => {
    setSaving(true)
    const updates = {
      site_title: form.site_title,
      site_subtitle: form.site_subtitle,
      hero_badge_1: form.hero_badge_1,
      hero_badge_2: form.hero_badge_2,
      hero_badge_3: form.hero_badge_3,
      hero_badge_4: form.hero_badge_4,
      entry_fee_amount: form.entry_fee_amount,
      entry_fee_label: form.entry_fee_label,
      contact_email_athletics: form.contact_email_athletics,
      contact_email_aquatics: form.contact_email_aquatics,
      hospitality_text: form.hospitality_text,
      coaches_meeting_text: form.coaches_meeting_text,
    }
    const { error } = await supabase.from('site_settings').update(updates).eq('id', 1)
    if (error) toast.error(error.message)
    else { toast.success('Settings saved'); refetch() }
    setSaving(false)
  }

  const fp = { form, setForm }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Site Settings</h1>
      <p className="text-sm text-gray-500 mb-6">Global configuration for the website</p>
      <div className="admin-card">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Identity</h3>
            <Field {...fp} label="Site Title" field="site_title" />
            <Field {...fp} label="Site Subtitle" field="site_subtitle" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Hero Badges</h3>
            <Field {...fp} label="Badge 1" field="hero_badge_1" />
            <Field {...fp} label="Badge 2" field="hero_badge_2" />
            <Field {...fp} label="Badge 3" field="hero_badge_3" />
            <Field {...fp} label="Badge 4" field="hero_badge_4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Entry Fee</h3>
            <Field {...fp} label="Fee Amount" field="entry_fee_amount" />
            <Field {...fp} label="Fee Label" field="entry_fee_label" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Contact</h3>
            <Field {...fp} label="Athletics Director Email" field="contact_email_athletics" type="email" />
            <Field {...fp} label="Aquatics Department Email" field="contact_email_aquatics" type="email" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Hospitality & Operations</h3>
            <Field {...fp} label="Hospitality Text" field="hospitality_text" type="textarea" />
            <Field {...fp} label="Coaches Meeting Text" field="coaches_meeting_text" type="textarea" />
          </div>
        </div>
        <div className="mt-6 pt-4 border-t">
          <button onClick={save} disabled={saving} className="admin-btn">{saving ? 'Saving...' : 'Save Settings'}</button>
        </div>
      </div>
    </AdminLayout>
  )
}
