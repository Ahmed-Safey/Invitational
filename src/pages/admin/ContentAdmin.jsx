import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/admin/AdminLayout'
import toast from 'react-hot-toast'

export default function ContentAdmin() {
  const [pageSlug, setPageSlug] = useState('')
  const [blocks, setBlocks] = useState([])
  const [allPages, setAllPages] = useState([])
  const [adding, setAdding] = useState(false)
  const [newBlock, setNewBlock] = useState({ block_key: '', block_type: 'text', label: '', content: '', sort_order: 0 })

  useEffect(() => {
    supabase.from('pages').select('slug, title').order('nav_order').then(({ data }) => setAllPages(data || []))
  }, [])

  const loadBlocks = useCallback(async () => {
    if (!pageSlug) return
    const { data } = await supabase.from('content_blocks').select('*').eq('page_slug', pageSlug).order('sort_order')
    setBlocks(data || [])
  }, [pageSlug])
  useEffect(() => { loadBlocks() }, [loadBlocks])

  const validateJson = (content, type) => {
    if (!['json', 'table', 'list'].includes(type)) return true
    if (!content || !content.trim()) return true
    try { JSON.parse(content); return true }
    catch (e) { toast.error(`Invalid JSON: ${e.message}`); return false }
  }

  const saveBlock = async (block) => {
    if (!validateJson(block.content, block.block_type)) return
    const { error } = await supabase.from('content_blocks').update({ content: block.content, label: block.label, is_visible: block.is_visible }).eq('id', block.id)
    if (error) toast.error(error.message)
    else toast.success('Content saved')
  }

  const addBlock = async () => {
    if (!newBlock.block_key.trim()) return toast.error('block_key is required')
    if (!validateJson(newBlock.content, newBlock.block_type)) return
    const { error } = await supabase.from('content_blocks').insert({ ...newBlock, page_slug: pageSlug, is_visible: true })
    if (error) toast.error(error.message)
    else { toast.success('Block added'); setAdding(false); setNewBlock({ block_key: '', block_type: 'text', label: '', content: '', sort_order: 0 }); loadBlocks() }
  }

  const deleteBlock = async (id) => {
    if (!confirm('Delete this content block?')) return
    const { error } = await supabase.from('content_blocks').delete().eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success('Block deleted'); loadBlocks() }
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Content</h1>
      <p className="text-sm text-gray-500 mb-6">Edit text content blocks for each page</p>

      <div className="flex gap-3 mb-6 items-center">
        <select value={pageSlug} onChange={e => setPageSlug(e.target.value)} className="admin-input max-w-xs">
          <option value="">Select a page...</option>
          {allPages.map(p => <option key={p.slug} value={p.slug}>{p.title || p.slug}</option>)}
        </select>
        {pageSlug && <button onClick={() => setAdding(!adding)} className="admin-btn">+ Add Block</button>}
      </div>

      {adding && pageSlug && (
        <div className="admin-card mb-4">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">New Content Block</h3>
          <div className="grid md:grid-cols-3 gap-3 mb-3">
            <input value={newBlock.block_key} onChange={e => setNewBlock({...newBlock, block_key: e.target.value})} placeholder="block_key (e.g. about_p4)" className="admin-input" />
            <input value={newBlock.label} onChange={e => setNewBlock({...newBlock, label: e.target.value})} placeholder="Admin label" className="admin-input" />
            <select value={newBlock.block_type} onChange={e => setNewBlock({...newBlock, block_type: e.target.value})} className="admin-input">
              <option value="text">Text</option><option value="html">HTML</option><option value="json">JSON</option><option value="table">Table</option><option value="list">List</option>
            </select>
          </div>
          <textarea value={newBlock.content} onChange={e => setNewBlock({...newBlock, content: e.target.value})} placeholder="Content..." className="admin-input h-24 mb-3" />
          <div className="flex gap-2">
            <button onClick={addBlock} className="admin-btn">Add Block</button>
            <button onClick={() => setAdding(false)} className="admin-btn-outline">Cancel</button>
          </div>
        </div>
      )}

      {blocks.length > 0 && (
        <div className="space-y-4">
          {blocks.map(b => (
            <div key={b.id} className="admin-card">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-mono text-gray-400">{b.block_key}</label>
                  {b.label && <span className="text-xs text-gray-500">({b.label})</span>}
                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded text-gray-400">{b.block_type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 text-xs cursor-pointer">
                    <input type="checkbox" checked={b.is_visible} onChange={e => {
                      setBlocks(blocks.map(x => x.id === b.id ? {...x, is_visible: e.target.checked} : x))
                    }} />
                    Visible
                  </label>
                  <button onClick={() => deleteBlock(b.id)} className="text-xs text-red-500 hover:underline cursor-pointer bg-transparent border-none">Delete</button>
                </div>
              </div>
              <textarea value={b.content} onChange={e => setBlocks(blocks.map(x => x.id === b.id ? {...x, content: e.target.value} : x))}
                className="admin-input h-24 font-mono text-sm mb-2" />
              <button onClick={() => saveBlock(b)} className="admin-btn text-xs">Save</button>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
