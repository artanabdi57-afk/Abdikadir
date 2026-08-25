import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
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
function ResourceRoute({kind}){const params=useParams();const value=params.slug||params.username||'';return <div style={{minHeight:'100vh',padding:40}}><a href="/">← Sahan</a><div style={{maxWidth:900,margin:'80px auto'}}><div className="learner-kicker">{kind.toUpperCase()}</div><h1>{kind==='community'?'Sahan Community':kind==='creator'?'Creator profile':'Course'}</h1><p>{value ? `/${kind}/${value}` : `The ${kind} route is ready.`}</p><p>This route is deep-linkable and is connected to the Sahan application routing layer. The full data-backed experience will use the Sahan Supabase data layer.</p></div></div>}
function RoleRoute({session,roles,children}){
 const [role,setRole]=useState(null)
 const [loading,setLoading]=useState(true)
 useEffect(()=>{let active=true;if(!session){setRole(null);setLoading(false);return}supabase.from('sahan_profiles').select('role').eq('id',session.user.id).maybeSingle().then(({data,error})=>{if(!active)return;setRole(error?null:data?.role??'learner');setLoading(false)});return()=>{active=false}},[session])
 if(!session)return <Navigate to="/login" replace/>
 if(loading)return <Loading/>
 if(!roles.includes(role))return <Navigate to="/app" replace/>
 return children
}
function TeachRoute({session}){return <RoleRoute session={session} roles={['creator','admin']}><TeachApp onNavigateHome={()=>window.location.assign('/')}/></RoleRoute>}
function AdminRoute({session}){return <RoleRoute session={session} roles={['admin']}><TeachApp onNavigateHome={()=>window.location.assign('/')}/></RoleRoute>}
function AppRoutes({session,loading}){
 if(loading)return <Loading/>
 return <Routes>
  <Route path="/" element={<PublicHome goLogin={()=>window.location.assign('/login')} goSignup={()=>window.location.assign('/signup')} goTeach={()=>window.location.assign('/teach')}/>} />
  <Route path="/login" element={session?<Navigate to="/app" replace/>:<AuthPage mode="login"/>}/>
  <Route path="/signup" element={session?<Navigate to="/app" replace/>:<AuthPage mode="signup"/>}/>
  <Route path="/forgot-password" element={<AuthPage mode="forgot"/>}/>
  <Route path="/reset-password" element={<AuthPage mode="reset"/>}/>
  <Route path="/auth/callback" element={session?<Navigate to="/app" replace/>:<AuthPage mode="login"/>}/>

  <Route path="/courses/:slug" element={<ResourceRoute kind="course"/>}/>
  <Route path="/creator/:username" element={<ResourceRoute kind="creator"/>}/>
  <Route path="/community/:slug" element={<ResourceRoute kind="community"/>}/>
  <Route path="/community" element={<ResourceRoute kind="community"/>}/>

  <Route path="/app/*" element={<ProtectedLearner session={session}/>} />
  <Route path="/teach/*" element={<TeachRoute session={session}/>} />
  <Route path="/instructor/*" element={<TeachRoute session={session}/>} />
  <Route path="/admin/*" element={<AdminRoute session={session}/>} />

  <Route path="/payment/success" element={<ProtectedLearner session={session}/>} />
  <Route path="/payment/failed" element={<ProtectedLearner session={session}/>} />
  <Route path="*" element={<NotFound/>}/>
 </Routes>
}
function Root(){const [session,setSession]=useState(null);const [loading,setLoading]=useState(true);useEffect(()=>{let mounted=true;supabase.auth.getSession().then(({data})=>{if(mounted){setSession(data.session??null);setLoading(false)}});const {data:listener}=supabase.auth.onAuthStateChange((_event,next)=>{if(mounted)setSession(next??null)});return()=>{mounted=false;listener.subscription.unsubscribe()}},[]);return <BrowserRouter><AppRoutes session={session} loading={loading}/></BrowserRouter>}
ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><Root/></React.StrictMode>)
