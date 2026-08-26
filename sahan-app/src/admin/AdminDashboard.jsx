import React,{useEffect,useState}from'react'
import {supabase}from'../lib/supabase.js'

const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(n||0))

export default function AdminDashboard({session}){
 const [loading,setLoading]=useState(true),[data,setData]=useState(null),[error,setError]=useState('')
 const load=async()=>{setLoading(true);setError('');try{
  const [profiles,courses,enrollments,orders,instructors,apps]=await Promise.all([
   supabase.from('sahan_profiles').select('id,display_name,username,role'),
   supabase.from('sahan_courses').select('id,title,category,instructor_id,creator_id,price,status'),
   supabase.from('sahan_enrollments').select('id,user_id,course_id,status,progress,enrolled_at'),
   supabase.from('sahan_orders').select('id,buyer_id,course_id,creator_id,amount,total,status,paid_at,created_at'),
   supabase.from('instructors').select('id,auth_user_id,name,email,status'),
   supabase.from('sahan_creator_applications').select('*').order('created_at',{ascending:false})
  ])
  const bad=[profiles,courses,enrollments,orders,instructors,apps].find(x=>x.error);if(bad)throw bad.error
  const paid=orders.data.filter(o=>['paid','completed','succeeded'].includes((o.status||'').toLowerCase()))
  const unpaid=orders.data.filter(o=>!['paid','completed','succeeded','refunded'].includes((o.status||'').toLowerCase()))
  const categoryCount={};(enrollments.data||[]).forEach(e=>{const c=(courses.data||[]).find(x=>x.id===e.course_id);if(c){categoryCount[c.category||'Uncategorized']=(categoryCount[c.category||'Uncategorized']||0)+1}})
  const teacherStats=(instructors.data||[]).map(t=>{const cs=(courses.data||[]).filter(c=>c.instructor_id===t.id||c.creator_id===t.auth_user_id);const ids=new Set(cs.map(c=>c.id));const students=new Set((enrollments.data||[]).filter(e=>ids.has(e.course_id)).map(e=>e.user_id));const sales=(paid||[]).filter(o=>ids.has(o.course_id));const pending=(unpaid||[]).filter(o=>ids.has(o.course_id));return {...t,courses:cs.length,learners:students.size,paid:sales.reduce((s,o)=>s+Number(o.total??o.amount??0),0),unpaid:pending.reduce((s,o)=>s+Number(o.total??o.amount??0),0)}})
  setData({profiles:profiles.data||[],courses:courses.data||[],enrollments:enrollments.data||[],orders:orders.data||[],instructors:teacherStats,apps:apps.data||[],categoryCount,paid:paid.reduce((s,o)=>s+Number(o.total??o.amount??0),0),unpaid:unpaid.reduce((s,o)=>s+Number(o.total??o.amount??0),0)})
 }catch(e){setError(e.message||'Unable to load admin data')}finally{setLoading(false)}}
 useEffect(()=>{load()},[])
 const approve=async app=>{const {error}=await supabase.from('sahan_creator_applications').update({status:'approved',reviewed_by:session.user.id,reviewed_at:new Date().toISOString()}).eq('id',app.id);if(error)return setError(error.message);await load()}
 if(loading)return <div style={{padding:32}}>Loading live Sahan admin data…</div>
 if(error)return <div style={{padding:32}}><h2>Admin dashboard error</h2><p>{error}</p><button onClick={load}>Try again</button></div>
 const learners=data.profiles.filter(p=>p.role!=='admin').length
 return <main style={{maxWidth:1400,margin:'0 auto',padding:28,fontFamily:'Inter,system-ui'}}><header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:16,marginBottom:28}}><div><div style={{fontSize:13,fontWeight:800,textTransform:'uppercase',letterSpacing:1}}>Sahan Control Center</div><h1 style={{margin:'6px 0'}}>Admin Dashboard</h1><p style={{margin:0,color:'#666'}}>Real platform data — no placeholder metrics.</p></div><button onClick={load}>Refresh</button></header>
 <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:16}}>{[['Students',learners],['Teachers',data.instructors.length],['Courses',data.courses.length],['Enrollments',data.enrollments.length],['Paid',money(data.paid)],['Not paid',money(data.unpaid)],['Teacher requests',data.apps.filter(a=>a.status==='pending').length]].map(([k,v])=><article key={k} style={{border:'1px solid #ddd',borderRadius:14,padding:18}}><div style={{color:'#666'}}>{k}</div><strong style={{fontSize:28}}>{v}</strong></article>)}</section>
 <section style={{marginTop:32}}><h2>Students by subject</h2><div style={{display:'flex',gap:12,flexWrap:'wrap'}}>{Object.entries(data.categoryCount).length?Object.entries(data.categoryCount).map(([k,v])=><div key={k} style={{border:'1px solid #ddd',borderRadius:10,padding:'12px 16px'}}><b>{k}</b><div>{v} enrollments</div></div>):<p>No real enrollments yet.</p>}</div></section>
 <section style={{marginTop:32}}><h2>Teachers and their learners</h2><div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr>{['Teacher','Status','Courses','Learners watching','Paid','Not paid'].map(x=><th key={x} style={{textAlign:'left',padding:10,borderBottom:'1px solid #ddd'}}>{x}</th>)}</tr></thead><tbody>{data.instructors.map(t=><tr key={t.id}>{[t.name,t.status,t.courses,t.learners,money(t.paid),money(t.unpaid)].map((x,i)=><td key={i} style={{padding:10,borderBottom:'1px solid #eee'}}>{x}</td>)}</tr>)}</tbody></table></div></section>
 <section style={{marginTop:32}}><h2>Teacher approval requests</h2>{data.apps.length===0?<p>No teacher requests yet.</p>:data.apps.map(a=><article key={a.id} style={{border:'1px solid #ddd',borderRadius:12,padding:16,marginBottom:10}}><b>{a.full_name}</b><div>{a.email} · {a.expertise}</div><p>{a.experience}</p><small>Status: {a.status}</small>{a.status==='pending'&&<div><button style={{marginTop:10}} onClick={()=>approve(a)}>Approve teacher</button></div>}</article>)}</section>
 </main>
}
