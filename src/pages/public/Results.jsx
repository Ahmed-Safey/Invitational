import PageHeader from '../../components/public/PageHeader'
import Breadcrumb from '../../components/public/Breadcrumb'
import { useContent } from '../../lib/hooks'
import { useSite } from '../../lib/SiteContext'

export default function Results() {
  const { settings, currentSeason } = useSite()
  const { blocks } = useContent('results')
  const hasResults = settings?.results_url

  return (
    <>
      <PageHeader slug="results" label="Race Results" titleHtml='Live <span class="text-gold">Results</span>' />
      <Breadcrumb page="Live Results" />
      <div className="max-w-[900px] mx-auto py-16 px-8">
        <p className="text-sm text-gray-500 mb-6">{blocks.results_intro}</p>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <a href="https://apps.apple.com/app/meet-mobile/id440986614" target="_blank" rel="noreferrer" className="info-card no-underline block">
            <h3>iOS — App Store</h3>
            <p className="text-sm text-gray-500">Download Meet Mobile for iPhone and iPad</p>
          </a>
          <a href="https://play.google.com/store/apps/details?id=com.activenetwork.hy.meetmobile" target="_blank" rel="noreferrer" className="info-card no-underline block">
            <h3>Android — Google Play</h3>
            <p className="text-sm text-gray-500">Download Meet Mobile for Android</p>
          </a>
        </div>

        <h2 className="section-title">Post-Session <span className="text-crimson">Results</span></h2>
        <div className="divider" />
        {hasResults ? (
          <a href={settings.results_url} target="_blank" rel="noreferrer" className="btn-primary no-underline">&darr; Download Results PDF</a>
        ) : (
          <div className="bg-cream-mid border-2 border-dashed border-crimson/20 p-8 text-center rounded">
            <p className="font-oswald text-sm tracking-widest uppercase text-gray-400">{blocks.results_placeholder || 'Results will be posted here after each session'}</p>
            <p className="text-xs text-gray-400 mt-2">Check back on meet day — {currentSeason?.dates_display}</p>
          </div>
        )}
      </div>
    </>
  )
}
