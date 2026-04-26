import { Link } from 'react-router-dom'
import { useSite } from '../../lib/SiteContext'
import { driveUrl } from '../../lib/hooks'

export default function Footer() {
  const { getMediaUrl, settings, pages } = useSite()
  const seisLogo = driveUrl(getMediaUrl('seis-logo'), 300)
  const cacLogo = driveUrl(getMediaUrl('cac-logo'), 200)
  const eagleLogo = driveUrl(getMediaUrl('screaming-eagle'), 200)
  const year = new Date().getFullYear()

  const isPageVisible = (slug) => {
    const page = pages.find(p => p.slug === slug)
    return page ? page.is_visible : false
  }

  const footerLinks = [
    { slug: 'contact', label: 'Contact' },
    { slug: 'entries', label: 'Entries' },
    { slug: 'warmup', label: 'Warm-up' },
    { slug: 'meet-info', label: 'Meet Info' },
  ].filter(l => isPageVisible(l.slug))

  return (
    <footer className="bg-[#0a0a0a] border-t-2 border-crimson py-10 px-6 text-center">
      <div className="max-w-[900px] mx-auto">
        {/* Row 1: SEIS logo */}
        {seisLogo && <img src={seisLogo} alt="SEIS" className="h-16 mx-auto mb-3 opacity-70" loading="lazy" decoding="async" />}
        {/* Row 2: CAC Swimming + Screaming Eagle — equal height */}
        {(cacLogo || eagleLogo) && (
          <div className="flex items-center justify-center gap-6 mb-4">
            {cacLogo && <img src={cacLogo} alt="CAC Swimming" className="h-10 w-auto object-contain opacity-60" loading="lazy" decoding="async" />}
            {eagleLogo && <img src={eagleLogo} alt="Screaming Eagles" className="h-10 w-auto object-contain opacity-60" loading="lazy" decoding="async" />}
          </div>
        )}
        <p className="text-sm text-gray-500 tracking-wide mb-1">{settings?.site_title || 'Swimming Eagles Invitational Series'}</p>
        <p className="text-xs text-gray-600 mb-4">&copy; {year} Cairo American College &mdash; Aquatics Department. All rights reserved.</p>
        {footerLinks.length > 0 && (
          <div className="flex justify-center gap-4 text-xs">
            {footerLinks.map(l => (
              <Link key={l.slug} to={`/${l.slug}`} className="text-gray-600 hover:text-gold no-underline transition-colors">{l.label}</Link>
            ))}
          </div>
        )}
      </div>
    </footer>
  )
}
