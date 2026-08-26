import { createClient } from '@supabase/supabase-js'

// Sahan is intentionally locked to its own Supabase project.
// The publishable key is safe for browser use; environment variables remain preferred.
const SAHAN_URL = 'https://dwmwdhybmpfjqvkbgqsj.supabase.co'
const SAHAN_PUBLISHABLE_KEY = 'sb_publishable_ne4m2N6HRJU9OZd6JJEnjA_gk78plxG'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || SAHAN_URL).replace(/\/$/, '')
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || SAHAN_PUBLISHABLE_KEY

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

