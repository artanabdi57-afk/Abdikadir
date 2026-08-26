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
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [courseData, setCourseData] = useState(null)
  const [progress, setProgress] = useState([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const user = session?.user
  const displayName = profile?.display_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Learner'
  const initials = displayName.trim().split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase()

  const load = async () => {
    if (!user) return
    setError('')
    const [profileRes, courseRes, enrollmentRes] = await Promise.all([
      supabase.from('sahan_profiles').select('id,display_name,username,avatar_url,bio,role').eq('id', user.id).maybeSingle(),
      supabase.rpc('get_sahan_marketplace_courses'),
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
  const learning = useMemo(() => courses.filter(c => enrolledIds.has(c.id)), [courses, enrolledIds])
  const filtered = useMemo(() => courses.filter(c => `${c.title} ${c.category} ${c.level}`.toLowerCase().includes(query.toLowerCase())), [courses, query])

  const openCourse = async (course) => {
    setSelectedCourse(course)
    setCourseData(null)
    setError('')
    const { data: sections, error: sectionError } = await supabase.from('sahan_sections').select('id,title,sort_order').eq('course_id', course.id).order('sort_order', { ascending: true })
    if (sectionError) { setError(sectionError.message); return }
    const sectionIds = (sections || []).map(s => s.id)
    let lessons = []
    if (sectionIds.length) {
      const { data, error: lessonError } = await supabase.from('sahan_lessons').select('id,section_id,title,lesson_type,content,video_url,duration_minutes,sort_order,is_preview').in('section_id', sectionIds).order('sort_order', { ascending: true })
      if (lessonError) { setError(lessonError.message); return }
      lessons = data || []
    }
    const { data: progressRows, error: progressError } = await supabase.from('sahan_lesson_progress').select('lesson_id,completed,last_position_seconds').eq('user_id', user.id)
    if (progressError) { setError(progressError.message); return }
    setProgress(progressRows || [])
    setCourseData({ sections: sections || [], lessons })
  }

  const enroll = async (course) => {
    if (!user) return
    if (enrolledIds.has(course.id)) { await openCourse(course); return }
    if (!course.is_free) { setMessage('This course is paid. Payment checkout will be connected before paid enrollment is enabled.'); await openCourse(course); return }
    setBusy(true); setError(''); setMessage('')
    const { error: insertError } = await supabase.from('sahan_enrollments').insert({ user_id: user.id, course_id: course.id, status: 'active', progress: 0 })
    if (insertError && !/duplicate key/i.test(insertError.message)) setError(insertError.message)
    else { setMessage(`You are enrolled in ${course.title}.`); await load(); await openCourse(course); setPage('learning') }
    setBusy(false)
  }

  const markLesson = async (lessonId, completed) => {
    setError('')
    const { error: upsertError } = await supabase.from('sahan_lesson_progress').upsert({ user_id: user.id, lesson_id: lessonId, completed, updated_at: new Date().toISOString() }, { onConflict: 'user_id,lesson_id' })
    if (upsertError) { setError(upsertError.message); return }
    const next = progress.map(p => p.lesson_id === lessonId ? { ...p, completed } : p)
    if (!next.some(p => p.lesson_id === lessonId)) next.push({ lesson_id: lessonId, completed })
    setProgress(next)
    if (selectedCourse) {
      const total = courseData?.lessons?.length || 0
      const done = next.filter(p => p.completed && courseData.lessons.some(l => l.id === p.lesson_id)).length
      const pct = total ? Math.round(done / total * 100) : 0
      await supabase.from('sahan_enrollments').update({ progress: pct, status: pct === 100 ? 'completed' : 'active', completed_at: pct === 100 ? new Date().toISOString() : null }).eq('user_id', user.id).eq('course_id', selectedCourse.id)
      setEnrollments(prev => prev.map(e => e.course_id === selectedCourse.id ? { ...e, progress: pct, status: pct === 100 ? 'completed' : 'active' } : e))
    }
  }

  const saveProfile = async (name) => {
    setError('')
    const { data, error: updateError } = await supabase.from('sahan_profiles').upsert({ id: user.id, display_name: name.trim() }, { onConflict: 'id' }).select('id,display_name,username,avatar_url,bio,role').single()
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
      {page === 'home' && <Home displayName={displayName} learning={learning} onDiscover={() => setPage('discover')} onLearning={() => setPage('learning')} onOpen={openCourse} />}
      {page === 'discover' && <Discover courses={filtered} enrolledIds={enrolledIds} busy={busy} onOpen={openCourse} onEnroll={enroll} />}
      {page === 'learning' && <Learning courses={learning} onDiscover={() => setPage('discover')} onOpen={openCourse} />}
      {page === 'settings' && <Settings profile={profile} email={user?.email} onSave={saveProfile} />}
    </main>
    {selectedCourse && <CoursePanel course={selectedCourse} data={courseData} enrolled={enrolledIds.has(selectedCourse.id)} progress={progress} busy={busy} onClose={() => { setSelectedCourse(null); setCourseData(null) }} onEnroll={() => enroll(selectedCourse)} onMark={markLesson} />}
  </div>
}

function Home({ displayName, learning, onDiscover, onLearning, onOpen }) {
  return <div className="learner-content"><section className="learner-welcome"><div><div className="learner-kicker">YOUR LEARNING SPACE</div><h1>Welcome, {displayName}.</h1><p>Your marketplace, enrollments and lesson progress are connected to your real Sahan account.</p><div className="learner-actions"><button onClick={onDiscover}>Explore courses →</button><button className="secondary" onClick={onLearning}>My learning</button></div></div><div className="learner-identity"><span>{displayName.split(/\s+/).map(x => x[0]).join('').slice(0, 2).toUpperCase()}</span><b>Verified learner account</b><small>Real courses and activity are loaded from Supabase.</small></div></section><section><div className="learner-section-head"><div><h2>Continue learning</h2><p>Courses attached to your account.</p></div></div>{learning.length ? <div className="learner-grid">{learning.slice(0, 3).map(c => <CourseCard key={c.id} course={c} enrolled onOpen={() => onOpen(c)} />)}</div> : <Empty text="You have no enrollments yet. Start with a course you like." action={onDiscover} />}</section></div>
}

function Discover({ courses, enrolledIds, busy, onOpen, onEnroll }) {
  return <div className="learner-content"><div className="learner-page-title"><div className="learner-kicker">DISCOVER</div><h1>Find something worth learning.</h1><p>Only published and admin-approved courses are shown. Titles, prices, learners and ratings come from Supabase.</p></div>{courses.length ? <div className="learner-grid">{courses.map(c => <CourseCard key={c.id} course={c} enrolled={enrolledIds.has(c.id)} busy={busy} onOpen={() => onOpen(c)} onEnroll={() => onEnroll(c)} />)}</div> : <Empty text="No published courses are available yet." />}</div>
}

function Learning({ courses, onDiscover, onOpen }) {
  return <div className="learner-content"><div className="learner-page-title"><div className="learner-kicker">MY LEARNING</div><h1>Your courses.</h1><p>Progress is calculated from lessons you actually complete.</p></div>{courses.length ? <div className="learner-grid">{courses.map(c => <CourseCard key={c.id} course={c} enrolled onOpen={() => onOpen(c)} />)}</div> : <Empty text="You have not enrolled in a course yet." action={onDiscover} />}</div>
}

function CourseCard({ course, enrolled, busy, onOpen, onEnroll }) {
  const price = course.is_free ? 'Free' : `${course.currency || 'USD'} ${Number(course.price || 0).toFixed(2)}`
  return <article className="learner-course"><button className="learner-course-main" onClick={onOpen}><div className="learner-cover">{course.cover_url ? <img src={course.cover_url} alt="" /> : null}<span>{course.category || 'Learning'}</span><b>{course.title?.[0] || 'S'}</b></div><small>{course.level} · {course.lesson_count || 0} lessons · {course.student_count || 0} learners</small><h3>{course.title}</h3><p>{course.description || 'Build useful skills with Sahan.'}</p><div className="learner-course-meta"><span>{course.rating ? `★ ${course.rating}` : 'No ratings yet'}{course.review_count ? ` · ${course.review_count} reviews` : ''}</span><strong>{price}</strong></div></button>{enrolled ? <div className="learner-enrolled">✓ Enrolled · {Math.round(Number(course.progress || 0))}% complete</div> : <button className="learner-enroll" onClick={onEnroll} disabled={busy}>{busy ? 'Enrolling…' : course.is_free ? 'Enroll free →' : 'View course →'}</button>}</article>
}

function CoursePanel({ course, data, enrolled, progress, busy, onClose, onEnroll, onMark }) {
  const completed = new Set(progress.filter(p => p.completed).map(p => p.lesson_id))
  const total = data?.lessons?.length || course.lesson_count || 0
  const done = data?.lessons?.filter(l => completed.has(l.id)).length || 0
  const pct = total ? Math.round(done / total * 100) : Number(course.progress || 0)
  return <div className="learner-modal-backdrop" onClick={onClose}><section className="learner-modal" onClick={e => e.stopPropagation()}><button className="learner-modal-close" onClick={onClose}>×</button><div className="learner-kicker">COURSE</div><h2>{course.title}</h2><p>{course.description || 'Learn practical skills with Sahan.'}</p><div className="learner-course-stats"><span>{course.category || 'Learning'}</span><span>{course.level}</span><span>{course.rating ? `★ ${course.rating}` : 'No ratings yet'}</span><span>{course.student_count || 0} learners</span></div>{enrolled ? <><div className="learner-progress"><div><b>{pct}% complete</b><span>{done} of {total} lessons</span></div><i><em style={{ width: `${pct}%` }} /></i></div>{data ? <div className="learner-sections">{data.sections.map(section => <div className="learner-section" key={section.id}><h3>{section.title}</h3>{data.lessons.filter(l => l.section_id === section.id).map(lesson => <label className="learner-lesson" key={lesson.id}><input type="checkbox" checked={completed.has(lesson.id)} onChange={e => onMark(lesson.id, e.target.checked)} /><span><b>{lesson.title}</b><small>{lesson.lesson_type} · {lesson.duration_minutes || 0} min</small></span></label>)}</div>)}</div> : <div className="learner-loading">Loading lessons…</div>}</> : <div className="learner-enroll-panel"><strong>{course.is_free ? 'Free course' : `${course.currency || 'USD'} ${Number(course.price || 0).toFixed(2)}`}</strong><p>{course.is_free ? 'Enroll now and start learning immediately.' : 'This course requires checkout. Payment integration will be enabled before paid enrollment.'}</p><button className="learner-enroll" onClick={onEnroll} disabled={busy}>{busy ? 'Working…' : course.is_free ? 'Enroll free →' : 'View course'}</button></div>}</section></div>
}

function Settings({ profile, email, onSave }) {
  const [name, setName] = useState(profile?.display_name || '')
  useEffect(() => setName(profile?.display_name || ''), [profile?.display_name])
  return <div className="learner-content"><div className="learner-page-title"><div className="learner-kicker">SETTINGS</div><h1>Your account.</h1><p>Update your learner profile. Authentication is managed by Supabase Auth.</p></div><section className="learner-settings"><label>Full name<input value={name} onChange={e => setName(e.target.value)} /></label><label>Email<input value={email || ''} disabled /></label><button onClick={() => onSave(name)} disabled={!name.trim()}>Save profile</button></section></div>
}

function Empty({ text, action }) { return <div className="learner-empty"><h3>{text}</h3>{action && <button onClick={action}>Explore courses →</button>}</div> }

