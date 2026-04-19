import { useState } from 'react'
import PageHeader from '../../components/public/PageHeader'
import Breadcrumb from '../../components/public/Breadcrumb'
import { useEvents } from '../../lib/hooks'

export default function Schedule() {
  const [tab, setTab] = useState(1)
  const { events } = useEvents()

  const dayEvents = (d, s) => events.filter(e => e.day === d && e.session === s)

  const renderSession = (day, session, title) => {
    const evts = dayEvents(day, session)
    if (evts.length === 0) return null

    // Group consecutive events by event_number for girls/boys pairing
    const rows = []
    let i = 0
    while (i < evts.length) {
      const e = evts[i]
      if (e.is_break) {
        rows.push({ type: 'break', label: e.break_label })
        i++
      } else if (e.gender === 'mixed') {
        rows.push({ type: 'event', girls: e.event_number, boys: '—', name: e.event_name, format: e.format, isRelay: e.stroke === 'relay' })
        i++
      } else if (e.gender === 'girls' && i + 1 < evts.length && evts[i+1].gender === 'boys' && evts[i+1].event_number === e.event_number + 1) {
        rows.push({ type: 'event', girls: e.event_number, boys: evts[i+1].event_number, name: e.event_name, format: e.format, isRelay: e.stroke === 'relay' })
        i += 2
      } else {
        rows.push({ type: 'event', girls: e.gender === 'girls' ? e.event_number : '', boys: e.gender === 'boys' ? e.event_number : '', name: e.event_name, format: e.format, isRelay: e.stroke === 'relay' })
        i++
      }
    }

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
        <div className="flex gap-0 border-b-2 border-cream-mid mb-8">
          {[{ d:1, label:'Friday — Day 1' },{ d:2, label:'Saturday — Day 2' }].map(t => (
            <button key={t.d} onClick={() => setTab(t.d)}
              className={`font-oswald text-sm font-semibold tracking-widest uppercase px-6 py-3 border-b-[3px] -mb-[2px] transition-colors cursor-pointer bg-transparent ${tab === t.d ? 'text-crimson border-crimson' : 'text-gray-400 border-transparent hover:text-charcoal'}`}>
              {t.label}
            </button>
          ))}
        </div>
        {tab === 1 && <>
          {renderSession(1, 'morning', '8 & Under Timed Finals + 11+ Prelims')}
          {renderSession(1, 'evening', '11+ Finals')}
        </>}
        {tab === 2 && <>
          {renderSession(2, 'morning', '9–10 Timed Finals + 11+ Prelims')}
          {renderSession(2, 'evening', '11+ Finals + Closing Relays')}
        </>}
      </div>
    </>
  )
}
