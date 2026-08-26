import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import SahanExperience from './sahan/SahanExperience.jsx'
import SahanApp from './App.jsx'
import LearnerDashboardPayments from './learner/LearnerDashboardPayments.jsx'
import TeachApp from './teach/TeachApp.jsx'
import Auth from './auth/Auth.jsx'
import { supabase } from './lib/supabase.js'
import { LanguageProvider } from './i18n/LanguageContext.jsx'
import './styles/index.css'

function Loading() {
  return <div className="sahan-auth-loading">Loading Sahan…</div>
}

function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 32, textAlign: 'center' }}>
      <div>
        <div className="learner-kicker">404</div>
        <h1>Page not found</h1>
        <p>The page you're looking for doesn't exist or has moved.</p>
        <a href="/" style={{ fontWeight: 800 }}>Return to Sahan →</a>
      </div>
    </div>
  )
}

function AuthPage({ mode }) {
  const navigate = useNavigate()
  return <Auth mode={mode} onAuthenticated={() => navigate('/app', { replace: true })} />
}

function ResourceRoute({ kind }) {
  const params = useParams()
  const value = params.slug || params.username || ''
  return (
    <div style={{ minHeight: '100vh', padding: 40 }}>
      <a href="/">← Return to Sahan</a>
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
            <SahanExperience
              onNavigateTeach={() => navigate('/teach')}
              onNavigateApp={() => navigate(session ? '/app' : '/login')}
            />
          }
        />
        <Route
          path="/app/*"
          element={
            session ? (
              <SahanApp
                onNavigateTeach={() => navigate('/teach')}
                onNavigateHome={() => navigate('/')}
              />
            ) : <Navigate to="/login" replace />
          }
        />

        {/* Sahan Personalized Path & Survey Landing Experience */}
        <Route
          path="/experience" element={<Navigate to="/" replace />} 
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

