import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase'

export function useContent(pageSlug) {
  const [blocks, setBlocks] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!pageSlug) { setLoading(false); return }
    let cancelled = false
    setLoading(true)
    supabase
      .from('content_blocks')
      .select('*')
      .eq('page_slug', pageSlug)
      .order('sort_order')
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) console.error('useContent:', error)
        const map = {}
        if (data) data.forEach(b => {
          if (['json', 'table', 'list'].includes(b.block_type)) {
            try { map[b.block_key] = JSON.parse(b.content) }
            catch (err) {
              // Fall back to raw string but surface the key so consumers can
              // notice malformed JSON blocks in the admin instead of silently
              // rendering the wrong fallback branch.
              console.warn(`[useContent] ${pageSlug}.${b.block_key} (${b.block_type}) failed to parse as JSON:`, err.message)
              map[b.block_key] = b.content
            }
          } else {
            map[b.block_key] = b.content
          }
        })
        setBlocks(map)
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [pageSlug])

  return { blocks, loading }
}

export function useEvents(day, session, seasonSlug) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    let query = supabase.from('events').select('*').order('day').order('sort_order')
    if (day) query = query.eq('day', day)
    if (session) query = query.eq('session', session)
    if (seasonSlug) query = query.eq('season_slug', seasonSlug)
    query.then(({ data, error }) => {
      if (cancelled) return
      if (error) console.error('useEvents:', error)
      setEvents(data || [])
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [day, session, seasonSlug])

  return { events, loading }
}

export function useScoring() {
  const [scoring, setScoring] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let cancelled = false
    supabase.from('scoring_table').select('*').order('place').then(({ data, error }) => {
      if (cancelled) return
      if (error) console.error('useScoring:', error)
      setScoring(data || [])
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [])
  return { scoring, loading }
}

export function usePrograms(seasonSlug) {
  const [programs, setPrograms] = useState([])
  useEffect(() => {
    if (!seasonSlug) return
    let cancelled = false
    supabase.from('programs').select('*').eq('season_slug', seasonSlug).then(({ data, error }) => {
      if (cancelled) return
      if (error) console.error('usePrograms:', error)
      setPrograms(data || [])
    })
    return () => { cancelled = true }
  }, [seasonSlug])
  return programs
}

export function useBankDetails() {
  const [bank, setBank] = useState(null)
  useEffect(() => {
    let cancelled = false
    supabase.from('bank_details').select('*').maybeSingle().then(({ data, error }) => {
      if (cancelled) return
      if (error) console.error('useBankDetails:', error)
      setBank(data)
    })
    return () => { cancelled = true }
  }, [])
  return bank
}

export function driveUrl(url, width = 1920) {
  if (!url) return null
  const match = url.match(/\/d\/([^/]+)/)
  if (match) return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w${width}`
  if (url.includes('thumbnail?id=')) return url
  return url
}

// Admin helper: fetch all rows from a table
export function useAdminTable(table, orderBy = 'id') {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data: rows } = await supabase.from(table).select('*').order(orderBy)
    setData(rows || [])
    setLoading(false)
  }, [table, orderBy])

  useEffect(() => { load() }, [load])

  return { data, loading, reload: load }
}
