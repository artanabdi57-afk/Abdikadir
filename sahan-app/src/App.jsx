import React, { useEffect, useMemo, useState, useRef } from 'react'
import { useLanguage } from './i18n/LanguageContext'
import LanguageSwitcher from './components/LanguageSwitcher'
import './styles/app.css'

const initialCourses = [
  { id: 1, title: 'Excel & Power BI for Real Work', creator: 'Sahan Academy', instructor: 'Mariam Hassan', category: 'Business', level: 'Beginner', price: 29, students: 1280, progress: 68, lessons: 32, rating: 4.9 },
  { id: 2, title: 'Modern English Speaking & Fluency', creator: 'Ayaan Teacher', instructor: 'Ayaan Teacher', category: 'Languages', level: 'All levels', price: 19, students: 842, progress: 42, lessons: 24, rating: 4.8 },
  { id: 3, title: 'Build Your First Online Business', creator: 'Hassan Noor', instructor: 'Hassan Noor', category: 'Business', level: 'Intermediate', price: 49, students: 516, progress: 12, lessons: 41, rating: 4.9 },
  { id: 4, title: 'Graphic Design From Zero to Pro', creator: 'Sahan Creative', instructor: 'Sahan Creative', category: 'Design', level: 'Beginner', price: 0, students: 2304, progress: 100, lessons: 18, rating: 4.7 },
  { id: 5, title: 'The Executive Power BI Masterclass', creator: 'Mariam Hassan', instructor: 'Mariam Hassan', category: 'Business', level: 'Advanced', price: 129, students: 9340, progress: 0, lessons: 56, rating: 5, premium: true },
  { id: 6, title: 'Photography: See the Light', creator: 'Omar Studio', instructor: 'Omar Studio', category: 'Photography', level: 'All levels', price: 79, students: 7210, progress: 0, lessons: 38, rating: 4.9 },
  { id: 7, title: 'AI for Modern Work & Automation', creator: 'Nadia Ahmed', instructor: 'Nadia Ahmed', category: 'Technology', level: 'Intermediate', price: 59, students: 6800, progress: 0, lessons: 34, rating: 4.9 },
  { id: 8, title: 'Start Investing With Confidence', creator: 'Yusuf Finance', instructor: 'Yusuf Finance', category: 'Finance', level: 'Beginner', price: 69, students: 4200, progress: 0, lessons: 27, rating: 4.8 },
]

const nav = [
  ['home', 'Home'],
  ['discover', 'Discover'],
  ['learning', 'My learning'],
  ['community', 'Community'],
  ['live', 'Live & events'],
  ['messages', 'Messages']
]

const categories = ['All', 'Business', 'Design', 'Technology', 'Languages', 'Photography', 'Finance']

function Icon({ name, size = 18 }) {
  const p = {
    home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    book: <><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 1 4 17.5z"/><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    user: <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    calendar: <><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
    message: <path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 9.7 9.7 0 0 1-4-.8L3 21l1.8-4A8.1 8.1 0 0 1 3 11.5 8.38 8.38 0 0 1 12 3a8.38 8.38 0 0 1 9 8.5Z"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.3 1a8 8 0 0 0-1.7-1L14.6 3h-4l-.3 2.1a8 8 0 0 0-1.7 1l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a8 8 0 0 0 1.7 1l.3 2.1h4l.3-2.1a8 8 0 0 0 1.7-1l2.3 1 2-3.4-2-1.5c.1-.3.1-.7.1-1Z"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    menu: <><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></>,
    chevronLeft: <path d="m15 18-6-6 6-6"/>,
    chevronRight: <path d="m9 18 6-6-6-6"/>,
    award: <><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></>,
    play: <polygon points="5 3 19 12 5 21 5 3"/>,
    flame: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.38 0 2.5-1.12 2.5-2.5 0-.61-.22-1.17-.59-1.6-.74-.88-1.91-2.9-1.91-2.9s-1.17 2.02-1.91 2.9c-.37.43-.59.99-.59 1.6zM12 2c-.67 0-1.3.26-1.78.73-.48.47-.72 1.1-.72 1.77 0 1.25.75 2.5 1.5 3.5.75-1 1.5-2.25 1.5-3.5 0-.67-.24-1.3-.72-1.77C13.3 2.26 12.67 2 12 2z"/>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></>,
    copy: <><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></>
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {p[name] || p.home}
    </svg>
  )
}

function readStorage(key, fallback) {
  try {
    const val = localStorage.getItem(key)
    return val ? JSON.parse(val) : fallback
  } catch {
    return fallback
  }
}

function writeStorage(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val))
  } catch {}
}

export default function App({ onNavigateTeach, onNavigateHome }) {
  const { t, language, dir } = useLanguage()
  const [page, setPage] = useState('home')
  const [profileTab, setProfileTab] = useState('profile')
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [toast, setToast] = useState('')
  const [selected, setSelected] = useState(null)
  
  // Refs for click outside popovers
  const profileMenuRef = useRef(null)
  const notifRef = useRef(null)
  
  // Sidebar state: 'expanded' (full) or 'collapsed' (half-visible / compact icon rail)
  const [sidebarState, setSidebarState] = useState(() => readStorage('sahan_sidebar_mode', 'expanded'))
  
  // Notification popover state
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState(() => [
    { id: 1, title: 'Certificate Issued!', desc: 'You completed Excel & Power BI for Real Work.', time: '10m ago', unread: true, type: 'gold', target: 'profile', tab: 'certificates' },
    { id: 2, title: 'Live Office Hours Soon', desc: 'Power BI Q&A with Mariam Hassan starts in 1 hour.', time: '45m ago', unread: true, type: 'blue', target: 'live' },
    { id: 3, title: 'Welcome to Sahan', desc: 'Your student profile & personalized path are active.', time: '2h ago', unread: true, type: 'green', target: 'home' },
    { id: 4, title: 'New Community Reply', desc: 'Mariam replied to your Power BI dashboard question.', time: '1d ago', unread: false, type: 'purple', target: 'community' }
  ])

  // Profile state synced with landing onboarding survey & settings
  const [profile, setProfile] = useState(() => {
    return readStorage('sahan_student_profile', {
      fullName: 'Abdikadir Mohamed',
      email: 'student@sahan.com',
      phone: '+252 61 2345678',
      avatarUrl: '',
      bio: 'Learner at Sahan Academy',
      interests: ['Excel & Data Analysis', 'Languages'],
      goal: 'Advance my career',
      weeklyGoal: '5 hours',
      emailUpdates: true,
      reminders: true,
      liveAlerts: true
    })
  })

  // Courses and enrollment state
  const [courses] = useState(initialCourses)
  const [enrolled, setEnrolled] = useState(() => readStorage('sahan_enrolled', [1, 2, 4]))
  const [saved, setSaved] = useState(() => readStorage('sahan_saved', [5]))

  useEffect(() => writeStorage('sahan_sidebar_mode', sidebarState), [sidebarState])
  useEffect(() => {
    writeStorage('sahan_student_profile', profile)
    // Synchronize to admin learner surveys
    try {
      const stored = JSON.parse(localStorage.getItem('sahan_learner_surveys') || '[]')
      if (stored.length > 0 && profile.email) {
        const updated = stored.map(s => s.email === profile.email ? {
          ...s,
          fullName: profile.fullName || s.fullName,
          phone: profile.phone || s.phone,
          interests: profile.interests || s.interests,
          goal: profile.goal || s.goal,
          avatarUrl: profile.avatarUrl || s.avatarUrl
        } : s)
        localStorage.setItem('sahan_learner_surveys', JSON.stringify(updated))
      }
    } catch {}
  }, [profile])
  useEffect(() => writeStorage('sahan_enrolled', enrolled), [enrolled])
  useEffect(() => writeStorage('sahan_saved', saved), [saved])

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const notify = (msg) => {
    setToast(msg)
    clearTimeout(window.__sahanToast)
    window.__sahanToast = setTimeout(() => setToast(''), 3000)
  }

  const go = (p) => {
    setPage(p)
    setNotifOpen(false)
    setProfileMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openProfile = (tab = 'profile') => {
    setProfileTab(tab)
    setProfileMenuOpen(false)
    setNotifOpen(false)
    setPage('profile')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleSidebar = () => {
    setSidebarState(s => s === 'expanded' ? 'collapsed' : 'expanded')
  }

  const toggleSave = (id) => {
    setSaved(v => {
      const exists = v.includes(id)
      const next = exists ? v.filter(x => x !== id) : [...v, id]
      notify(exists ? t('saved', 'Course removed from saved.') : t('saved', 'Course saved to your library.'))
      return next
    })
  }

  const buyOrEnroll = (c) => {
    if (!enrolled.includes(c.id)) {
      setEnrolled(v => [...v, c.id])
    }
    notify(`${t('enroll', 'Enrolled')}: ${c.title}!`)
    setSelected(null)
    go('learning')
  }

  const markAllNotifsRead = () => {
    setNotifications(items => items.map(i => ({ ...i, unread: false })))
    notify(t('allRead', 'All notifications marked as read.'))
  }

  const handleNotifClick = (n) => {
    setNotifications(items => items.map(i => i.id === n.id ? { ...i, unread: false } : i))
    setNotifOpen(false)
    if (n.target === 'profile' || n.target === 'certificates' || n.target === 'settings') {
      openProfile(n.tab || (n.target === 'certificates' ? 'certificates' : n.target === 'settings' ? 'settings' : 'profile'))
    } else if (n.target) {
      go(n.target)
    }
  }

  const unreadCount = useMemo(() => notifications.filter(n => n.unread).length, [notifications])

  const filteredCourses = useMemo(() => {
    return courses.filter(c => `${c.title} ${c.creator} ${c.category}`.toLowerCase().includes(query.toLowerCase()))
  }, [courses, query])

  const handleNavGo = (id) => {
    if (id === 'profile' || id === 'certificates' || id === 'settings') {
      openProfile(id === 'certificates' ? 'certificates' : id === 'settings' ? 'settings' : 'profile')
    } else {
      go(id)
    }
    if (typeof window !== 'undefined' && window.innerWidth <= 900 && sidebarState === 'expanded') {
      setSidebarState('collapsed')
    }
  }

  const getNavLabel = (id) => {
    switch (id) {
      case 'home': return t('navHome', 'Home')
      case 'discover': return t('navExplore', 'Discover')
      case 'learning': return t('navLearning', 'My learning')
      case 'community': return t('navCommunity', 'Community')
      case 'live': return t('navLive', 'Live & events')
      case 'messages': return t('navMessages', 'Messages')
      case 'profile': return t('navProfile', 'Profile')
      default: return id
    }
  }

  return (
    <div className={`sahan-app lang-${language}`} dir={dir}>
      {/* Mobile Backdrop for Sidebar Drawer */}
      {sidebarState === 'expanded' && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarState('collapsed')}
          aria-label="Close sidebar"
        />
      )}

      {/* Dynamic Sidebar with Collapsible / Half-Visible rail mode */}
      <aside className={`sidebar ${sidebarState}`}>
        <div className="sidebar-header">
          <button className="brand" onClick={() => handleNavGo('home')}>
            <span className="brand-mark">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                <path d="M9 7h6"/>
                <path d="M9 11h4"/>
              </svg>
            </span>
            {sidebarState === 'expanded' && (
              <div className="brand-info">
                <strong>Sahan</strong>
                <small>{t('studentDashboard', 'Student Learning Space')}</small>
              </div>
            )}
          </button>
          
          <button className="collapse-btn" onClick={toggleSidebar} title={sidebarState === 'expanded' ? 'Collapse sidebar' : 'Expand sidebar'}>
            <Icon name={sidebarState === 'expanded' ? (dir === 'rtl' ? 'chevronRight' : 'chevronLeft') : (dir === 'rtl' ? 'chevronLeft' : 'chevronRight')} size={14} />
          </button>
        </div>

        {sidebarState === 'expanded' && <div className="side-label">{t('learningMenu', 'LEARNING MENU')}</div>}

        {nav.map(([id]) => {
          const label = getNavLabel(id)
          const iconName = id === 'home' ? 'home' : id === 'discover' ? 'search' : id === 'learning' ? 'book' : id === 'community' ? 'users' : id === 'live' ? 'calendar' : 'message'
          return (
            <button
              key={id}
              className={`nav-item ${page === id ? 'active' : ''}`}
              onClick={() => handleNavGo(id)}
              title={label}
            >
              <span className="nav-icon"><Icon name={iconName} size={17} /></span>
              {sidebarState === 'expanded' && <span>{label}</span>}
            </button>
          )
        })}

        <div className="sidebar-spacer" />

        {/* Profile Card in Sidebar - Clicking immediately opens Profile Hub on top */}
        <button className={`profile-mini ${page === 'profile' ? 'active' : ''}`} onClick={() => openProfile('profile')} title="View and edit your profile">
          <div className="avatar">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.fullName} />
            ) : (
              <span>{profile.fullName ? profile.fullName[0].toUpperCase() : 'A'}</span>
            )}
          </div>
          {sidebarState === 'expanded' && (
            <div className="brand-info profile-mini-info">
              <strong style={{ fontSize: '12px' }}>{profile.fullName || 'Student'}</strong>
              <small>{t('editProfile', 'Student Â· View Profile')}</small>
            </div>
          )}
        </button>
      </aside>

      {/* Main Content Area */}
      <main className={`main-content sidebar-${sidebarState}`}>
        {/* Sticky Topbar */}
        <header className="topbar">
          <button className="topbar-toggle" onClick={toggleSidebar} title="Toggle sidebar view">
            <Icon name="menu" size={17} />
          </button>

          <button className="mobile-brand" onClick={() => handleNavGo('home')}>
            <span className="brand-mark sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                <path d="M9 7h6"/>
                <path d="M9 11h4"/>
              </svg>
            </span>
            <span>Sahan</span>
          </button>

          {/* Quick Mobile Streak Badge */}
          <div className="mobile-streak-badge" title="Daily study streak: 3 days active">
            <span>ðŸ”¥</span>
            <b>{t('streakDays', '3d streak')}</b>
          </div>

          <div className="global-search">
            <Icon name="search" size={16} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t('searchPlaceholder', 'Search courses, teachers...')}
            />
            {query && (
              <button className="search-clear-btn" onClick={() => setQuery('')} title={t('clear', 'Clear search')}>
                <Icon name="close" size={12} />
              </button>
            )}
          </div>

          <div className="top-actions">
            {/* Language Switcher in App Header */}
            <LanguageSwitcher />

            {/* Notification Bell with interactive Popover */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                className="icon-btn"
                onClick={() => setNotifOpen(o => !o)}
                title={t('notifications', 'Notifications')}
              >
                <Icon name="bell" size={17} />
                {unreadCount > 0 && <span className="badge-dot" />}
              </button>

              {/* Notification Popover Dropdown */}
              {notifOpen && (
                <div className="notif-popover">
                  <div className="notif-header">
                    <h4>{t('notifications', 'Notifications')}</h4>
                    {unreadCount > 0 && (
                      <button onClick={markAllNotifsRead}>{t('allRead', 'Mark all read')}</button>
                    )}
                  </div>
                  <div className="notif-list">
                    {notifications.map(n => (
                      <button
                        key={n.id}
                        className={`notif-item ${n.unread ? 'unread' : ''}`}
                        onClick={() => handleNotifClick(n)}
                      >
                        <div className={`notif-icon ${n.type}`}>
                          {n.type === 'gold' ? 'ðŸ†' : n.type === 'blue' ? 'ðŸ”´' : n.type === 'green' ? 'âœ“' : 'ðŸ’¬'}
                        </div>
                        <div className="notif-content">
                          <strong>{n.title}</strong>
                          <p>{n.desc}</p>
                          <span>{n.time}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="notif-footer">
                    <button onClick={() => openProfile('settings')}>{t('notifPrefs', 'Notification preferences')}</button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile on Top: Clickable Profile Avatar with Dropdown housing Profile, Certificates, Settings & Security */}
            <div style={{ position: 'relative' }} ref={profileMenuRef}>
              <button
                className={`avatar avatar-sm ${profileMenuOpen ? 'ring-active' : ''}`}
                onClick={() => setProfileMenuOpen(o => !o)}
                title={`Profile: ${profile.fullName} (Click to open menu)`}
                aria-expanded={profileMenuOpen}
              >
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.fullName} />
                ) : (
                  <span>{profile.fullName ? profile.fullName[0].toUpperCase() : 'A'}</span>
                )}
              </button>

              {/* Dropdown Menu inside Profile on Top */}
              {profileMenuOpen && (
                <div className="profile-popover">
                  <div className="profile-popover-header">
                    <div className="avatar avatar-sm">
                      {profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt={profile.fullName} />
                      ) : (
                        <span>{profile.fullName ? profile.fullName[0].toUpperCase() : 'A'}</span>
                      )}
                    </div>
                    <div>
                      <strong>{profile.fullName || 'Student'}</strong>
                      <small>{profile.email || 'student@sahan.com'}</small>
                      <span className="profile-popover-badge">ðŸŽ“ {t('student', 'Student')}</span>
                    </div>
                  </div>

                  <div className="profile-popover-menu">
                    <button
                      className={`profile-popover-item ${page === 'profile' && profileTab === 'profile' ? 'active' : ''}`}
                      onClick={() => openProfile('profile')}
                    >
                      <span className="profile-popover-icon"><Icon name="user" size={15} /></span>
                      <span>{t('profileDetails', 'Profile Details')}</span>
                    </button>

                    <button
                      className={`profile-popover-item ${page === 'profile' && profileTab === 'certificates' ? 'active' : ''}`}
                      onClick={() => openProfile('certificates')}
                    >
                      <span className="profile-popover-icon"><Icon name="award" size={15} /></span>
                      <span>{t('navCertificates', 'Course Certificates')}</span>
                    </button>

                    <button
                      className={`profile-popover-item ${page === 'profile' && profileTab === 'settings' ? 'active' : ''}`}
                      onClick={() => openProfile('settings')}
                    >
                      <span className="profile-popover-icon"><Icon name="settings" size={15} /></span>
                      <span>{t('navSettings', 'Settings & Preferences')}</span>
                    </button>

                    <button
                      className={`profile-popover-item ${page === 'profile' && profileTab === 'security' ? 'active' : ''}`}
                      onClick={() => openProfile('security')}
                    >
                      <span className="profile-popover-icon"><Icon name="check" size={15} /></span>
                      <span>{t('accountSecurity', 'Account Security')}</span>
                    </button>
                  </div>

                  <div className="profile-popover-footer">
                    <button
                      className="profile-popover-logout"
                      onClick={() => {
                        setProfileMenuOpen(false)
                        notify(t('loggedOut', 'Logged out of student account.'))
                        if (onNavigateHome) onNavigateHome()
                      }}
                    >
                      <Icon name="close" size={13} />
                      <span>{t('logOut', 'Log Out of Sahan')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Views */}
        <div className="content-wrap">
          {page === 'home' && (
            <HomeView
              go={go}
              openProfile={openProfile}
              onOpen={setSelected}
              enrolled={enrolled}
              profile={profile}
              courses={courses}
            />
          )}

          {page === 'discover' && (
            <DiscoverView
              courses={filteredCourses}
              onOpen={setSelected}
              saved={saved}
              toggle={toggleSave}
            />
          )}

          {page === 'learning' && (
            <LearningView
              courses={courses.filter(c => enrolled.includes(c.id))}
              go={go}
              onOpen={setSelected}
            />
          )}

          {page === 'community' && <CommunityView notify={notify} />}
          {page === 'live' && <LiveView notify={notify} />}
          {page === 'messages' && <MessagesView notify={notify} />}

          {/* Unified Profile Hub (housing Profile Details, Certificates, Settings & Security) */}
          {(page === 'profile' || page === 'certificates' || page === 'settings') && (
            <ProfileHubView
              activeTab={profileTab}
              setActiveTab={setProfileTab}
              profile={profile}
              setProfile={setProfile}
              courses={courses}
              enrolled={enrolled}
              notify={notify}
              onNavigateHome={onNavigateHome}
            />
          )}
        </div>
      </main>

      {/* Native Mobile Bottom Navigation Bar without cluttered certificates or settings */}
      <nav className="mobile-tab-bar" aria-label="Mobile Navigation">
        <button
          className={`mobile-tab-item ${page === 'home' ? 'active' : ''}`}
          onClick={() => handleNavGo('home')}
        >
          <div className="mobile-tab-icon-wrap">
            <Icon name="home" size={20} />
          </div>
          <span>{t('navHome', 'Home')}</span>
        </button>

        <button
          className={`mobile-tab-item ${page === 'discover' ? 'active' : ''}`}
          onClick={() => handleNavGo('discover')}
        >
          <div className="mobile-tab-icon-wrap">
            <Icon name="search" size={20} />
          </div>
          <span>{t('navExplore', 'Explore')}</span>
        </button>

        <button
          className={`mobile-tab-item ${page === 'learning' ? 'active' : ''}`}
          onClick={() => handleNavGo('learning')}
        >
          <div className="mobile-tab-icon-wrap">
            <Icon name="book" size={20} />
            {enrolled.length > 0 && <span className="mobile-tab-badge">{enrolled.length}</span>}
          </div>
          <span>{t('navLearning', 'Learning')}</span>
        </button>

        <button
          className={`mobile-tab-item ${page === 'community' ? 'active' : ''}`}
          onClick={() => handleNavGo('community')}
        >
          <div className="mobile-tab-icon-wrap">
            <Icon name="users" size={20} />
          </div>
          <span>{t('navCommunity', 'Community')}</span>
        </button>

        <button
          className={`mobile-tab-item ${page === 'profile' ? 'active' : ''}`}
          onClick={() => openProfile('profile')}
        >
          <div className="mobile-tab-icon-wrap">
            <Icon name="user" size={20} />
          </div>
          <span>{t('navProfile', 'Profile')}</span>
        </button>
      </nav>

      {/* Course Modal */}
      {selected && (
        <CourseModal
          course={selected}
          enrolled={enrolled.includes(selected.id)}
          saved={saved.includes(selected.id)}
          onClose={() => setSelected(null)}
          onBuy={buyOrEnroll}
          onSave={() => toggleSave(selected.id)}
        />
      )}

      {/* Global Toast */}
      {toast && <div className="toast">âœ“ {toast}</div>}
    </div>
  )
}

/* ---------------- Home View ---------------- */
function HomeView({ go, onOpen, enrolled, profile, courses }) {
  const { t, dir } = useLanguage()
  const promotedId = readStorage('sahan_promoted_course_id', 1)
  const featured = courses.find(c => c.id === Number(promotedId)) || courses[0]
  const enrolledCourses = courses.filter(c => enrolled.includes(c.id))
  const primaryEnrolled = enrolledCourses[0]

  return (
    <>
      <section className="welcome">
        <div>
          <div className="eyebrow-row">
            <span className="eyebrow">{t('studentDashboard', 'SAHAN STUDENT DASHBOARD')}</span>
            <span className="streak-pill-tag">ðŸ”¥ {t('streakDays', '3-Day Streak')}</span>
          </div>
          <h1>
            {t('welcomeBack', 'Welcome back')},<br />
            <em>{profile.fullName ? profile.fullName.split(' ')[0] : 'Learner'}</em>
          </h1>
          <p>
            {t('pickUpJourney', 'Pick up where you left off or explore new courses in your learning journey.')}
          </p>
          <div className="actions">
            <button className="primary" onClick={() => go('discover')}>
              {t('discoverCourses', 'Discover courses')} <Icon name={dir === 'rtl' ? 'chevronLeft' : 'arrow'} size={14} />
            </button>
            <button className="ghost" onClick={() => go('learning')}>
              {t('continueLearning', 'Continue learning')} ({enrolledCourses.length})
            </button>
          </div>
        </div>

        <button className="hero-card" onClick={() => onOpen(featured)}>
          <div className="hero-card-top">
            <span className="premium-label">
              <span>ðŸŒŸ</span> {t('sponsoredClass', 'SPONSORED CLASS')}
            </span>
            <span style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: '600' }}>
              {t('instructor', 'Instructor')}: {featured.instructor || featured.creator}
            </span>
          </div>
          <div className="hero-card-content">
            <small>{t('featuredPromo', 'FEATURED PROMOTION')}</small>
            <h2>{featured.title}</h2>
            <p>{t('practicalLessons', 'Practical lessons taught by experienced industry leaders.')}</p>
            <span>â˜…â˜…â˜…â˜…â˜… {featured.rating} Â· {featured.students.toLocaleString()} {t('students', 'students')} Â· {featured.lessons} {t('lessons', 'lessons')}</span>
            <b>{t('startLearning', 'Start learning')} <Icon name={dir === 'rtl' ? 'chevronLeft' : 'arrow'} size={13} /></b>
          </div>
        </button>
      </section>

      {/* Mobile-First Active Course Resume Card */}
      {primaryEnrolled && (
        <div className="resume-strip" onClick={() => onOpen(primaryEnrolled)}>
          <div className="resume-strip-left">
            <div className={`resume-strip-cover c${(primaryEnrolled.id % 6) + 1}`}>
              <Icon name="play" size={14} />
            </div>
            <div className="resume-strip-info">
              <small>{t('continueWhereLeft', 'CONTINUE WHERE YOU LEFT OFF')}</small>
              <strong>{primaryEnrolled.title}</strong>
              <div className="resume-progress-bar-wrap">
                <div className="resume-progress-bar" style={{ width: `${primaryEnrolled.progress || 50}%` }} />
              </div>
            </div>
          </div>
          <button className="resume-action-btn" onClick={(e) => { e.stopPropagation(); onOpen(primaryEnrolled); }}>
            <span>{t('resume', 'Resume')}</span>
            <Icon name={dir === 'rtl' ? 'chevronLeft' : 'arrow'} size={12} />
          </button>
        </div>
      )}

      {/* Quick Category Chips for Fast Mobile Browsing */}
      <div className="quick-category-row">
        {['Business', 'Technology', 'Languages', 'Design', 'Finance'].map(cat => (
          <button
            key={cat}
            className="quick-cat-chip"
            onClick={() => go('discover')}
          >
            <span>{cat === 'Business' ? 'ðŸ’¼' : cat === 'Technology' ? 'âš¡' : cat === 'Languages' ? 'ðŸ—£' : cat === 'Design' ? 'ðŸŽ¨' : 'ðŸ“ˆ'}</span>
            <span>{t(cat.toLowerCase(), cat)}</span>
          </button>
        ))}
      </div>

      <div className="section-head">
        <div>
          <h2>{t('yourActiveCourses', 'Your Active Courses')}</h2>
          <p>{t('resumeStructured', 'Resume your structured lessons and assignments.')}</p>
        </div>
        <button className="text-btn" onClick={() => go('learning')}>
          {t('viewAll', 'View all')} ({enrolledCourses.length}) <Icon name={dir === 'rtl' ? 'chevronLeft' : 'arrow'} size={12} />
        </button>
      </div>

      <div className="course-grid">
        {enrolledCourses.slice(0, 3).map(c => (
          <CourseCard key={c.id} course={c} onClick={() => onOpen(c)} />
        ))}
      </div>

      <div className="section-head" style={{ marginTop: '40px' }}>
        <div>
          <h2>{t('trendingOnSahan', 'Trending on Sahan')}</h2>
          <p>{t('highestRatedCourses', 'The highest rated courses students are taking right now.')}</p>
        </div>
        <button className="text-btn" onClick={() => go('discover')}>
          {t('exploreCatalog', 'Explore catalog')} <Icon name={dir === 'rtl' ? 'chevronLeft' : 'arrow'} size={12} />
        </button>
      </div>

      <div className="top-ten">
        {courses.slice(0, 5).map((c, i) => (
          <button className="rank-row" key={c.id} onClick={() => onOpen(c)}>
            <strong>{String(i + 1).padStart(2, '0')}</strong>
            <span className={`rank-cover c${(i % 6) + 1}`}>{c.title[0]}</span>
            <span>
              <b>{c.title}</b>
              <small>{c.creator} Â· {c.students.toLocaleString()} {t('students', 'students')}</small>
            </span>
            <span>â˜… {c.rating}</span>
            <strong>{c.price ? `$${c.price}` : t('free', 'Free')}</strong>
            <Icon name={dir === 'rtl' ? 'chevronLeft' : 'arrow'} size={14} />
          </button>
        ))}
      </div>
    </>
  )
}

/* ---------------- Discover View ---------------- */
function DiscoverView({ courses, onOpen, saved, toggle }) {
  const { t } = useLanguage()
  const [cat, setCat] = useState('All')
  const list = cat === 'All' ? courses : courses.filter(c => c.category === cat)

  return (
    <>
      <div className="page-title">
        <div className="eyebrow">{t('courseCatalog', 'COURSE CATALOG')}</div>
        <h1>{t('exploreSkills', 'Explore skills & courses.')}</h1>
        <p>{t('findYourNextPath', 'Find your next path across technology, business, design, and languages.')}</p>
      </div>

      <div className="filter-row">
        {categories.map(c => (
          <button
            key={c}
            className={cat === c ? 'active' : ''}
            onClick={() => setCat(c)}
          >
            {c === 'All' ? t('allCategories', 'All') : t(c.toLowerCase(), c)}
          </button>
        ))}
      </div>

      <div className="course-grid four">
        {list.map(c => (
          <div className="discover-item" key={c.id}>
            <CourseCard course={c} onClick={() => onOpen(c)} />
            <button className="save-btn" onClick={(e) => { e.stopPropagation(); toggle(c.id); }}>
              {saved.includes(c.id) ? t('saved', 'Saved') : t('save', 'Save')}
            </button>
          </div>
        ))}
      </div>
    </>
  )
}

/* ---------------- Learning View ---------------- */
function LearningView({ courses, go, onOpen }) {
  const { t } = useLanguage()
  return (
    <>
      <div className="page-title">
        <div className="eyebrow">{t('studentLibrary', 'STUDENT LIBRARY')}</div>
        <h1>{t('myLearningSpace', 'My Learning Space')}</h1>
        <p>{t('keepTrackProgress', 'Keep track of your course progress, lessons done, and certificates.')}</p>
      </div>

      {courses.length ? (
        <>
          <div className="stats-row">
            <div className="stat">
              <b>{courses.length}</b>
              <span>{t('enrolledCourses', 'Enrolled Courses')}</span>
            </div>
            <div className="stat">
              <b>{courses.reduce((a, c) => a + Math.round((c.lessons * (c.progress || 0)) / 100), 0)}</b>
              <span>{t('lessonsCompleted', 'Lessons Completed')}</span>
            </div>
            <div className="stat">
              <b>8h 30m</b>
              <span>{t('totalLearningTime', 'Total Learning Time')}</span>
            </div>
            <div className="stat">
              <b>1</b>
              <span>{t('verifiedCertificate', 'Verified Certificate')}</span>
            </div>
          </div>

          <div className="course-grid">
            {courses.map(c => (
              <CourseCard key={c.id} course={c} onClick={() => onOpen(c)} />
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <h2>{t('libraryEmpty', 'Your course library is empty.')}</h2>
          <p>{t('findTopicStart', 'Find a topic you want to learn and start building skills today.')}</p>
          <button className="primary" onClick={() => go('discover')}>
            {t('browseCatalog', 'Browse course catalog')}
          </button>
        </div>
      )}
    </>
  )
}

/* ---------------- Unified Profile Hub (housing Profile, Certificates, Settings & Security) ---------------- */
function ProfileHubView({
  activeTab,
  setActiveTab,
  profile,
  setProfile,
  courses,
  enrolled,
  notify,
  onNavigateHome
}) {
  const { t, language, setLanguage } = useLanguage()
  const [form, setForm] = useState(profile)
  const [customCertName, setCustomCertName] = useState(profile.fullName || 'Abdikadir Mohamed')
  const [selectedCertIndex, setSelectedCertIndex] = useState(0)
  const fileInputRef = useRef(null)

  // Keep customCertName in sync if user changes profile full name
  useEffect(() => {
    if (profile.fullName) {
      setCustomCertName(profile.fullName)
    }
  }, [profile.fullName])

  const certData = [
    {
      course: 'Excel & Power BI for Real Work',
      issuer: 'Sahan Academy',
      instructor: 'Mariam Hassan',
      date: 'August 12, 2026',
      serial: 'SAH-2026-001284',
      grade: 'With Distinction'
    },
    {
      course: 'Graphic Design From Zero to Pro',
      issuer: 'Sahan Creative',
      instructor: 'Sahan Creative Team',
      date: 'July 28, 2026',
      serial: 'SAH-2026-000942',
      grade: 'Completed'
    }
  ]

  const activeCert = certData[selectedCertIndex] || certData[0]

  const copyVerifyLink = () => {
    const link = `https://sahan.com/verify/${activeCert.serial}`
    navigator.clipboard?.writeText(link)
    notify(`${t('verificationLinkCopied', 'Verification link copied to clipboard')}: ${link}`)
  }

  const printCert = () => {
    notify(t('preparingPrint', 'Preparing certificate print dialog...'))
    window.print()
  }

  const handleAvatarFile = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setForm(f => ({ ...f, avatarUrl: ev.target.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeAvatar = () => {
    setForm(f => ({ ...f, avatarUrl: '' }))
    notify(t('photoRemoved', 'Profile photo removed.'))
  }

  const saveChanges = (e) => {
    e.preventDefault()
    setProfile(form)
    setCustomCertName(form.fullName)
    notify(t('savedSuccess', 'âœ“ Profile settings saved successfully!'))
  }

  return (
    <div className="settings-container">
      {/* Student Overview Header on Top */}
      <div className="profile-hub-header">
        <div className="profile-hub-main">
          <div className="avatar avatar-lg">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.fullName} />
            ) : (
              <span>{profile.fullName ? profile.fullName[0].toUpperCase() : 'A'}</span>
            )}
          </div>
          <div className="profile-hub-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2>{profile.fullName || 'Student'}</h2>
              <span className="profile-popover-badge">ðŸŽ“ {t('student', 'Student')}</span>
            </div>
            <p>{profile.bio || 'Learner at Sahan Academy'}</p>
            <small>{profile.email} Â· {profile.phone}</small>
          </div>
        </div>

        {/* Quick Stats Rail */}
        <div className="profile-hub-stats">
          <div className="profile-stat-box">
            <span>ðŸ”¥ 3 Days</span>
            <small>{t('streakDays', 'Daily Streak')}</small>
          </div>
          <div className="profile-stat-box">
            <span>ðŸ“š {enrolled.length}</span>
            <small>{t('navLearning', 'Enrolled Courses')}</small>
          </div>
          <div className="profile-stat-box">
            <span>ðŸ† {certData.length}</span>
            <small>{t('navCertificates', 'Certificates')}</small>
          </div>
        </div>
      </div>

      {/* Profile Section Tabs */}
      <div className="settings-nav">
        <button
          className={`settings-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          ðŸ‘¤ {t('profileDetails', 'Profile Details')}
        </button>
        <button
          className={`settings-nav-btn ${activeTab === 'certificates' ? 'active' : ''}`}
          onClick={() => setActiveTab('certificates')}
        >
          ðŸ† {t('navCertificates', 'Course Certificates')}
        </button>
        <button
          className={`settings-nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          âš™ï¸ {t('navSettings', 'Settings & Preferences')}
        </button>
        <button
          className={`settings-nav-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          ðŸ”’ {t('accountSecurity', 'Account Security')}
        </button>
      </div>

      <div className="settings-panel">
        {/* TAB 1: Profile Details */}
        {activeTab === 'profile' && (
          <form onSubmit={saveChanges}>
            <div className="settings-avatar-row">
              <div className="avatar avatar-lg">
                {form.avatarUrl ? (
                  <img src={form.avatarUrl} alt={form.fullName} />
                ) : (
                  <span>{form.fullName ? form.fullName[0].toUpperCase() : 'A'}</span>
                )}
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>{t('profilePhoto', 'Profile Photo')}</strong>
                <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 10px' }}>
                  {t('photoDesc', 'Upload a clean headshot for your student profile and certificates.')}
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="ghost"
                    style={{ padding: '6px 12px', fontSize: '11px' }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {t('uploadPhoto', 'Upload new photo')}
                  </button>
                  {form.avatarUrl && (
                    <button
                      type="button"
                      className="text-btn"
                      style={{ color: '#ef4444', fontSize: '11px' }}
                      onClick={removeAvatar}
                    >
                      {t('remove', 'Remove')}
                    </button>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleAvatarFile}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t('fullLegalName', 'Full Legal Name (For Certificates)')} *</label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={e => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Your Full Name"
                />
              </div>

              <div className="form-group">
                <label>{t('phoneNumber', 'Phone Number (WhatsApp / SMS)')} *</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="+252 61 2345678"
                />
              </div>
            </div>

            <div className="form-group">
              <label>{t('emailAddress', 'Email Address')}</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="your.email@example.com"
              />
            </div>

            <div className="form-group">
              <label>{t('bioHeadline', 'Bio / Headline')}</label>
              <input
                type="text"
                value={form.bio}
                onChange={e => setForm({ ...form, bio: e.target.value })}
                placeholder="e.g. Aspiring Data Analyst & Freelancer"
              />
            </div>

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              <button type="submit" className="primary">
                {t('saveChanges', 'Save Profile Changes')}
              </button>
              <button
                type="button"
                className="ghost"
                onClick={() => setForm(profile)}
              >
                {t('cancel', 'Cancel')}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: Certificates (Directly inside Profile) */}
        {activeTab === 'certificates' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 4px' }}>
                {t('courseCertificates', 'Course Certificates')}
              </h3>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                {t('officialVerified', 'Official verified certificates issued upon completion of Sahan courses.')}
              </p>
            </div>

            <div className="certificate-library">
              {/* Certificate selector */}
              <div className="certificate-list">
                <b>{t('issuedCertificates', 'ISSUED CERTIFICATES')} ({certData.length})</b>
                {certData.map((c, i) => (
                  <button
                    key={c.serial}
                    className={`certificate-list-item ${selectedCertIndex === i ? 'selected' : ''}`}
                    onClick={() => setSelectedCertIndex(i)}
                  >
                    <span className="certificate-thumb">S</span>
                    <div>
                      <b>{c.course}</b>
                      <small>{c.issuer} Â· {c.date}</small>
                    </div>
                    <em>{t('verified', 'Verified')}</em>
                  </button>
                ))}

                <div style={{ marginTop: '20px', padding: '16px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  <strong style={{ fontSize: '11px', display: 'block', marginBottom: '6px' }}>{t('needLegalName', 'Need a formal legal name?')}</strong>
                  <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 10px', lineHeight: '1.4' }}>
                    {t('adjustRecipientDesc', 'You can adjust the recipient name shown on this certificate below.')}
                  </p>
                  <input
                    type="text"
                    value={customCertName}
                    onChange={e => setCustomCertName(e.target.value)}
                    placeholder="Certificate Recipient Name"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                </div>
              </div>

              {/* Certificate Display Paper */}
              <div className="certificate-detail">
                <div className="certificate-paper">
                  <div className="cert-header">
                    <span className="brand-mark" style={{ width: '28px', height: '28px', fontSize: '12px' }}>S</span>
                    <span>SAHAN ACADEMY</span>
                  </div>

                  <div className="cert-seal-badge">â˜…</div>

                  <label>{t('certificateOfCompletion', 'CERTIFICATE OF COMPLETION')}</label>
                  <p style={{ margin: '8px 0 2px' }}>{t('proudlyPresentedTo', 'This is proudly presented to')}</p>
                  
                  <h3>{customCertName || profile.fullName || 'Student Name'}</h3>

                  <p style={{ maxWidth: '440px', lineHeight: '1.5' }}>
                    {t('forCompleting', 'for successfully completing all coursework, lessons, and project requirements for')}
                  </p>
                  <h2>{activeCert.course}</h2>
                  <p style={{ fontSize: '11px' }}>{t('authorizedBy', 'Authorized by')} <b>{activeCert.instructor}</b></p>

                  <footer>
                    <div>
                      <span>{t('issueDate', 'Issue Date')}: <b>{activeCert.date}</b></span><br />
                      <span>{t('certId', 'Certificate ID')}: <b>{activeCert.serial}</b></span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '9px', display: 'block', color: '#16a34a', fontWeight: '700' }}>âœ“ {t('verifiedCredential', 'VERIFIED CREDENTIAL')}</span>
                      <span>Issued by {activeCert.issuer}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '14px', borderBottom: '1px solid #9ca3af', paddingBottom: '2px', display: 'inline-block' }}>
                        {activeCert.instructor}
                      </span><br />
                      <span style={{ fontSize: '9px' }}>{t('courseInstructor', 'Course Instructor')}</span>
                    </div>
                  </footer>
                </div>

                <div className="cert-actions">
                  <button className="primary" onClick={printCert}>
                    <Icon name="download" size={14} /> {t('printSavePdf', 'Print / Save PDF')}
                  </button>
                  <button className="ghost" onClick={copyVerifyLink}>
                    <Icon name="copy" size={14} /> {t('copyVerifyLink', 'Copy Verification Link')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Settings & Preferences */}
        {activeTab === 'settings' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>
                {t('chooseLanguage', 'Choose Platform Language')}
              </h3>
              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
                {t('languageDesc', 'Select your preferred language for the whole Sahan platform. Changes apply immediately.')}
              </p>
              <div style={{ maxWidth: '460px' }}>
                <LanguageSwitcher variant="segmented" />
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '24px 0' }} />

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>
                {t('learningGoals', 'Learning Goals')}
              </h3>
              <div className="form-group">
                <label>{t('weeklyTarget', 'Weekly Learning Target')}</label>
                <select
                  value={form.weeklyGoal}
                  onChange={e => {
                    const updated = { ...form, weeklyGoal: e.target.value }
                    setForm(updated)
                    setProfile(updated)
                    notify(`Weekly target updated to ${e.target.value}.`)
                  }}
                >
                  <option value="2 hours">2 hours / week (Casual pace)</option>
                  <option value="5 hours">5 hours / week (Recommended)</option>
                  <option value="10 hours">10 hours / week (Accelerated)</option>
                  <option value="15 hours+">15+ hours / week (Intensive boot camp)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginTop: '16px' }}>
                <label>{t('primaryFocus', 'Primary Focus')}</label>
                <input
                  type="text"
                  value={form.goal}
                  onChange={e => setForm({ ...form, goal: e.target.value })}
                  placeholder="e.g. Advance my career in business & analytics"
                />
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '24px 0' }} />

            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>
                {t('notifications', 'Notification Preferences')}
              </h3>
              
              <div className="toggle-row">
                <div>
                  <b>{t('emailDigests', 'Email Course Digests')}</b>
                  <small>{t('emailDigestsDesc', 'Receive periodic recommendations and new course notifications.')}</small>
                </div>
                <button
                  type="button"
                  className={`toggle ${form.emailUpdates ? 'on' : ''}`}
                  onClick={() => {
                    const updated = { ...form, emailUpdates: !form.emailUpdates }
                    setForm(updated)
                    setProfile(updated)
                    notify(updated.emailUpdates ? 'Email digests enabled.' : 'Email digests disabled.')
                  }}
                >
                  <i />
                </button>
              </div>

              <div className="toggle-row">
                <div>
                  <b>{t('dailyReminders', 'Daily Learning Reminders')}</b>
                  <small>{t('dailyRemindersDesc', 'Get reminded when you havenâ€™t completed your daily lesson.')}</small>
                </div>
                <button
                  type="button"
                  className={`toggle ${form.reminders ? 'on' : ''}`}
                  onClick={() => {
                    const updated = { ...form, reminders: !form.reminders }
                    setForm(updated)
                    setProfile(updated)
                    notify(updated.reminders ? 'Reminders enabled.' : 'Reminders disabled.')
                  }}
                >
                  <i />
                </button>
              </div>

              <div className="toggle-row">
                <div>
                  <b>{t('liveClassAlerts', 'Live Class & Workshop Alerts')}</b>
                  <small>{t('liveClassAlertsDesc', 'Get notified 15 minutes before instructor live sessions start.')}</small>
                </div>
                <button
                  type="button"
                  className={`toggle ${form.liveAlerts ? 'on' : ''}`}
                  onClick={() => {
                    const updated = { ...form, liveAlerts: !form.liveAlerts }
                    setForm(updated)
                    setProfile(updated)
                    notify(updated.liveAlerts ? 'Live alerts enabled.' : 'Live alerts disabled.')
                  }}
                >
                  <i />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Security */}
        {activeTab === 'security' && (
          <div>
            <div className="toggle-row">
              <div>
                <b>{t('googleAccount', 'Google Account Connection')}</b>
                <small>{t('connectedAs', 'Connected with Google OAuth as')} {form.email}</small>
              </div>
              <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '700' }}>âœ“ {t('connected', 'Connected')}</span>
            </div>

            <div className="toggle-row">
              <div>
                <b>{t('accountStatus', 'Account Status')}</b>
                <small>{t('studentAccess', 'Student Access Â· Free Tier Active')}</small>
              </div>
              <span style={{ fontSize: '11px', color: '#6b7280' }}>{t('active', 'Active')}</span>
            </div>

            <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #f3f4f6' }}>
              <button
                type="button"
                className="ghost"
                style={{ color: '#ef4444' }}
                onClick={() => {
                  notify(t('loggedOut', 'Logged out of student account.'))
                  if (onNavigateHome) onNavigateHome()
                }}
              >
                {t('logOut', 'Log Out of Sahan')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------------- Additional Views ---------------- */
function CommunityView({ notify }) {
  const { t } = useLanguage()
  return (
    <>
      <div className="page-title">
        <div className="eyebrow">{t('communityGroups', 'COMMUNITY & GROUPS')}</div>
        <h1>{t('learnTogether', 'Learn together.')}</h1>
        <p>{t('communityDesc', 'Ask questions, get feedback on projects, and discuss with fellow students.')}</p>
      </div>

      <div className="community-grid">
        {['Power BI & Data Learners', 'Designers in Sahan', 'English Speaking Club'].map((x, i) => (
          <article className="community-card" key={x}>
            <div className={`community-art i${i + 1}`}>{x[0]}</div>
            <h3>{x}</h3>
            <p>{[517, 284, 193][i]} {t('membersActive', 'members active')}</p>
            <button className="primary" onClick={() => notify(`Joined ${x} discussion board.`)}>
              {t('joinGroup', 'Join group')}
            </button>
          </article>
        ))}
      </div>
    </>
  )
}

function LiveView({ notify }) {
  const { t } = useLanguage()
  return (
    <>
      <div className="page-title">
        <div className="eyebrow">{t('liveWorkshops', 'LIVE WORKSHOPS')}</div>
        <h1>{t('interactiveLiveSessions', 'Interactive Live Sessions')}</h1>
        <p>{t('liveDesc', 'Join office hours, live breakdowns, and workshops with teachers.')}</p>
      </div>

      <div className="live-feature">
        <span>â— {t('liveToday', 'LIVE TODAY Â· 5:00 PM')}</span>
        <h2>Power BI Dashboard Masterclass Q&A</h2>
        <p>{t('liveSessionMariam', 'Live troubleshooting, data models, and portfolio reviews with Mariam Hassan.')}</p>
        <button className="primary" onClick={() => notify('Reminder scheduled for 5:00 PM live session.')}>
          {t('setReminder', 'Set reminder')}
        </button>
      </div>
    </>
  )
}

function MessagesView({ notify }) {
  const { t, dir } = useLanguage()
  return (
    <>
      <div className="page-title">
        <div className="eyebrow">{t('directMessages', 'DIRECT MESSAGES')}</div>
        <h1>{t('instructorConversations', 'Instructor Conversations')}</h1>
        <p>{t('messagesDesc', 'Ask questions directly to course teachers and peer study buddies.')}</p>
      </div>

      <div className="message-list">
        {[
          ['Mariam Hassan', 'Your Power BI practice files are ready for review.'],
          ['Ayaan Teacher', 'See you at todayâ€™s English speaking session!'],
          ['Sahan Academy Support', 'Welcome to Sahan! Let us know if you need anything.']
        ].map(([n, text]) => (
          <button className="message-row" key={n} onClick={() => notify(`Opening chat with ${n}...`)}>
            <span className="avatar">{n[0]}</span>
            <span>
              <b>{n}</b>
              <small>{text}</small>
            </span>
            <Icon name={dir === 'rtl' ? 'chevronLeft' : 'arrow'} size={14} />
          </button>
        ))}
      </div>
    </>
  )
}

function CourseCard({ course, onClick }) {
  const { t } = useLanguage()
  const isPromoted = course.id === 1 || course.promoted
  return (
    <button className="course-card" onClick={onClick}>
      <div className={`course-cover c${(course.id % 6) + 1}`}>
        {isPromoted && (
          <b style={{ background: '#ff6b00', color: '#fff', letterSpacing: '0.06em' }}>
            â˜… {t('promoted', 'PROMOTED')}
          </b>
        )}
        {!isPromoted && course.premium && <b>{t('premium', 'PREMIUM')}</b>}
        <span>{t(course.category.toLowerCase(), course.category)}</span>
        <strong>{course.title[0]}</strong>
      </div>
      <div className="course-body">
        <small>{course.level} Â· {course.lessons} {t('lessons', 'lessons')}</small>
        <h3>{course.title}</h3>
        <p>{course.instructor || course.creator}</p>
        <div>
          <span>â˜… {course.rating} Â· {course.students.toLocaleString()} {t('students', 'students')}</span>
          <b>{course.price ? `$${course.price}` : t('free', 'Free')}</b>
        </div>
      </div>
    </button>
  )
}

function CourseModal({ course, enrolled, saved, onClose, onBuy, onSave }) {
  const { t, dir } = useLanguage()
  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="course-modal">
        {/* Mobile bottom-sheet drag bar */}
        <div className="sheet-drag-handle" onClick={onClose} title="Swipe or tap to close" />
        <button className="modal-close" onClick={onClose} aria-label="Close modal"><Icon name="close" size={16} /></button>
        <div className={`modal-cover c${(course.id % 6) + 1}`}>
          <span>{t(course.category.toLowerCase(), course.category)}</span>
          <b>{course.title[0]}</b>
        </div>
        <div className="modal-body">
          <div className="eyebrow">{course.premium ? 'SAHAN PREMIUM' : t('course', 'COURSE')} Â· {course.level}</div>
          <h2>{course.title}</h2>
          <p style={{ color: '#475569', fontWeight: '500', margin: '4px 0 10px' }}>
            {t('taughtBy', 'Taught by')} <strong>{course.instructor || course.creator}</strong>
          </p>
          <div className="modal-meta">
            <span>â˜… {course.rating}</span>
            <span>{course.students.toLocaleString()} {t('students', 'students')}</span>
            <span>{course.lessons} {t('lessons', 'lessons')}</span>
          </div>
          <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.6', margin: '14px 0 20px' }}>
            {t('courseDescLong', 'Build job-ready practical skills with step-by-step video tutorials, guided projects, and instructor feedback.')}
          </p>
          <div className="modal-actions">
            {enrolled ? (
              <button className="primary modal-cta-btn" onClick={onClose}>
                {t('continueLessons', 'Continue lessons')} <Icon name={dir === 'rtl' ? 'chevronLeft' : 'arrow'} size={13} />
              </button>
            ) : (
              <button className="primary modal-cta-btn" onClick={() => onBuy(course)}>
                {course.price ? `${t('enroll', 'Enroll')} $${course.price}` : t('enrollFree', 'Enroll Free')} <Icon name={dir === 'rtl' ? 'chevronLeft' : 'arrow'} size={13} />
              </button>
            )}
            <button className="ghost modal-save-btn" onClick={onSave}>
              {saved ? `âœ“ ${t('savedInLibrary', 'Saved in Library')}` : t('saveForLater', 'Save for later')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

