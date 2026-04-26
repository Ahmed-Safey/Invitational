import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext({})

// Max time we'll keep the admin shell in the "Loading" state waiting for the
// is_admin RPC to resolve. If the call hangs (network, stuck gotrue lock,
// supabase down) we assume "not admin" so the UI never wedges.
const ADMIN_RPC_TIMEOUT_MS = 8000

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // `null` = "haven't checked yet". We cannot default to `false` because
  // AdminLayout would then redirect signed-in admins to the login page
  // during the brief window before the RPC resolves — which caused a
  // render-loop + Chrome's navigation throttle on the admin dashboard.
  const [isAdmin, setIsAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  // Track the user id we last verified and whether a verify is in flight,
  // so we never start two concurrent is_admin RPCs. Two concurrent calls
  // race on gotrue's auth lock and one of them hangs forever — that was the
  // "keeps loading without opening" symptom on /admin after refresh.
  const lastVerifiedUserIdRef = useRef(undefined)
  const verifyInFlightRef = useRef(false)

  // Verify the signed-in user is on the admins allow-list via a server-side RPC
  // (`is_current_user_admin()` wraps `is_admin()`). RLS already blocks their
  // data reads/writes, but this lets the UI redirect them out of `/admin/*`
  // instead of showing an empty shell.
  const verifyAdmin = async (session) => {
    const uid = session?.user?.id ?? null
    if (!uid) {
      lastVerifiedUserIdRef.current = null
      setIsAdmin(false)
      return
    }
    // If we already verified this exact user and a check isn't in flight,
    // don't re-run — isAdmin doesn't change mid-session, and re-running
    // races with the first call on gotrue's lock.
    if (lastVerifiedUserIdRef.current === uid && !verifyInFlightRef.current) return
    if (verifyInFlightRef.current) return
    verifyInFlightRef.current = true
    try {
      const result = await Promise.race([
        supabase.rpc('is_current_user_admin'),
        new Promise(resolve => setTimeout(() => resolve({ data: null, error: new Error('timeout') }), ADMIN_RPC_TIMEOUT_MS)),
      ])
      if (result.error) {
        console.warn('is_current_user_admin RPC failed:', result.error.message)
        setIsAdmin(false)
      } else {
        setIsAdmin(!!result.data)
      }
      lastVerifiedUserIdRef.current = uid
    } finally {
      verifyInFlightRef.current = false
    }
  }

  useEffect(() => {
    let cancelled = false

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (cancelled) return
      setUser(session?.user ?? null)
      await verifyAdmin(session)
      if (!cancelled) setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return
      const newUid = session?.user?.id ?? null
      const oldUid = lastVerifiedUserIdRef.current
      setUser(session?.user ?? null)
      // Only re-run the expensive RPC when the *identity* changed
      // (SIGNED_IN with a different user, SIGNED_OUT) — not on every
      // TOKEN_REFRESHED or INITIAL_SESSION that fires with the same user.
      if (newUid !== oldUid) {
        setIsAdmin(null)
        await verifyAdmin(session)
      }
    })
    return () => { cancelled = true; subscription.unsubscribe() }
  }, [])

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    lastVerifiedUserIdRef.current = null
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
