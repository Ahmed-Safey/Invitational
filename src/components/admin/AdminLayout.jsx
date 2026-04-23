import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import AdminNav from './AdminNav'
import Loading from '../public/Loading'

const TITLE_MAP = {
  '/admin': 'Dashboard',
  '/admin/settings': 'Settings',
  '/admin/seasons': 'Seasons',
  '/admin/pages': 'Pages',
  '/admin/content': 'Content',
  '/admin/events': 'Events',
  '/admin/scoring': 'Scoring',
  '/admin/media': 'Media',
  '/admin/programs': 'Programs',
  '/admin/fees': 'Fees',
  '/admin/integrations': 'Integrations',
  '/admin/login': 'Admin Login',
}

export default function AdminLayout({ children }) {
  const { user, isAdmin, loading, signOut } = useAuth()
  const { pathname } = useLocation()

  useEffect(() => {
    const label = TITLE_MAP[pathname] || 'Admin'
    document.title = `${label} · Admin | SEIS`
  }, [pathname])

  if (loading) return <Loading />
  if (!user) return <Navigate to="/admin/login" replace />
  // Defense-in-depth: a signed-in user who isn't on the admins allow-list gets
  // kicked out of the admin shell instead of seeing an empty (RLS-blocked)
  // dashboard. Sign them out so they stop appearing authenticated elsewhere.
  if (!isAdmin) {
    signOut()
    return <Navigate to="/admin/login" replace />
  }

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="admin-content flex-1 pt-14 md:pt-0">{children}</main>
    </div>
  )
}
