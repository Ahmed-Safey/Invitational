import PageHeader from '../../components/public/PageHeader'
import Breadcrumb from '../../components/public/Breadcrumb'
import { useContent, useScoring } from '../../lib/hooks'
import { useSite } from '../../lib/SiteContext'
import Loading from '../../components/public/Loading'

function DataTable({ headers, keys, rows }) {
  if (!Array.isArray(rows) || rows.length === 0) return null
  const cols = keys || Object.keys(rows[0])
  return (
    <table className="w-full text-sm mb-8">
      <thead><tr className="bg-charcoal text-white">{headers.map((h,i) => <th key={i} className="py-3 px-4 text-left font-oswald text-xs tracking-widest uppercase">{h}</th>)}</tr></thead>
      <tbody>{rows.map((row,i) => (
        <tr key={i} className="border-b border-cream-mid hover:bg-cream">{cols.map((k,j) => <td key={j} className="py-3 px-4">{row[k]}</td>)}</tr>
      ))}</tbody>
    </table>
  )
}

export default function MeetInfo() {
  const { settings, seasons } = useSite()
  const { blocks: b, loading } = useContent('meet-info')
  const { scoring } = useScoring()

  if (loading) return <><PageHeader slug="meet-info" label="Everything You Need to Know" titleHtml='Meet <span class="text-gold">Information</span>' /><Loading /></>

  return (
    <>
      <PageHeader slug="meet-info" label="Everything You Need to Know" titleHtml='Meet <span class="text-gold">Information</span>' />
      <Breadcrumb page="Meet Information" />
      <div className="max-w-[900px] mx-auto py-16 px-8">
        {/* Both-seasons banner — content on this page is identical across seasons,
            only the calendar dates differ, so we show them side by side instead
            of forcing visitors to toggle back and forth. */}
        {seasons.length > 0 && (
          <div className="grid md:grid-cols-2 gap-3 mb-10">
            {seasons.map(ss => (
              <div key={ss.slug} className="bg-white border-l-4 border-l-crimson p-5">
                <p className="font-oswald text-xs tracking-[0.2em] text-gray-400 uppercase mb-1">{ss.label}</p>
                <p className="font-oswald font-bold text-xl text-charcoal leading-tight">{ss.dates_display}</p>
                {ss.age_up_date && <p className="text-xs text-gray-500 mt-1">Age-up: <strong className="text-crimson">{ss.age_up_date}</strong></p>}
              </div>
            ))}
          </div>
        )}

        <h2 className="section-title">Venue & <span className="text-crimson">Equipment</span></h2>
        <div className="divider" />
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          <div className="info-card"><h3>Venue</h3><p className="text-sm text-gray-500">{b.venue_name}{b.venue_address && <><br/>{b.venue_address}</>}{b.venue_pool && <><br/>{b.venue_pool}</>}</p></div>
          <div className="info-card"><h3>Timing System</h3><p className="text-sm text-gray-500">{b.timing_text}</p></div>
          <div className="info-card"><h3>Rules</h3><p className="text-sm text-gray-500">{b.rules_text}</p></div>
          <div className="info-card"><h3>Dryland Area</h3><p className="text-sm text-gray-500">{b.dryland_text}</p></div>
        </div>

        <h2 className="section-title">Age Group <span className="text-crimson">Structure</span></h2>
        <div className="divider" />
        <p className="text-sm text-gray-500 mb-4">{b.age_groups_text}</p>
        {b.age_groups_table && <DataTable headers={['Age Group','Format','Day','Session']} keys={['group','format','day','session']} rows={b.age_groups_table} />}
        <p className="text-sm text-gray-500 mb-4">{b.mixed_relay_text}</p>
        <p className="text-sm text-gray-500 mb-4">{b.session_structure_text}</p>
        <p className="text-sm text-gray-500 mb-4">{b.seeding_text}</p>

        <h2 className="section-title">Entry <span className="text-crimson">Limits</span></h2>
        <div className="divider" />
        {b.entry_limits_table && <DataTable headers={['Category','Limit']} keys={['category','limit']} rows={b.entry_limits_table} />}
        {Array.isArray(b.entry_policy_text) ? (
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-500 mb-8">
            {b.entry_policy_text.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 mb-8 whitespace-pre-wrap">{b.entry_policy_text}</p>
        )}

        <h2 className="section-title">Scoring & <span className="text-crimson">Awards</span></h2>
        <div className="divider" />
        <table className="w-full text-sm mb-6">
          <thead><tr className="bg-charcoal text-white"><th className="py-3 px-4 text-left font-oswald text-xs tracking-widest uppercase">Place</th><th className="py-3 px-4 text-left font-oswald text-xs tracking-widest uppercase">Individual</th><th className="py-3 px-4 text-left font-oswald text-xs tracking-widest uppercase">Relay</th></tr></thead>
          <tbody>{scoring.map(s => <tr key={s.place} className="border-b border-cream-mid hover:bg-cream"><td className="py-3 px-4">{s.place}</td><td className="py-3 px-4">{s.individual_points}</td><td className="py-3 px-4">{s.relay_points}</td></tr>)}</tbody>
        </table>
        {Array.isArray(b.scoring_rules) && (
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-500 mb-6">{b.scoring_rules.map((r,i) => <li key={i}>{r}</li>)}</ul>
        )}
        {b.awards_table && <DataTable headers={['Category','Award']} keys={['category','award']} rows={b.awards_table} />}

        <h2 className="section-title">Protests & <span className="text-crimson">Officials</span></h2>
        <div className="divider" />
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="info-card"><h3>Protest Procedure</h3><p className="text-sm text-gray-500">{b.protest_text}</p></div>
          <div className="info-card"><h3>Officials</h3><p className="text-sm text-gray-500">{b.officials_text}</p></div>
        </div>

        {settings?.meet_info_pdf_url && <a href={settings.meet_info_pdf_url} target="_blank" rel="noreferrer" className="btn-primary no-underline">&darr; Download Meet Info PDF</a>}
      </div>
    </>
  )
}
