import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

const SiteContext = createContext({})

const SITE_CACHE_KEY = 'seis_site_cache'
const SITE_CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

function loadSiteCache() {
  try {
    const raw = sessionStorage.getItem(SITE_CACHE_KEY)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > SITE_CACHE_TTL_MS) return null
    return data
  } catch { return null }
}

function writeSiteCache(data) {
  try { sessionStorage.setItem(SITE_CACHE_KEY, JSON.stringify({ data, ts: Date.now() })) } catch {}
}

export function SiteProvider({ children }) {
  const [settings, setSettings] = useState(null)
  const [seasons, setSeasons] = useState([])
  const [pages, setPages] = useState([])
  const [media, setMedia] = useState({})
  const [activeSeason, setActiveSeason] = useState(
    localStorage.getItem('seis_season') || null
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const applyData = (settingsData, seasonsData, pagesData, mediaData) => {
    if (settingsData) setSettings(settingsData)
    if (seasonsData) setSeasons(seasonsData)
    if (pagesData) setPages(pagesData)
    if (mediaData) {
      const map = {}
      mediaData.forEach(m => { map[m.slug] = m })
      setMedia(map)
    }
    const loadedSeasons = seasonsData || []
    const stored = localStorage.getItem('seis_season')
    const storedIsValid = stored && loadedSeasons.some(s => s.slug === stored)
    if (!storedIsValid) {
      if (stored) localStorage.removeItem('seis_season')
      if (settingsData) setActiveSeason(settingsData.active_season)
    } else if (!activeSeason) {
      setActiveSeason(stored)
    }
  }

  const fetchAll = async (skipCache = false) => {
    try {
      // Fast path: use sessionStorage cache if fresh (saves 4 Supabase queries)
      if (!skipCache) {
        const cached = loadSiteCache()
        if (cached) {
          applyData(cached.settings, cached.seasons, cached.pages, cached.media)
          setError(null)
          setLoading(false)
          return
        }
      }

      const [settingsRes, seasonsRes, pagesRes, mediaRes] = await Promise.all([
        supabase.from('site_settings').select('*').single(),
        supabase.from('seasons').select('*').order('slug'),
        supabase.from('pages').select('*').order('nav_order'),
        supabase.from('media').select('*'),
      ])
      if (settingsRes.error) throw settingsRes.error
      applyData(settingsRes.data, seasonsRes.data, pagesRes.data, mediaRes.data)
      writeSiteCache({
        settings: settingsRes.data,
        seasons: seasonsRes.data,
        pages: pagesRes.data,
        media: mediaRes.data,
      })
      setError(null)
    } catch (err) {
      console.error('Failed to load site data:', err)
      setError(err.message || 'Failed to connect to the database')
    } finally {
      setLoading(false)
    }
  }

  // refetch always bypasses cache
  const refetch = () => fetchAll(true)

  useEffect(() => { fetchAll() }, [])

  const switchSeason = (slug) => {
    setActiveSeason(slug)
    localStorage.setItem('seis_season', slug)
  }

  const currentSeason = seasons.find(s => s.slug === activeSeason) || seasons[0]

  const getMediaUrl = (slug) => {
    const m = media[slug]
    if (!m || !m.google_drive_url) return null
    return m.google_drive_url
  }

  return (
    <SiteContext.Provider value={{
      settings, seasons, pages, media, currentSeason,
      activeSeason, switchSeason, getMediaUrl, loading, error, refetch,
    }}>
      {children}
    </SiteContext.Provider>
  )
}

export const useSite = () => useContext(SiteContext)
