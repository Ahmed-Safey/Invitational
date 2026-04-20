import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useSite } from '../../lib/SiteContext'
import AdminLayout from '../../components/admin/AdminLayout'
import toast from 'react-hot-toast'
import { PROGRAM_TYPES, PROGRAM_TYPE_LABELS as TYPE_LABELS, buildProgramSlotsForSeason } from '../../lib/constants'

export default function ProgramsAdmin() {
  const { seasons } = useSite()
  const [programs, setPrograms] = useState([])

  const load = async () => {
    const { data } = await supabase.from('programs').select('*').order('season_slug').order('program_type')
    setPrograms(data || [])
  }
  useEffect(() => { load() }, [])

  const saveProgram = async (p) => {
    const { error } = await supabase.from('programs').update({
      google_drive_url: p.google_drive_url, is_published: p.is_published, label: p.label
    }).eq('id', p.id)
    if (error) toast.error(error.message)
    else { toast.success('Program updated'); load() }
  }

  const deleteProgram = async (p) => {
    if (!confirm(`Delete "${TYPE_LABELS[p.program_type] || p.label}" for this season?`)) return
    const { error } = await supabase.from('programs').delete().eq('id', p.id)
    if (error) toast.error(error.message)
    else { toast.success('Program deleted'); load() }
  }

  const addMissingSlots = async (seasonSlug, seasonLabel) => {
    const existing = programs.filter(p => p.season_slug === seasonSlug).map(p => p.program_type)
    const missing = PROGRAM_TYPES.filter(t => !existing.includes(t))
    if (missing.length === 0) return toast('All program slots already exist')
    const rows = buildProgramSlotsForSeason(seasonSlug, seasonLabel).filter(r => missing.includes(r.program_type))
    const { error } = await supabase.from('programs').insert(rows)
    if (error) toast.error(error.message)
    else { toast.success(`Added ${missing.length} program slot(s)`); load() }
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Programs</h1>
      <p className="text-sm text-gray-500 mb-6">Manage downloadable documents per season</p>
      <div>
        {seasons.map(s => {
          const seasonPrograms = programs.filter(p => p.season_slug === s.slug)
          const hasMissing = PROGRAM_TYPES.some(t => !seasonPrograms.find(p => p.program_type === t))
          return (
            <div key={s.slug} className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="font-bold text-gray-900">{s.label} {s.is_current && <span className="status-active ml-2">Active</span>}</h3>
                {hasMissing && <button onClick={() => addMissingSlots(s.slug, s.label)} className="admin-btn-outline text-xs">+ Add Missing Slots</button>}
              </div>
              {seasonPrograms.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No program slots yet. Click "Add Missing Slots" to create them.</p>
              ) : (
                <div className="space-y-3">
                  {seasonPrograms.map(p => (
                    <div key={p.id} className="admin-card flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm text-gray-900">{TYPE_LABELS[p.program_type] || p.label}</p>
                          <span className="text-xs text-gray-400">{p.program_type}</span>
                        </div>
                        <input value={p.google_drive_url || ''} onChange={e => setPrograms(programs.map(x => x.id === p.id ? {...x, google_drive_url: e.target.value} : x))}
                          placeholder="Google Drive link..." className="admin-input mt-1" />
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1 text-sm cursor-pointer">
                          <input type="checkbox" checked={p.is_published} onChange={e => setPrograms(programs.map(x => x.id === p.id ? {...x, is_published: e.target.checked} : x))} />
                          Published
                        </label>
                        <button onClick={() => saveProgram(p)} className="admin-btn text-xs">Save</button>
                        <button onClick={() => deleteProgram(p)} className="text-xs text-red-400 hover:text-red-600 cursor-pointer bg-transparent border-none">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </AdminLayout>
  )
}
