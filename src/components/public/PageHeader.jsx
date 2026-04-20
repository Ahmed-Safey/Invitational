import { useSite } from '../../lib/SiteContext'
import { driveUrl } from '../../lib/hooks'
import PageTitle from './PageTitle'

export default function PageHeader({ label, title, titleHtml, subtitle, slug }) {
  const { getMediaUrl, pages } = useSite()
  const pageData = slug ? pages.find(p => p.slug === slug) : null
  const bgUrl = driveUrl(getMediaUrl('page-header-bg') || getMediaUrl('hero-photo'), 1200)

  // Prop wins for dynamic content (e.g. season dates); DB value is the fallback
  // so admin edits in Pages admin take effect when no hardcoded subtitle is set.
  const effectiveSubtitle = subtitle || pageData?.subtitle
  const effectiveTitle = title || pageData?.title

  return (
    <>
      <PageTitle title={effectiveTitle || (titleHtml || '').replace(/<[^>]*>/g, '')} description={pageData?.meta_description} />
      <div className="bg-black pt-[120px] pb-[60px] px-8 text-center relative overflow-hidden"
        style={bgUrl ? {
          backgroundImage: `linear-gradient(160deg, rgba(13,13,13,0.92), rgba(26,4,5,0.9) 40%, rgba(44,6,8,0.9) 70%, rgba(17,17,17,0.92)), url(${bgUrl})`,
          backgroundSize: 'cover', backgroundPosition: 'center'
        } : undefined}>
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(198,186,142,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(198,186,142,0.03) 1px, transparent 1px)',
          backgroundSize: '64px 64px'
        }} />
        {!bgUrl && <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-[#1a0405]/85 to-black/90" />}
        <div className="relative z-10">
          {label && <p className="font-oswald text-xs font-medium tracking-[0.22em] uppercase text-gold mb-1">{label}</p>}
          {titleHtml ? (
            // SECURITY: titleHtml is rendered with dangerouslySetInnerHTML.
            // Only pass HARDCODED JSX strings here (for <br /> line breaks etc).
            // NEVER pass DB-editable content directly — sanitize with DOMPurify first.
            <h1 className="font-oswald font-bold text-3xl md:text-5xl text-white tracking-tight uppercase leading-none"
              dangerouslySetInnerHTML={{ __html: titleHtml }} />
          ) : (
            <h1 className="font-oswald font-bold text-3xl md:text-5xl text-white tracking-tight uppercase leading-none">{effectiveTitle}</h1>
          )}
          {effectiveSubtitle && <p className="font-crimsonPro italic text-lg text-gold/50 mt-3">{effectiveSubtitle}</p>}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[60px]" style={{ background: 'linear-gradient(to bottom right, transparent 49%, #f9f8f4 50%)' }} />
      </div>
    </>
  )
}
