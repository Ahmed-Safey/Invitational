import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './lib/AuthContext'
import { SiteProvider } from './lib/SiteContext'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import './styles/index.css'

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
