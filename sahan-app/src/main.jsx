import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import SahanExperience from './sahan/SahanExperience.jsx'
import SahanApp from './App.jsx'
import LearnerDashboardPayments from './learner/LearnerDashboardPayments.jsx'
import TeachApp from './teach/TeachApp.jsx'
import AdminDashboard from './admin/AdminDashboard.jsx'
import Auth from './auth/Auth.jsx'
import { supabase } from './lib/supabase.js'
import { LanguageProvider } from './i18n/LanguageContext.jsx'
import './styles/index.css'

function Loading(){return <div className="sahan-auth-loading">Loading Sahan…</div>}
function NotFound(){return <div style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:32,textAlign:'center'}}><div><div className="learner-kicker">404</div><h1>Page not found</h1><a href="/">Return to Sahan →</a></div></div>}
function AuthPage({mode}){const navigate=useNavigate();return <Auth mode={mode} onAuthenticated={()=>navigate('/app',{replace:true})}/>}
function ResourceRoute({kind}){const p=useParams(),v=p.slug||p.username||'';return <div style={{minHeight:'100vh',padding:40}}><a href="/">← Return to Sahan</a><div style={{maxWidth:900,margin:'80px auto'}}><div className="learner-kicker">{kind.toUpperCase()}</div><h1>{kind==='community'?'Sahan Community':kind==='creator'?'Creator profile':'Course Details'}</h1><p>{v?`/${kind}/${v}`:`The ${kind} section is connected and ready.`}</p></div></div>}
function AdminRoute({session}){const [checking,setChecking]=useState(true),[ok,setOk]=useState(false);useEffect(()=>{let live=true;if(!session){setChecking(false);return}supabase.from('admins').select('id').eq('auth_user_id',session.user.id).eq('status','active').maybeSingle().then(({data})=>{if(live){setOk(!!data);setChecking(false)}});return()=>{live=false}},[session]);if(checking)return <Loading/>;if(!session)return <Navigate to="/login" replace/>;if(!ok)return <Navigate to="/app" replace/>;return <AdminDashboard session={session}/>}
function AppRoutes({session,loading}){const navigate=useNavigate();if(loading)return <Loading/>;const signOut=async()=>{await supabase.auth.signOut();navigate('/')};return <Routes>
<Route path="/" element={<SahanExperience onNavigateTeach={()=>navigate('/teach')} onNavigateApp={()=>navigate(session?'/app':'/login')}/>}/>
<Route path="/app/*" element={session?<SahanApp onNavigateTeach={()=>navigate('/teach')} onNavigateHome={()=>navigate('/')}/>:<Navigate to="/login" replace/>}/>
<Route path="/experience" element={<Navigate to="/" replace/>}/>
<Route path="/teach/*" element={session?<TeachApp onNavigateHome={()=>navigate('/')}/>:<Navigate to="/login" replace/>}/>
<Route path="/instructor/*" element={session?<TeachApp onNavigateHome={()=>navigate('/')}/>:<Navigate to="/login" replace/>}/>
<Route path="/admin/*" element={<AdminRoute session={session}/>}/>
<Route path="/payments" element={<LearnerDashboardPayments session={session} onSignOut={signOut} onNavigateTeach={()=>navigate('/teach')}/>}/>
<Route path="/login" element={<AuthPage mode="login"/>}/><Route path="/signup" element={<AuthPage mode="signup"/>}/><Route path="/forgot-password" element={<AuthPage mode="forgot"/>}/><Route path="/reset-password" element={<AuthPage mode="reset"/>}/><Route path="/auth/callback" element={<AuthPage mode="login"/>}/>
<Route path="/courses/:slug" element={<ResourceRoute kind="course"/>}/><Route path="/creator/:username" element={<ResourceRoute kind="creator"/>}/><Route path="/community/:slug" element={<ResourceRoute kind="community"/>}/><Route path="/community" element={<ResourceRoute kind="community"/>}/>
<Route path="/payment/success" element={<LearnerDashboardPayments session={session} onSignOut={signOut} onNavigateTeach={()=>navigate('/teach')}/>}/><Route path="/payment/failed" element={<LearnerDashboardPayments session={session} onSignOut={signOut} onNavigateTeach={()=>navigate('/teach')}/>}/><Route path="*" element={<NotFound/>}/>
</Routes>}
function Root(){const [session,setSession]=useState(null),[loading,setLoading]=useState(true);useEffect(()=>{let mounted=true;supabase.auth.getSession().then(({data})=>{if(mounted){setSession(data.session??null);setLoading(false)}});const {data:listener}=supabase.auth.onAuthStateChange((_e,next)=>{if(mounted)setSession(next??null)});return()=>{mounted=false;listener.subscription.unsubscribe()}},[]);return <LanguageProvider><BrowserRouter><AppRoutes session={session} loading={loading}/></BrowserRouter></LanguageProvider>}
ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><Root/></React.StrictMode>)