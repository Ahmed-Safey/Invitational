import { Link } from 'react-router-dom'
import PageHeader from '../../components/public/PageHeader'
import Breadcrumb from '../../components/public/Breadcrumb'
import { usePrograms, useContent } from '../../lib/hooks'
import { useSite } from '../../lib/SiteContext'
import SeasonToggle from '../../components/public/SeasonToggle'

// Fallback labels + descriptions used only if the DB doesn't have the blocks
// yet (e.g. the 20260421003000_programs_copy.sql migration hasn't run).
const FALLBACK_LABELS = { psych_sheet: 'Psych Sheets', heat_sheet: 'Heat Sheets', program_booklet: 'Meet Program Booklet' }
const FALLBACK_DESCS = {
  psych_sheet: 'Pre-seeded entry lists ranked by submitted times. Published after the entry deadline.',
  heat_sheet: 'Final lane and heat assignments for all events. Published 24 hours before each session.',
  program_booklet: 'Comprehensive meet program including schedule, event order, team rosters, and pool records.',
}

export default function Programs() {
  const { activeSeason } = useSite()
  const programs = usePrograms(activeSeason)
  const { blocks: b } = useContent('programs')

  // Filter out entry_file — that's on the Entries page
  const displayPrograms = programs.filter(p => p.program_type !== 'entry_file')

  return (
    <>
      <PageHeader slug="programs" label="Downloads" titleHtml='Meet <span class="text-gold">Programs</span>' />
      <Breadcrumb page="Meet Programs" />
      <div className="max-w-[900px] mx-auto py-16 px-8">
        <SeasonToggle />
        <div className="grid md:grid-cols-2 gap-4">
          {['psych_sheet', 'heat_sheet', 'program_booklet'].map(type => {
            const prog = displayPrograms.find(p => p.program_type === type)
            const label = prog?.label || b[`${type}_label`] || FALLBACK_LABELS[type]
            const desc = b[`${type}_desc`] || FALLBACK_DESCS[type]
            return (
              <div key={type} className={`info-card ${type === 'program_booklet' ? 'md:col-span-2' : ''}`}>
                <h3>{label}</h3>
                <p className="text-sm text-gray-500 mb-4">{desc}</p>
                {prog?.google_drive_url ? (
                  <a href={prog.google_drive_url} target="_blank" rel="noreferrer" className="btn-primary no-underline text-xs">↓ Download</a>
                ) : (
                  <div className="bg-cream-mid border-2 border-dashed border-crimson/20 p-4 text-center rounded">
                    <p className="font-oswald text-xs tracking-widest uppercase text-gray-400">Coming Soon</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-8">
          <Link to="/schedule" className="btn-outline no-underline !text-crimson !border-crimson/30">← Back to Schedule</Link>
        </div>
      </div>
    </>
  )
}
