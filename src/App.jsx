import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useSite } from './lib/SiteContext'
import { configError } from './lib/supabase'
import Navbar from './components/public/Navbar'
import Footer from './components/public/Footer'
import BackToTop from './components/public/BackToTop'
import ScrollToTop from './components/public/ScrollToTop'
import Loading from './components/public/Loading'
import ErrorScreen from './components/public/ErrorScreen'

// Public pages (eagerly loaded — small and cache-critical)
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
import Faq from './pages/public/Faq'
import NotFound from './pages/public/NotFound'

// Admin pages — lazy loaded so public visitors never download the admin bundle
const Login = lazy(() => import('./pages/admin/Login'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const Settings = lazy(() => import('./pages/admin/Settings'))
const Seasons = lazy(() => import('./pages/admin/Seasons'))
const PagesAdmin = lazy(() => import('./pages/admin/PagesAdmin'))
const ContentAdmin = lazy(() => import('./pages/admin/ContentAdmin'))
const Events = lazy(() => import('./pages/admin/Events'))
const Scoring = lazy(() => import('./pages/admin/Scoring'))
const Media = lazy(() => import('./pages/admin/Media'))
const ProgramsAdmin = lazy(() => import('./pages/admin/ProgramsAdmin'))
const FeesAdmin = lazy(() => import('./pages/admin/FeesAdmin'))
const Integrations = lazy(() => import('./pages/admin/Integrations'))

function VisibleRoute({ slug, element }) {
  const { pages, loading } = useSite()
  if (loading) return <Loading />
  const page = pages.find(p => p.slug === slug)
  if (!page || !page.is_visible) return <NotFound />
  return element
}

export default function App() {
  const { loading, error } = useSite()
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  if (configError) return <ErrorScreen message={configError} />
  if (loading && !isAdmin) return <Loading />
  if (error && !isAdmin) return <ErrorScreen message={error} />

  return (
    <>
      <ScrollToTop />
      {!isAdmin && <Navbar />}
      <main className={!isAdmin ? 'pt-[68px]' : ''}>
        <Suspense fallback={<Loading />}>
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
          <Route path="/faq" element={<VisibleRoute slug="faq" element={<Faq />} />} />

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
        </Suspense>
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <BackToTop />}
    </>
  )
}
