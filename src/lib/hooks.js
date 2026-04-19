import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase'

export function useContent(pageSlug) {
  const [blocks, setBlocks] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!pageSlug) return
    supabase
      .from('content_blocks')
      .select('*')
      .eq('page_slug', pageSlug)
      .order('sort_order')
      .then(({ data }) => {
        const map = {}
        if (data) data.forEach(b => {
          if (['json', 'table', 'list'].includes(b.block_type)) {
            try { map[b.block_key] = JSON.parse(b.content) }
            catch { map[b.block_key] = b.content }
          } else {
            map[b.block_key] = b.content
          }
        })
        setBlocks(map)
        setLoading(false)
      })
  }, [pageSlug])

  return { blocks, loading }
}

export function useEvents(day, session) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let query = supabase.from('events').select('*').order('day').order('sort_order')
    if (day) query = query.eq('day', day)
    if (session) query = query.eq('session', session)
    query.then(({ data }) => {
      setEvents(data || [])
      setLoading(false)
    })
  }, [day, session])

  return { events, loading }
}

export function useScoring() {
  const [scoring, setScoring] = useState([])
  useEffect(() => {
    supabase.from('scoring_table').select('*').order('place').then(({ data }) => {
      setScoring(data || [])
    })
  }, [])
  return scoring
}

export function usePrograms(seasonSlug) {
  const [programs, setPrograms] = useState([])
  useEffect(() => {
    if (!seasonSlug) return
    supabase.from('programs').select('*').eq('season_slug', seasonSlug).then(({ data }) => {
      setPrograms(data || [])
    })
  }, [seasonSlug])
  return programs
}

export function useBankDetails() {
  const [bank, setBank] = useState(null)
  useEffect(() => {
    supabase.from('bank_details').select('*').maybeSingle().then(({ data }) => {
      setBank(data)
    })
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
