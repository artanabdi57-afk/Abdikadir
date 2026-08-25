import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import './learner.css'

const nav = ['home', 'discover', 'learning']
const labels = { home: 'Home', discover: 'Explore', learning: 'My learning' }

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
  const [collapsed, setCollapsed] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const user = session?.user
  const displayName = profile?.display_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Learner'
  const initials = displayName.trim().split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase()
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || ''

  const load = async () => {
    if (!user) return
    setError('')
    const [profileRes, courseRes, enrollmentRes] = await Promise.all([
      supabase.from('sahan_profiles').select('id,display_name,username,avatar_url,bio,role').eq('id', user.id).maybeSingle(),
      supabase.rpc('get_sahan_marketplace_courses'),
      supabase.from('sahan_enrollments').select('id,course_id,status,progress,enrolled_at,completed_at').eq('user_id', user.id).order('enrolled_at', { ascending: false }),
    ])
    if (profileRes.error) setError(profileRes.error.message); else setProfile(profileRes.data)
    if (courseRes.error) setError(courseRes.error.message); else setCourses(courseRes.data || [])
    if (enrollmentRes.error) setError(enrollmentRes.error.message); else setEnrollments(enrollmentRes.data || [])
  }

  useEffect(() => { load() }, [user?.id])

  const enrolledIds = useMemo(() => new Set(enrollments.map(e => e.course_id)), [enrollments])
  const learning = useMemo(() => courses.filter(c => enrolledIds.has(c.id)), [courses, enrolledIds])
  const filtered = useMemo(() => courses.filter(c => `${c.title} ${c.category} ${c.level}`.toLowerCase().includes(query.toLowerCase())), [courses, query])

  const openCourse = async (course) => {
    setSelectedCourse(course); setCourseData(null); setError('')
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
    setProgress(progressRows || []); setCourseData({ sections: sections || [], lessons })
  }

  const enroll = async (course) => {
    if (!user) return
    if (enrolledIds.has(course.id)) { await openCourse(course); return }
    if (!course.is_free) { setMessage('Paid checkout is not enabled yet.'); await openCourse(course); return }
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
    if (updateError) setError(updateError.message); else { setProfile(data); setMessage('Profile updated.'); setAccountOpen(false) }
  }

  const go = id => { setPage(id); setAccountOpen(false); setNotificationsOpen(false) }

  return <div className={`learner-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
    <aside className="learner-sidebar">
      <button className="learner-brand" onClick={() => go('home')}><span>S</span><b>Sahan</b></button>
      <div className="learner-label">LEARNING</div>
      {nav.map(id => <button key={id} className={`learner-nav ${page === id ? 'active' : ''}`} onClick={() => go(id)}><NavIcon id={id}/><b>{labels[id]}</b></button>)}
      <div className="learner-spacer" />
      <div className="learner-sidebar-footer"><button className="learner-collapse" onClick={() => setCollapsed(v => !v)}>{collapsed ? '→' : '←'} <b>{collapsed ? 'Open' : 'Collapse'}</b></button></div>
    </aside>

    <main className="learner-main">
      <header className="learner-topbar">
        <div className="learner-mobile-brand"><span>S</span><b>Sahan</b></div>
        <div className="learner-search"><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search courses, skills, lessons…" /></div>
        <div className="learner-top-actions">
          <button className={`learner-icon-button ${notificationsOpen ? 'selected' : ''}`} onClick={() => { setNotificationsOpen(v => !v); setAccountOpen(false) }} aria-label="Notifications"><span className="notification-dot" />♧</button>
          <button className="learner-account-button" onClick={() => { setAccountOpen(v => !v); setNotificationsOpen(false) }}><Avatar url={avatarUrl} initials={initials}/><span className="learner-account-copy"><b>{displayName}</b><small>{user?.email}</small></span><i>⌄</i></button>
          {notificationsOpen && <div className="learner-popover notification-popover"><b>Notifications</b><p>No new notifications.</p><small>Course updates and learning reminders will appear here.</small></div>}
          {accountOpen && <div className="learner-popover account-popover"><div className="popover-user"><Avatar url={avatarUrl} initials={initials}/><div><b>{displayName}</b><small>{user?.email}</small></div></div><button onClick={() => go('settings')}>Profile & settings</button><button onClick={() => go('learning')}>My learning</button><button className="danger" onClick={onSignOut}>Sign out</button></div>}
        </div>
      </header>

      {message && <div className="learner-message">{message}</div>}
      {error && <div className="learner-error">{error}</div>}
      {page === 'home' && <Home displayName={displayName} learning={learning} onDiscover={() => go('discover')} onLearning={() => go('learning')} onOpen={openCourse} />}
      {page === 'discover' && <Discover courses={filtered} enrolledIds={enrolledIds} busy={busy} onOpen={openCourse} onEnroll={enroll} />}
      {page === 'learning' && <Learning courses={learning} onDiscover={() => go('discover')} onOpen={openCourse} />}
      {page === 'settings' && <Settings profile={profile} email={user?.email} avatarUrl={avatarUrl} onSave={saveProfile} />}
    </main>
    {selectedCourse && <CoursePanel course={selectedCourse} data={courseData} enrolled={enrolledIds.has(selectedCourse.id)} progress={progress} busy={busy} onClose={() => { setSelectedCourse(null); setCourseData(null) }} onEnroll={() => enroll(selectedCourse)} onMark={markLesson} />}
  </div>
}

function Avatar({ url, initials }) { return url ? <img className="learner-avatar" src={url} alt="Profile" /> : <span className="learner-avatar learner-avatar-fallback">{initials || 'L'}</span> }
function NavIcon({ id }) { return <span className={`nav-icon nav-${id}`} aria-hidden="true">{id === 'home' ? '⌂' : id === 'discover' ? '✦' : '▣'}</span> }

function Home({ displayName, learning, onDiscover, onLearning, onOpen }) {
  return <div className="learner-content">
    <section className="learner-welcome">
      <div className="welcome-copy"><div className="learner-kicker">YOUR LEARNING SPACE</div><h1>Good to see you, {displayName.split(' ')[0]} <span>👋</span></h1><p>Keep building the skills that move you forward.</p><div className="learner-actions"><button onClick={onDiscover}>Explore courses <span>→</span></button><button className="secondary" onClick={onLearning}>My learning</button></div></div>
      <div className="learner-promo"><div className="promo-orb" /><span className="promo-tag">FEATURED THIS WEEK</span><h3>Turn your next skill into an opportunity.</h3><p>Explore practical courses from Sahan creators.</p><button onClick={onDiscover}>Discover learning →</button></div>
    </section>
    <section><div className="learner-section-head"><div><div className="learner-kicker">YOUR COURSES</div><h2>Continue learning</h2><p>Pick up exactly where you left off.</p></div>{learning.length > 3 && <button className="text-button" onClick={onLearning}>View all →</button>}</div>{learning.length ? <div className="learner-grid">{learning.slice(0, 3).map(c => <CourseCard key={c.id} course={c} enrolled onOpen={() => onOpen(c)} />)}</div> : <Empty text="Your learning library is waiting." sub="Choose your first course and start building a new skill." action={onDiscover} />}</section>
  </div>
}

function Discover({ courses, enrolledIds, busy, onOpen, onEnroll }) { return <div className="learner-content"><div className="learner-page-title"><div className="learner-kicker">EXPLORE</div><h1>Find your next skill.</h1><p>Discover published courses from Sahan creators.</p></div>{courses.length ? <div className="learner-grid">{courses.map(c => <CourseCard key={c.id} course={c} enrolled={enrolledIds.has(c.id)} busy={busy} onOpen={() => onOpen(c)} onEnroll={() => onEnroll(c)} />)}</div> : <Empty text="No published courses yet." sub="New courses will appear here when creators publish them." />}</div> }
function Learning({ courses, onDiscover, onOpen }) { return <div className="learner-content"><div className="learner-page-title"><div className="learner-kicker">MY LEARNING</div><h1>Your learning library.</h1><p>Track the courses you are actively working through.</p></div>{courses.length ? <div className="learner-grid">{courses.map(c => <CourseCard key={c.id} course={c} enrolled onOpen={() => onOpen(c)} />)}</div> : <Empty text="No courses in your library yet." sub="Explore the marketplace and choose something you want to learn." action={onDiscover} />}</div> }

function CourseCard({ course, enrolled, busy, onOpen, onEnroll }) { const price = course.is_free ? 'Free' : `${course.currency || 'USD'} ${Number(course.price || 0).toFixed(2)}`; return <article className="learner-course"><button className="learner-course-main" onClick={onOpen}><div className="learner-cover">{course.cover_url ? <img src={course.cover_url} alt="" /> : null}<span>{course.category || 'Learning'}</span><b>{course.title?.[0] || 'S'}</b></div><small>{course.level || 'All levels'} · {course.lesson_count || 0} lessons · {course.student_count || 0} learners</small><h3>{course.title}</h3><p>{course.description || 'Build useful skills with Sahan.'}</p><div className="learner-course-meta"><span>{course.rating ? `★ ${course.rating}` : 'New course'}</span><strong>{price}</strong></div></button>{enrolled ? <div className="learner-enrolled">✓ Enrolled · {Math.round(Number(course.progress || 0))}% complete</div> : <button className="learner-enroll" onClick={onEnroll} disabled={busy}>{busy ? 'Enrolling…' : course.is_free ? 'Enroll free →' : 'View course →'}</button>}</article> }

function CoursePanel({ course, data, enrolled, progress, busy, onClose, onEnroll, onMark }) { const completed = new Set(progress.filter(p => p.completed).map(p => p.lesson_id)); const total = data?.lessons?.length || course.lesson_count || 0; const done = data?.lessons?.filter(l => completed.has(l.id)).length || 0; const pct = total ? Math.round(done / total * 100) : Number(course.progress || 0); return <div className="learner-modal-backdrop" onClick={onClose}><section className="learner-modal" onClick={e => e.stopPropagation()}><button className="learner-modal-close" onClick={onClose}>×</button><div className="learner-kicker">COURSE</div><h2>{course.title}</h2><p>{course.description || 'Learn practical skills with Sahan.'}</p><div className="learner-course-stats"><span>{course.category || 'Learning'}</span><span>{course.level}</span><span>{course.rating ? `★ ${course.rating}` : 'New'}</span><span>{course.student_count || 0} learners</span></div>{enrolled ? <><div className="learner-progress"><div><b>{pct}% complete</b><span>{done} of {total} lessons</span></div><i><em style={{ width: `${pct}%` }} /></i></div>{data ? <div className="learner-sections">{data.sections.map(section => <div className="learner-section" key={section.id}><h3>{section.title}</h3>{data.lessons.filter(l => l.section_id === section.id).map(lesson => <label className="learner-lesson" key={lesson.id}><input type="checkbox" checked={completed.has(lesson.id)} onChange={e => onMark(lesson.id, e.target.checked)} /><span><b>{lesson.title}</b><small>{lesson.lesson_type} · {lesson.duration_minutes || 0} min</small></span></label>)}</div>)}</div> : <div className="learner-loading">Loading lessons…</div>}</> : <div className="learner-enroll-panel"><strong>{course.is_free ? 'Free course' : `${course.currency || 'USD'} ${Number(course.price || 0).toFixed(2)}`}</strong><p>{course.is_free ? 'Enroll now and start learning immediately.' : 'Checkout will be enabled before paid enrollment is available.'}</p><button className="learner-enroll" onClick={onEnroll} disabled={busy}>{busy ? 'Working…' : course.is_free ? 'Enroll free →' : 'View course'}</button></div>}</section></div> }

function Settings({ profile, email, avatarUrl, onSave }) { const [name, setName] = useState(profile?.display_name || ''); useEffect(() => setName(profile?.display_name || ''), [profile?.display_name]); return <div className="learner-content"><div className="learner-page-title"><div className="learner-kicker">PROFILE & SETTINGS</div><h1>Your profile.</h1><p>Manage your learner identity and account information.</p></div><section className="learner-settings"><div className="settings-avatar"><Avatar url={avatarUrl} initials={name.split(/\s+/).map(x => x[0]).join('').slice(0,2).toUpperCase()} /><div><b>{name || 'Learner'}</b><small>{email}</small></div></div><label>Full name<input value={name} onChange={e => setName(e.target.value)} /></label><label>Email<input value={email || ''} disabled /></label><button onClick={() => onSave(name)} disabled={!name.trim()}>Save profile</button></section></div> }
function Empty({ text, sub, action }) { return <div className="learner-empty"><div className="empty-icon">✦</div><h3>{text}</h3><p>{sub}</p>{action && <button onClick={action}>Explore courses →</button>}</div> }
