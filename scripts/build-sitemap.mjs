#!/usr/bin/env node
// Build-time sitemap generator. Reads the `pages` table via the public
// anon key and emits `dist/sitemap.xml` listing only rows with
// `is_visible = true`. This prevents hidden routes from appearing in
// Google / WhatsApp / LinkedIn link-preview fetchers (which then hit
// the SPA's <NotFound /> and count as soft 404s).
//
// Run as a postbuild step (see package.json). Falls back to a minimal
// hardcoded sitemap if env vars are missing or the fetch fails, so
// Vercel builds never fail over this.

import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY
const SITE_URL = process.env.SITE_URL || 'https://swimming-eagles-invitational.vercel.app'
const OUTPUT = resolve('dist/sitemap.xml')

const FALLBACK_ROUTES = [
  { slug: '', changefreq: 'weekly', priority: '1.0' },
  { slug: 'meet-info', changefreq: 'monthly', priority: '0.9' },
  { slug: 'schedule', changefreq: 'monthly', priority: '0.9' },
  { slug: 'fees', changefreq: 'monthly', priority: '0.8' },
  { slug: 'faq', changefreq: 'monthly', priority: '0.7' },
  { slug: 'contact', changefreq: 'monthly', priority: '0.9' },
]

const PRIORITY_BY_SLUG = {
  home: '1.0',
  'meet-info': '0.9',
  schedule: '0.9',
  entries: '0.9',
  contact: '0.9',
  results: '0.9',
  sessions: '0.8',
  programs: '0.8',
  fees: '0.8',
  stream: '0.8',
  warmup: '0.7',
  faq: '0.7',
}

function buildXml(routes) {
  const urls = routes.map(r => {
    const path = r.slug === '' || r.slug === 'home' ? '' : `/${r.slug}`
    return `  <url><loc>${SITE_URL}${path}</loc><changefreq>${r.changefreq}</changefreq><priority>${r.priority}</priority></url>`
  }).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

async function main() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('[sitemap] Supabase env vars missing; writing fallback sitemap')
    writeFileSync(OUTPUT, buildXml(FALLBACK_ROUTES))
    return
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/pages?select=slug&is_visible=eq.true&order=nav_order`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const rows = await res.json()
    const routes = rows.map(r => ({
      slug: r.slug,
      changefreq: 'monthly',
      priority: PRIORITY_BY_SLUG[r.slug] || '0.5',
    }))
    // Ensure home is always first; Supabase order by nav_order should do this,
    // but be defensive in case admin re-ordered.
    routes.sort((a, b) => (a.slug === 'home' ? -1 : b.slug === 'home' ? 1 : 0))
    writeFileSync(OUTPUT, buildXml(routes))
    console.log(`[sitemap] wrote ${routes.length} routes from Supabase`)
  } catch (err) {
    console.warn(`[sitemap] Supabase fetch failed (${err.message}); writing fallback sitemap`)
    writeFileSync(OUTPUT, buildXml(FALLBACK_ROUTES))
  }
}

main()
