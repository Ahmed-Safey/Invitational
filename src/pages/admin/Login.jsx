import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import PageTitle from '../../components/public/PageTitle'

export default function Login() {
  const { user, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/admin" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error: err } = await signIn(email, password)
    if (err) setError(err.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <PageTitle title="Admin Sign In" />
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-white font-bold text-xl tracking-wider">SEIS Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Swimming Eagles Invitational Series</p>
        </div>
        <div className="bg-white rounded-lg p-8 shadow-xl">
          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="admin-input mb-4" required />
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="admin-input mb-6" required />
            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
            <button type="submit" disabled={loading} className="admin-btn w-full">{loading ? 'Signing in...' : 'Sign In'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}
