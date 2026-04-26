import { Link } from 'react-router-dom'
import PageHeader from '../../components/public/PageHeader'
import Breadcrumb from '../../components/public/Breadcrumb'
import { useContent, useSessions } from '../../lib/hooks'
import { useSite } from '../../lib/SiteContext'
import SeasonToggle from '../../components/public/SeasonToggle'
import Loading from '../../components/public/Loading'

function SessionTimes({ times }) {
  if (!times) return null
  // Handle string (legacy), object, or array
  if (typeof times === 'string') {
    return <div className="mt-8 info-card"><h3>Session Times</h3><p className="text-sm text-gray-500 whitespace-pre-wrap">{times}</p></div>
  }
  if (Array.isArray(times)) {
    return (
      <div className="mt-8 info-card">
        <h3>Session Times</h3>
        <table className="w-full text-sm mt-2">
          <tbody>{times.map((t, i) => (
            <tr key={i} className="border-b border-cream-mid last:border-none">
              <td className="py-2 font-bold text-charcoal">{t.session || t.label || t.name}</td>
              <td className="py-2 text-gray-500">{t.time || t.value}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    )
  }
  if (typeof times === 'object') {
    return (
      <div className="mt-8 info-card">
        <h3>Session Times</h3>
        <table className="w-full text-sm mt-2">
          <tbody>{Object.entries(times).map(([k, v]) => (
            <tr key={k} className="border-b border-cream-mid last:border-none">
              <td className="py-2 font-bold text-charcoal">{k}</td>
              <td className="py-2 text-gray-500">{typeof v === 'string' ? v : JSON.stringify(v)}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    )
  }
  return null
}

export default function Sessions() {
  const { currentSeason } = useSite()
  const { blocks: b, loading: blocksLoading } = useContent('sessions')
  const { blocks: sched } = useContent('schedule')
  const { sessions, loading: sessionsLoading } = useSessions(currentSeason?.slug)
  const times = currentSeason?.session_times_json

  const loading = blocksLoading || sessionsLoading

  // Group sessions by day
  const day1Sessions = sessions.filter(s => s.day === 1)
  const day2Sessions = sessions.filter(s => s.day === 2)
  const hasDbSessions = sessions.length > 0

  // Legacy fallback: render from content blocks if no meet_sessions rows
  const LegacySessionCard = ({ blockKey }) => {
    const title = b[blockKey + '_title']
    const desc = b[blockKey + '_desc']
    if (!title && !desc) return null
    return <div className="info-card mb-4"><h3>{title}</h3><p className="text-sm text-gray-500">{desc}</p></div>
  }

  if (loading) return <><PageHeader slug="sessions" label="Daily Sessions" titleHtml='Session <span class="text-gold">Schedule</span>' /><Loading /></>

  return (
    <>
      <PageHeader slug="sessions" label="Daily Sessions" titleHtml='Session <span class="text-gold">Schedule</span>' />
      <Breadcrumb page="Session Schedule" />
      <div className="max-w-[900px] mx-auto py-16 px-8">
        <SeasonToggle />

        <h2 className="section-title"><span className="text-crimson">{sched.day1_tab_label || 'Friday — Day 1'}</span></h2>
        <div className="divider" />
        {hasDbSessions ? (
          day1Sessions.map(s => (
            <div key={s.id} className="info-card mb-4">
              <div className="flex items-baseline justify-between gap-2">
                <h3>{s.title}</h3>
                {s.start_time && <span className="font-oswald text-xs tracking-widest text-crimson">{s.start_time}</span>}
              </div>
              {s.description && <p className="text-sm text-gray-500">{s.description}</p>}
            </div>
          ))
        ) : (
          <><LegacySessionCard blockKey="fri_session_8u" /><LegacySessionCard blockKey="fri_session_1" /><LegacySessionCard blockKey="fri_session_2" /></>
        )}

        <h2 className="section-title mt-12"><span className="text-crimson">{sched.day2_tab_label || 'Saturday — Day 2'}</span></h2>
        <div className="divider" />
        {hasDbSessions ? (
          day2Sessions.map(s => (
            <div key={s.id} className="info-card mb-4">
              <div className="flex items-baseline justify-between gap-2">
                <h3>{s.title}</h3>
                {s.start_time && <span className="font-oswald text-xs tracking-widest text-crimson">{s.start_time}</span>}
              </div>
              {s.description && <p className="text-sm text-gray-500">{s.description}</p>}
            </div>
          ))
        ) : (
          <><LegacySessionCard blockKey="sat_session_1" /><LegacySessionCard blockKey="sat_session_2" /><LegacySessionCard blockKey="sat_session_3" /></>
        )}

        {times ? (
          <SessionTimes times={times} />
        ) : (
          <div className="mt-8 bg-cream-mid border-2 border-dashed border-crimson/20 p-8 text-center rounded"><p className="font-oswald text-sm tracking-widest uppercase text-gray-400">Session times — To Be Confirmed</p>{currentSeason?.dates_display && <p className="text-xs text-gray-400 mt-2">Check back closer to {currentSeason.dates_display}</p>}</div>
        )}

        <div className="mt-8 flex gap-4 flex-wrap">
          <Link to="/schedule" className="btn-primary no-underline">Full Event Order &rarr;</Link>
          <Link to="/warmup" className="btn-outline no-underline !text-crimson !border-crimson/30">Warm-up Schedule &rarr;</Link>
        </div>
      </div>
    </>
  )
}
