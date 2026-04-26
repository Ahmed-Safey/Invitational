import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext({})

// Max time we'll keep the admin shell in the "Loading" state waiting for the
// is_admin RPC to resolve. If the call hangs (network, stuck gotrue lock,
// supabase down) we assume "not admin" so the UI never wedges.
const ADMIN_RPC_TIMEOUT_MS = 5000
const ADMIN_CACHE_KEY = 'seis_admin_cache'
const ADMIN_CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

// Read/write a { uid, ts } object from localStorage to skip the is_admin RPC
// on page refresh when we've verified recently. RLS still enforces server-side.
const readAdminCache = (uid) => {
  try {
    const raw = localStorage.getItem(ADMIN_CACHE_KEY)
    if (!raw) return null
    const { uid: cachedUid, ts } = JSON.parse(raw)
    if (cachedUid === uid && Date.now() - ts < ADMIN_CACHE_TTL_MS) return true
  } catch {}
  return null
}
const writeAdminCache = (uid, isAdmin) => {
  try {
    if (isAdmin) localStorage.setItem(ADMIN_CACHE_KEY, JSON.stringify({ uid, ts: Date.now() }))
    else localStorage.removeItem(ADMIN_CACHE_KEY)
  } catch {}
}

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
    // Fast path: trust the localStorage cache for 1 hour so page refresh on
    // slow Wi-Fi doesn't hang on the RPC. RLS enforces server-side anyway.
    const cached = readAdminCache(uid)
    if (cached === true) {
      setIsAdmin(true)
      lastVerifiedUserIdRef.current = uid
      return
    }
    verifyInFlightRef.current = true
    const rpcWithTimeout = () => Promise.race([
      supabase.rpc('is_current_user_admin'),
      new Promise(resolve => setTimeout(() => resolve({ data: null, error: new Error('timeout') }), ADMIN_RPC_TIMEOUT_MS)),
    ])
    try {
      let result = await rpcWithTimeout()
      // One retry on failure (network blip, cold start)
      if (result.error) {
        console.warn('is_current_user_admin RPC failed, retrying:', result.error.message)
        result = await rpcWithTimeout()
      }
      if (result.error) {
        console.warn('is_current_user_admin RPC failed after retry:', result.error.message)
        setIsAdmin(false)
        writeAdminCache(uid, false)
      } else {
        setIsAdmin(!!result.data)
        writeAdminCache(uid, !!result.data)
      }
      lastVerifiedUserIdRef.current = uid
    } finally {
      verifyInFlightRef.current = false
    }
  }

  useEffect(() => {
    let cancelled = false

    // Let gotrue resolve getSession on its own schedule. Supabase internally
    // recovers orphaned locks after 5 s, so the call always resolves — it just
    // takes up to ~6 s in the worst case. We no longer race it with our own
    // timer because a premature timeout was wiping the auth token and logging
    // the admin out on every refresh.
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (cancelled) return
      if (error) console.warn('getSession error (treating as signed-out):', error.message)
      setUser(session?.user ?? null)
      await verifyAdmin(session)
      if (!cancelled) setLoading(false)
    }).catch(err => {
      // Genuine exception (corrupt storage, browser security policy, etc.)
      console.error('getSession threw:', err)
      if (!cancelled) { setUser(null); setIsAdmin(false); setLoading(false) }
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
    writeAdminCache(null, false)
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
