import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import SahanExperience from './sahan/SahanExperience.jsx'
import LearnerDashboard from './learner/LearnerDashboardPayments.jsx'
import TeachApp from './teach/TeachApp.jsx'
import Auth from './auth/Auth.jsx'
import { supabase } from './lib/supabase.js'
import './styles/index.css'

function Loading(){return <div className="sahan-auth-loading">Loading Sahan…</div>}
function NotFound(){return <div style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:32,textAlign:'center'}}><div><div className="learner-kicker">404</div><h1>Page not found</h1><p>The page you're looking for doesn't exist or has moved.</p><a href="/" style={{fontWeight:800}}>Return to Sahan →</a></div></div>}
function PublicHome({goLogin,goSignup,goTeach}){return <div className="sahan-public-root"><SahanExperience onNavigateTeach={goTeach} onNavigateApp={()=>window.location.assign('/app')}/><div style={{position:'fixed',top:18,right:22,zIndex:100,display:'flex',gap:8,padding:6,borderRadius:12,background:'rgba(255,255,255,.94)',border:'1px solid #e4e0d8',boxShadow:'0 10px 30px rgba(20,18,12,.08)',backdropFilter:'blur(10px)'}}><button style={{border:0,background:'transparent',padding:'8px 10px',fontWeight:700,cursor:'pointer'}} onClick={goLogin}>Sign in</button><button style={{border:0,background:'#171714',color:'#fff',borderRadius:8,padding:'8px 12px',fontWeight:800,cursor:'pointer'}} onClick={goSignup}>Create account</button></div></div>}
function AuthPage({mode}){const navigate=useNavigate();return <Auth mode={mode} onAuthenticated={()=>navigate('/app',{replace:true})}/>}
function ProtectedLearner({session}){if(!session)return <Navigate to="/login" replace/>;return <LearnerDashboard session={session} onSignOut={async()=>{await supabase.auth.signOut();window.location.assign('/')}} onNavigateTeach={()=>window.location.assign('/teach')}/>}
function TeachRoute(){return <TeachApp onNavigateHome={()=>window.location.assign('/')}/>}
function ResourceRoute({kind}){return <div style={{minHeight:'100vh',padding:40}}><a href="/">← Sahan</a><div style={{maxWidth:900,margin:'80px auto'}}><div className="learner-kicker">{kind.toUpperCase()}</div><h1>{kind==='community'?'Sahan Community':'Creator profile'}</h1><p>This route is live and deep-linkable. The full {kind} experience is being connected to the same Supabase data layer.</p></div></div>}
function AppRoutes({session,loading}){
 const location=useLocation()
 if(loading)return <Loading/>
 return <Routes>
  <Route path="/" element={<PublicHome goLogin={()=>window.location.assign('/login')} goSignup={()=>window.location.assign('/signup')} goTeach={()=>window.location.assign('/teach')}/>} />
  <Route path="/login" element={session?<Navigate to="/app" replace/>:<AuthPage mode="login"/>}/>
  <Route path="/signup" element={session?<Navigate to="/app" replace/>:<AuthPage mode="signup"/>}/>
  <Route path="/forgot-password" element={<AuthPage mode="forgot"/>}/>
  <Route path="/reset-password" element={<AuthPage mode="reset"/>}/>
  <Route path="/auth/callback" element={session?<Navigate to="/app" replace/>:<AuthPage mode="login"/>}/>
  <Route path="/app" element={<ProtectedLearner session={session}/>} />
  <Route path="/courses/:slug" element={<ProtectedLearner session={session}/>} />
  <Route path="/creator/:username" element={<ResourceRoute kind="creator"/>}/>
  <Route path="/community" element={<ResourceRoute kind="community"/>}/>
  <Route path="/teach/*" element={<TeachRoute/>}/>
  <Route path="/instructor/*" element={<TeachRoute/>}/>
  <Route path="/admin/*" element={<TeachRoute/>}/>
  <Route path="/payment/success" element={<ProtectedLearner session={session}/>} />
  <Route path="/payment/failed" element={<ProtectedLearner session={session}/>} />
  <Route path="*" element={<NotFound/>}/>
 </Routes>
}
function Root(){const [session,setSession]=useState(null);const [loading,setLoading]=useState(true);useEffect(()=>{let mounted=true;supabase.auth.getSession().then(({data})=>{if(mounted){setSession(data.session??null);setLoading(false)}});const {data:listener}=supabase.auth.onAuthStateChange((_event,next)=>{if(mounted)setSession(next??null)});return()=>{mounted=false;listener.subscription.unsubscribe()}},[]);return <BrowserRouter><AppRoutes session={session} loading={loading}/></BrowserRouter>}
ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><Root/></React.StrictMode>)
