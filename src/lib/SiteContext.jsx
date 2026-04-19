import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

const SiteContext = createContext({})

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

  const fetchAll = async () => {
    try {
      const [settingsRes, seasonsRes, pagesRes, mediaRes] = await Promise.all([
        supabase.from('site_settings').select('*').single(),
        supabase.from('seasons').select('*').order('slug'),
        supabase.from('pages').select('*').order('nav_order'),
        supabase.from('media').select('*'),
      ])
      if (settingsRes.error) throw settingsRes.error
      if (settingsRes.data) setSettings(settingsRes.data)
      if (seasonsRes.data) setSeasons(seasonsRes.data)
      if (pagesRes.data) setPages(pagesRes.data)
      if (mediaRes.data) {
        const map = {}
        mediaRes.data.forEach(m => { map[m.slug] = m })
        setMedia(map)
      }
      if (!activeSeason && settingsRes.data) {
        setActiveSeason(settingsRes.data.active_season)
      }
      setError(null)
    } catch (err) {
      console.error('Failed to load site data:', err)
      setError(err.message || 'Failed to connect to the database')
    } finally {
      setLoading(false)
    }
  }

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
      activeSeason, switchSeason, getMediaUrl, loading, error, refetch: fetchAll,
    }}>
      {children}
    </SiteContext.Provider>
  )
}

export const useSite = () => useContext(SiteContext)
