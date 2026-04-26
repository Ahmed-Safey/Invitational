import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './lib/AuthContext'
import { SiteProvider } from './lib/SiteContext'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import './styles/index.css'

// Universal escape hatch: visiting any URL with `?reset=1` wipes local browser
// state (localStorage, sessionStorage, caches, service workers) and reloads to
// the same URL without the query param. Useful if auth/localStorage ever get
// into a wedged state that a normal refresh can't recover from.
;(function handleResetParam() {
  try {
    const url = new URL(window.location.href)
    if (url.searchParams.get('reset') !== '1') return
    try { localStorage.clear() } catch {}
    try { sessionStorage.clear() } catch {}
    if ('caches' in window) {
      caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).catch(() => {})
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister())).catch(() => {})
    }
    url.searchParams.delete('reset')
    // Replace so ?reset=1 isn't in history; reload to start 100% clean.
    window.location.replace(url.pathname + (url.search || '') + url.hash)
  } catch {}
})()

// If the user had the tab open across a deploy, React.lazy() will try to load
// a JS chunk whose filename no longer exists on the new deploy. Catch that and
// force a one-time reload so they get the fresh index.html + new chunk hashes.
// Guarded by a sessionStorage flag so a real bug can't loop forever.
const CHUNK_RELOAD_FLAG = 'seis_chunk_reload_attempt'
function isChunkLoadError(err) {
  const msg = (err && (err.message || err.toString())) || ''
  return /Loading chunk [\w-]+ failed|Failed to fetch dynamically imported module|Importing a module script failed/i.test(msg)
}
function maybeReload(err) {
  if (!isChunkLoadError(err)) return
  if (sessionStorage.getItem(CHUNK_RELOAD_FLAG)) return
  sessionStorage.setItem(CHUNK_RELOAD_FLAG, '1')
  window.location.reload()
}
window.addEventListener('error', (e) => maybeReload(e.error || e))
window.addEventListener('unhandledrejection', (e) => maybeReload(e.reason))
// Clear the flag once we've successfully booted past the lazy imports.
window.addEventListener('load', () => sessionStorage.removeItem(CHUNK_RELOAD_FLAG))

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <SiteProvider>
            <App />
            <Toaster position="top-right" />
          </SiteProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)
