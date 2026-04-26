import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useSite } from '../../lib/SiteContext'
import AdminLayout from '../../components/admin/AdminLayout'
import toast from 'react-hot-toast'

const emptyEvent = { event_number: 0, gender: 'girls', event_name: '', distance: null, stroke: 'freestyle', age_group: '11+', format: 'prelims', day: 1, session: 'morning', sort_order: 0, is_break: false, break_label: '' }
const emptySession = { day: 1, title: '', description: '', start_time: '', sort_order: 0 }

function SessionForm({ sess, onSave, onCancel, saving }) {
  const [f, setF] = useState(sess)
  return (
    <tr className="bg-blue-50">
      <td className="p-2"><select value={f.day} onChange={e => setF({...f, day: parseInt(e.target.value)})} className="admin-input w-14"><option value={1}>1</option><option value={2}>2</option></select></td>
      <td className="p-2"><input value={f.title} onChange={e => setF({...f, title: e.target.value})} className="admin-input" placeholder="e.g. Session 1 — 11+ Prelims" /></td>
      <td className="p-2"><input value={f.description || ''} onChange={e => setF({...f, description: e.target.value})} className="admin-input" placeholder="Events in this session..." /></td>
      <td className="p-2"><input value={f.start_time || ''} onChange={e => setF({...f, start_time: e.target.value})} className="admin-input w-24" placeholder="8:00 AM" /></td>
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

  // Sessions state
  const [sessions, setSessions] = useState([])
  const [editingSession, setEditingSession] = useState(null)
  const [newSession, setNewSession] = useState(null)
  const [showSessions, setShowSessions] = useState(true)

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

  const loadSessions = async () => {
    const slug = filter.season || currentSeason?.slug
    if (!slug) return
    const { data } = await supabase.from('meet_sessions').select('*').eq('season_slug', slug).order('day').order('sort_order')
    setSessions(data || [])
  }
  useEffect(() => { loadSessions() }, [filter.season, currentSeason?.slug])

  const saveSession = async (sess) => {
    setSaving(true)
    const data = {
      day: sess.day, title: sess.title, description: sess.description || null,
      start_time: sess.start_time || null, sort_order: sess.sort_order,
      season_slug: sess.season_slug || filter.season || currentSeason?.slug,
    }
    if (sess.id) {
      const { error } = await supabase.from('meet_sessions').update(data).eq('id', sess.id)
      if (error) toast.error(error.message)
      else { toast.success('Session updated'); setEditingSession(null); loadSessions() }
    } else {
      const { error } = await supabase.from('meet_sessions').insert(data)
      if (error) toast.error(error.message)
      else { toast.success('Session added'); setNewSession(null); loadSessions() }
    }
    setSaving(false)
  }

  const deleteSession = async (id) => {
    if (!confirm('Delete this session?')) return
    const { error } = await supabase.from('meet_sessions').delete().eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success('Session deleted'); loadSessions() }
  }

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

      {/* ─── Sessions ─── */}
      <div className="flex items-center justify-between mb-2 mt-8">
        <h2 className="text-lg font-bold text-gray-900 cursor-pointer" onClick={() => setShowSessions(!showSessions)}>{showSessions ? '▾' : '▸'} Sessions <span className="text-sm font-normal text-gray-400">({sessions.length})</span></h2>
        <button onClick={() => setNewSession({...emptySession, season_slug: filter.season || currentSeason?.slug, sort_order: sessions.length + 1})} className="admin-btn text-xs">+ Add Session</button>
      </div>

      {showSessions && (
        <div className="admin-card overflow-x-auto mb-8">
          <table className="admin-table">
            <thead><tr><th>Day</th><th>Title</th><th>Description</th><th>Time</th><th>Order</th><th>Actions</th></tr></thead>
            <tbody>
              {newSession && <SessionForm sess={newSession} saving={saving} onSave={saveSession} onCancel={() => setNewSession(null)} />}
              {sessions.map(s => editingSession === s.id ? (
                <SessionForm key={s.id} sess={s} saving={saving} onSave={saveSession} onCancel={() => setEditingSession(null)} />
              ) : (
                <tr key={s.id}>
                  <td className="font-bold">{s.day}</td>
                  <td className="font-medium">{s.title}</td>
                  <td className="text-xs text-gray-500 max-w-[300px] truncate">{s.description || '—'}</td>
                  <td className="text-xs">{s.start_time || 'TBC'}</td>
                  <td className="text-xs text-gray-400">{s.sort_order}</td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => setEditingSession(s.id)} className="text-xs text-blue-600 hover:underline cursor-pointer bg-transparent border-none">Edit</button>
                      <button onClick={() => deleteSession(s.id)} className="text-xs text-red-600 hover:underline cursor-pointer bg-transparent border-none">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && !newSession && <tr><td colSpan="6" className="text-center text-gray-400 py-4">No sessions yet — add one above</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── Events ─── */}
      <h2 className="text-lg font-bold text-gray-900 mb-2">Events <span className="text-sm font-normal text-gray-400">({eventCount} events + {breakCount} breaks)</span></h2>

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
