import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Sahan Supabase environment is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.')
}

if (!supabaseUrl.includes('dwmwdhybmpfjqvkbgqsj.supabase.co')) {
  throw new Error('Sahan is configured with the wrong Supabase project. Refusing to start.')
}

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
