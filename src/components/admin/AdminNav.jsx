import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'

const links = [
  { to: '/admin', label: 'Dashboard', icon: '◉' },
  { to: '/admin/settings', label: 'Site Settings', icon: '⚙' },
  { to: '/admin/seasons', label: 'Seasons', icon: '📅' },
  { to: '/admin/pages', label: 'Pages', icon: '📄' },
  { to: '/admin/content', label: 'Content', icon: '✎' },
  { to: '/admin/events', label: 'Events', icon: '🏊' },
  { to: '/admin/scoring', label: 'Scoring', icon: '🏆' },
  { to: '/admin/media', label: 'Media', icon: '🖼' },
  { to: '/admin/programs', label: 'Programs', icon: '📋' },
  { to: '/admin/fees', label: 'Fees', icon: '💰' },
  { to: '/admin/integrations', label: 'Integrations', icon: '🔗' },
]

export default function AdminNav() {
  const location = useLocation()
  const { signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isActive = (to) => location.pathname === to

  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-white no-underline font-bold text-sm tracking-wider">SEIS Admin</Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-gray-400 bg-transparent border-none cursor-pointer text-xl w-11 h-11 flex items-center justify-center" aria-label="Toggle menu" aria-expanded={mobileOpen} aria-controls="admin-sidebar">
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Sidebar */}
      <aside id="admin-sidebar" className={`admin-sidebar flex flex-col z-40 transition-transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-5 border-b border-white/10 hidden md:block">
          <Link to="/" className="text-white no-underline font-bold text-sm tracking-wider">SEIS Admin</Link>
        </div>
        <div className="p-5 border-b border-white/10 md:hidden" />
        <nav className="flex-1 py-4 overflow-y-auto">
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm no-underline transition-colors ${isActive(l.to) ? 'bg-crimson text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <span className="text-base">{l.icon}</span> {l.label}
            </Link>
          ))}
        </nav>
        <div className="p-5 border-t border-white/10">
          <button onClick={signOut} className="w-full text-left text-sm text-gray-500 hover:text-white transition-colors cursor-pointer bg-transparent border-none">Sign Out</button>
          <Link to="/" className="block mt-2 text-xs text-gray-600 no-underline hover:text-gray-400">&larr; View Public Site</Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && <div onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-black/50 z-30 md:hidden" />}
    </>
  )
}
