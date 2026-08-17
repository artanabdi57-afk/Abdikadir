import React, { useEffect, useMemo, useState } from 'react'

const courses = [
  { id: 1, title: 'Excel & Power BI for Real Work', creator: 'Sahan Academy', category: 'Business', level: 'Beginner', price: 29, students: 1280, progress: 68, lessons: 32, rating: 4.9, premium: false },
  { id: 2, title: 'Modern English Speaking', creator: 'Ayaan Teacher', category: 'Languages', level: 'All levels', price: 19, students: 842, progress: 42, lessons: 24, rating: 4.8 },
  { id: 3, title: 'Build Your First Online Business', creator: 'Hassan Noor', category: 'Business', level: 'Intermediate', price: 49, students: 516, progress: 12, lessons: 41, rating: 4.9 },
  { id: 4, title: 'Graphic Design From Zero', creator: 'Sahan Creative', category: 'Design', level: 'Beginner', price: 0, students: 2304, progress: 0, lessons: 18, rating: 4.7 },
  { id: 5, title: 'The Executive Power BI Masterclass', creator: 'Mariam Hassan', category: 'Business', level: 'Advanced', price: 129, students: 9340, progress: 0, lessons: 56, rating: 5, premium: true },
  { id: 6, title: 'Photography: See the Light', creator: 'Omar Studio', category: 'Photography', level: 'All levels', price: 79, students: 7210, progress: 0, lessons: 38, rating: 4.9 },
  { id: 7, title: 'AI for Modern Work', creator: 'Nadia Ahmed', category: 'Technology', level: 'Intermediate', price: 59, students: 6800, progress: 0, lessons: 34, rating: 4.9 },
  { id: 8, title: 'English Fluency in 90 Days', creator: 'Ayaan Teacher', category: 'Languages', level: 'All levels', price: 39, students: 5900, progress: 0, lessons: 42, rating: 4.8 },
  { id: 9, title: 'Brand Design Masterclass', creator: 'Sahan Creative', category: 'Design', level: 'Advanced', price: 99, students: 4800, progress: 0, lessons: 29, rating: 4.9 },
  { id: 10, title: 'Start Investing With Confidence', creator: 'Yusuf Finance', category: 'Finance', level: 'Beginner', price: 69, students: 4200, progress: 0, lessons: 27, rating: 4.8 },
]

const nav = [['home', 'Home'], ['discover', 'Discover'], ['learning', 'My learning'], ['community', 'Community'], ['live', 'Live & events'], ['messages', 'Messages'], ['certificates', 'Certificates'], ['settings', 'Settings']]
const categories = ['All', 'Business', 'Design', 'Technology', 'Languages', 'Photography', 'Finance']

function Icon({ name, size = 18 }) {
  const p = {
    home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    book: <><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 1 4 17.5z"/><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    calendar: <><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
    message: <path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 9.7 9.7 0 0 1-4-.8L3 21l1.8-4A8.1 8.1 0 0 1 3 11.5 8.38 8.38 0 0 1 12 3a8.38 8.38 0 0 1 9 8.5Z"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.3 1a8 8 0 0 0-1.7-1L14.6 3h-4l-.3 2.1a8 8 0 0 0-1.7 1l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a8 8 0 0 0 1.7 1l.3 2.1h4l.3-2.1a8 8 0 0 0 1.7-1l2.3 1 2-3.4-2-1.5c.1-.3.1-.7.1-1Z"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    play: <path d="m9 6 10 6-10 6Z"/>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{p[name] || p.home}</svg>
}

function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback } }
function write(key, value) { try { localStorage.setItem(key, JSON.stringify(value)) } catch {} }

export default function App() {
  const [page, setPage] = useState('home')
  const [query, setQuery] = useState('')
  const [toast, setToast] = useState('')
  const [selected, setSelected] = useState(null)
  const [enrolled, setEnrolled] = useState(() => read('sahan-enrolled', [1, 2]))
  const [saved, setSaved] = useState(() => read('sahan-saved', []))
  const [settings, setSettings] = useState(() => read('sahan-settings', { email: true, reminders: true }))

  useEffect(() => write('sahan-enrolled', enrolled), [enrolled])
  useEffect(() => write('sahan-saved', saved), [saved])
  useEffect(() => write('sahan-settings', settings), [settings])

  const notify = (message) => { setToast(message); window.clearTimeout(window.__sahanToast); window.__sahanToast = window.setTimeout(() => setToast(''), 2500) }
  const filtered = useMemo(() => courses.filter(c => `${c.title} ${c.creator} ${c.category}`.toLowerCase().includes(query.toLowerCase())), [query])
  const go = (next) => { setPage(next); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const buy = (course) => { if (!enrolled.includes(course.id)) setEnrolled(v => [...v, course.id]); notify(course.price ? `Demo purchase started for ${course.title}. Connect checkout to take payment.` : `You're enrolled in ${course.title}.`); setSelected(null); go('learning') }
  const toggleSaved = (id) => setSaved(v => v.includes(id) ? v.filter(x => x !== id) : [...v, id])

  return <div className="sahan-app">
    <aside className="sidebar">
      <button className="brand" onClick={() => go('home')}><div className="brand-mark">S</div><div><strong>Sahan</strong><span>Learn beautifully.</span></div></button>
      <div className="side-label">Library</div>
      {nav.map(([id, label]) => <button key={id} className={`nav-item ${page === id ? 'active' : ''}`} onClick={() => go(id)}><Icon name={id === 'home' ? 'home' : id === 'discover' ? 'search' : id === 'learning' ? 'book' : id === 'community' ? 'users' : id === 'live' ? 'calendar' : id === 'messages' ? 'message' : id === 'certificates' ? 'check' : 'settings'} /><span>{label}</span></button>)}
      <div className="sidebar-spacer" />
      <div className="sidebar-note"><span className="note-mark">✦</span><strong>Teach on Sahan</strong><p>Share what you know from the private instructor portal.</p><button onClick={() => notify('Instructor access is handled at teach.sahan.com.')}>Learn more <Icon name="arrow" size={13}/></button></div>
      <div className="profile-mini"><div className="avatar">A</div><div><strong>Abdikadir</strong><span>Learner</span></div></div>
    </aside>
    <main className="main-content">
      <header className="topbar"><button className="mobile-brand" onClick={() => go('home')}>Sahan</button><div className="global-search"><Icon name="search" size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search courses, teachers, communities..." aria-label="Search" /></div><div className="top-actions"><button className="icon-btn" onClick={() => notify('No new notifications.')} aria-label="Notifications"><Icon name="bell" size={18}/></button><button className="avatar avatar-sm" onClick={() => go('settings')}>A</button></div></header>
      <div className="content-wrap">
        {page === 'home' && <Home go={go} courses={courses} enrolled={enrolled} onOpen={setSelected}/>} 
        {page === 'discover' && <Discover courses={filtered} go={go} saved={saved} toggleSaved={toggleSaved} onOpen={setSelected}/>} 
        {page === 'learning' && <Learning courses={courses.filter(c => enrolled.includes(c.id))} go={go} onOpen={setSelected}/>} 
        {page === 'community' && <Community notify={notify}/>} 
        {page === 'live' && <Live notify={notify}/>} 
        {page === 'messages' && <Messages notify={notify}/>} 
        {page === 'certificates' && <Certificates notify={notify}/>} 
        {page === 'settings' && <Settings settings={settings} setSettings={setSettings} notify={notify}/>} 
      </div>
    </main>
    {selected && <CourseModal course={selected} enrolled={enrolled.includes(selected.id)} saved={saved.includes(selected.id)} onClose={() => setSelected(null)} onBuy={buy} onSave={() => toggleSaved(selected.id)}/>} 
    {toast && <div className="toast"><span>✓</span>{toast}</div>}
  </div>
}

function Home({ go, courses, enrolled, onOpen }) {
  const premium = courses.find(c => c.premium)
  return <>
    <section className="welcome"><div className="welcome-copy"><div className="eyebrow">SAHAN · YOUR LEARNING SPACE</div><h1>Learn something<br/><span>worth knowing.</span></h1><p>Courses, live classes and communities from people who know their craft.</p><div className="welcome-actions"><button className="primary" onClick={() => go('discover')}>Explore courses <Icon name="arrow" size={15}/></button><button className="ghost" onClick={() => go('live')}>See live classes</button></div></div><button className="hero-card" onClick={() => onOpen(premium)}><div className="hero-glow"/><div className="premium-label">SAHAN PREMIUM</div><div className="hero-content"><span className="hero-kicker">MASTERCLASS · FEATURED</span><h2>{premium.title}</h2><p>A premium, expert-led masterclass selected for learners who want to go further.</p><div className="hero-meta"><span>★★★★★ {premium.rating}</span><span>{premium.students.toLocaleString()} learners</span></div><span className="hero-link">View masterclass <Icon name="arrow" size={14}/></span></div></button></section>
    <SectionHead title="Continue learning" sub="Pick up exactly where you left off." action="View all" onClick={() => go('learning')}/><div className="course-grid">{courses.filter(c => enrolled.includes(c.id)).slice(0, 3).map(c => <CourseCard key={c.id} course={c} onClick={() => onOpen(c)}/>)}</div>
    <section className="premium-strip"><div><div className="premium-label dark">FEATURED</div><h2>Learn from the best.</h2><p>Premium masterclasses from respected teachers, specialists and industry leaders.</p></div><button className="dark-btn" onClick={() => go('discover')}>Explore premium <Icon name="arrow" size={14}/></button></section>
    <section className="top-learning"><div className="top-heading"><div><div className="eyebrow">WHAT PEOPLE ARE LEARNING</div><h2>Top 10 classes</h2><p>The courses learners are choosing most right now.</p></div><button className="text-btn" onClick={() => go('discover')}>See all <Icon name="arrow" size={13}/></button></div><div className="top-ten">{courses.map((c, i) => <button className="rank-row" key={c.id} onClick={() => onOpen(c)}><span className="rank">{String(i + 1).padStart(2, '0')}</span><span className={`rank-cover c${(i % 6) + 1}`}><span>{c.title[0]}</span></span><span className="rank-info"><strong>{c.title}</strong><small>{c.creator} · {c.students.toLocaleString()} learners</small></span><span className="rank-rating">★ {c.rating}</span><span className="rank-price">{c.price ? `$${c.price}` : 'Free'}</span><Icon name="arrow" size={15}/></button>)}</div></section>
    <SectionHead title="Explore by interest" sub="Find your next direction."/><div className="interest-grid">{['Business','Design','Technology','Languages'].map((x, i) => <button className={`interest i${i + 1}`} key={x} onClick={() => { go('discover'); }}>{x}<small>Explore {x.toLowerCase()} courses</small><Icon name="arrow" size={15}/></button>)}</div>
  </>
}

function SectionHead({ title, sub, action, onClick }) { return <div className="section-head"><div><h2>{title}</h2><p>{sub}</p></div>{action && <button className="text-btn" onClick={onClick}>{action} <Icon name="arrow" size={13}/></button>}</div> }
function PageTitle({ kicker, title, sub }) { return <div className="page-title"><div className="eyebrow">{kicker}</div><h1>{title}</h1><p>{sub}</p></div> }
function CourseCard({ course, onClick }) { return <button className="course-card" onClick={onClick}><div className={`course-cover c${(course.id % 6) + 1}`}>{course.premium && <b>PREMIUM</b>}<span>{course.category}</span><div className="cover-shape">{course.title[0]}</div></div><div className="course-body"><div className="course-meta"><span>{course.level}</span><span>·</span><span>{course.lessons} lessons</span></div><h3>{course.title}</h3><p>{course.creator}</p><div className="course-bottom"><span>★ {course.rating} · {course.students.toLocaleString()}</span><strong>{course.price ? `$${course.price}` : 'Free'}</strong></div></div></button> }

function Discover({ courses, go, saved, toggleSaved, onOpen }) { const [category, setCategory] = useState('All'); const list = category === 'All' ? courses : courses.filter(c => c.category === category); return <><PageTitle kicker="DISCOVER" title="Find something worth learning." sub="Explore courses, teachers and ideas from every category."/><div className="filter-row">{categories.map(c => <button key={c} className={`filter ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>{c}</button>)}</div><div className="course-grid four">{list.map(c => <div className="discover-item" key={c.id}><CourseCard course={c} onClick={() => onOpen(c)}/><button className={`save-btn ${saved.includes(c.id) ? 'saved' : ''}`} onClick={() => toggleSaved(c.id)}>{saved.includes(c.id) ? 'Saved' : 'Save'}</button></div>)}</div>{!list.length && <div className="empty-state"><h2>No courses found</h2><p>Try another search or category.</p><button className="primary" onClick={() => go('home')}>Back home</button></div>}</> }
function Learning({ courses, go, onOpen }) { return <><PageTitle kicker="MY LEARNING" title="Your learning space." sub="Courses you started, saved and completed."/>{courses.length ? <><div className="stats-row"><Stat n={courses.length} label="Courses"/><Stat n={courses.reduce((a,c)=>a+Math.round(c.lessons*c.progress/100),0)} label="Lessons done"/><Stat n="6h 42m" label="Learning time"/><Stat n="1" label="Certificates"/></div><div className="course-grid">{courses.map(c => <CourseCard key={c.id} course={c} onClick={() => onOpen(c)}/>)}</div></> : <div className="empty-state"><h2>Your library is waiting.</h2><p>Find a course you love and start learning.</p><button className="primary" onClick={() => go('discover')}>Discover courses</button></div>}</> }
function Stat({ n, label }) { return <div className="stat"><strong>{n}</strong><span>{label}</span></div> }
function Community({ notify }) { const groups = ['Designers in Sahan','Power BI Learners','English Speaking Club']; return <><PageTitle kicker="COMMUNITY" title="Learn together." sub="Ask questions, share progress and meet people learning alongside you."/><div className="community-grid">{groups.map((g,i)=><article className="community-card" key={g}><div className={`community-art i${i+1}`}>{g[0]}</div><div><span>COMMUNITY</span><h3>{g}</h3><p>{[284,517,193][i]} members · active today</p><button className="primary small" onClick={()=>notify(`Joined ${g}.`)}>Join community</button></div></article>)}</div><div className="feed-card"><div className="feed-head"><strong>Community feed</strong><button className="text-btn" onClick={()=>notify('You are viewing the latest posts.')}>Latest</button></div>{['Just finished my first Power BI dashboard.','What is the best way to practice spoken English every day?','Sharing a brand concept I made this weekend.'].map((x,i)=><div className="feed-row" key={x}><div className="avatar">{String.fromCharCode(77+i)}</div><div><strong>{['Muna','Hassan','Sagal'][i]}</strong><p>{x}</p><small>{[4,8,12][i]} min ago · {i+2} replies</small></div></div>)}</div></> }
function Live({ notify }) { return <><PageTitle kicker="LIVE & EVENTS" title="Learn in the moment." sub="Live classes, workshops and conversations with people worth listening to."/><div className="live-feature"><div><span className="live-badge">● LIVE SOON</span><h2>Power BI Office Hours</h2><p>Bring your questions and build alongside Mariam Hassan.</p><button className="primary" onClick={()=>notify('You are on the reminder list.')}>Set reminder</button></div><div className="live-time"><strong>18:30</strong><span>Today · 60 min</span></div></div><div className="event-list">{['AI for Modern Work','English Fluency Workshop','Brand Design Critique'].map((x,i)=><div className="event-row" key={x}><div className="event-date"><strong>{20+i}</strong><span>AUG</span></div><div><strong>{x}</strong><p>{['Nadia Ahmed','Ayaan Teacher','Sahan Creative'][i]} · {i+1} hour</p></div><button className="ghost" onClick={()=>notify('Reminder set.')}>Remind me</button></div>)}</div></> }
function Messages({ notify }) { const msgs = [['Mariam Hassan','Your Power BI masterclass is ready for you.'],['Ayaan Teacher','See you in the English workshop!'],['Sahan Creative','I replied to your community post.']]; return <><PageTitle kicker="MESSAGES" title="Your conversations." sub="Stay connected with teachers and learning communities."/><div className="message-list">{msgs.map(([name,text],i)=><button className="message-row" key={name} onClick={()=>notify(`Opening conversation with ${name}.`)}><div className="avatar">{name[0]}</div><div><strong>{name}</strong><p>{text}</p><small>{i+1}h ago</small></div><span>›</span></button>)}</div></> }
function Certificates({ notify }) { const certs = [{id:'SAH-2026-001284', course:'Excel & Power BI for Real Work', issuer:'Sahan Academy', instructor:'Mariam Hassan', date:'August 12, 2026'}]; return <><PageTitle kicker="YOUR ACHIEVEMENTS" title="Certificates" sub="Certificates issued to you by the creators of courses you have completed."/><div className="certificate-library"><div className="certificate-list"><div className="library-label">ISSUED TO YOU · {certs.length}</div>{certs.map(c=><button className="certificate-list-item selected" key={c.id}><div className="certificate-thumb">S</div><div className="certificate-list-copy"><strong>{c.course}</strong><span>{c.issuer} · {c.date}</span></div><span className="certificate-status">Verified</span></button>)}</div><div className="certificate-detail"><div className="certificate-paper"><div className="certificate-paper-top">SAHAN</div><div className="certificate-paper-kicker">CERTIFICATE OF COMPLETION</div><h2>{certs[0].course}</h2><p>This certificate is proudly presented to</p><h3>Abdikadir</h3><p>for successfully completing the course requirements established by</p><strong>{certs[0].instructor}</strong><div className="certificate-paper-footer"><span>{certs[0].date}</span><span>{certs[0].id}</span><span>Issued by {certs[0].issuer}</span></div></div><div className="certificate-actions"><button className="primary" onClick={()=>{notify('Opening print dialog.');window.print()}}>View / print certificate</button><span>Issued by the course creator · Verified</span></div></div></div></> }
function Settings({ settings, setSettings, notify }) { return <><PageTitle kicker="SETTINGS" title="Make Sahan yours." sub="Control your learning preferences and notifications."/><div className="settings-card"><div className="setting-row"><div><strong>Email updates</strong><p>Occasional product and learning recommendations.</p></div><button className={`toggle ${settings.email?'on':''}`} onClick={()=>setSettings(s=>({...s,email:!s.email}))}><span/></button></div><div className="setting-row"><div><strong>Learning reminders</strong><p>Get reminders when a course is waiting for you.</p></div><button className={`toggle ${settings.reminders?'on':''}`} onClick={()=>setSettings(s=>({...s,reminders:!s.reminders}))}><span/></button></div><div className="setting-row"><div><strong>Account</strong><p>Abdikadir · Learner</p></div><button className="ghost" onClick={()=>notify('Account management is ready for connection.')}>Manage</button></div></div></> }
function CourseModal({ course, enrolled, saved, onClose, onBuy, onSave }) { return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="course-modal"><button className="modal-close" onClick={onClose}><Icon name="close"/></button><div className={`modal-cover c${(course.id%6)+1}`}><span>{course.category}</span><strong>{course.title[0]}</strong></div><div className="modal-body"><div className="eyebrow">{course.premium?'SAHAN PREMIUM':'COURSE'} · {course.level}</div><h2>{course.title}</h2><p className="modal-creator">By {course.creator}</p><div className="modal-meta"><span>★ {course.rating}</span><span>{course.students.toLocaleString()} learners</span><span>{course.lessons} lessons</span></div><p>Build practical skills with a structured course, clear lessons and a community around the topic.</p><div className="modal-actions">{enrolled ? <button className="primary" onClick={onClose}>Continue learning <Icon name="arrow" size={14}/></button> : <button className="primary" onClick={()=>onBuy(course)}>{course.price ? `Buy for $${course.price}` : 'Enroll free'} <Icon name="arrow" size={14}/></button>}<button className="ghost" onClick={onSave}>{saved?'Saved':'Save for later'}</button></div></div></div></div> }
