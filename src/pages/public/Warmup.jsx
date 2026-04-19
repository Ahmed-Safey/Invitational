import { Link } from 'react-router-dom'
import PageHeader from '../../components/public/PageHeader'
import Breadcrumb from '../../components/public/Breadcrumb'
import { useContent } from '../../lib/hooks'
import Loading from '../../components/public/Loading'
import { useSite } from '../../lib/SiteContext'

export default function Warmup() {
  const { blocks } = useContent('warmup')
  const { currentSeason } = useSite()

  return (
    <>
      <PageHeader slug="warmup" label="Preparation" titleHtml='Warm-up <span class="text-gold">Schedule</span>' />
      <Breadcrumb page="Warm-up Schedule" />
      <div className="max-w-[900px] mx-auto py-16 px-8">
        {currentSeason?.warmup_schedule_text ? (
          <div className="info-card mb-8"><h3>Warm-up Schedule</h3><p className="text-sm text-gray-500 whitespace-pre-wrap">{currentSeason.warmup_schedule_text}</p></div>
        ) : (
          <div className="bg-cream-mid border-2 border-dashed border-crimson/20 p-8 text-center rounded mb-8">
            <p className="font-oswald text-sm tracking-widest uppercase text-gray-400">Warm-up schedule — To Be Confirmed</p>
          </div>
        )}

        <h2 className="section-title">General <span className="text-crimson">Guidelines</span></h2>
        <div className="divider" />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="info-card"><h3>Pool Rules</h3><p className="text-sm text-gray-500">{blocks.pool_rules}</p></div>
          <div className="info-card"><h3>Lane Assignments</h3><p className="text-sm text-gray-500">{blocks.lane_assignments}</p></div>
          <div className="info-card"><h3>Timing</h3><p className="text-sm text-gray-500">{blocks.timing_note}</p></div>
          <div className="info-card"><h3>Safety</h3><p className="text-sm text-gray-500">{blocks.safety_note}</p></div>
        </div>

        <div className="mt-8">
          <Link to="/sessions" className="btn-outline no-underline !text-crimson !border-crimson/30">← Back to Sessions</Link>
        </div>
      </div>
    </>
  )
}
