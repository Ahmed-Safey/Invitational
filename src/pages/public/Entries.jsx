import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/public/PageHeader'
import Breadcrumb from '../../components/public/Breadcrumb'
import { useContent } from '../../lib/hooks'
import { useSite } from '../../lib/SiteContext'
import { supabase } from '../../lib/supabase'
import SeasonToggle from '../../components/public/SeasonToggle'

export default function Entries() {
  const { settings, activeSeason } = useSite()
  const { blocks } = useContent('entries')
  const [entryFile, setEntryFile] = useState(null)

  useEffect(() => {
    if (!activeSeason) return
    supabase.from('programs').select('*')
      .eq('season_slug', activeSeason)
      .eq('program_type', 'entry_file')
      .maybeSingle()
      .then(({ data }) => setEntryFile(data))
  }, [activeSeason])

  return (
    <>
      <PageHeader slug="entries" label="Team Entries" titleHtml='Meet <span class="text-gold">Entries</span>' />
      <Breadcrumb page="Meet Entries" />
      <div className="max-w-[900px] mx-auto py-16 px-8">
        <SeasonToggle />

        <h2 className="section-title">Entry <span className="text-crimson">Process</span></h2>
        <div className="divider" />
        {blocks.entry_steps ? (
          <div className="text-sm text-gray-500 mb-8 whitespace-pre-wrap leading-7">{blocks.entry_steps.replace(/\\n/g, '\n')}</div>
        ) : (
          <ol className="list-decimal list-inside space-y-3 text-sm text-gray-500 mb-8">
            <li>Download the Hy-Tek Team Manager entry file (.cl2) below</li>
            <li>Import the file into Hy-Tek Team Manager on your computer</li>
            <li>Enter your swimmers and their events in Team Manager</li>
            <li>Export the completed entry file (.hy3)</li>
            <li>Submit your entry file via the Google Form below at least 72 hours before the meet</li>
          </ol>
        )}

        <h2 className="section-title">Download <span className="text-crimson">Entry File</span></h2>
        <div className="divider" />
        {entryFile?.google_drive_url ? (
          <a href={entryFile.google_drive_url} target="_blank" rel="noreferrer" className="btn-primary no-underline mb-8 inline-block">↓ Download Hy-Tek Entry File (.cl2)</a>
        ) : (
          <div className="bg-cream-mid border-2 border-dashed border-crimson/20 p-8 text-center rounded mb-8">
            <p className="font-oswald text-sm tracking-widest uppercase text-gray-400">Entry file — Coming Soon</p>
          </div>
        )}

        <h2 className="section-title">Submit <span className="text-crimson">Entries</span></h2>
        <div className="divider" />
        {settings?.entry_form_url ? (
          <div className="bg-white shadow-lg">
            <div className="bg-black px-5 py-3 flex items-center justify-between flex-wrap gap-2">
              <span className="font-oswald text-xs tracking-widest uppercase text-white/60">Entry Submission Form</span>
              <a href={settings.entry_form_url} target="_blank" rel="noreferrer" className="font-oswald text-xs tracking-widest uppercase text-gold border border-gold/40 px-3 py-1 hover:border-gold no-underline">Open in New Tab ↗</a>
            </div>
            <iframe src={settings.entry_form_url.includes('?') ? settings.entry_form_url + '&embedded=true' : settings.entry_form_url + '?embedded=true'} className="w-full border-none h-[680px]" title="Entry Submission Form">Loading form…</iframe>
          </div>
        ) : (
          <div className="bg-cream-mid border-2 border-dashed border-crimson/20 p-8 text-center rounded">
            <p className="font-oswald text-sm tracking-widest uppercase text-gray-400">Entry submission form — Coming Soon</p>
          </div>
        )}

        <div className="mt-8 flex gap-4 flex-wrap">
          <Link to="/schedule" className="btn-outline no-underline !text-crimson !border-crimson/30">← View Full Schedule</Link>
          <Link to="/meet-info" className="btn-outline no-underline !text-crimson !border-crimson/30">Meet Info →</Link>
        </div>
      </div>
    </>
  )
}
