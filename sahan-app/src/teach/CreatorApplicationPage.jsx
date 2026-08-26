import React,{useState}from'react';
import{supabase}from'../lib/supabase.js';
import LanguageSwitcher from'../components/LanguageSwitcher.jsx';
import'../styles/teach.css';

export default function CreatorApplicationPage({session,onBack,onNavigateSignup}){
 const[form,setForm]=useState({name:'',email:'',teaching_topic:'',bio:''});
 const[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
 const submit=async(e)=>{
  e.preventDefault();setBusy(true);setError('');setMessage('');
  if(!session){setError('Please log in to your Sahan learner account first, then return here to apply.');setBusy(false);return;}
  const accountEmail=(session.user.email||'').trim().toLowerCase();const email=form.email.trim().toLowerCase();
  if(!accountEmail||email!==accountEmail){setError(`Use the same email as your logged-in Sahan account (${accountEmail||'your account email'}).`);setBusy(false);return;}
  const{error:insertError}=await supabase.from('sahan_creator_applications').insert({user_id:session.user.id,full_name:form.name.trim(),email,teaching_topic:form.teaching_topic.trim(),expertise:form.teaching_topic.trim(),experience:form.bio.trim(),bio:form.bio.trim(),name:form.name.trim()}).select().single();
  if(insertError){
   console.error('creator application submission failed',insertError);
   if(insertError.code==='23505')setError('You already have a creator application for this Sahan account. It is already pending or has already been reviewed.');
   else setError(insertError.message||'Unable to submit your application.');
  }else setMessage('Application submitted successfully. Your application is now pending admin review.');
  setBusy(false);
 };
 const update=(key)=>(e)=>setForm(f=>({...f,[key]:e.target.value}));
 return <div className="auth"><div className="auth-card">
  <div className="logo"><span>S</span><div><b>Sahan</b><small>Creator application</small></div></div>
  <div style={{display:'flex',justifyContent:'center',marginBottom:14}}><LanguageSwitcher variant="pill"/></div>
  <div className="eyebrow">BECOME A CREATOR</div><h1>Teach on Sahan.</h1>
  <p className="muted">You must be logged in to your Sahan learner account. An admin reviews every application before courses can be published.</p>
  {!session&&<div className="alert">Please log in first. Your application must be connected to your authenticated Sahan account.</div>}
  {message?<div className="success">{message}</div>:<form onSubmit={submit}>
   <label>Full name<input required value={form.name} onChange={update('name')} /></label>
   <label>Email used for your Sahan account<input required type="email" value={form.email} onChange={update('email')} /></label>
   <label>What will you teach?<input required value={form.teaching_topic} onChange={update('teaching_topic')} placeholder="For example: Excel, design, English" /></label>
   <label>Tell us about your experience<textarea value={form.bio} onChange={update('bio')} rows="4" /></label>
   {error&&<div className="alert">{error}</div>}
   <button className="primary wide" disabled={busy||!session}>{busy?'Submitting…':'Submit application'}</button>
  </form>}
  <div className="or"><span/>or<span/></div>
  <button className="secondary wide" onClick={onNavigateSignup}>Create a learner account first</button>
  <button className="header-link" style={{marginTop:16}} onClick={onBack}>Back</button>
 </div></div>;
}
