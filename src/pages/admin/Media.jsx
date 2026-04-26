import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useSite } from '../../lib/SiteContext'
import AdminLayout from '../../components/admin/AdminLayout'
import toast from 'react-hot-toast'

const CORE_MEDIA_SLUGS = ['seis-logo','cac-logo','screaming-eagle','hero-photo','page-header-bg']

export default function Media() {
  const { refetch } = useSite()
  const [mediaList, setMediaList] = useState([])
  const [adding, setAdding] = useState(false)
  const [newMedia, setNewMedia] = useState({ slug: '', label: '', google_drive_url: '', usage_hint: '', alt_text: '' })
  const [failedIds, setFailedIds] = useState(new Set())

  const load = async () => {
    const { data } = await supabase.from('media').select('*').order('slug')
    setMediaList(data || [])
  }
  useEffect(() => { load() }, [])

  const autoConvert = (url) => {
    if (!url) return url
    const match = url.match(/\/d\/([^/]+)/)
    if (match && !url.includes('thumbnail')) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1920`
    }
    return url
  }

  const saveMedia = async (m) => {
    const url = autoConvert(m.google_drive_url || '')
    const { error } = await supabase.from('media').update({ google_drive_url: url, alt_text: m.alt_text, usage_hint: m.usage_hint, label: m.label }).eq('id', m.id)
    if (error) toast.error(error.message)
    else { toast.success('Media updated'); load(); refetch() }
  }

  const addMedia = async () => {
    const { error } = await supabase.from('media').insert({ ...newMedia, google_drive_url: autoConvert(newMedia.google_drive_url) })
    if (error) toast.error(error.message)
    else { toast.success('Media slot added'); setAdding(false); setNewMedia({ slug: '', label: '', google_drive_url: '', usage_hint: '', alt_text: '' }); load(); refetch() }
  }

  const deleteMedia = async (id, slug) => {
    if (CORE_MEDIA_SLUGS.includes(slug)) return toast.error('Cannot delete core media slots')
    if (!confirm('Delete this media slot?')) return
    await supabase.from('media').delete().eq('id', id)
    toast.success('Deleted'); load(); refetch()
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Media</h1>
      <p className="text-sm text-gray-500 mb-2">Manage Google Drive URLs for all images and logos. Paste a sharing link and it auto-converts to thumbnail format.</p>
      <div className="text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded p-3 mb-4">
        <strong className="text-gray-500">Accepted formats:</strong>{' '}
        <code className="bg-gray-100 px-1 rounded">https://drive.google.com/file/d/FILE_ID/view?usp=sharing</code>{' '}
        or <code className="bg-gray-100 px-1 rounded">https://drive.google.com/thumbnail?id=FILE_ID&amp;sz=w1920</code>
      </div>
      <button onClick={() => setAdding(!adding)} className="admin-btn mb-4">+ Add Media Slot</button>

      {adding && (
        <div className="admin-card mb-4">
          <div className="grid md:grid-cols-2 gap-3 mb-3">
            <input value={newMedia.slug} onChange={e => setNewMedia({...newMedia, slug: e.target.value})} placeholder="slug (e.g. pool-photo-2)" className="admin-input" />
            <input value={newMedia.label} onChange={e => setNewMedia({...newMedia, label: e.target.value})} placeholder="Label" className="admin-input" />
            <input value={newMedia.google_drive_url} onChange={e => setNewMedia({...newMedia, google_drive_url: e.target.value})} placeholder="Google Drive URL" className="admin-input" />
            <input value={newMedia.usage_hint} onChange={e => setNewMedia({...newMedia, usage_hint: e.target.value})} placeholder="Where it's used" className="admin-input" />
          </div>
          <div className="flex gap-2"><button onClick={addMedia} className="admin-btn">Add</button><button onClick={() => setAdding(false)} className="admin-btn-outline">Cancel</button></div>
        </div>
      )}

      <div className="space-y-4">
        {mediaList.map(m => (
          <div key={m.id} className="admin-card">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center shrink-0 overflow-hidden relative">
                {m.google_drive_url
                  ? <img src={m.google_drive_url} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" onLoad={() => setFailedIds(prev => { const n = new Set(prev); n.delete(m.id); return n })} onError={e => { e.target.style.visibility='hidden'; setFailedIds(prev => new Set(prev).add(m.id)) }} />
                  : <span className="text-gray-400 text-2xl">🖼</span>}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900">{m.label}</span>
                  <span className="text-xs text-gray-400 font-mono">{m.slug}</span>
                  {failedIds.has(m.id) && m.google_drive_url && (
                    <span title="Image failed to load. Ensure the Google Drive file is set to 'Anyone with the link can view'." className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded font-medium">⚠ Preview failed</span>
                  )}
                  {!CORE_MEDIA_SLUGS.includes(m.slug) && <button onClick={() => deleteMedia(m.id, m.slug)} className="text-xs text-red-400 hover:text-red-600 ml-auto cursor-pointer bg-transparent border-none">Delete</button>}
                </div>
                <p className="text-xs text-gray-400 mb-2">Used in: {m.usage_hint}</p>
                <input value={m.google_drive_url || ''} onChange={e => setMediaList(mediaList.map(x => x.id === m.id ? {...x, google_drive_url: e.target.value} : x))} placeholder="Paste Google Drive sharing link..." className="admin-input mb-2" />
                <div className="flex gap-2">
                  <input value={m.alt_text || ''} onChange={e => setMediaList(mediaList.map(x => x.id === m.id ? {...x, alt_text: e.target.value} : x))} placeholder="Alt text..." className="admin-input flex-1" />
                  <button onClick={() => saveMedia(m)} className="admin-btn text-xs">Save</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}
