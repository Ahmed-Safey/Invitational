import { Navigate } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import AdminNav from './AdminNav'
import Loading from '../public/Loading'

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loading />
  if (!user) return <Navigate to="/admin/login" replace />

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="admin-content flex-1 pt-14 md:pt-0">{children}</main>
    </div>
  )
}
