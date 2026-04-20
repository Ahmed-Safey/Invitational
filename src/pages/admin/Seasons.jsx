import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useSite } from '../../lib/SiteContext'
import AdminLayout from '../../components/admin/AdminLayout'
import toast from 'react-hot-toast'

export default function Seasons() {
  const { refetch } = useSite()
  const [seasons, setSeasons] = useState([])
  const [editing, setEditing] = useState(null)
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newSeason, setNewSeason] = useState({ slug: '', label: '', dates_display: '', age_up_date: '' })

  const load = async () => {
    const { data } = await supabase.from('seasons').select('*').order('slug')
    setSeasons(data || [])
  }
  useEffect(() => { load() }, [])

  const setActive = async (slug) => {
    setSaving(true)
    const { error } = await supabase.rpc('set_active_season', { new_slug: slug })
    if (error) toast.error(error.message)
    else { toast.success('Active season updated'); load(); refetch() }
    setSaving(false)
  }

  const saveSeason = async (s) => {
    setSaving(true)
    let sessionJson = s.session_times_json
    if (typeof s._session_times_raw === 'string' && s._session_times_raw.trim()) {
      try { sessionJson = JSON.parse(s._session_times_raw) } catch { toast.error('Invalid JSON for session times'); setSaving(false); return }
    } else if (s._session_times_raw === '') {
      sessionJson = null
    }
    const { error } = await supabase.from('seasons').update({
      label: s.label, dates_display: s.dates_display, age_up_date: s.age_up_date, warmup_schedule_text: s.warmup_schedule_text, session_times_json: sessionJson
    }).eq('id', s.id)
    if (error) toast.error(error.message)
    else { toast.success('Season updated'); setEditing(null); load(); refetch() }
    setSaving(false)
  }

  const addSeason = async () => {
    if (!/^[a-z0-9_]+$/.test(newSeason.slug)) {
      return toast.error('Slug must be lowercase letters, digits, and underscores only (e.g. fall_2027)')
    }
    if (!newSeason.label.trim()) return toast.error('Label is required')
    setSaving(true)
    const { error } = await supabase.from('seasons').insert({ ...newSeason, is_current: false })
    if (error) { toast.error(error.message); setSaving(false); return }
    // Auto-create the 4 standard program slots for this season
    const programTypes = [
      { program_type: 'entry_file', label: `${newSeason.label} Entry File` },
      { program_type: 'heat_sheet', label: `${newSeason.label} Heat Sheets` },
      { program_type: 'program_booklet', label: `${newSeason.label} Meet Program` },
      { program_type: 'psych_sheet', label: `${newSeason.label} Psych Sheets` },
    ]
    await supabase.from('programs').insert(programTypes.map(p => ({ ...p, season_slug: newSeason.slug, is_published: false })))
    toast.success('Season added with program slots')
    setAdding(false); setNewSeason({ slug: '', label: '', dates_display: '', age_up_date: '' }); load(); refetch()
    setSaving(false)
  }

  const deleteSeason = async (s) => {
    if (s.is_current) return toast.error('Cannot delete the active season. Set another season as active first.')
    if (!confirm(`Delete "${s.label}" and all its program documents? This cannot be undone.`)) return
    setSaving(true)
    const { error } = await supabase.from('seasons').delete().eq('id', s.id)
    if (error) toast.error(error.message)
    else { toast.success('Season deleted'); load(); refetch() }
    setSaving(false)
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Seasons</h1>
      <p className="text-sm text-gray-500 mb-4">Manage Fall/Spring seasons and set the active season</p>
      <button onClick={() => setAdding(!adding)} className="admin-btn mb-4">+ Add Season</button>

      {adding && (
        <div className="admin-card mb-4">
          <div className="grid md:grid-cols-2 gap-3 mb-3">
            <input value={newSeason.slug} onChange={e => setNewSeason({...newSeason, slug: e.target.value})} placeholder="slug (e.g. fall_2027)" className="admin-input" />
            <input value={newSeason.label} onChange={e => setNewSeason({...newSeason, label: e.target.value})} placeholder="Label (e.g. Fall Invitational)" className="admin-input" />
            <input value={newSeason.dates_display} onChange={e => setNewSeason({...newSeason, dates_display: e.target.value})} placeholder="Dates display" className="admin-input" />
            <input value={newSeason.age_up_date} onChange={e => setNewSeason({...newSeason, age_up_date: e.target.value})} placeholder="Age-up date" className="admin-input" />
          </div>
          <div className="flex gap-2"><button onClick={addSeason} disabled={saving} className="admin-btn">{saving ? 'Adding...' : 'Add Season'}</button><button onClick={() => setAdding(false)} className="admin-btn-outline">Cancel</button></div>
        </div>
      )}

      <div className="space-y-4">
        {seasons.map(s => (
          <div key={s.id} className="admin-card">
            <div className="flex items-start justify-between mb-4">
              <div><h3 className="font-bold text-gray-900">{s.label}</h3><p className="text-sm text-gray-500">{s.dates_display}</p></div>
              <div className="flex gap-2">
                {s.is_current ? <span className="status-active">Active</span> : <button onClick={() => setActive(s.slug)} disabled={saving} className="admin-btn-outline text-xs">{saving ? '...' : 'Set Active'}</button>}
                <button onClick={() => { setEditing(editing === s.id ? null : s.id); if (editing === s.id) load() }} className="admin-btn-outline text-xs">Edit</button>
                {!s.is_current && <button onClick={() => deleteSeason(s)} disabled={saving} className="text-xs text-red-500 hover:text-red-700 cursor-pointer bg-transparent border-none">Delete</button>}
              </div>
            </div>
            {editing === s.id && (
              <div className="border-t pt-4 mt-4 grid md:grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-500 mb-1">Label</label><input value={s.label} onChange={e => setSeasons(seasons.map(x => x.id === s.id ? {...x, label: e.target.value} : x))} className="admin-input" /></div>
                <div><label className="block text-xs font-medium text-gray-500 mb-1">Dates Display</label><input value={s.dates_display} onChange={e => setSeasons(seasons.map(x => x.id === s.id ? {...x, dates_display: e.target.value} : x))} className="admin-input" /></div>
                <div><label className="block text-xs font-medium text-gray-500 mb-1">Age-Up Date</label><input value={s.age_up_date || ''} onChange={e => setSeasons(seasons.map(x => x.id === s.id ? {...x, age_up_date: e.target.value} : x))} className="admin-input" /></div>
                <div><label className="block text-xs font-medium text-gray-500 mb-1">Warm-up Schedule Text</label><textarea value={s.warmup_schedule_text || ''} onChange={e => setSeasons(seasons.map(x => x.id === s.id ? {...x, warmup_schedule_text: e.target.value} : x))} className="admin-input h-20" /></div>
                <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-500 mb-1">{'Session Times (JSON array, e.g. [{"session":"Warm-up","time":"7:00 AM"}])'}</label><textarea value={s._session_times_raw !== undefined ? s._session_times_raw : (s.session_times_json ? JSON.stringify(s.session_times_json, null, 2) : '')} onChange={e => setSeasons(seasons.map(x => x.id === s.id ? {...x, _session_times_raw: e.target.value} : x))} className="admin-input h-24 font-mono text-xs" placeholder={'[{"session": "Warm-up", "time": "7:00 AM"}]'} /></div>
                <div className="flex gap-2"><button onClick={() => saveSeason(s)} disabled={saving} className="admin-btn">{saving ? 'Saving...' : 'Save Season'}</button><button onClick={() => { setEditing(null); load() }} className="admin-btn-outline">Cancel</button></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}
