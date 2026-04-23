import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // `null` = "haven't checked yet". We cannot default to `false` because
  // AdminLayout would then redirect signed-in admins to the login page
  // during the brief window before the RPC resolves — which caused a
  // render-loop + Chrome's navigation throttle on the admin dashboard.
  const [isAdmin, setIsAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  // Verify the signed-in user is on the admins allow-list via a server-side RPC
  // (`is_current_user_admin()` wraps `is_admin()`). RLS already blocks their
  // data reads/writes, but this lets the UI redirect them out of `/admin/*`
  // instead of showing an empty shell.
  const verifyAdmin = async (session) => {
    if (!session?.user) { setIsAdmin(false); return }
    const { data, error } = await supabase.rpc('is_current_user_admin')
    if (error) {
      console.warn('is_current_user_admin RPC failed:', error.message)
      setIsAdmin(false)
    } else {
      setIsAdmin(!!data)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)
      await verifyAdmin(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, session) => {
      setUser(session?.user ?? null)
      // Reset to "unknown" while re-verifying so AdminLayout keeps showing
      // the loading state instead of flashing the login redirect.
      setIsAdmin(null)
      await verifyAdmin(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
