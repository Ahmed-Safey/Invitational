import { useState } from 'react'
import PageHeader from '../../components/public/PageHeader'
import Breadcrumb from '../../components/public/Breadcrumb'
import { useEvents, useContent } from '../../lib/hooks'
import { useSite } from '../../lib/SiteContext'

export default function Schedule() {
  const [tab, setTab] = useState(1)
  const { currentSeason } = useSite()
  const { events, loading } = useEvents(null, null, currentSeason?.slug)
  const { blocks } = useContent('schedule')

  // Session titles are admin-editable via content_blocks. Fallbacks match the Master Plan v2.0
  // structure and keep the page readable if blocks are missing.
  const d1mTitle = blocks.day1_morning_title || '8 & Under Timed Finals + 11+ Prelims'
  const d1eTitle = blocks.day1_evening_title || '11+ Finals'
  const d2mTitle = blocks.day2_morning_title || '9–10 Timed Finals + 11+ Prelims'
  const d2eTitle = blocks.day2_evening_title || '11+ Finals + Closing Relays'
  const d1Label  = blocks.day1_tab_label || 'Friday — Day 1'
  const d2Label  = blocks.day2_tab_label || 'Saturday — Day 2'

  const dayEvents = (d, s) => events.filter(e => e.day === d && e.session === s)

  // Pair girls/boys rows by event_name equality (robust to reorders and
  // non-consecutive numbering). Consumes both rows when matched.
  const buildRows = (evts) => {
    const rows = []
    const used = new Set()
    evts.forEach((e, idx) => {
      if (used.has(idx)) return
      used.add(idx)
      if (e.is_break) {
        rows.push({ type: 'break', label: e.break_label })
        return
      }
      if (e.gender === 'mixed') {
        rows.push({ type: 'event', girls: e.event_number, boys: '—', name: e.event_name, format: e.format, isRelay: e.stroke === 'relay' })
        return
      }
      // Find the opposite-gender row with the same event_name that isn't yet paired
      const partnerIdx = evts.findIndex((o, j) => !used.has(j) && j !== idx && o.event_name === e.event_name && ((e.gender === 'girls' && o.gender === 'boys') || (e.gender === 'boys' && o.gender === 'girls')))
      if (partnerIdx !== -1) {
        used.add(partnerIdx)
        const partner = evts[partnerIdx]
        const girls = e.gender === 'girls' ? e : partner
        const boys = e.gender === 'boys' ? e : partner
        rows.push({ type: 'event', girls: girls.event_number, boys: boys.event_number, name: e.event_name, format: e.format, isRelay: e.stroke === 'relay' })
      } else {
        rows.push({ type: 'event', girls: e.gender === 'girls' ? e.event_number : '', boys: e.gender === 'boys' ? e.event_number : '', name: e.event_name, format: e.format, isRelay: e.stroke === 'relay' })
      }
    })
    return rows
  }

  const renderSession = (day, session, title) => {
    const evts = dayEvents(day, session)
    if (evts.length === 0) return null
    const rows = buildRows(evts)

    return (
      <div className="mb-8">
        <h3 className="font-oswald text-lg font-bold text-charcoal uppercase tracking-wider mb-3">{title}</h3>
        <table className="w-full text-sm">
          <thead><tr className="bg-charcoal text-white">
            <th className="py-2 px-3 text-left font-oswald text-xs tracking-widest uppercase w-20">Girls #</th>
            <th className="py-2 px-3 text-left font-oswald text-xs tracking-widest uppercase w-20">Boys #</th>
            <th className="py-2 px-3 text-left font-oswald text-xs tracking-widest uppercase">Event</th>
            <th className="py-2 px-3 text-left font-oswald text-xs tracking-widest uppercase w-28">Format</th>
          </tr></thead>
          <tbody>
            {rows.map((r, idx) => r.type === 'break' ? (
              <tr key={idx} className="bg-cream-mid"><td colSpan={4} className="py-2 px-3 text-center font-oswald text-xs tracking-[0.2em] uppercase text-gray-400">&mdash; {r.label} &mdash;</td></tr>
            ) : (
              <tr key={idx} className={`border-b border-cream-mid hover:bg-cream ${r.isRelay ? 'border-l-[3px] border-l-gold-dark' : ''}`}>
                <td className="py-2 px-3 font-oswald font-bold text-charcoal">{r.girls}</td>
                <td className="py-2 px-3 font-oswald font-bold text-charcoal">{r.boys}</td>
                <td className="py-2 px-3">{r.name}</td>
                <td className="py-2 px-3"><span className="inline-block px-2 py-0.5 bg-cream-mid text-gray-500 text-xs font-bold tracking-wider uppercase">{r.format.replace('_', ' ')}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <>
      <PageHeader slug="schedule" label="Event Program" titleHtml='Schedule of <span class="text-gold">Events</span>' />
      <Breadcrumb page="Schedule of Events" />
      <div className="max-w-[900px] mx-auto py-16 px-8">
        <div role="tablist" aria-label="Day selector" className="flex gap-0 border-b-2 border-cream-mid mb-8">
          {[{ d:1, label:d1Label },{ d:2, label:d2Label }].map(t => (
            <button key={t.d} onClick={() => setTab(t.d)}
              role="tab"
              id={`schedule-tab-${t.d}`}
              aria-selected={tab === t.d}
              aria-controls={`schedule-panel-${t.d}`}
              tabIndex={tab === t.d ? 0 : -1}
              className={`font-oswald text-sm font-semibold tracking-widest uppercase px-6 py-3 border-b-[3px] -mb-[2px] transition-colors cursor-pointer bg-transparent ${tab === t.d ? 'text-crimson border-crimson' : 'text-gray-400 border-transparent hover:text-charcoal'}`}>
              {t.label}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="py-24 text-center text-sm text-gray-400 font-oswald tracking-widest uppercase">Loading event order…</div>
        ) : events.length === 0 ? (
          <div className="py-24 text-center text-sm text-gray-400">
            <p className="font-oswald tracking-widest uppercase mb-2">No events scheduled yet</p>
            <p className="text-xs">The event order for {currentSeason?.label || 'this season'} has not been published yet. Please check back soon.</p>
          </div>
        ) : (
          <>
            {tab === 1 && (
              <div role="tabpanel" id="schedule-panel-1" aria-labelledby="schedule-tab-1">
                {renderSession(1, 'morning', d1mTitle)}
                {renderSession(1, 'evening', d1eTitle)}
              </div>
            )}
            {tab === 2 && (
              <div role="tabpanel" id="schedule-panel-2" aria-labelledby="schedule-tab-2">
                {renderSession(2, 'morning', d2mTitle)}
                {renderSession(2, 'evening', d2eTitle)}
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
