import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useSite } from '../../lib/SiteContext'
import AdminLayout from '../../components/admin/AdminLayout'

export default function Dashboard() {
  const { settings, currentSeason, pages, getMediaUrl } = useSite()
  const [stats, setStats] = useState({ events: 0, blocks: 0, media: 0 })

  useEffect(() => {
    Promise.all([
      supabase.from('events').select('id', { count: 'exact', head: true }),
      supabase.from('content_blocks').select('id', { count: 'exact', head: true }),
      supabase.from('media').select('id', { count: 'exact', head: true }),
    ]).then(([evRes, cbRes, mRes]) => {
      setStats({
        events: evRes.count || 0,
        blocks: cbRes.count || 0,
        media: mRes.count || 0,
      })
    })
  }, [])

  const s = settings

  const StatusBadge = ({ active, label }) => (
    <span className={active ? 'status-active' : 'status-inactive'}>{active ? '✓ ' : '✗ '}{label}</span>
  )

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="admin-card">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Active Season</h3>
          <p className="text-xl font-bold text-gray-900">{currentSeason?.label || '—'}</p>
          <p className="text-xs text-gray-400">{currentSeason?.dates_display}</p>
        </div>
        <div className="admin-card">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Pages</h3>
          <p className="text-xl font-bold text-gray-900">{pages.filter(p => p.is_visible).length} <span className="text-sm font-normal text-gray-400">/ {pages.length}</span></p>
          <p className="text-xs text-gray-400">visible / total</p>
        </div>
        <div className="admin-card">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Events</h3>
          <p className="text-xl font-bold text-gray-900">{stats.events}</p>
          <p className="text-xs text-gray-400">event rows in database</p>
        </div>
        <div className="admin-card">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Content Blocks</h3>
          <p className="text-xl font-bold text-gray-900">{stats.blocks}</p>
          <p className="text-xs text-gray-400">editable text blocks</p>
        </div>
      </div>

      <div className="admin-card mb-8">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Integration Status</h3>
        <div className="flex flex-wrap gap-3">
          <StatusBadge active={!!s?.results_url} label="Results PDF" />
          <StatusBadge active={!!s?.stream_url} label="Live Stream" />
          <StatusBadge active={!!s?.google_form_url} label="Interest Form" />
          <StatusBadge active={!!s?.google_form_embed_url} label="Form Embed" />
          <StatusBadge active={!!s?.meet_info_pdf_url} label="Meet Info PDF" />
          <StatusBadge active={!!s?.entry_form_url} label="Entry Form" />
        </div>
        <p className="text-xs text-gray-400 mt-3">Last updated: {s?.updated_at ? new Date(s.updated_at).toLocaleString() : '—'}</p>
      </div>

      <div className="admin-card mb-8">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Media Status</h3>
        <div className="flex flex-wrap gap-3">
          {['seis-logo', 'cac-logo', 'hero-photo', 'eagle-watermark'].map(slug => (
            <StatusBadge key={slug} active={!!getMediaUrl(slug)} label={slug} />
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">Manage images in <Link to="/admin/media" className="text-crimson hover:underline">Media</Link></p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Link to="/admin/integrations" className="admin-btn no-underline">Set URLs →</Link>
        <Link to="/admin/media" className="admin-btn-outline no-underline">Manage Media →</Link>
        <Link to="/admin/events" className="admin-btn-outline no-underline">Edit Events ({stats.events}) →</Link>
        <Link to="/admin/content" className="admin-btn-outline no-underline">Edit Content ({stats.blocks}) →</Link>
        <a href="/" target="_blank" rel="noreferrer" className="admin-btn-outline no-underline">View Live Site ↗</a>
      </div>
    </AdminLayout>
  )
}
