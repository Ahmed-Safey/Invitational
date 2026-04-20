import { Link } from 'react-router-dom'
import { useSite } from '../../lib/SiteContext'
import { useContent, useEvents, driveUrl } from '../../lib/hooks'
import SeasonToggle from '../../components/public/SeasonToggle'
import PageTitle from '../../components/public/PageTitle'
import Loading from '../../components/public/Loading'

function FormatCard({ title, items }) {
  let parsed = items
  if (typeof items === 'string') {
    try { parsed = JSON.parse(items) } catch { return null }
  }
  if (!Array.isArray(parsed)) return null
  return (
    <div className="bg-white/5 border border-gold/10 border-t-[3px] border-t-crimson p-6 hover:border-t-gold transition-colors">
      <h3 className="font-oswald text-xs font-semibold tracking-[0.15em] uppercase text-gold mb-4">{title}</h3>
      <ul className="list-none space-y-0">
        {parsed.map((item, i) => (
          <li key={i} className="flex justify-between items-baseline gap-2 py-2 border-b border-white/5 last:border-none text-sm">
            <span className="text-white/50">{item.label}</span>
            <strong className="text-white font-oswald text-sm tracking-wide text-right whitespace-nowrap">{item.value}</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Home() {
  const { settings, seasons, currentSeason, getMediaUrl } = useSite()
  const { blocks: b } = useContent('home')
  const { events } = useEvents(null, null, currentSeason?.slug)
  const heroUrl = driveUrl(getMediaUrl('hero-photo'))
  const logoUrl = driveUrl(getMediaUrl('seis-logo'), 600)
  const eagleUrl = driveUrl(getMediaUrl('eagle-watermark'), 400)

  if (!settings) return <Loading />
  const s = settings

  // Parse registration steps from DB
  let regSteps = []
  if (b.registration_steps) {
    try { regSteps = typeof b.registration_steps === 'string' ? JSON.parse(b.registration_steps) : b.registration_steps }
    catch { regSteps = [] }
  }

  // Quick schedule preview — count events per day/session
  const d1m = events.filter(e => e.day === 1 && e.session === 'morning' && !e.is_break).length
  const d1e = events.filter(e => e.day === 1 && e.session === 'evening' && !e.is_break).length
  const d2m = events.filter(e => e.day === 2 && e.session === 'morning' && !e.is_break).length
  const d2e = events.filter(e => e.day === 2 && e.session === 'evening' && !e.is_break).length

  return (
    <>
      <PageTitle />

      {/* Hero */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center text-center px-8 py-24 relative overflow-hidden"
        style={{
          background: heroUrl
            ? `linear-gradient(160deg, rgba(13,13,13,0.8), rgba(26,4,5,0.8) 40%, rgba(44,6,8,0.8) 70%, rgba(17,17,17,0.8)), url(${heroUrl}) center/cover no-repeat`
            : 'linear-gradient(160deg, #0d0d0d, #1a0405 40%, #2c0608 70%, #111)'
        }}>
        <div className="absolute inset-0" style={{backgroundImage:'linear-gradient(rgba(198,186,142,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(198,186,142,0.03) 1px,transparent 1px)',backgroundSize:'64px 64px'}} />
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-8 mb-6 flex-wrap animate-fade-up">
            {logoUrl && <img src={logoUrl} alt="SEIS" className="w-full max-w-[400px]" />}
            {eagleUrl && <img src={eagleUrl} alt="Eagles" className="w-full max-w-[200px] hidden md:block" />}
          </div>
          <h1 className="font-oswald font-bold text-5xl md:text-7xl text-white tracking-tight uppercase leading-[0.95] animate-fade-up-delay-1">
            Swimming Eagles<br/><span className="text-gold">Invitational Series</span>
          </h1>
          <p className="font-crimsonPro italic text-lg text-gold/60 mt-4 tracking-wide animate-fade-up-delay-2">{s.site_subtitle}</p>
          <div className="flex gap-3 flex-wrap justify-center my-8 animate-fade-up-delay-3">
            {[s.hero_badge_1,s.hero_badge_2,s.hero_badge_3,s.hero_badge_4].filter(Boolean).map((badge,i) => (
              <span key={i} className="bg-crimson/40 border border-gold/40 text-gold font-oswald text-sm font-medium tracking-widest uppercase px-4 py-1.5">{badge}</span>
            ))}
          </div>
          <div className="flex gap-3 justify-center flex-wrap animate-fade-up-delay-4">
            <Link to="/contact" className="btn-primary no-underline">Secure Your School&apos;s Spot</Link>
            <Link to="/schedule" className="btn-outline no-underline">View Schedule</Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20" style={{background:'linear-gradient(to bottom right,transparent 49%,#f9f8f4 50%)'}} />
      </section>

      {/* Dates */}
      <section className="bg-black py-16 px-8">
        <div className="max-w-[1100px] mx-auto">
          <p className="section-label !text-gold">{b.section_label_dates || 'Mark Your Calendar'}</p>
          <h2 className="section-title !text-white">Meet <span className="text-gold">Dates</span></h2>
          <div className="divider !bg-gold" />
          <SeasonToggle />
          <div className="grid md:grid-cols-2 gap-4">
            {seasons.map(ss => (
              <div key={ss.slug} className={`bg-white/5 border border-gold/15 border-l-4 p-6 transition-all ${ss.slug === currentSeason?.slug ? 'border-l-crimson' : 'border-l-gold/20 opacity-60'}`}>
                <p className="font-oswald text-xs tracking-[0.2em] text-gold uppercase mb-1">{ss.label}</p>
                <p className="font-oswald font-bold text-2xl text-white mb-1">{ss.dates_display}</p>
                <p className="text-xs text-white/40">Age-Up: <strong className="text-gold/70">{ss.age_up_date}</strong></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interest Form */}
      {s.google_form_embed_url && (
        <section className="bg-cream-mid py-20 px-8">
          <div className="max-w-[1100px] mx-auto">
            <div className="grid md:grid-cols-[1fr_1.5fr] gap-12 items-start">
              <div>
                <p className="section-label">Step One</p>
                <h2 className="section-title">Register<br/>Your <span className="text-crimson">Interest</span></h2>
                <div className="divider" />
                <p className="text-sm text-gray-500 mb-6">{b.interest_form_intro}</p>
                {regSteps.length > 0 && (
                  <ul className="list-none mt-4 space-y-0">
                    {regSteps.map((step, i) => (
                      <li key={i} className="flex gap-3 items-start py-3 border-b border-black/5 last:border-none text-sm text-gray-500">
                        <span className="shrink-0 w-6 h-6 bg-crimson text-white font-oswald text-xs font-semibold flex items-center justify-center">{step.num}</span>
                        {step.text}
                      </li>
                    ))}
                  </ul>
                )}
                {b.interest_form_note && (
                  <p className="mt-4 text-xs italic text-gray-400">{b.interest_form_note}</p>
                )}
              </div>
              <div className="bg-white shadow-lg">
                <div className="bg-black px-5 py-3 flex items-center justify-between flex-wrap gap-2">
                  <span className="font-oswald text-xs tracking-widest uppercase text-white/60">Interest Form</span>
                  <a href={s.google_form_url} target="_blank" rel="noreferrer" className="font-oswald text-xs tracking-widest uppercase text-gold border border-gold/40 px-3 py-1 hover:border-gold no-underline">Open in New Tab ↗</a>
                </div>
                <iframe src={s.google_form_embed_url} className="w-full border-none h-[680px]" title="Interest Form">Loading form…</iframe>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* About */}
      <section className="py-20 px-8">
        <div className="max-w-[1100px] mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="section-label">{b.section_label_about || 'Welcome'}</p>
            <h2 className="section-title">About the <span className="text-crimson">Invitational</span></h2>
            <div className="divider" />
            {['about_p1','about_p2','about_p3'].map(k => b[k] && <p key={k} className="leading-7 text-gray-500 mb-4">{b[k]}</p>)}
          </div>
          <div className="grid grid-cols-2 gap-px bg-cream-mid">
            {[
              { num: b.stat_days, label: b.stat_days_label || 'Days Per Meet' },
              { num: b.stat_lanes, label: b.stat_lanes_label || 'Lanes' },
              { num: b.stat_course, label: b.stat_course_label || 'Short Course' },
              { num: b.stat_age_groups, label: b.stat_age_groups_label || 'Age Groups' },
            ].map((st,i) => (
              <div key={i} className="bg-white p-6 text-center hover:bg-cream transition-colors">
                <div className="font-oswald font-bold text-4xl text-crimson leading-none mb-1">{st.num || '—'}</div>
                <div className="text-xs uppercase tracking-widest text-gray-400 font-oswald">{st.label}</div>
              </div>
            ))}
            <div className="col-span-2 bg-white p-4 text-center">
              <div className="font-oswald font-bold text-sm tracking-wider text-crimson">{b.stat_age_list || '8&U · 9-10 · 11-12 · 13-14 · 15+'}</div>
              <div className="text-xs uppercase tracking-widest text-gray-400 font-oswald mt-1">Age Group Divisions</div>
            </div>
          </div>
        </div>
      </section>

      {/* Format */}
      <section className="bg-black py-20 px-8">
        <div className="max-w-[1100px] mx-auto">
          <p className="section-label !text-gold">{b.section_label_format || 'Competition Structure'}</p>
          <h2 className="section-title !text-white">Meet <span className="text-gold">Format</span></h2>
          <div className="divider !bg-gold" />
          <div className="grid md:grid-cols-3 gap-4">
            <FormatCard title={b.format_card_1_title || 'Age Groups & Structure'} items={b.format_card_1_content} />
            <FormatCard title={b.format_card_2_title || 'Entry Limits'} items={b.format_card_2_content} />
            <FormatCard title={b.format_card_3_title || 'Scoring & Awards'} items={b.format_card_3_content} />
          </div>
        </div>
      </section>

      {/* Schedule Preview */}
      {events.length > 0 && (
        <section className="py-20 px-8">
          <div className="max-w-[1100px] mx-auto">
            <p className="section-label">Event Program</p>
            <h2 className="section-title">Schedule <span className="text-crimson">Preview</span></h2>
            <div className="divider" />
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="info-card">
                <h3>Friday — Day 1</h3>
                <div className="space-y-2 text-sm text-gray-500 mt-2">
                  <p>☀ <strong>Morning:</strong> 8&U Timed Finals + 11+ Prelims ({d1m} events)</p>
                  <p>🌙 <strong>Evening:</strong> 11+ Finals ({d1e} events)</p>
                </div>
              </div>
              <div className="info-card">
                <h3>Saturday — Day 2</h3>
                <div className="space-y-2 text-sm text-gray-500 mt-2">
                  <p>☀ <strong>Morning:</strong> 9–10 Timed Finals + 11+ Prelims ({d2m} events)</p>
                  <p>🌙 <strong>Evening:</strong> 11+ Finals + Closing Relays ({d2e} events)</p>
                </div>
              </div>
            </div>
            <div className="text-center">
              <Link to="/schedule" className="btn-primary no-underline">View Full Event Order →</Link>
            </div>
          </div>
        </section>
      )}

      {/* Fees */}
      <section className="bg-cream-mid py-20 px-8">
        <div className="max-w-[1100px] mx-auto">
          <p className="section-label">{b.section_label_fees || 'Event Details'}</p>
          <h2 className="section-title">Fees & <span className="text-crimson">Info</span></h2>
          <div className="divider" />
          <div className="bg-white border-t-4 border-crimson p-10 text-center mb-6">
            <div className="font-oswald font-bold text-5xl text-crimson leading-none mb-1">{s.entry_fee_amount}</div>
            <div className="text-sm uppercase tracking-widest text-gray-400 font-oswald">{s.entry_fee_label}</div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {s.hospitality_text && <div className="info-card"><h3>Hospitality</h3><p className="text-sm text-gray-500">{s.hospitality_text}</p></div>}
            {s.coaches_meeting_text && <div className="info-card"><h3>Coaches Meeting</h3><p className="text-sm text-gray-500">{s.coaches_meeting_text}</p></div>}
          </div>
          <div className="text-center mt-6">
            <Link to="/fees" className="btn-primary no-underline">Payment Details →</Link>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-black py-20 px-8">
        <div className="max-w-[1100px] mx-auto text-center">
          <p className="section-label !text-gold">{b.section_label_contact || 'Get In Touch'}</p>
          <h2 className="section-title !text-white">Express Your <span className="text-gold">Interest</span></h2>
          <div className="divider !bg-gold mx-auto" />
          <p className="text-white/50 mb-8 max-w-2xl mx-auto">{b.contact_intro}</p>
          <div className="flex gap-4 justify-center flex-wrap mb-8">
            {s.contact_email_athletics && <a href={`mailto:${s.contact_email_athletics}`} className="btn-outline no-underline">Athletics: {s.contact_email_athletics}</a>}
            {s.contact_email_aquatics && <a href={`mailto:${s.contact_email_aquatics}`} className="btn-outline no-underline">Aquatics: {s.contact_email_aquatics}</a>}
          </div>
          <div className="flex gap-4 justify-center flex-wrap">
            {s.google_form_url && <a href={s.google_form_url} target="_blank" rel="noreferrer" className="btn-primary no-underline">Submit Interest Form →</a>}
            {s.meet_info_pdf_url && <a href={s.meet_info_pdf_url} target="_blank" rel="noreferrer" className="btn-outline no-underline">Meet Info PDF →</a>}
          </div>
        </div>
      </section>
    </>
  )
}
