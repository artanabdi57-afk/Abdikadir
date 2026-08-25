import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://olhfaqqpypwotusviyhf.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_oWgACpitjSdouBWInJYXjg_m6lytn7z'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
})

export const getAuthRedirectUrl = (path = '/auth/callback') => {
  const base = window.location.origin.replace(/\/$/, '')
  return `${base}${path}`
}
