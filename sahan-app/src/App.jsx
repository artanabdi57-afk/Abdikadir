import React, { useMemo, useState } from 'react';
import './styles/index.css';
import CertificateBuilder from './pages/CertificateBuilder.jsx';

const demoCourses = [
  { id: 1, title: 'Excel & Power BI for Real Work', creator: 'Sahan Academy', category: 'Business', level: 'Beginner', price: 29, students: 1280, progress: 68, lessons: 32, color: 'violet', rating: 4.9 },
  { id: 2, title: 'Modern English Speaking', creator: 'Ayaan Teacher', category: 'Languages', level: 'All levels', price: 19, students: 842, progress: 42, lessons: 24, color: 'blue', rating: 4.8 },
  { id: 3, title: 'Build Your First Online Business', creator: 'Hassan Noor', category: 'Business', level: 'Intermediate', price: 49, students: 516, progress: 12, lessons: 41, color: 'orange', rating: 4.9 },
  { id: 4, title: 'Graphic Design From Zero', creator: 'Sahan Creative', category: 'Design', level: 'Beginner', price: 0, students: 2304, progress: 0, lessons: 18, color: 'green', rating: 4.7 },
  { id: 5, title: 'The Executive Power BI Masterclass', creator: 'Mariam Hassan', category: 'Business', level: 'Advanced', price: 129, students: 9340, progress: 0, lessons: 56, color: 'purple', rating: 5.0, premium: true },
  { id: 6, title: 'Photography: See the Light', creator: 'Omar Studio', category: 'Photography', level: 'All levels', price: 79, students: 7210, progress: 0, lessons: 38, color: 'slate', rating: 4.9 },
  { id: 7, title: 'AI for Modern Work', creator: 'Nadia Ahmed', category: 'Technology', level: 'Intermediate', price: 59, students: 6800, progress: 0, lessons: 34, color: 'blue', rating: 4.9 },
  { id: 8, title: 'English Fluency in 90 Days', creator: 'Ayaan Teacher', category: 'Languages', level: 'All levels', price: 39, students: 5900, progress: 0, lessons: 42, color: 'violet', rating: 4.8 },
  { id: 9, title: 'Brand Design Masterclass', creator: 'Sahan Creative', category: 'Design', level: 'Advanced', price: 99, students: 4800, progress: 0, lessons: 29, color: 'orange', rating: 4.9 },
  { id: 10, title: 'Start Investing With Confidence', creator: 'Yusuf Finance', category: 'Finance', level: 'Beginner', price: 69, students: 4200, progress: 0, lessons: 27, color: 'slate', rating: 4.8 },
];

const nav = [
  ['home', 'Home'], ['discover', 'Discover'], ['courses', 'My learning'], ['community', 'Community'], ['live', 'Live & events'], ['messages', 'Messages'], ['certificates', 'Certificates'],
];

function Icon({ name, size = 18 }) {
  const paths = {
    home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    book: <><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 1 4 17.5z"/><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    calendar: <><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
    message: <path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 9.7 9.7 0 0 1-4-.8L3 21l1.8-4A8.1 8.1 0 0 1 3 11.5 8.38 8.38 0 0 1 12 3a8.38 8.38 0 0 1 9 8.5Z"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.41 1.41-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.55V20h-2v-.5a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06-1.41-1.41.06-.06A1.7 1.7 0 0 0 9.4 15a1.7 1.7 0 0 0-1.55-1H7v-2h.85a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.88L9 9.06l1.41-1.41.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.55-1H14v.5a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.41 1.41-.06.06A1.7 1.7 0 0 0 18.6 13h.85v2h-.05Z"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name] || paths.home}</svg>;
}

function App() {
  const [page, setPage] = useState('home');
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState('');
  const filteredCourses = useMemo(() => demoCourses.filter(c => `${c.title} ${c.creator} ${c.category}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const notify = (message) => { setToast(message); window.clearTimeout(window.__sahanToast); window.__sahanToast = window.setTimeout(() => setToast(''), 2600); };
  const pages = { home: <Home setPage={setPage} courses={demoCourses} notify={notify} />, discover: <Discover courses={filteredCourses} setPage={setPage} />, courses: <Learning courses={demoCourses} notify={notify} />, community: <Community />, live: <Live notify={notify} />, messages: <Messages />, certificates: <CertificateBuilder /> };
  return <div className="sahan-app">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">S</div><div><strong>Sahan</strong><span>Learn beautifully.</span></div></div>
      <div className="side-label">Library</div>
      {nav.map(([id, label]) => <button key={id} className={`nav-item ${page === id ? 'active' : ''}`} onClick={() => setPage(id)}><Icon name={id === 'home' ? 'home' : id === 'discover' ? 'search' : id === 'courses' ? 'book' : id === 'community' ? 'users' : id === 'live' ? 'calendar' : id === 'messages' ? 'message' : 'check'} /><span>{label}</span></button>)}
      <div className="sidebar-spacer" />
      <div className="sidebar-note"><span className="note-mark">✦</span><strong>Teach on Sahan</strong><p>Ready to share what you know?</p><button onClick={() => notify('Instructor applications will open from the Teach portal.')}>Learn more <Icon name="arrow" size={13}/></button></div>
      <button className="nav-item settings-link" onClick={() => notify('Settings are ready for the next release.')}><Icon name="settings" /><span>Settings</span></button>
      <div className="profile-mini"><div className="avatar">A</div><div><strong>Abdikadir</strong><span>Learner</span></div></div>
    </aside>
    <main className="main-content">
      <header className="topbar"><div className="mobile-brand">Sahan</div><div className="global-search"><Icon name="search" size={17} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search courses, teachers, communities..." /></div><div className="top-actions"><button className="icon-btn" onClick={() => notify('You are all caught up.')} aria-label="notifications"><Icon name="bell" size={18}/><i /></button><button className="avatar avatar-sm">A</button></div></header>
      <div className="content-wrap">{pages[page] || pages.home}</div>
    </main>
    {toast && <div className="toast"><span>✓</span>{toast}</div>}
  </div>;
}

function Home({ setPage, courses, notify }) {
  const premium = courses.find(c => c.premium);
  return <>
    <section className="welcome">
      <div className="welcome-copy"><div className="eyebrow">SAHAN · YOUR LEARNING SPACE</div><h1>Learn something<br/><span>worth knowing.</span></h1><p>Courses, live classes and communities from people who know their craft.</p><div className="welcome-actions"><button className="primary" onClick={() => setPage('discover')}>Explore courses <Icon name="arrow" size={15}/></button><button className="ghost" onClick={() => setPage('live')}>See live classes</button></div></div>
      <div className="hero-card"><div className="hero-glow"/><div className="premium-label">SAHAN PREMIUM</div><div className="hero-content"><span className="hero-kicker">MASTERCLASS · FEATURED</span><h2>{premium.title}</h2><p>Learn from an expert-led masterclass built for people who want to go further.</p><div className="hero-meta"><span>★★★★★ {premium.rating}</span><span>{premium.students.toLocaleString()} learners</span></div><button onClick={() => notify(`Opening ${premium.title}`)}>View masterclass <Icon name="arrow" size={14}/></button></div></div>
    </section>
    <section className="section-head"><div><h2>Continue learning</h2><p>Pick up exactly where you left off.</p></div><button className="text-btn" onClick={() => setPage('courses')}>View all <Icon name="arrow" size={13}/></button></section>
    <div className="course-grid">{courses.slice(0, 3).map(c => <CourseCard key={c.id} course={c} onClick={() => setPage('courses')} />)}</div>
    <section className="premium-strip"><div><div className="premium-label dark">FEATURED</div><h2>Learn from the best.</h2><p>Premium masterclasses from respected teachers, specialists and industry leaders.</p></div><button className="dark-btn" onClick={() => setPage('discover')}>Explore premium <Icon name="arrow" size={14}/></button></section>
    <section className="top-learning"><div className="top-heading"><div><div className="eyebrow">WHAT PEOPLE ARE LEARNING</div><h2>Top 10 classes</h2><p>The courses learners are choosing most right now.</p></div><button className="text-btn" onClick={() => setPage('discover')}>See all <Icon name="arrow" size={13}/></button></div><div className="top-ten">{courses.slice(0, 10).map((c, i) => <button className="rank-row" key={c.id} onClick={() => notify(`Opening ${c.title}`)}><span className="rank">{String(i + 1).padStart(2, '0')}</span><span className={`rank-cover ${c.color}`}><span>{c.title.slice(0, 1)}</span></span><span className="rank-info"><strong>{c.title}</strong><small>{c.creator} · {c.students.toLocaleString()} learners</small></span><span className="rank-rating">★ {c.rating}</span><span className="rank-price">{c.price ? `$${c.price}` : 'Free'}</span><Icon name="arrow" size={15}/></button>)}</div></section>
    <section className="section-head space-top"><div><h2>Explore by interest</h2><p>Find your next direction.</p></div></section><div className="interest-grid"><Interest title="Business" count="124 courses" symbol="B"/><Interest title="Design" count="86 courses" symbol="D"/><Interest title="Technology" count="142 courses" symbol="T"/><Interest title="Languages" count="73 courses" symbol="L"/></div>
  </>;
}

function CourseCard({ course, onClick }) { return <article className="course-card" onClick={onClick}><div className={`course-cover ${course.color}`}>{course.premium && <b>PREMIUM</b>}<span>{course.category}</span><div className="cover-shape">{course.title.slice(0,1)}</div></div><div className="course-body"><div className="course-meta"><span>{course.level}</span><span>·</span><span>{course.lessons} lessons</span></div><h3>{course.title}</h3><p>{course.creator}</p><div className="course-bottom">{course.progress > 0 ? <><div className="progress"><div style={{width: `${course.progress}%`}} /></div><span>{course.progress}%</span></> : <span>★ {course.rating} · {course.students.toLocaleString()} learners</span>}<strong>{course.price ? `$${course.price}` : 'Free'}</strong></div></div></article>; }
function Discover({ courses, setPage }) { return <><PageTitle kicker="DISCOVER" title="Find something worth learning." sub="Courses, lessons and teachers from every category."/><div className="filter-row"><button className="filter active">All</button><button className="filter">Business</button><button className="filter">Design</button><button className="filter">Technology</button><button className="filter">Languages</button><button className="filter">Premium</button></div><div className="course-grid four">{courses.map(c => <CourseCard key={c.id} course={c} onClick={() => setPage('courses')} />)}</div></>; }
function Learning({ courses, notify }) { return <><PageTitle kicker="MY LEARNING" title="Your learning space." sub="Courses you started, saved and completed."/><div className="stats-row"><Stat n={courses.length} label="Courses"/><Stat n="21" label="Lessons done"/><Stat n="6h 42m" label="Learning time"/><Stat n="3" label="Certificates"/></div><div className="section-head"><div><h2>In progress</h2></div></div><div className="course-grid four">{courses.slice(0, 4).map(c => <CourseCard key={c.id} course={c} onClick={() => notify(`Opening ${c.title}`)} />)}</div></>; }
function Community() { return <><PageTitle kicker="COMMUNITY" title="Learn together, not alone." sub="Find people, conversations and spaces around what you care about."/><div className="community-layout"><div className="feed"><Post name="Sahan Academy" time="12 min" text="What are you working on this week? Share your goal and let the community keep you accountable." likes="42"/><Post name="Ayaan Teacher" time="1h" text="New English speaking lesson is live. Try the practice exercise and post your answer." likes="28"/></div><aside className="side-card"><h3>Popular spaces</h3><div className="space-item"><div className="space-icon">B</div><div><strong>Business Builders</strong><span>8.4k members</span></div></div><div className="space-item"><div className="space-icon blue">E</div><div><strong>English Everyday</strong><span>4.2k members</span></div></div></aside></div></>; }
function Live({ notify }) { return <><PageTitle kicker="LIVE & EVENTS" title="Learn in real time." sub="Workshops, coaching, office hours and classes."/><div className="live-grid"><div className="live-feature"><div className="live-pill"><span/> STARTING SOON</div><h2>Power BI: Build your first executive dashboard</h2><p>Live workshop · Today at 7:00 PM</p><button className="primary" onClick={() => notify('Reminder added.')}>Join reminder</button></div><div className="event-list"><Event time="Tomorrow · 10:00 AM" title="English speaking practice" host="Ayaan Teacher"/><Event time="Tomorrow · 4:00 PM" title="Design critique session" host="Sahan Creative"/></div></div></>; }
function Messages() { return <><PageTitle kicker="MESSAGES" title="Stay connected." sub="Talk to teachers, learners and your community."/><div className="messages"><div className="message-list"><div className="message active"><div className="avatar blue-bg">A</div><div><strong>Ayaan Teacher</strong><span>Can you check the exercise...</span></div><b>2m</b></div><div className="message"><div className="avatar green-bg">S</div><div><strong>Sahan Academy</strong><span>Your certificate is ready.</span></div><b>1h</b></div></div><div className="chat"><div className="chat-head"><div className="avatar blue-bg">A</div><div><strong>Ayaan Teacher</strong><span>Usually replies quickly</span></div></div><div className="chat-body"><div className="bubble">Can you check the exercise from lesson 4?</div><div className="bubble me">Yes — I just finished it. Thank you!</div></div><div className="chat-input"><input placeholder="Write a message..."/><button>Send</button></div></div></div></>; }
function PageTitle({ kicker, title, sub }) { return <div className="page-title"><div><div className="eyebrow">{kicker}</div><h1>{title}</h1><p>{sub}</p></div></div>; }
function Stat({ n, label }) { return <div className="stat"><strong>{n}</strong><span>{label}</span></div>; }
function Interest({ title, count, symbol }) { return <div className="interest"><span>{symbol}</span><div><strong>{title}</strong><small>{count}</small></div><Icon name="arrow" size={14}/></div>; }
function Post({ name, time, text, likes }) { return <article className="post"><div className="post-head"><div className="avatar">{name[0]}</div><div><strong>{name}</strong><span>{time} ago</span></div></div><p>{text}</p><div className="post-actions"><button>♡ {likes}</button><button>Comment</button><button>Share</button></div></article>; }
function Event({ time, title, host }) { return <div className="event"><span className="event-time">{time}</span><h3>{title}</h3><p>with {host}</p><button>View event →</button></div>; }

export default App;
