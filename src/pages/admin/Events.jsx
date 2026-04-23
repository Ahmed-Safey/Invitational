import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useSite } from '../../lib/SiteContext'
import AdminLayout from '../../components/admin/AdminLayout'
import toast from 'react-hot-toast'

const emptyEvent = { event_number: 0, gender: 'girls', event_name: '', distance: null, stroke: 'freestyle', age_group: '11+', format: 'prelims', day: 1, session: 'morning', sort_order: 0, is_break: false, break_label: '' }

// Defined outside to keep identity stable; otherwise parent re-renders would
// unmount the row-editor and drop the user's in-progress edits.
function EventForm({ evt, onSave, onCancel, saving }) {
  const [f, setF] = useState(evt)
  return (
    <tr className="bg-blue-50">
      <td className="p-2"><input type="number" inputMode="numeric" value={f.event_number} onChange={e => setF({...f, event_number: parseInt(e.target.value) || 0})} className="admin-input w-16" /></td>
      <td className="p-2">
        <select value={f.gender} onChange={e => setF({...f, gender: e.target.value})} className="admin-input w-20">
          <option value="girls">Girls</option><option value="boys">Boys</option><option value="mixed">Mixed</option>
        </select>
      </td>
      <td className="p-2">
        {f.is_break ? (
          <input value={f.break_label || ''} onChange={e => setF({...f, break_label: e.target.value, event_name: e.target.value})} placeholder="Break label..." className="admin-input" />
        ) : (
          <input value={f.event_name} onChange={e => setF({...f, event_name: e.target.value})} className="admin-input" />
        )}
      </td>
      <td className="p-2"><input type="number" inputMode="numeric" value={f.distance || ''} onChange={e => setF({...f, distance: e.target.value ? parseInt(e.target.value) : null})} placeholder="—" className="admin-input w-16" /></td>
      <td className="p-2">
        <select value={f.stroke || ''} onChange={e => setF({...f, stroke: e.target.value || null})} className="admin-input w-24">
          <option value="">—</option><option value="freestyle">Free</option><option value="backstroke">Back</option><option value="breaststroke">Breast</option><option value="butterfly">Fly</option><option value="im">IM</option><option value="relay">Relay</option>
        </select>
      </td>
      <td className="p-2"><select value={f.age_group} onChange={e => setF({...f, age_group: e.target.value})} className="admin-input w-20"><option value="8u">8u</option><option value="9-10">9-10</option><option value="11+">11+</option></select></td>
      <td className="p-2"><select value={f.format} onChange={e => setF({...f, format: e.target.value})} className="admin-input w-28"><option value="timed_final">Timed Final</option><option value="prelims">Prelims</option><option value="finals">Finals</option></select></td>
      <td className="p-2"><select value={f.day} onChange={e => setF({...f, day: parseInt(e.target.value)})} className="admin-input w-14"><option value={1}>1</option><option value={2}>2</option></select></td>
      <td className="p-2"><select value={f.session} onChange={e => setF({...f, session: e.target.value})} className="admin-input w-24"><option value="morning">AM</option><option value="evening">PM</option></select></td>
      <td className="p-2"><input type="number" inputMode="numeric" value={f.sort_order} onChange={e => setF({...f, sort_order: parseInt(e.target.value) || 0})} className="admin-input w-16" /></td>
      <td className="p-2">
        <div className="flex gap-1">
          <button onClick={() => onSave(f)} disabled={saving} className="admin-btn text-xs">{saving ? '...' : 'Save'}</button>
          <button onClick={onCancel} className="admin-btn-outline text-xs">Cancel</button>
        </div>
      </td>
    </tr>
  )
}

export default function Events() {
  const { refetch, seasons, currentSeason } = useSite()
  const [events, setEvents] = useState([])
  const [filter, setFilter] = useState({ day: '', session: '', season: '' })
  const [editing, setEditing] = useState(null)
  const [newEvent, setNewEvent] = useState(null)
  const [saving, setSaving] = useState(false)

  // Default the season filter to the currently active season once it loads
  useEffect(() => {
    if (!filter.season && currentSeason?.slug) setFilter(f => ({ ...f, season: currentSeason.slug }))
  }, [currentSeason?.slug])

  const load = async () => {
    let q = supabase.from('events').select('*').order('day').order('sort_order')
    if (filter.season) q = q.eq('season_slug', filter.season)
    const { data } = await q
    setEvents(data || [])
  }
  useEffect(() => { load() }, [filter.season])

  let filtered = events
  if (filter.day) filtered = filtered.filter(e => e.day === parseInt(filter.day))
  if (filter.session) filtered = filtered.filter(e => e.session === filter.session)

  const saveEvent = async (evt) => {
    setSaving(true)
    const data = {
      event_number: evt.event_number, gender: evt.gender, event_name: evt.event_name,
      distance: evt.distance, stroke: evt.stroke, age_group: evt.age_group,
      format: evt.format, day: evt.day, session: evt.session,
      sort_order: evt.sort_order, is_break: evt.is_break, break_label: evt.break_label,
      season_slug: evt.season_slug || filter.season || currentSeason?.slug,
    }
    if (evt.id) {
      const { error } = await supabase.from('events').update(data).eq('id', evt.id)
      if (error) toast.error(error.message)
      else { toast.success('Event updated'); setEditing(null); load() }
    } else {
      const { error } = await supabase.from('events').insert(data)
      if (error) toast.error(error.message)
      else { toast.success('Event added'); setNewEvent(null); load() }
    }
    setSaving(false)
  }

  const deleteEvent = async (id) => {
    if (!confirm('Delete this event?')) return
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success('Event deleted'); load() }
  }

  const addBreak = () => {
    setNewEvent({
      event_number: 0, gender: 'mixed', event_name: 'Break', distance: null,
      stroke: null, age_group: '11+', format: 'timed_final',
      day: filter.day ? parseInt(filter.day) : 1,
      session: filter.session || 'morning',
      sort_order: events.length + 1, is_break: true, break_label: 'Break',
      season_slug: filter.season || currentSeason?.slug,
    })
  }

  const eventCount = events.filter(e => !e.is_break).length
  const breakCount = events.filter(e => e.is_break).length

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Events</h1>
      <p className="text-sm text-gray-500 mb-4">{eventCount} events + {breakCount} breaks across {new Set(events.map(e => e.day)).size} days</p>

      <div className="flex gap-3 mb-4 flex-wrap">
        <select value={filter.season} onChange={e => setFilter({...filter, season: e.target.value})} className="admin-input max-w-[200px]">
          {seasons.map(s => <option key={s.slug} value={s.slug}>{s.label}{s.is_current ? ' (active)' : ''}</option>)}
        </select>
        <select value={filter.day} onChange={e => setFilter({...filter, day: e.target.value})} className="admin-input max-w-[150px]"><option value="">All Days</option><option value="1">Day 1</option><option value="2">Day 2</option></select>
        <select value={filter.session} onChange={e => setFilter({...filter, session: e.target.value})} className="admin-input max-w-[150px]"><option value="">All Sessions</option><option value="morning">Morning</option><option value="evening">Evening</option></select>
        <button onClick={() => setNewEvent({...emptyEvent, sort_order: events.length + 1, season_slug: filter.season || currentSeason?.slug})} className="admin-btn">+ Add Event</button>
        <button onClick={addBreak} className="admin-btn-outline">+ Add Break</button>
      </div>

      <div className="admin-card overflow-x-auto">
        <table className="admin-table">
          <thead><tr><th>#</th><th>Gender</th><th>Event</th><th>Dist</th><th>Stroke</th><th>Age</th><th>Format</th><th>Day</th><th>Session</th><th>Order</th><th>Actions</th></tr></thead>
          <tbody>
            {newEvent && <EventForm evt={newEvent} saving={saving} onSave={saveEvent} onCancel={() => setNewEvent(null)} />}
            {filtered.map(e => editing === e.id ? (
              <EventForm key={e.id} evt={e} saving={saving} onSave={saveEvent} onCancel={() => setEditing(null)} />
            ) : (
              <tr key={e.id} className={e.is_break ? 'bg-amber-50' : ''}>
                <td className="font-bold">{e.is_break ? '—' : e.event_number}</td>
                <td>{e.gender}</td>
                <td>{e.is_break ? <em className="text-amber-600">{e.break_label}</em> : e.event_name}</td>
                <td className="text-xs text-gray-400">{e.distance || '—'}</td>
                <td className="text-xs text-gray-400">{e.stroke || '—'}</td>
                <td>{e.age_group}</td>
                <td className="text-xs">{e.format?.replace('_', ' ')}</td>
                <td>{e.day}</td>
                <td>{e.session}</td>
                <td className="text-xs text-gray-400">{e.sort_order}</td>
                <td>
                  <div className="flex gap-1">
                    <button onClick={() => setEditing(e.id)} className="text-xs text-blue-600 hover:underline cursor-pointer bg-transparent border-none">Edit</button>
                    <button onClick={() => deleteEvent(e.id)} className="text-xs text-red-600 hover:underline cursor-pointer bg-transparent border-none">Del</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
