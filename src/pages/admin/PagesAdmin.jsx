import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useSite } from '../../lib/SiteContext'
import AdminLayout from '../../components/admin/AdminLayout'
import toast from 'react-hot-toast'

export default function PagesAdmin() {
  const { refetch } = useSite()
  const [pagesList, setPagesList] = useState([])
  const [editing, setEditing] = useState(null)

  const load = async () => {
    const { data } = await supabase.from('pages').select('*').order('nav_order')
    setPagesList(data || [])
  }
  useEffect(() => { load() }, [])

  const toggleVisible = async (p) => {
    if (p.slug === 'home') return toast.error('Cannot hide homepage')
    await supabase.from('pages').update({ is_visible: !p.is_visible }).eq('id', p.id)
    toast.success(`${p.title} ${p.is_visible ? 'hidden' : 'visible'}`)
    load(); refetch()
  }

  const savePage = async (p) => {
    const { error } = await supabase.from('pages').update({
      title: p.title, subtitle: p.subtitle, meta_description: p.meta_description,
      nav_label: p.nav_label, nav_order: p.nav_order
    }).eq('id', p.id)
    if (error) toast.error(error.message)
    else { toast.success('Page updated'); setEditing(null); load(); refetch() }
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Pages</h1>
      <p className="text-sm text-gray-500 mb-6">Toggle page visibility and edit metadata</p>
      <div className="space-y-3">
        {pagesList.map(p => (
          <div key={p.id} className="admin-card">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-gray-900">{p.title}</span>
                <span className="text-xs text-gray-400 ml-2">/{p.slug === 'home' ? '' : p.slug}</span>
                {p.nav_label && <span className="text-xs ml-2 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">Nav: {p.nav_label}</span>}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => toggleVisible(p)}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer border-none ${p.is_visible ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <span className={`block w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${p.is_visible ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
                <button onClick={() => { if (editing === p.id) { setEditing(null); load() } else setEditing(p.id) }} className="admin-btn-outline text-xs">Edit</button>
              </div>
            </div>
            {editing === p.id && (
              <div className="border-t pt-4 mt-4 grid md:grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-500 mb-1">Title</label><input value={p.title} onChange={e => setPagesList(pagesList.map(x => x.id === p.id ? {...x, title: e.target.value} : x))} className="admin-input" /></div>
                <div><label className="block text-xs font-medium text-gray-500 mb-1">Subtitle</label><input value={p.subtitle || ''} onChange={e => setPagesList(pagesList.map(x => x.id === p.id ? {...x, subtitle: e.target.value} : x))} className="admin-input" /></div>
                <div><label className="block text-xs font-medium text-gray-500 mb-1">Nav Label (empty = hide from nav)</label><input value={p.nav_label || ''} onChange={e => setPagesList(pagesList.map(x => x.id === p.id ? {...x, nav_label: e.target.value} : x))} className="admin-input" /></div>
                <div><label className="block text-xs font-medium text-gray-500 mb-1">Nav Order</label><input type="number" value={p.nav_order} onChange={e => setPagesList(pagesList.map(x => x.id === p.id ? {...x, nav_order: parseInt(e.target.value) || 0} : x))} className="admin-input" /></div>
                <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-500 mb-1">Meta Description</label><textarea value={p.meta_description || ''} onChange={e => setPagesList(pagesList.map(x => x.id === p.id ? {...x, meta_description: e.target.value} : x))} className="admin-input h-16" /></div>
                <div className="flex gap-2"><button onClick={() => savePage(p)} className="admin-btn">Save Page</button><button onClick={() => { setEditing(null); load() }} className="admin-btn-outline">Cancel</button></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}
