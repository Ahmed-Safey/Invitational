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

  // Defense-in-depth: sign out users who are authenticated but NOT on the
  // admins allow-list. Debounce by 600ms so a transient null→false→true
  // flicker during GoTrue token refresh or rapid navigation doesn't trigger
  // a premature logout. If isAdmin stays false for 600ms, it's real.
  useEffect(() => {
    if (user && isAdmin === false) {
      const id = setTimeout(() => signOut(), 600)
      return () => clearTimeout(id)
    }
  }, [user, isAdmin, signOut])

  if (loading) return <Loading />
  if (!user) return <Navigate to="/admin/login" replace />
  // isAdmin === null means the RPC hasn't resolved yet — keep showing the
  // loading state instead of bouncing to /admin/login.
  if (isAdmin === null) return <Loading />
  if (isAdmin === false) return <Navigate to="/admin/login" replace />

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="admin-content flex-1 pt-14 md:pt-0">{children}</main>
    </div>
  )
}
