import { Link } from 'react-router-dom'
import { useSite } from '../../lib/SiteContext'
import { driveUrl, onImgError } from '../../lib/hooks'

export default function Footer() {
  const { getMediaUrl, settings, pages } = useSite()
  const cacLogo = driveUrl(getMediaUrl('cac-logo'), 200)
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
        {cacLogo && <img src={cacLogo} alt="CAC" className="h-12 mx-auto mb-4 opacity-60" loading="lazy" decoding="async" data-fallback="cac-logo" onError={onImgError} />}
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
