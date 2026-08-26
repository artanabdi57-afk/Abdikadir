import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams, Link, useLocation } from 'react-router-dom'
import SahanExperience from './sahan/SahanExperience.jsx'
import SahanApp from './App.jsx'
import LearnerDashboardPayments from './learner/LearnerDashboardPayments.jsx'
import TeachApp from './teach/TeachApp.jsx'
import Auth from './auth/Auth.jsx'
import { supabase } from './lib/supabase.js'
import { LanguageProvider } from './i18n/LanguageContext.jsx'
import './styles/index.css'

function ViewNavigator() {
  const location = useLocation()
  const [minimized, setMinimized] = useState(false)
  const currentPath = location.pathname

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 9999,
          background: '#18181b',
          color: '#ffffff',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 30,
          padding: '8px 16px',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span>ðŸŽ¨ Sahan Views</span>
        <span style={{ fontSize: 11, background: '#3f3f46', padding: '2px 6px', borderRadius: 10 }}>Expand</span>
      </button>
    )
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 9999,
        background: 'rgba(24, 24, 27, 0.96)',
        color: '#f4f4f5',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: 16,
        padding: '10px 14px',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 4 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
        <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.04em', color: '#a1a1aa', textTransform: 'uppercase' }}>Views</span>
      </div>

      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: 3, gap: 2 }}>
        <Link
          to="/"
          style={{
            padding: '6px 12px',
            borderRadius: 7,
            fontSize: 12,
            fontWeight: 700,
            color: currentPath === '/' ? '#ffffff' : '#a1a1aa',
            background: currentPath === '/' ? '#3b82f6' : 'transparent',
            textDecoration: 'none',
            transition: 'all 0.15s ease',
          }}
        >
          ðŸŽ“ Student App
        </Link>
        <Link
          to="/experience"
          style={{
            padding: '6px 12px',
            borderRadius: 7,
            fontSize: 12,
            fontWeight: 700,
            color: currentPath === '/experience' ? '#ffffff' : '#a1a1aa',
            background: currentPath === '/experience' ? '#3b82f6' : 'transparent',
            textDecoration: 'none',
            transition: 'all 0.15s ease',
          }}
        >
          âœ¨ Landing & Survey
        </Link>
        <Link
          to="/teach"
          style={{
            padding: '6px 12px',
            borderRadius: 7,
            fontSize: 12,
            fontWeight: 700,
            color: currentPath.startsWith('/teach') ? '#ffffff' : '#a1a1aa',
            background: currentPath.startsWith('/teach') ? '#3b82f6' : 'transparent',
            textDecoration: 'none',
            transition: 'all 0.15s ease',
          }}
        >
          ðŸ‘¨â€ðŸ« Teach Portal
        </Link>
        <Link
          to="/payments"
          style={{
            padding: '6px 12px',
            borderRadius: 7,
            fontSize: 12,
            fontWeight: 700,
            color: currentPath === '/payments' ? '#ffffff' : '#a1a1aa',
            background: currentPath === '/payments' ? '#3b82f6' : 'transparent',
            textDecoration: 'none',
            transition: 'all 0.15s ease',
          }}
        >
          ðŸ’³ Live Payments
        </Link>
      </div>

      <button
        onClick={() => setMinimized(true)}
        title="Minimize"
        style={{
          border: 0,
          background: 'transparent',
          color: '#71717a',
          cursor: 'pointer',
          padding: '4px 6px',
          fontSize: 14,
          lineHeight: 1,
          borderRadius: 6,
        }}
      >
        âœ•
      </button>
    </div>
  )
}

function Loading() {
  return <div className="sahan-auth-loading">Loading Sahanâ€¦</div>
}

function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 32, textAlign: 'center' }}>
      <div>
        <div className="learner-kicker">404</div>
        <h1>Page not found</h1>
        <p>The page you're looking for doesn't exist or has moved.</p>
        <a href="/" style={{ fontWeight: 800 }}>Return to Sahan â†’</a>
      </div>
    </div>
  )
}

function AuthPage({ mode }) {
  const navigate = useNavigate()
  return <Auth mode={mode} onAuthenticated={() => navigate('/', { replace: true })} />
}

function ResourceRoute({ kind }) {
  const params = useParams()
  const value = params.slug || params.username || ''
  return (
    <div style={{ minHeight: '100vh', padding: 40 }}>
      <a href="/">â† Return to Sahan</a>
      <div style={{ maxWidth: 900, margin: '80px auto' }}>
        <div className="learner-kicker">{kind.toUpperCase()}</div>
        <h1>{kind === 'community' ? 'Sahan Community' : kind === 'creator' ? 'Creator profile' : 'Course Details'}</h1>
        <p>{value ? `/${kind}/${value}` : `The ${kind} section is connected and ready.`}</p>
        <p>This deep-linkable route connects to the Sahan learning application ecosystem.</p>
      </div>
    </div>
  )
}

function AppRoutes({ session, loading }) {
  const navigate = useNavigate()

  if (loading) return <Loading />

  return (
    <>
      <Routes>
        {/* Main Student Learning Space & Interactive Design */}
        <Route
          path="/"
          element={
            <SahanApp
              onNavigateTeach={() => navigate('/teach')}
              onNavigateHome={() => navigate('/')}
            />
          }
        />
        <Route
          path="/app/*"
          element={
            <SahanApp
              onNavigateTeach={() => navigate('/teach')}
              onNavigateHome={() => navigate('/')}
            />
          }
        />

        {/* Sahan Personalized Path & Survey Landing Experience */}
        <Route
          path="/experience"
          element={
            <SahanExperience
              onNavigateTeach={() => navigate('/teach')}
              onNavigateApp={() => navigate('/')}
            />
          }
        />

        {/* Instructor & Creator Portal */}
        <Route
          path="/teach/*"
          element={<TeachApp onNavigateHome={() => navigate('/')} />}
        />
        <Route
          path="/instructor/*"
          element={<TeachApp onNavigateHome={() => navigate('/')} />}
        />
        <Route
          path="/admin/*"
          element={<TeachApp onNavigateHome={() => navigate('/')} />}
        />

        {/* Live Supabase & Payments Hub */}
        <Route
          path="/payments"
          element={
            <LearnerDashboardPayments
              session={session}
              onSignOut={async () => {
                await supabase.auth.signOut()
                navigate('/')
              }}
              onNavigateTeach={() => navigate('/teach')}
            />
          }
        />

        {/* Auth routes */}
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route path="/forgot-password" element={<AuthPage mode="forgot" />} />
        <Route path="/reset-password" element={<AuthPage mode="reset" />} />
        <Route path="/auth/callback" element={<AuthPage mode="login" />} />

        {/* Deep links */}
        <Route path="/courses/:slug" element={<ResourceRoute kind="course" />} />
        <Route path="/creator/:username" element={<ResourceRoute kind="creator" />} />
        <Route path="/community/:slug" element={<ResourceRoute kind="community" />} />
        <Route path="/community" element={<ResourceRoute kind="community" />} />

        <Route
          path="/payment/success"
          element={
            <LearnerDashboardPayments
              session={session}
              onSignOut={async () => {
                await supabase.auth.signOut()
                navigate('/')
              }}
              onNavigateTeach={() => navigate('/teach')}
            />
          }
        />
        <Route
          path="/payment/failed"
          element={
            <LearnerDashboardPayments
              session={session}
              onSignOut={async () => {
                await supabase.auth.signOut()
                navigate('/')
              }}
              onNavigateTeach={() => navigate('/teach')}
            />
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ViewNavigator />
    </>
  )
}

function Root() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session ?? null)
        setLoading(false)
      }
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      if (mounted) setSession(next ?? null)
    })
    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  return (
    <LanguageProvider>
      <BrowserRouter>
        <AppRoutes session={session} loading={loading} />
      </BrowserRouter>
    </LanguageProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)

