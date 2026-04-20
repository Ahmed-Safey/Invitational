import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const configError = (!supabaseUrl || !supabaseKey)
  ? 'Supabase credentials missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment (.env locally, Vercel env vars in production).'
  : null

if (configError) console.error(configError)

// Use placeholders when config is missing so the app can still render a configuration error screen
// instead of hanging on an infinite loading spinner.
export const supabase = createClient(
  supabaseUrl || 'https://missing.supabase.co',
  supabaseKey || 'missing'
)
