import { Routes, Route, useLocation } from 'react-router-dom'
import { useSite } from './lib/SiteContext'
import Navbar from './components/public/Navbar'
import Footer from './components/public/Footer'
import BackToTop from './components/public/BackToTop'
import ScrollToTop from './components/public/ScrollToTop'
import Loading from './components/public/Loading'

// Public pages
import Home from './pages/public/Home'
import MeetInfo from './pages/public/MeetInfo'
import Schedule from './pages/public/Schedule'
import Sessions from './pages/public/Sessions'
import Warmup from './pages/public/Warmup'
import Programs from './pages/public/Programs'
import Fees from './pages/public/Fees'
import Results from './pages/public/Results'
import Stream from './pages/public/Stream'
import Contact from './pages/public/Contact'
import Entries from './pages/public/Entries'
import NotFound from './pages/public/NotFound'

// Admin pages
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import Settings from './pages/admin/Settings'
import Seasons from './pages/admin/Seasons'
import PagesAdmin from './pages/admin/PagesAdmin'
import ContentAdmin from './pages/admin/ContentAdmin'
import Events from './pages/admin/Events'
import Scoring from './pages/admin/Scoring'
import Media from './pages/admin/Media'
import ProgramsAdmin from './pages/admin/ProgramsAdmin'
import FeesAdmin from './pages/admin/FeesAdmin'
import Integrations from './pages/admin/Integrations'

function VisibleRoute({ slug, element }) {
  const { pages, loading } = useSite()
  if (loading) return <Loading />
  const page = pages.find(p => p.slug === slug)
  if (!page || !page.is_visible) return <NotFound />
  return element
}

function ErrorScreen({ message }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-8">
      <div className="text-center max-w-md">
        <div className="font-oswald font-bold text-6xl text-crimson mb-4">!</div>
        <h1 className="font-oswald font-bold text-2xl text-black uppercase tracking-wider mb-3">Connection Error</h1>
        <p className="text-gray-500 text-sm mb-6">{message || 'Unable to connect to the database. Please try again later.'}</p>
        <button onClick={() => window.location.reload()} className="btn-primary cursor-pointer">Retry</button>
      </div>
    </div>
  )
}

export default function App() {
  const { loading, error } = useSite()
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  if (loading && !isAdmin) return <Loading />
  if (error && !isAdmin) return <ErrorScreen message={error} />

  return (
    <>
      <ScrollToTop />
      {!isAdmin && <Navbar />}
      <main className={!isAdmin ? 'pt-[68px]' : ''}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/meet-info" element={<VisibleRoute slug="meet-info" element={<MeetInfo />} />} />
          <Route path="/schedule" element={<VisibleRoute slug="schedule" element={<Schedule />} />} />
          <Route path="/sessions" element={<VisibleRoute slug="sessions" element={<Sessions />} />} />
          <Route path="/warmup" element={<VisibleRoute slug="warmup" element={<Warmup />} />} />
          <Route path="/programs" element={<VisibleRoute slug="programs" element={<Programs />} />} />
          <Route path="/fees" element={<VisibleRoute slug="fees" element={<Fees />} />} />
          <Route path="/results" element={<VisibleRoute slug="results" element={<Results />} />} />
          <Route path="/stream" element={<VisibleRoute slug="stream" element={<Stream />} />} />
          <Route path="/contact" element={<VisibleRoute slug="contact" element={<Contact />} />} />
          <Route path="/entries" element={<VisibleRoute slug="entries" element={<Entries />} />} />

          {/* Admin */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/settings" element={<Settings />} />
          <Route path="/admin/seasons" element={<Seasons />} />
          <Route path="/admin/pages" element={<PagesAdmin />} />
          <Route path="/admin/content" element={<ContentAdmin />} />
          <Route path="/admin/events" element={<Events />} />
          <Route path="/admin/scoring" element={<Scoring />} />
          <Route path="/admin/media" element={<Media />} />
          <Route path="/admin/programs" element={<ProgramsAdmin />} />
          <Route path="/admin/fees" element={<FeesAdmin />} />
          <Route path="/admin/integrations" element={<Integrations />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <BackToTop />}
    </>
  )
}
