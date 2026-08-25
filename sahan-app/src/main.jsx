import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import SahanExperience from './sahan/SahanExperience.jsx'
import LearnerDashboard from './learner/LearnerDashboard.jsx'
import TeachApp from './teach/TeachApp.jsx'
import Auth from './auth/Auth.jsx'
import { supabase } from './lib/supabase.js'
import './styles/index.css'

const routeFromPath = () => {
  const path = window.location.pathname
  if (path.startsWith('/teach') || path.startsWith('/instructor') || path.startsWith('/admin')) return 'teach'
  if (path.startsWith('/app')) return 'app'
  if (path.startsWith('/signup')) return 'signup'
  if (path.startsWith('/forgot-password')) return 'forgot'
  if (path.startsWith('/reset-password')) return 'reset'
  if (path.startsWith('/auth/callback')) return 'callback'
  if (path.startsWith('/login')) return 'login'
  return 'experience'
}

function Root() {
  const [route, setRoute] = useState(routeFromPath)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  const navigate = (to) => {
    setRoute(to)
    const targetPath = ({ teach: '/teach', app: '/app', login: '/login', signup: '/signup', forgot: '/forgot-password', reset: '/reset-password' })[to] ?? '/'
    window.history.pushState({}, '', targetPath)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session ?? null)
      setLoading(false)
      if (route === 'callback' && data.session) navigate('app')
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return
      setSession(nextSession ?? null)
      if (nextSession && ['login', 'signup', 'callback'].includes(route)) navigate('app')
    })
    const onPop = () => setRoute(routeFromPath())
    window.addEventListener('popstate', onPop)
    return () => { mounted = false; listener.subscription.unsubscribe(); window.removeEventListener('popstate', onPop) }
  }, [])

  const signOut = async () => { await supabase.auth.signOut(); navigate('experience') }
  if (loading) return <div className="sahan-auth-loading">Loading Sahan…</div>
  if (route === 'callback') return session ? null : <Auth mode="login" onAuthenticated={() => navigate('app')} />
  if (route === 'reset') return <Auth mode="reset" onAuthenticated={() => navigate('app')} />
  if (route === 'login') return <Auth mode="login" onAuthenticated={() => navigate('app')} />
  if (route === 'signup') return <Auth mode="signup" onAuthenticated={() => navigate('app')} />
  if (route === 'forgot') return <Auth mode="forgot" onAuthenticated={() => navigate('app')} />
  if (route === 'app' && !session) return <Auth mode="login" onAuthenticated={() => navigate('app')} />

  return <>
    {route === 'teach' && <TeachApp onNavigateHome={() => navigate('experience')} />}
    {route === 'app' && <LearnerDashboard session={session} onSignOut={signOut} onNavigateTeach={() => navigate('teach')} />}
    {route === 'experience' && <div className="sahan-public-root"><SahanExperience onNavigateTeach={() => navigate('teach')} onNavigateApp={() => navigate('app')} /><div style={{position:'fixed',top:18,right:22,zIndex:100,display:'flex',gap:8,padding:6,borderRadius:12,background:'rgba(255,255,255,.94)',border:'1px solid #e4e0d8',boxShadow:'0 10px 30px rgba(20,18,12,.08)',backdropFilter:'blur(10px)'}}><button style={{border:0,background:'transparent',padding:'8px 10px',fontWeight:700,cursor:'pointer'}} onClick={() => navigate('login')}>Sign in</button><button style={{border:0,background:'#171714',color:'#fff',borderRadius:8,padding:'8px 12px',fontWeight:800,cursor:'pointer'}} onClick={() => navigate('signup')}>Create account</button></div></div>}
  </>
}

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><Root /></React.StrictMode>)
