import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSite } from '../../lib/SiteContext'
import { driveUrl } from '../../lib/hooks'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { pages, getMediaUrl } = useSite()
  const location = useLocation()
  const logoUrl = driveUrl(getMediaUrl('seis-logo'), 400)

  // Contact is always the pill CTA, never in the regular nav list (so it isn't
  // duplicated if an admin accidentally fills its nav_label).
  const navPages = pages.filter(p => p.nav_label && p.slug !== 'home' && p.slug !== 'contact' && p.is_visible).sort((a, b) => a.nav_order - b.nav_order)
  const isActive = (slug) => location.pathname === `/${slug}` || (slug === 'home' && location.pathname === '/')
  const contactPage = pages.find(p => p.slug === 'contact' && p.is_visible)
  // CTA label follows the Contact page's nav_label when set so admin renames
  // flow through to the pill button. Falls back to the traditional copy.
  const ctaLabel = contactPage?.nav_label || 'Register Interest'

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/[0.97] backdrop-blur-sm border-b-2 border-crimson flex items-center justify-between px-2 md:px-6 h-[68px]">
      <Link to="/" className="flex items-center gap-3 no-underline shrink-0">
        {logoUrl && <img src={logoUrl} alt="SEIS" className="h-[58px]" />}
        <span className="font-oswald font-semibold text-sm text-white tracking-widest uppercase border-l-2 border-crimson pl-3 hidden sm:block">
          Swimming Eagles<br/>Invitational Series
        </span>
      </Link>

      {/* Desktop nav */}
      <ul className="hidden lg:flex items-center gap-5 h-full list-none">
        {navPages.map(p => (
          <li key={p.slug}>
            <Link
              to={`/${p.slug}`}
              className={`font-oswald font-normal text-xs tracking-widest uppercase no-underline transition-colors ${isActive(p.slug) ? 'text-gold' : 'text-gray-400 hover:text-gold'}`}
            >{p.nav_label}</Link>
          </li>
        ))}
        {contactPage && (
          <li>
            <Link to="/contact" className="bg-crimson text-white font-oswald text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-sm hover:bg-crimson-dark transition-colors no-underline">
              {ctaLabel}
            </Link>
          </li>
        )}
      </ul>

      {/* Hamburger */}
      <button onClick={() => setOpen(!open)} className="lg:hidden flex flex-col justify-center items-center gap-[5px] w-11 h-11 bg-transparent border-none cursor-pointer" aria-label="Menu" aria-expanded={open} aria-controls="mobile-menu">
        <span className={`block w-6 h-0.5 bg-gray-400 rounded transition-all ${open ? 'translate-y-[7px] rotate-45' : ''}`} />
        <span className={`block w-6 h-0.5 bg-gray-400 rounded transition-all ${open ? 'opacity-0' : ''}`} />
        <span className={`block w-6 h-0.5 bg-gray-400 rounded transition-all ${open ? '-translate-y-[7px] -rotate-45' : ''}`} />
      </button>

      {/* Mobile menu */}
      {open && (
        <ul id="mobile-menu" className="absolute top-[68px] left-0 right-0 bg-black/[0.98] flex flex-col p-4 gap-0 border-b-2 border-crimson lg:hidden list-none">
          {navPages.map(p => (
            <li key={p.slug} className="w-full">
              <Link to={`/${p.slug}`} onClick={() => setOpen(false)}
                className={`block py-3 font-oswald text-sm tracking-widest uppercase no-underline border-b border-white/5 ${isActive(p.slug) ? 'text-gold' : 'text-gray-400 hover:text-gold'}`}>
                {p.nav_label}
              </Link>
            </li>
          ))}
          {contactPage && (
            <li>
              <Link to="/contact" onClick={() => setOpen(false)}
                className="inline-block mt-3 bg-crimson text-white font-oswald text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-sm no-underline">
                {ctaLabel}
              </Link>
            </li>
          )}
        </ul>
      )}
    </nav>
  )
}
