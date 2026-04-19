import PageHeader from '../../components/public/PageHeader'
import Breadcrumb from '../../components/public/Breadcrumb'
import { useContent } from '../../lib/hooks'
import { useSite } from '../../lib/SiteContext'

export default function Stream() {
  const { settings, currentSeason } = useSite()
  const { blocks } = useContent('stream')
  const hasStream = settings?.stream_url

  return (
    <>
      <PageHeader slug="stream" label="Watch Live" titleHtml='Live <span class="text-gold">Stream</span>' />
      <Breadcrumb page="Live Stream" />
      <div className="max-w-[900px] mx-auto py-16 px-8">
        <p className="text-sm text-gray-500 mb-6">{blocks.stream_intro}</p>
        {hasStream ? (
          <div className="bg-white border-t-4 border-crimson overflow-hidden">
            <div className="relative pb-[56.25%]">
              <iframe src={settings.stream_url} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Live Stream" />
            </div>
          </div>
        ) : (
          <div className="bg-cream-mid border-2 border-dashed border-crimson/20 p-12 text-center rounded">
            <p className="font-oswald text-sm tracking-widest uppercase text-gray-400">{blocks.stream_placeholder || 'Live stream will be available here on meet day'}</p>
            <p className="text-xs text-gray-400 mt-2">{currentSeason?.dates_display} — Check back on meet day</p>
          </div>
        )}
      </div>
    </>
  )
}
