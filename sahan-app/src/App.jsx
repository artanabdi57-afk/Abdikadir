import React, { useMemo, useState } from 'react';
import './styles/index.css';

const demoCourses = [
  { id: 1, title: 'Excel & Power BI for Real Work', creator: 'Sahan Academy', category: 'Business', level: 'Beginner', price: 29, students: 1280, progress: 68, lessons: 32, color: 'violet' },
  { id: 2, title: 'Modern English Speaking', creator: 'Ayaan Teacher', category: 'Languages', level: 'All levels', price: 19, students: 842, progress: 42, lessons: 24, color: 'blue' },
  { id: 3, title: 'Build Your First Online Business', creator: 'Hassan Noor', category: 'Business', level: 'Intermediate', price: 49, students: 516, progress: 12, lessons: 41, color: 'orange' },
  { id: 4, title: 'Graphic Design From Zero', creator: 'Sahan Creative', category: 'Design', level: 'Beginner', price: 0, students: 2304, progress: 0, lessons: 18, color: 'green' },
];

const nav = [
  ['home', 'Home'], ['discover', 'Discover'], ['courses', 'My learning'], ['community', 'Community'], ['live', 'Live & events'], ['messages', 'Messages'],
];

function Icon({ name, size = 18 }) {
  const paths = {
    home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    book: <><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 1 4 17.5z"/><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    calendar: <><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
    message: <><path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 9.7 9.7 0 0 1-4-.8L3 21l1.8-4A8.1 8.1 0 0 1 3 11.5 8.38 8.38 0 0 1 12 3a8.38 8.38 0 0 1 9 8.5Z"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    play: <path d="m9 6 10 6-10 6z"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    chart: <><path d="M4 19V5M4 19h17"/><path d="m7 15 4-5 3 3 5-7"/></>,
    video: <><rect x="3" y="5" width="14" height="14" rx="2"/><path d="m17 10 4-2v8l-4-2z"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.41 1.41-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.55V20h-2v-.5a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06-1.41-1.41.06-.06A1.7 1.7 0 0 0 9.4 15a1.7 1.7 0 0 0-1.55-1H7v-2h.85a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.88L9 9.06l1.41-1.41.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1-1.55V6h2v.5a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.41 1.41-.06.06A1.7 1.7 0 0 0 19.4 11c.17.6.72 1 1.55 1H21v2h-.05a1.7 1.7 0 0 0-1.55 1Z"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name] || paths.home}</svg>;
}

function App() {
  const [page, setPage] = useState('home');
  const [transaction, setTransaction] = useState('buy');
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState('');
  const [courses, setCourses] = useState(demoCourses);
  const [courseForm, setCourseForm] = useState({ title: '', description: '', price: '', category: 'Business', type: 'course' });

  const filteredCourses = useMemo(() => courses.filter(c => `${c.title} ${c.creator} ${c.category}`.toLowerCase().includes(query.toLowerCase())), [courses, query]);

  const notify = (message) => { setToast(message); window.clearTimeout(window.__sahanToast); window.__sahanToast = window.setTimeout(() => setToast(''), 2600); };

  const createCourse = (e) => {
    e.preventDefault();
    if (!courseForm.title.trim()) return notify('Add a title first.');
    const newCourse = { id: Date.now(), title: courseForm.title, creator: 'Abdikadir', category: courseForm.category, level: 'All levels', price: Number(courseForm.price) || 0, students: 0, progress: 0, lessons: 0, color: 'violet' };
    setCourses([newCourse, ...courses]);
    setCourseForm({ title: '', description: '', price: '', category: 'Business', type: 'course' });
    notify('Draft created. Add lessons, files, quizzes and publish when ready.');
    setPage('creator');
  };

  return (
    <div className="sahan-app">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">S</div><div><strong>Sahan</strong><span>Learn. Teach. Grow.</span></div></div>
        <button className="create-btn" onClick={() => setPage('creator')}><Icon name="plus" /> Create</button>
        <div className="side-label">Workspace</div>
        {nav.map(([id, label]) => <button key={id} className={`nav-item ${page === id ? 'active' : ''}`} onClick={() => setPage(id)}><Icon name={id === 'home' ? 'home' : id === 'discover' ? 'search' : id === 'courses' ? 'book' : id === 'community' ? 'users' : id === 'live' ? 'calendar' : 'message'} /><span>{label}</span>{id === 'messages' && <b>3</b>}</button>)}
        <div className="side-label">Creator studio</div>
        <button className={`nav-item ${page === 'creator' ? 'active' : ''}`} onClick={() => setPage('creator')}><Icon name="chart" /><span>Creator dashboard</span></button>
        <button className="nav-item" onClick={() => notify('Settings are ready for the next release.')}><Icon name="settings" /><span>Settings</span></button>
        <div className="sidebar-spacer" />
        <div className="upgrade"><div className="upgrade-icon">✦</div><strong>Build your school</strong><p>Sell courses, memberships and live teaching from one place.</p><button onClick={() => notify('Creator Pro will be available soon.')}>Explore Pro</button></div>
        <div className="profile-mini"><div className="avatar">A</div><div><strong>Abdikadir</strong><span>Creator · Learner</span></div><span className="dot" /></div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="mobile-brand">Sahan</div>
          <div className="global-search"><Icon name="search" size={17} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search courses, teachers, communities..." /></div>
          <div className="top-actions"><button className="icon-btn" onClick={() => notify('You are all caught up.')} aria-label="notifications">♢<i /></button><button className="avatar avatar-sm" onClick={() => setPage('creator')}>A</button></div>
        </header>

        <div className="content-wrap">
          {page === 'home' && <Home setPage={setPage} courses={courses} notify={notify} />}
          {page === 'discover' && <Discover courses={filteredCourses} setPage={setPage} />}
          {page === 'courses' && <Learning courses={courses} setPage={setPage} />}
          {page === 'community' && <Community notify={notify} />}
          {page === 'live' && <Live notify={notify} />}
          {page === 'messages' && <Messages />}
          {page === 'creator' && <Creator courses={courses} setPage={setPage} transaction={transaction} setTransaction={setTransaction} form={courseForm} setForm={setCourseForm} onCreate={createCourse} notify={notify} />}
          {page === 'marketplace' && <Marketplace courses={filteredCourses} transaction={transaction} setTransaction={setTransaction} notify={notify} />}
        </div>
      </main>
      {toast && <div className="toast"><span>✓</span>{toast}</div>}
    </div>
  );
}

function Home({ setPage, courses, notify }) {
  return <>
    <section className="welcome"><div><div className="eyebrow">YOUR LEARNING WORLD</div><h1>Everything you want to <em>learn or teach.</em></h1><p>Sahan brings courses, communities, live classes, coaching and digital products into one place — without the clutter.</p><div className="welcome-actions"><button className="primary" onClick={() => setPage('discover')}>Explore learning <span>→</span></button><button className="ghost" onClick={() => setPage('creator')}><Icon name="plus" size={16} /> Start teaching</button></div></div><div className="hero-card"><div className="live-pill"><span /> LIVE NOW</div><h3>Master the skill. Build the future.</h3><p>Join a live workshop, ask questions and learn with people who are building too.</p><button onClick={() => notify('Opening the live classroom...')}>Join classroom <span>→</span></button><div className="floating-stat"><strong>12.4k</strong><span>learners active today</span></div></div></section>
    <div className="section-head"><div><h2>Continue learning</h2><p>Pick up where you left off.</p></div><button className="text-btn" onClick={() => setPage('courses')}>View all →</button></div>
    <div className="course-grid">{courses.slice(0, 3).map(c => <CourseCard key={c.id} course={c} onClick={() => setPage('courses')} />)}</div>
    <div className="section-head space-top"><div><h2>One platform. Every way to learn.</h2><p>Take a course, join a community, attend live teaching or build your own school.</p></div></div>
    <div className="feature-grid"><Feature icon="book" title="Courses & lessons" text="Video, articles, files, quizzes, assignments and structured paths."/><Feature icon="users" title="Communities" text="Build a real audience with posts, discussions, events and groups."/><Feature icon="video" title="Live teaching" text="Run workshops, coaching, office hours and interactive classes."/><Feature icon="chart" title="Sell & grow" text="Set your price, sell courses or memberships and track revenue."/></div>
  </>;
}

function Discover({ courses, setPage }) {
  return <><PageTitle kicker="DISCOVER" title="Find something worth learning." sub="Courses, lessons and teachers from every category." /><div className="filter-row"><button className="filter active">All</button><button className="filter">Business</button><button className="filter">Design</button><button className="filter">Technology</button><button className="filter">Languages</button><button className="filter">Health</button></div><div className="course-grid four">{courses.map(c => <CourseCard key={c.id} course={c} onClick={() => setPage('courses')} />)}</div></>;
}

function Learning({ courses, setPage }) {
  return <><PageTitle kicker="MY LEARNING" title="Your learning space." sub="Courses you started, saved and completed." action={<button className="primary" onClick={() => setPage('discover')}>Find a new course</button>} /><div className="stats-row"><Stat n="4" label="Courses"/><Stat n="21" label="Lessons done"/><Stat n="6h 42m" label="Learning time"/><Stat n="3" label="Certificates"/></div><div className="section-head"><div><h2>In progress</h2></div></div><div className="course-grid four">{courses.map(c => <CourseCard key={c.id} course={c} onClick={() => setPage('course')} />)}</div></>;
}

function Community({ notify }) { return <><PageTitle kicker="COMMUNITY" title="Learn together, not alone." sub="Find people, conversations and spaces around what you care about." action={<button className="primary" onClick={() => notify('Community creation opened.')}>Create community</button>} /><div className="community-layout"><div className="feed"><div className="post composer"><div className="avatar">A</div><button onClick={() => notify('Post composer opened.')}>Share something with your community...</button></div><Post name="Sahan Academy" time="12 min" text="What are you working on this week? Share your goal and let the community keep you accountable." likes="42"/><Post name="Ayaan Teacher" time="1h" text="New English speaking lesson is live. I added a practice exercise at the end — try it and post your answer." likes="28"/><Post name="Hassan Noor" time="3h" text="Live workshop starts tonight. Bring your questions; we are building a real business from scratch." likes="67"/></div><aside className="side-card"><h3>Popular spaces</h3><div className="space-item"><div className="space-icon">B</div><div><strong>Business Builders</strong><span>8.4k members</span></div></div><div className="space-item"><div className="space-icon blue">E</div><div><strong>English Everyday</strong><span>4.2k members</span></div></div><div className="space-item"><div className="space-icon orange">D</div><div><strong>Design Lab</strong><span>2.9k members</span></div></div></aside></div></>; }

function Live({ notify }) { return <><PageTitle kicker="LIVE & EVENTS" title="Learn in real time." sub="Workshops, coaching, office hours and classes — all in one calendar." action={<button className="primary" onClick={() => notify('Live event creator opened.')}>Schedule live</button>} /><div className="live-grid"><div className="live-feature"><div className="live-pill"><span /> STARTING SOON</div><h2>Power BI: Build your first executive dashboard</h2><p>Live workshop · Today at 7:00 PM</p><div className="attendees"><div className="avatars"><span>A</span><span>M</span><span>H</span><span>+</span></div><span>184 learners joined</span></div><button className="primary" onClick={() => notify('You joined the live event.')}>Join reminder</button></div><div className="event-list"><Event time="Tomorrow · 10:00 AM" title="English speaking practice" host="Ayaan Teacher"/><Event time="Tomorrow · 4:00 PM" title="Creator Q&A" host="Sahan Academy"/><Event time="Fri · 6:30 PM" title="Build your first online business" host="Hassan Noor"/></div></div></>; }

function Messages() { return <><PageTitle kicker="MESSAGES" title="Stay connected." sub="Talk to teachers, learners and your community."/><div className="messages"><div className="message-list"><div className="message active"><div className="avatar blue-bg">A</div><div><strong>Ayaan Teacher</strong><span>Can you check the exercise...</span></div><b>2m</b></div><div className="message"><div className="avatar green-bg">S</div><div><strong>Sahan Academy</strong><span>Your certificate is ready.</span></div><b>1h</b></div><div className="message"><div className="avatar orange-bg">H</div><div><strong>Hassan Noor</strong><span>See you at the workshop.</span></div><b>3h</b></div></div><div className="chat"><div className="chat-head"><div className="avatar blue-bg">A</div><div><strong>Ayaan Teacher</strong><span>Usually replies in a few minutes</span></div></div><div className="chat-body"><div className="bubble">Hey Abdikadir 👋 I added a new practice lesson to the course.</div><div className="bubble me">Perfect. I'll take it tonight. Thanks!</div><div className="bubble">Great — message me if you get stuck.</div></div><div className="chat-input"><input placeholder="Write a message..."/><button>Send</button></div></div></div></>; }

function Creator({ courses, setPage, transaction, setTransaction, form, setForm, onCreate, notify }) { return <><PageTitle kicker="CREATOR STUDIO" title="Build your own school." sub="Create courses, lessons, communities and live experiences — then sell them." action={<button className="primary" onClick={() => setPage('creator')}>+ New product</button>} /><div className="creator-stats"><Stat n="$4,820" label="Revenue this month" trend="+18%"/><Stat n="1,946" label="Total learners" trend="+12%"/><Stat n="68%" label="Completion rate"/><Stat n="4.9" label="Average rating"/></div><div className="creator-tabs"><button className="active">Products</button><button>Analytics</button><button>Audience</button><button>Payments</button></div><div className="creator-layout"><section><div className="section-head"><div><h2>Your products</h2><p>Courses, lessons, coaching and memberships.</p></div></div><div className="product-list">{courses.map(c => <div className="product-row" key={c.id}><div className={`product-cover ${c.color}`}><Icon name="play"/></div><div className="product-info"><strong>{c.title}</strong><span>{c.lessons} lessons · {c.students.toLocaleString()} learners</span></div><span className={`status ${c.price === 0 ? 'free' : ''}`}>{c.price === 0 ? 'Free' : `$${c.price}`}</span><button className="small-btn" onClick={() => notify(`Editing ${c.title}`)}>Manage</button></div>)}</div></section><aside className="create-panel"><h3>Create something</h3><p>Choose what you want to teach or sell.</p><div className="create-options"><button className="create-option active"><div>▣</div><span><strong>Course</strong><small>Structured lessons & learning path</small></span>→</button><button className="create-option" onClick={() => notify('Lesson creator opened.')}><div>▶</div><span><strong>Single lesson</strong><small>Sell one focused lesson</small></span>→</button><button className="create-option" onClick={() => notify('Live event creator opened.')}><div>◉</div><span><strong>Live class</strong><small>Workshop, coaching or event</small></span>→</button><button className="create-option" onClick={() => notify('Community creator opened.')}><div>◎</div><span><strong>Community</strong><small>Build your membership space</small></span>→</button></div><form className="quick-create" onSubmit={onCreate}><label>Quick course title<input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Master Excel in 30 Days"/></label><div className="form-row"><label>Category<select value={form.category} onChange={e => setForm({...form, category: e.target.value})}><option>Business</option><option>Design</option><option>Technology</option><option>Languages</option><option>Health</option></select></label><label>Price<input type="number" min="0" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="0"/></label></div><button className="primary full" type="submit">Create course draft</button></form></aside></div><div className="transaction-card"><div><div className="eyebrow">SELLING & BUYING</div><h3>One marketplace. Two actions.</h3><p>Keep buying and selling separate. <strong>Buy is always the default.</strong></p></div><div className="switch"><button className={transaction === 'buy' ? 'selected' : ''} onClick={() => setTransaction('buy')}>Buy</button><button className={transaction === 'sell' ? 'selected' : ''} onClick={() => setTransaction('sell')}>Sell</button></div><button className="primary" onClick={() => setPage('marketplace')}>{transaction === 'buy' ? 'Browse to buy' : 'Open selling center'} →</button></div></>; }

function Marketplace({ courses, transaction, setTransaction, notify }) { return <><PageTitle kicker="MARKETPLACE" title="Buy and sell knowledge." sub="Courses, individual lessons, coaching and memberships."/><div className="transaction-switch"><button className={transaction === 'buy' ? 'selected' : ''} onClick={() => setTransaction('buy')}>Buy</button><button className={transaction === 'sell' ? 'selected' : ''} onClick={() => setTransaction('sell')}>Sell</button></div>{transaction === 'buy' ? <div className="course-grid four">{courses.map(c => <CourseCard key={c.id} course={c} onClick={() => notify(`Opening ${c.title}`)} buy />)}</div> : <div className="seller-empty"><div className="seller-icon">✦</div><h2>Turn what you know into income.</h2><p>Create a course, sell a single lesson, host live teaching or build a paid community.</p><button className="primary" onClick={() => notify('Selling center opened.')}>Create your first product</button></div>}</>; }

function CourseCard({ course, onClick, buy }) { return <article className="course-card" onClick={onClick}><div className={`course-cover ${course.color}`}><span>{course.category}</span><div className="cover-shape">{course.title.slice(0,1)}</div>{course.price === 0 && <b>FREE</b>}</div><div className="course-body"><div className="course-meta"><span>{course.level}</span><span>{course.lessons} lessons</span></div><h3>{course.title}</h3><p>{course.creator}</p><div className="course-bottom"><div className="progress"><div style={{width: `${course.progress}%`}} /></div><span>{course.progress}%</span><strong>{course.price === 0 ? 'Free' : `$${course.price}`}</strong></div>{buy && <button className="buy-btn">Buy course →</button>}</div></article>; }
function PageTitle({ kicker, title, sub, action }) { return <div className="page-title"><div><div className="eyebrow">{kicker}</div><h1>{title}</h1><p>{sub}</p></div>{action}</div>; }
function Feature({icon,title,text}) { return <div className="feature"><div className="feature-icon"><Icon name={icon}/></div><h3>{title}</h3><p>{text}</p></div>; }
function Stat({n,label,trend}) { return <div className="stat"><strong>{n}</strong><span>{label}</span>{trend && <small>{trend}</small>}</div>; }
function Post({name,time,text,likes}) { return <article className="post"><div className="post-head"><div className="avatar">{name[0]}</div><div><strong>{name}</strong><span>{time} ago</span></div><button>•••</button></div><p>{text}</p><div className="post-actions"><button>♡ {likes}</button><button>◌ Comment</button><button>↗ Share</button></div></article>; }
function Event({time,title,host}) { return <div className="event"><div className="event-time">{time}</div><h3>{title}</h3><p>{host}</p><button>View event →</button></div>; }

export default App;
