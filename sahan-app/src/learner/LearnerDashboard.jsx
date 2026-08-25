import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import './learner.css'

const nav = ['home', 'discover', 'learning', 'settings']
const labels = { home: 'Home', discover: 'Discover', learning: 'My learning', settings: 'Settings' }

export default function LearnerDashboard({ session, onSignOut, onNavigateTeach }) {
  const [page, setPage] = useState('home')
  const [profile, setProfile] = useState(null)
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [query, setQuery] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const user = session?.user
  const displayName = profile?.name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Learner'
  const initials = displayName.trim().split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase()

  const load = async () => {
    if (!user) return
    setError('')
    const [profileRes, courseRes, enrollmentRes] = await Promise.all([
      supabase.from('sahan_profiles').select('id,name,avatar_url,locale').eq('id', user.id).maybeSingle(),
      supabase.from('sahan_courses').select('id,title,description,category,level,price,currency,is_free,legacy_id').eq('status', 'published').eq('admin_approved', true).order('created_at', { ascending: false }),
      supabase.from('sahan_enrollments').select('id,course_id,status,progress,enrolled_at,completed_at').eq('user_id', user.id).order('enrolled_at', { ascending: false }),
    ])
    if (profileRes.error) setError(profileRes.error.message)
    else setProfile(profileRes.data)
    if (courseRes.error) setError(courseRes.error.message)
    else setCourses(courseRes.data || [])
    if (enrollmentRes.error) setError(enrollmentRes.error.message)
    else setEnrollments(enrollmentRes.data || [])
  }

  useEffect(() => { load() }, [user?.id])

  const enrolledIds = useMemo(() => new Set(enrollments.map(e => e.course_id)), [enrollments])
  const filtered = useMemo(() => courses.filter(c => `${c.title} ${c.category} ${c.level}`.toLowerCase().includes(query.toLowerCase())), [courses, query])
  const learning = useMemo(() => courses.filter(c => enrolledIds.has(c.id)), [courses, enrolledIds])

  const enroll = async (course) => {
    if (!user) return
    if (enrolledIds.has(course.id)) { setPage('learning'); return }
    if (!course.is_free) {
      setMessage('This course is paid. Checkout will be connected before paid enrollment is enabled.')
      return
    }
    setBusyId(course.id)
    setMessage('')
    setError('')
    const { error: insertError } = await supabase.from('sahan_enrollments').insert({ user_id: user.id, course_id: course.id, status: 'active', progress: 0 })
    if (insertError && !/duplicate key/i.test(insertError.message)) setError(insertError.message)
    else { setMessage(`You are enrolled in ${course.title}.`); await load(); setPage('learning') }
    setBusyId(null)
  }

  const saveProfile = async (name) => {
    setError('')
    const { data, error: updateError } = await supabase.from('sahan_profiles').upsert({ id: user.id, name: name.trim() }, { onConflict: 'id' }).select('id,name,avatar_url,locale').single()
    if (updateError) setError(updateError.message)
    else { setProfile(data); setMessage('Profile updated.') }
  }

  return <div className="learner-shell">
    <aside className="learner-sidebar">
      <button className="learner-brand" onClick={() => setPage('home')}><span>S</span><b>Sahan</b></button>
      <div className="learner-label">LEARNER</div>
      {nav.map(id => <button key={id} className={`learner-nav ${page === id ? 'active' : ''}`} onClick={() => setPage(id)}>{labels[id]}</button>)}
      <div className="learner-spacer" />
      <button className="learner-teach" onClick={onNavigateTeach}>Teach on Sahan →</button>
      <button className="learner-profile" onClick={() => setPage('settings')}><span>{initials || 'L'}</span><div><b>{displayName}</b><small>{user?.email}</small></div></button>
      <button className="learner-signout" onClick={onSignOut}>Sign out</button>
    </aside>
    <main className="learner-main">
      <header className="learner-topbar"><div className="learner-search"><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search courses…" /></div><div className="learner-account"><span>{initials || 'L'}</span>{displayName}</div></header>
      {message && <div className="learner-message">{message}</div>}
      {error && <div className="learner-error">{error}</div>}
      {page === 'home' && <Home displayName={displayName} learning={learning} onDiscover={() => setPage('discover')} onLearning={() => setPage('learning')} />}
      {page === 'discover' && <Discover courses={filtered} enrolledIds={enrolledIds} busyId={busyId} onEnroll={enroll} />}
      {page === 'learning' && <Learning courses={learning} onDiscover={() => setPage('discover')} />}
      {page === 'settings' && <Settings profile={profile} email={user?.email} onSave={saveProfile} />}
    </main>
  </div>
}

function Home({ displayName, learning, onDiscover, onLearning }) {
  return <div className="learner-content"><section className="learner-welcome"><div><div className="learner-kicker">YOUR LEARNING SPACE</div><h1>Welcome, {displayName}.</h1><p>Your Sahan account is connected. Your profile and learning activity now follow your real account.</p><div className="learner-actions"><button onClick={onDiscover}>Explore courses →</button><button className="secondary" onClick={onLearning}>My learning</button></div></div><div className="learner-identity"><span>{displayName.split(/\s+/).map(x => x[0]).join('').slice(0, 2).toUpperCase()}</span><b>Verified learner account</b><small>Your session is protected by Supabase Auth.</small></div></section><section><div className="learner-section-head"><div><h2>Continue learning</h2><p>Courses attached to your account.</p></div></div>{learning.length ? <div className="learner-grid">{learning.slice(0, 3).map(c => <CourseCard key={c.id} course={c} enrolled />)}</div> : <Empty text="You have no enrollments yet. Start with a course you like." action={onDiscover} />}</section></div>
}

function Discover({ courses, enrolledIds, busyId, onEnroll }) {
  return <div className="learner-content"><div className="learner-page-title"><div className="learner-kicker">DISCOVER</div><h1>Find something worth learning.</h1><p>Only published, approved courses are shown here.</p></div>{courses.length ? <div className="learner-grid">{courses.map(c => <CourseCard key={c.id} course={c} enrolled={enrolledIds.has(c.id)} busy={busyId === c.id} onEnroll={() => onEnroll(c)} />)}</div> : <Empty text="No published courses are available yet." />}</div>
}

function Learning({ courses, onDiscover }) {
  return <div className="learner-content"><div className="learner-page-title"><div className="learner-kicker">MY LEARNING</div><h1>Your courses.</h1><p>Enrollment status comes directly from your Supabase account.</p></div>{courses.length ? <div className="learner-grid">{courses.map(c => <CourseCard key={c.id} course={c} enrolled />)}</div> : <Empty text="You have not enrolled in a course yet." action={onDiscover} />}</div>
}

function CourseCard({ course, enrolled, busy, onEnroll }) {
  return <article className="learner-course"><div className="learner-cover"><span>{course.category || 'Learning'}</span><b>{course.title?.[0] || 'S'}</b></div><small>{course.level} · {course.is_free ? 'Free' : `${course.currency || 'USD'} ${course.price}`}</small><h3>{course.title}</h3><p>{course.description || 'Build useful skills with Sahan.'}</p>{enrolled ? <div className="learner-enrolled">✓ Enrolled</div> : <button className="learner-enroll" onClick={onEnroll} disabled={busy}>{busy ? 'Enrolling…' : course.is_free ? 'Enroll free →' : 'View course →'}</button>}</article>
}

function Settings({ profile, email, onSave }) {
  const [name, setName] = useState(profile?.name || '')
  useEffect(() => setName(profile?.name || ''), [profile?.name])
  return <div className="learner-content"><div className="learner-page-title"><div className="learner-kicker">SETTINGS</div><h1>Your account.</h1><p>Update your learner profile. Authentication is managed by Supabase Auth.</p></div><section className="learner-settings"><label>Full name<input value={name} onChange={e => setName(e.target.value)} /></label><label>Email<input value={email || ''} disabled /></label><button onClick={() => onSave(name)} disabled={!name.trim()}>Save profile</button></section></div>
}

function Empty({ text, action }) { return <div className="learner-empty"><h3>{text}</h3>{action && <button onClick={action}>Explore courses →</button>}</div> }
