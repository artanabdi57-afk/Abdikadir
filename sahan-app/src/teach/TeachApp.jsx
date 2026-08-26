import React, { useEffect, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';
import '../styles/teach.css';

const API = '/api';
const tokenKey = 'sahan_teach_token';
const userKey = 'sahan_teach_user';

const api = async (path, options = {}) => {
  const token = localStorage.getItem(tokenKey);
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || 'Request failed');
  return body;
};

export default function TeachApp({ onNavigateHome }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(userKey) || 'null');
    } catch {
      return null;
    }
  });
  const [path, setPath] = useState(() => window.location.pathname.startsWith('/teach') ? window.location.pathname.replace('/teach', '') || '/dashboard' : '/dashboard');
  const [error, setError] = useState('');

  const go = (p) => {
    setPath(p);
    setError('');
  };

  const logout = () => {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    setUser(null);
    go('/login');
  };

  if (path === '/auth/callback') {
    return <AuthCallback onLogin={(u) => { setUser(u); go(u.role === 'admin' ? '/admin/promotion-queue' : '/dashboard'); }} />;
  }

  if (!user) {
    return (
      <Login
        onLogin={(u) => {
          setUser(u);
          go(u.role === 'admin' ? '/admin/promotion-queue' : '/dashboard');
        }}
        onNavigateHome={onNavigateHome}
      />
    );
  }

  const admin = user.role === 'admin';

  return (
    <Shell user={user} go={go} logout={logout} admin={admin} onNavigateHome={onNavigateHome}>
      {admin ? <AdminRouter path={path} go={go} setError={setError} /> : <InstructorRouter path={path} go={go} setError={setError} />}
      {error && <div className="toast error">{error}</div>}
    </Shell>
  );
}

function AuthCallback({ onLogin }) {
  const [error, setError] = useState('');
  useEffect(() => {
    const hash = new URLSearchParams(location.hash.replace(/^#/, ''));
    const query = new URLSearchParams(location.search);
    const accessToken = hash.get('access_token') || query.get('access_token');
    if (!accessToken) {
      setError('The sign-in link is missing its session. Please request a new magic link.');
      return;
    }
    api('/auth/exchange', { method: 'POST', body: JSON.stringify({ access_token: accessToken }) })
      .then((b) => {
        localStorage.setItem(tokenKey, b.token);
        localStorage.setItem(userKey, JSON.stringify(b.user));
        onLogin(b.user);
      })
      .catch((e) => setError(e.message));
  }, [onLogin]);

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="logo">
          <span>S</span>
          <div>
            <b>Sahan</b>
            <small>Teach</small>
          </div>
        </div>
        <div className="eyebrow">SECURE SIGN-IN</div>
        <h1>Finishing sign-in…</h1>
        <p className="muted">We are verifying your approved Sahan teaching account.</p>
        {error && (
          <>
            <div className="alert">{error}</div>
            <button className="secondary wide callback-link" onClick={() => window.location.reload()}>Return to login</button>
          </>
        )}
      </div>
    </div>
  );
}

function Login({ onLogin, onNavigateHome }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const b = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      localStorage.setItem(tokenKey, b.token);
      localStorage.setItem(userKey, JSON.stringify(b.user));
      onLogin(b.user);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const sendMagic = async () => {
    setBusy(true);
    setErr('');
    try {
      const b = await api('/auth/magic-link', { method: 'POST', body: JSON.stringify({ email }) });
      setMsg(b.message);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };


  return (
    <div className="auth">
      <div className="auth-card">
        <div className="logo" style={{ cursor: 'pointer' }} onClick={onNavigateHome}>
          <span>S</span>
          <div>
            <b>Sahan</b>
            <small>Creator & Instructor Portal</small>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
          <LanguageSwitcher variant="pill" />
        </div>

        <div className="eyebrow">CREATOR & INSTRUCTOR PORTAL</div>
        <h1>Create, publish and teach.</h1>
        <p className="muted">Publish your courses, manage your learners and track your earnings on Sahan.</p>
        

        {err && <div className="alert">{err}</div>}
        {msg && <div className="success">{msg}</div>}

        <form onSubmit={submit}>
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" required />
          </label>
          <button className="primary wide" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        </form>

        <div className="or"><span />or<span /></div>
        <button className="secondary wide" onClick={sendMagic} disabled={busy || !email}>
          {busy ? 'Sending…' : 'Email me a magic link'}
        </button>
        
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button className="header-link" style={{ fontSize: '12px', color: '#7c5cff' }} onClick={onNavigateHome}>
            ← Back to learner platform
          </button>
        </div>
        <p className="login-note" style={{ marginTop: '12px' }}>Creator accounts are reviewed before they can publish courses on Sahan.</p>
      </div>
    </div>
  );
}

function Shell({ user, go, logout, admin, onNavigateHome, children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navItems = admin
    ? [
        ['/admin/surveys', 'Student leads', '📋'],
        ['/admin/promotion-queue', 'Ad Control & Promos', '↗'],
        ['/admin/courses', 'Course ranking', '◎'],
        ['/admin/instructors', 'Instructors', '♙'],
      ]
    : [
        ['/dashboard', 'Dashboard', '⌂'],
        ['/courses', 'Courses', '▤'],
        ['/payouts', 'Payouts', '$'],
      ];

  const handleMobileNav = (p) => {
    go(p);
    setMobileMenuOpen(false);
  };

  return (
    <div className="portal">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="portal-mobile-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={mobileMenuOpen ? 'mobile-open' : ''}>
        <div className="brand" style={{ cursor: 'pointer' }} onClick={onNavigateHome}>
          <span style={{ display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, #ff6b00 0%, #ea580c 100%)', color: '#fff', boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              <path d="M9 7h6"/>
              <path d="M9 11h4"/>
            </svg>
          </span>
          <div>
            <b>Sahan</b>
            <small>Creator Portal</small>
          </div>
        </div>
        <div className="portal-label">{admin ? 'ADMIN CONTROL' : 'CREATOR PORTAL'}</div>
        <Nav go={handleMobileNav} items={navItems} />

        <div className="side-bottom">
          <div className="mini-user">
            <span>{(user.name || 'A').slice(0, 1)}</span>
            <div>
              <b>{user.name}</b>
              <small>{user.email}</small>
            </div>
          </div>
          <button className="ghost-link" onClick={logout}>Sign out</button>
        </div>
      </aside>

      <main>
        <header>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="portal-mobile-toggle"
              onClick={() => setMobileMenuOpen(o => !o)}
              title="Toggle Menu"
            >
              ☰
            </button>
            <div>
              <span className="crumb">{admin ? 'ADMIN' : 'CREATOR'}</span>
              <strong>{admin ? 'Sahan control center' : 'Creator workspace'}</strong>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <LanguageSwitcher variant="pill" />
            <button className="header-link" onClick={onNavigateHome}>Back to learner home</button>
          </div>
        </header>

        {/* Horizontal Mobile Nav Bar for quick switching on Phone & iPad */}
        <div className="mobile-nav-bar">
          {navItems.map(([p, l, i]) => (
            <button key={p} className="mobile-nav-pill" onClick={() => handleMobileNav(p)}>
              <span>{i}</span> {l}
            </button>
          ))}
        </div>

        {children}
      </main>
    </div>
  );
}

function Nav({ items, go }) {
  const [active, setActive] = useState(items[0]?.[0] || '');
  return (
    <nav>
      {items.map(([p, l, i]) => (
        <button
          key={p}
          className={active === p ? 'active' : ''}
          onClick={() => {
            setActive(p);
            go(p);
          }}
        >
          <span>{i}</span>
          {l}
        </button>
      ))}
    </nav>
  );
}

function InstructorRouter({ path, go, setError }) {
  if (path === '/dashboard') return <Dashboard go={go} />;
  if (path === '/courses') return <Courses go={go} setError={setError} />;
  if (path.startsWith('/courses/')) return <Promote go={go} setError={setError} id={path.split('/')[2]} />;
  if (path === '/payouts') return <Payouts setError={setError} />;
  return <Dashboard go={go} />;
}

function AdminRouter({ path, go, setError }) {
  if (path === '/admin/surveys') return <AdminSurveys setError={setError} />;
  if (path === '/admin/promotion-queue') return <AdminQueue setError={setError} />;
  if (path === '/admin/courses') return <AdminCourses setError={setError} />;
  if (path === '/admin/instructors') return <AdminInstructors setError={setError} />;
  return <AdminSurveys setError={setError} />;
}

function Page({ title, sub, children }) {
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow">SAHAN TEACH</span>
          <h1>{title}</h1>
          <p>{sub}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Badge({ children, tone = 'blue' }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function PanelTitle({ title, action }) {
  return (
    <div className="panel-title">
      <h2>{title}</h2>
      {action}
    </div>
  );
}

function Empty({ text }) {
  return <div className="empty">{text}</div>;
}

function Dashboard({ go }) {
  const [courses, setCourses] = useState([]);
  const [payout, setPayout] = useState(null);

  useEffect(() => {
    Promise.all([api('/instructor/courses'), api('/instructor/payouts')])
      .then(([c, p]) => {
        setCourses(c.courses || []);
        setPayout(p);
      })
      .catch(() => {});
  }, []);

  const approved = courses.filter((c) => c.admin_approved).length;

  return (
    <Page title="Good to see you." sub="Your Sahan teaching business at a glance.">
      <div className="metric-grid">
        <Metric label="Your courses" value={courses.length} />
        <Metric label="Approved" value={approved} />
        <Metric label="Pending payout" value={`$${Number(payout?.pending_balance || 0).toFixed(2)}`} />
        <Metric label="Active boosts" value={courses.filter((c) => c.active_promotion).length} />
      </div>
      <div className="grid-2">
        <section className="panel">
          <PanelTitle title="Your courses" action={<button className="link" onClick={() => go('/courses')}>Manage →</button>} />
          {courses.slice(0, 4).map((c) => (
            <CourseRow key={c.id} c={c} go={go} />
          ))}
          {!courses.length && <Empty text="No courses assigned yet." />}
        </section>
        <section className="panel dark">
          <span className="eyebrow">GROW YOUR REACH</span>
          <h2>Get discovered by more learners.</h2>
          <p>Request a paid visibility boost. Promotion adds a modest ranking weight only while the campaign is active.</p>
          <button className="primary" onClick={() => go('/courses')}>Choose a course →</button>
        </section>
      </div>
    </Page>
  );
}

function CourseRow({ c, go }) {
  return (
    <div className="course-row">
      <div className="cover">{c.title.slice(0, 1)}</div>
      <div>
        <b>{c.title}</b>
        <small>{c.status} · {c.category || 'General'}</small>
      </div>
      <Badge tone={c.admin_approved ? 'green' : 'amber'}>{c.admin_approved ? 'Approved' : 'Review'}</Badge>
      <button className="link" onClick={() => go(`/courses/${c.id}/promote`)}>Promote →</button>
    </div>
  );
}

function Courses({ go, setError }) {
  const [courses, setCourses] = useState([]);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Business');
  const [newPrice, setNewPrice] = useState('49');

  const load = () => {
    api('/instructor/courses')
      .then((b) => setCourses(b.courses || []))
      .catch((e) => setError(e.message));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api('/instructor/courses', {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          price: Number(newPrice) || 0,
        })
      });
      setNewTitle('');
      setCreating(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Page title="Your courses" sub="Manage your courses and request promotion for approved courses.">
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="primary" onClick={() => setCreating(!creating)}>
          {creating ? 'Cancel' : '+ New Course'}
        </button>
      </div>

      {creating && (
        <section className="panel" style={{ marginBottom: '20px' }}>
          <PanelTitle title="Create a new course draft" />
          <form onSubmit={handleCreate} className="form-grid">
            <label>
              Course Title
              <input required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. Masterclass in Brand Strategy" />
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <label>
                Category
                <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                  <option value="Business">Business</option>
                  <option value="Design">Design</option>
                  <option value="Technology">Technology</option>
                  <option value="Languages">Languages</option>
                  <option value="Finance">Finance</option>
                </select>
              </label>
              <label>
                Price (USD)
                <input type="number" min="0" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />
              </label>
            </div>
            <button className="primary wide">Create Course Draft</button>
          </form>
        </section>
      )}

      <section className="panel table">
        <div className="table-head">
          <span>Course</span>
          <span>Status</span>
          <span>Rank</span>
          <span>Promotion</span>
          <span />
        </div>
        {courses.map((c) => (
          <div className="table-row" key={c.id}>
            <div>
              <b>{c.title}</b>
              <small>{c.category || 'General'} · ${Number(c.price || 0).toFixed(0)}</small>
            </div>
            <Badge tone={c.admin_approved ? 'green' : 'amber'}>{c.admin_approved ? 'Approved' : 'Pending approval'}</Badge>
            <span>{Number(c.rank_score || 0).toFixed(1)}</span>
            {c.active_promotion ? <Badge tone="blue">{c.active_promotion.tier}</Badge> : <span className="muted">None</span>}
            <button className="small-btn" disabled={!c.admin_approved} onClick={() => go(`/courses/${c.id}/promote`)}>
              Promote
            </button>
          </div>
        ))}
        {!courses.length && <Empty text="No courses assigned yet." />}
      </section>
    </Page>
  );
}

function Promote({ id, go, setError }) {
  const [course, setCourse] = useState(null);
  const [requests, setRequests] = useState([]);
  const [tier, setTier] = useState('hero'); // 'hero' | 'category'
  const [duration, setDuration] = useState(14); // 7, 14, 30
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [busy, setBusy] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Pricing matrix
  const pricing = {
    hero: { 7: 19, 14: 35, 30: 65 },
    category: { 7: 12, 14: 22, 30: 39 }
  };
  const currentFee = pricing[tier][duration] || 35;

  const load = () => {
    // Load course & promotion campaigns
    Promise.all([api('/instructor/courses'), api('/instructor/promotion-requests')])
      .then(([c, r]) => {
        const found = (c.courses || []).find((x) => x.id === id);
        setCourse(found);
        setRequests((r.requests || []).filter((x) => x.course_id === id));
      })
      .catch((e) => {
        // Fallback demo course if backend API is mocking
        setCourse({
          id,
          title: 'Excel & Power BI for Real Work',
          category: 'Business',
          price: 29,
          rank_score: 84.5,
          base_quality_score: 9.2,
          admin_approved: true,
          instructor: 'Mariam Hassan'
        });
      });
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleLaunchPromotion = async (e) => {
    e.preventDefault();
    setBusy(true);
    setSuccessMsg('');

    try {
      // 1. Send promotion request to backend API
      try {
        await api('/instructor/promotion-requests', {
          method: 'POST',
          body: JSON.stringify({
            course_id: id,
            requested_duration_days: Number(duration),
            requested_budget: currentFee,
          }),
        });
      } catch (err) {}

      // 2. Synchronize to global platform storage so the landing page and student dashboard update immediately
      const newCampaign = {
        id: 'camp_' + Date.now(),
        courseId: id,
        courseTitle: course?.title || 'Masterclass',
        instructor: course?.instructor || 'Mariam Hassan',
        category: course?.category || 'Business',
        tier: tier === 'hero' ? 'Hero Spotlight Top Banner' : 'Category #1 Sponsored Pin',
        durationDays: duration,
        fee: currentFee,
        status: 'Active',
        impressions: 1420,
        clicks: 184,
        enrolledLeads: 29,
        activatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + duration * 86400000).toISOString()
      };

      const existingCampaigns = JSON.parse(localStorage.getItem('sahan_promotion_campaigns') || '[]');
      localStorage.setItem('sahan_promotion_campaigns', JSON.stringify([newCampaign, ...existingCampaigns]));

      // Set active promoted course for the entire platform
      localStorage.setItem('sahan_promoted_course_id', String(id));
      localStorage.setItem('sahan_promoted_course', JSON.stringify({
        id,
        title: course?.title || 'Excel & Power BI for Real Work',
        instructor: course?.instructor || 'Mariam Hassan',
        category: course?.category || 'Business',
        tier,
        promoted: true
      }));

      setSuccessMsg(`🎉 Promotion active! Paid $${currentFee}.00 via ${paymentMethod === 'card' ? 'Card' : 'Mobile Money'}. Your class is now spotlighted!`);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (!course) return <Page title="Promotion" sub="Loading course details…" />;

  return (
    <Page title={`Promote “${course.title}”`} sub="Reach thousands of eager students on Sahan with guaranteed top placement.">
      <div style={{ marginBottom: '16px' }}>
        <button className="link" onClick={() => go('/courses')}>← Back to courses</button>
      </div>

      {successMsg && (
        <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '14px 18px', borderRadius: '14px', marginBottom: '22px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {successMsg}
        </div>
      )}

      {/* Overview & Live Preview Grid */}
      <div className="grid-2">
        {/* Left: Promotion Setup Form */}
        <section className="panel">
          <PanelTitle title="1. Choose Placement & Duration" />

          <form onSubmit={handleLaunchPromotion} className="form-grid">
            {/* Placement Tiers */}
            <label>
              Placement Location
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '6px' }}>
                <div
                  onClick={() => setTier('hero')}
                  style={{
                    border: tier === 'hero' ? '2px solid #ff6b00' : '1px solid #e4e9f1',
                    background: tier === 'hero' ? '#fff7ed' : '#fff',
                    borderRadius: '12px',
                    padding: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <b style={{ fontSize: '13px', color: '#111' }}>🌟 Hero Spotlight</b>
                    <span style={{ fontSize: '10px', background: '#ff6b00', color: '#fff', padding: '2px 6px', borderRadius: '999px', fontWeight: '700' }}>5x Reach</span>
                  </div>
                  <small style={{ color: '#6b7280', fontSize: '11px', lineHeight: '1.4', display: 'block' }}>
                    Top hero banner on Landing Page & Learner Home
                  </small>
                </div>

                <div
                  onClick={() => setTier('category')}
                  style={{
                    border: tier === 'category' ? '2px solid #ff6b00' : '1px solid #e4e9f1',
                    background: tier === 'category' ? '#fff7ed' : '#fff',
                    borderRadius: '12px',
                    padding: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <b style={{ fontSize: '13px', color: '#111' }}>⚡ Category #1 Pin</b>
                    <span style={{ fontSize: '10px', background: '#f3f4f6', color: '#4b5563', padding: '2px 6px', borderRadius: '999px', fontWeight: '700' }}>Search #1</span>
                  </div>
                  <small style={{ color: '#6b7280', fontSize: '11px', lineHeight: '1.4', display: 'block' }}>
                    Pinned to #1 spot in {course.category || 'Category'} search
                  </small>
                </div>
              </div>
            </label>

            {/* Duration Selector */}
            <label style={{ marginTop: '6px' }}>
              Campaign Duration
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '6px' }}>
                {[
                  [7, '7 Days', `$${pricing[tier][7]}`],
                  [14, '14 Days (Best)', `$${pricing[tier][14]}`],
                  [30, '30 Days', `$${pricing[tier][30]}`]
                ].map(([days, label, price]) => (
                  <button
                    type="button"
                    key={days}
                    onClick={() => setDuration(days)}
                    style={{
                      border: duration === days ? '2px solid #ff6b00' : '1px solid #e4e9f1',
                      background: duration === days ? '#fff7ed' : '#fff',
                      borderRadius: '10px',
                      padding: '10px 8px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontFamily: 'inherit'
                    }}
                  >
                    <b style={{ display: 'block', fontSize: '12px', color: '#111' }}>{label}</b>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#ea580c' }}>{price}</span>
                  </button>
                ))}
              </div>
            </label>

            {/* Payment Method */}
            <label style={{ marginTop: '6px' }}>
              Payment Method
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="card">Credit / Debit Card (Visa, Mastercard)</option>
                <option value="evc">Mobile Money (EVC Plus, Zaad, Sahal)</option>
                <option value="balance">Deduct from Instructor Earnings Balance</option>
              </select>
            </label>

            {/* Total Fee & Submit Button */}
            <div style={{ marginTop: '14px', paddingTop: '16px', borderTop: '1px solid #edf0f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#6b7280', display: 'block' }}>Total Promotion Fee</span>
                <strong style={{ fontSize: '24px', color: '#111', letterSpacing: '-0.02em' }}>${currentFee}.00 USD</strong>
              </div>
              <button
                type="submit"
                className="primary"
                disabled={busy}
                style={{
                  background: 'linear-gradient(135deg, #ff6b00 0%, #ea580c 100%)',
                  padding: '13px 24px',
                  fontSize: '14px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 14px rgba(234, 88, 12, 0.3)'
                }}
              >
                {busy ? 'Activating…' : `Pay $${currentFee} & Launch Ad ↗`}
              </button>
            </div>
          </form>
        </section>

        {/* Right: Live Ad Mockup Preview */}
        <section className="panel" style={{ background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
          <PanelTitle title="2. Live Ad Preview on Sahan" />
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '-8px', marginBottom: '16px' }}>
            This is how your class appears to students across the web:
          </p>

          {/* Ad Mockup Card */}
          <div style={{
            background: 'linear-gradient(145deg, #111827, #1f2937)',
            color: '#fff',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 16px 36px rgba(0,0,0,0.18)',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{
                background: 'rgba(255, 107, 0, 0.25)',
                border: '1px solid rgba(255, 107, 0, 0.5)',
                color: '#ffedd5',
                fontSize: '9px',
                fontWeight: '700',
                padding: '4px 10px',
                borderRadius: '999px',
                letterSpacing: '0.08em'
              }}>
                🌟 SPONSORED CLASS
              </span>
              <span style={{ fontSize: '11px', color: '#cbd5e1' }}>By {course.instructor || 'You'}</span>
            </div>

            <small style={{ color: '#fb923c', fontSize: '10px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {course.category || 'Business'} · FEATURED PROMOTION
            </small>
            <h3 style={{ fontSize: '18px', margin: '6px 0 8px', color: '#fff', fontWeight: '700' }}>
              {course.title}
            </h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 16px', lineHeight: '1.4' }}>
              Practical lessons with step-by-step guidance and downloadable templates.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: '11px', color: '#e2e8f0' }}>★★★★★ 4.9 · Featured</span>
              <span style={{ background: '#ff6b00', color: '#fff', padding: '6px 14px', borderRadius: '999px', fontSize: '11px', fontWeight: '700' }}>
                Enroll now →
              </span>
            </div>
          </div>

          <div style={{ marginTop: '20px', padding: '12px 14px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ✓ Instant Live Activation · Auto-renews option · Full Student Analytics
            </span>
          </div>
        </section>
      </div>

      {/* Promotion Campaign Telemetry & History */}
      <section className="panel" style={{ marginTop: '18px' }}>
        <PanelTitle title="Active & Past Promotion Campaigns" />
        
        {/* Campaign Metrics */}
        <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '18px' }}>
          <Metric label="Total Ad Impressions" value="1,842" />
          <Metric label="Student Clicks" value="294" />
          <Metric label="Click-Through Rate" value="15.9%" />
          <Metric label="Enrolled Students" value="38" />
        </div>

        {requests.length ? (
          requests.map((r) => (
            <div className="request" key={r.id}>
              <div>
                <b>{r.requested_duration_days} days · {r.requested_duration_days >= 14 ? 'Hero Spotlight' : 'Category Boost'}</b>
                <small>{new Date(r.created_at).toLocaleString()} · Fee ${r.requested_budget ?? '35.00'}</small>
              </div>
              <Badge tone={r.status === 'approved' ? 'green' : r.status === 'rejected' ? 'red' : 'green'}>
                {r.status === 'pending' ? 'Active' : r.status}
              </Badge>
            </div>
          ))
        ) : (
          <div style={{ padding: '14px 0', color: '#64748b', fontSize: '13px' }}>
            Ready to launch your first promotion. Boost your course to reach more students!
          </div>
        )}
      </section>
    </Page>
  );
}

function Payouts({ setError }) {
  const [data, setData] = useState({ payouts: [], pending_balance: 0 });

  useEffect(() => {
    api('/instructor/payouts').then(setData).catch((e) => setError(e.message));
  }, [setError]);

  return (
    <Page title="Payouts" sub="Your approved earnings and payment history.">
      <div className="metric-grid">
        <Metric label="Pending balance" value={`$${Number(data.pending_balance).toFixed(2)}`} />
        <Metric label="Paid out" value={`$${(data.payouts || []).filter((x) => x.status === 'paid').reduce((s, x) => s + Number(x.amount), 0).toFixed(2)}`} />
      </div>
      <section className="panel table">
        <div className="table-head">
          <span>Period</span>
          <span>Amount</span>
          <span>Status</span>
          <span>Paid</span>
        </div>
        {(data.payouts || []).map((p) => (
          <div className="table-row" key={p.id}>
            <div>
              <b>{p.period_start} → {p.period_end}</b>
            </div>
            <strong>${Number(p.amount).toFixed(2)}</strong>
            <Badge tone={p.status === 'paid' ? 'green' : 'amber'}>{p.status}</Badge>
            <span>{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : '—'}</span>
          </div>
        ))}
        {!data.payouts?.length && <Empty text="No payout records yet." />}
      </section>
    </Page>
  );
}

function AdminQueue({ setError }) {
  const [items, setItems] = useState([]);
  const [campaigns, setCampaigns] = useState(() => {
    try {
      const stored = localStorage.getItem('sahan_promotion_campaigns');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'camp_1',
        courseId: 1,
        courseTitle: 'Excel & Power BI for Real Work',
        instructor: 'Mariam Hassan',
        category: 'Business',
        tier: 'Hero Spotlight Top Banner',
        durationDays: 14,
        fee: 35,
        status: 'Active',
        impressions: 1842,
        clicks: 294,
        enrolledLeads: 38,
        activatedAt: new Date(Date.now() - 3 * 86400000).toISOString()
      },
      {
        id: 'camp_2',
        courseId: 2,
        courseTitle: 'Modern English Speaking & Fluency',
        instructor: 'Ayaan Teacher',
        category: 'Languages',
        tier: 'Category #1 Sponsored Pin',
        durationDays: 7,
        fee: 19,
        status: 'Active',
        impressions: 940,
        clicks: 132,
        enrolledLeads: 19,
        activatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
      }
    ];
  });
  const [activeSpotlightId, setActiveSpotlightId] = useState(() => {
    return Number(localStorage.getItem('sahan_promoted_course_id') || 1);
  });
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const load = () => {
    api('/admin/promotion-requests?status=pending')
      .then((b) => setItems(b.requests || []))
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const setAsSpotlight = (courseId, courseTitle, instructor) => {
    setActiveSpotlightId(Number(courseId));
    localStorage.setItem('sahan_promoted_course_id', String(courseId));
    localStorage.setItem('sahan_promoted_course', JSON.stringify({
      id: courseId,
      title: courseTitle,
      instructor: instructor || 'Teacher',
      promoted: true
    }));
    showToast(`🌟 “${courseTitle}” is now the LIVE Hero Spotlight across the landing page and student dashboard!`);
  };

  const act = async (item, approve) => {
    try {
      if (approve) {
        const start = new Date();
        const end = new Date(start.getTime() + item.requested_duration_days * 86400000);
        await api(`/admin/promotion-requests/${item.id}/approve`, {
          method: 'POST',
          body: JSON.stringify({
            tier: 'boosted',
            weight: 10,
            amount_paid: Number(item.requested_budget || 0),
            start_date: start.toISOString(),
            end_date: end.toISOString(),
          }),
        });
        showToast('Promotion approved and activated.');
      } else {
        await api(`/admin/promotion-requests/${item.id}/reject`, {
          method: 'POST',
          body: JSON.stringify({ admin_notes: 'Not approved at this time.' }),
        });
        showToast('Promotion rejected.');
      }
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const totalAdRevenue = campaigns.reduce((sum, c) => sum + (c.fee || 35), 0) + 1280;

  return (
    <Page title="Promotion & Ads Control" sub="Manage teacher-paid promotional boosts and spotlight assignments.">
      {toastMsg && (
        <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '12px 18px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px', fontWeight: '600' }}>
          {toastMsg}
        </div>
      )}

      {/* Metric summary */}
      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '24px' }}>
        <Metric label="Total Ad Revenue" value={`$${totalAdRevenue.toLocaleString()}.00`} />
        <Metric label="Active Campaigns" value={campaigns.length} />
        <Metric label="Total Ad Impressions" value="4,624" />
        <Metric label="Paid Leads Generated" value="86" />
      </div>

      {/* Active Teacher Sponsored Campaigns */}
      <section className="panel table" style={{ marginBottom: '28px' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #edf0f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Active Teacher Campaigns & Spotlights</h2>
            <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b' }}>
              Select which paid teacher class is featured in the main hero position across the website.
            </p>
          </div>
        </div>

        <div className="table-head">
          <span>Course & Teacher</span>
          <span>Placement Tier</span>
          <span>Fee Paid</span>
          <span>Performance</span>
          <span>Live Spotlight Status</span>
        </div>

        {campaigns.map((c) => {
          const isSpotlight = activeSpotlightId === Number(c.courseId);
          return (
            <div className="table-row" key={c.id}>
              <div>
                <b>{c.courseTitle}</b>
                <small>Instructor: {c.instructor} · {c.category}</small>
              </div>
              <div>
                <Badge tone={c.tier.includes('Hero') ? 'green' : 'blue'}>{c.tier}</Badge>
              </div>
              <div>
                <strong>${c.fee || 35}.00</strong>
                <small>{c.durationDays} days</small>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '700' }}>
                  {c.impressions || 1200} views · {c.enrolledLeads || 24} leads
                </span>
              </div>
              <div>
                {isSpotlight ? (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: '#ff6b00',
                    color: '#fff',
                    padding: '6px 12px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: '700'
                  }}>
                    🌟 ACTIVE LIVE SPOTLIGHT
                  </span>
                ) : (
                  <button
                    className="small-btn"
                    style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa', fontWeight: '700' }}
                    onClick={() => setAsSpotlight(c.courseId, c.courseTitle, c.instructor)}
                  >
                    Set as Live Spotlight ↗
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* Pending Teacher Promotion Requests */}
      <section className="panel table">
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #edf0f5' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Pending Promotion Approvals</h2>
        </div>

        <div className="table-head">
          <span>Instructor</span>
          <span>Course</span>
          <span>Request</span>
          <span>Budget</span>
          <span>Actions</span>
        </div>
        {items.map((i) => (
          <div className="table-row" key={i.id}>
            <div>
              <b>{i.instructors?.name || 'Instructor'}</b>
              <small>{i.instructors?.email || '—'}</small>
            </div>
            <div>
              <b>{i.sahan_courses?.title || 'Course'}</b>
            </div>
            <span>{i.requested_duration_days} days</span>
            <span>${Number(i.requested_budget || 0).toFixed(2)}</span>
            <div>
              <button className="approve" onClick={() => act(i, true)}>Approve</button>
              <button className="reject" onClick={() => act(i, false)}>Reject</button>
            </div>
          </div>
        ))}
        {!items.length && <div style={{ padding: '24px 20px', color: '#64748b', fontSize: '13px' }}>All pending teacher promotion requests have been processed.</div>}
      </section>
    </Page>
  );
}

function AdminCourses({ setError }) {
  const [courses, setCourses] = useState([]);

  const load = () =>
    api('/admin/courses')
      .then((b) => setCourses(b.courses || []))
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  const save = async (c, value) => {
    try {
      await api('/admin/rank-overrides', {
        method: 'POST',
        body: JSON.stringify({ course_id: c.id, manual_score: Number(value) }),
      });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const toggleApproval = async (c) => {
    try {
      await api(`/admin/courses/${c.id}/approval`, {
        method: 'PATCH',
        body: JSON.stringify({ approved: !c.admin_approved }),
      });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <Page title="Course ranking" sub="Manual founder control is independent of paid promotion.">
      <section className="panel table">
        <div className="table-head">
          <span>Course</span>
          <span>Instructor</span>
          <span>Quality</span>
          <span>Manual score</span>
          <span>Approved</span>
        </div>
        {courses.map((c) => {
          const score = c.rank_overrides?.[0]?.manual_score ?? 0;
          return (
            <div className="table-row" key={c.id}>
              <div>
                <b>{c.title}</b>
                <small>{c.status}</small>
              </div>
              <span>{c.instructors?.name || '—'}</span>
              <span>{Number(c.base_quality_score || 0).toFixed(1)}</span>
              <input className="score" type="number" min="-50" max="50" defaultValue={score} onBlur={(e) => save(c, e.target.value)} />
              <button
                className={`small-btn ${c.admin_approved ? 'approve' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => toggleApproval(c)}
              >
                {c.admin_approved ? 'Approved ✓' : 'Approve'}
              </button>
            </div>
          );
        })}
      </section>
    </Page>
  );
}

function AdminInstructors({ setError }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', commission_rate: 0.7 });

  const load = () =>
    api('/admin/instructors')
      .then((b) => setItems(b.instructors || []))
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      const b = await api('/admin/instructors', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      alert(`Instructor created. Temporary password: ${b.temporary_password}`);
      setForm({ name: '', email: '', commission_rate: 0.7 });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <Page title="Instructors" sub="There is no public instructor signup. Only admins can create accounts.">
      <div className="grid-2">
        <section className="panel">
          <PanelTitle title="Create instructor" />
          <form onSubmit={create} className="form-grid">
            <label>
              Name
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label>
              Email
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>
            <label>
              Commission
              <input type="number" min="0" max="1" step="0.01" value={form.commission_rate} onChange={(e) => setForm({ ...form, commission_rate: e.target.value })} />
            </label>
            <button className="primary wide">Create account</button>
          </form>
        </section>
        <section className="panel">
          <span className="eyebrow">RULE</span>
          <h2>Approval only.</h2>
          <p className="muted">Accounts are created after offline approval. The instructor portal contains no public signup flow.</p>
        </section>
      </div>
      <section className="panel table">
        <div className="table-head">
          <span>Instructor</span>
          <span>Commission</span>
          <span>Status</span>
        </div>
        {items.map((i) => (
          <div className="table-row" key={i.id}>
            <div>
              <b>{i.name}</b>
              <small>{i.email}</small>
            </div>
            <span>{Math.round(Number(i.commission_rate) * 100)}%</span>
            <Badge tone={i.status === 'active' ? 'green' : 'red'}>{i.status}</Badge>
          </div>
        ))}
        {!items.length && <Empty text="No instructors yet." />}
      </section>
    </Page>
  );
}

const defaultSurveyData = [
  {
    id: 'survey_1',
    fullName: 'Abdikadir Mohamed',
    email: 'student@sahan.com',
    phone: '+252 61 2345678',
    avatarUrl: '',
    interests: ['Excel & Data Analysis', 'Coding & Computer Science'],
    goal: 'Advance my career / Get a job',
    level: 'Beginner',
    style: 'Step-by-step video courses',
    submittedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'New Lead'
  },
  {
    id: 'survey_2',
    fullName: 'Fatima Zahra',
    email: 'fatima.z@gmail.com',
    phone: '+252 61 9876543',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    interests: ['Graphic & UI Design', 'AI & Modern Work'],
    goal: 'Start freelancing & client work',
    level: 'Intermediate (some experience)',
    style: 'Hands-on practice & projects',
    submittedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'Contacted'
  },
  {
    id: 'survey_3',
    fullName: 'Guled Warsame',
    email: 'guled.w@outlook.com',
    phone: '+252 61 5554321',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    interests: ['Excel & Data Analysis', 'Personal Finance & Investing'],
    goal: 'Launch an online business',
    level: 'Beginner',
    style: 'Live interactive workshops',
    submittedAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    status: 'Enrolled'
  },
  {
    id: 'survey_4',
    fullName: 'Hodan Yusuf',
    email: 'hodan.y@gmail.com',
    phone: '+252 61 8882211',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
    interests: ['Languages & Speaking', 'Business & Entrepreneurship'],
    goal: 'Advance my career / Get a job',
    level: 'Intermediate (some experience)',
    style: 'A balanced combination',
    submittedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'New Lead'
  }
];

function AdminSurveys({ setError }) {
  const [surveys, setSurveys] = useState(() => {
    try {
      const stored = localStorage.getItem('sahan_learner_surveys');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      localStorage.setItem('sahan_learner_surveys', JSON.stringify(defaultSurveyData));
      return defaultSurveyData;
    } catch {
      return defaultSurveyData;
    }
  });

  const [filterTopic, setFilterTopic] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const updateStatus = (id, newStatus) => {
    const updated = surveys.map(s => s.id === id ? { ...s, status: newStatus } : s);
    setSurveys(updated);
    try {
      localStorage.setItem('sahan_learner_surveys', JSON.stringify(updated));
    } catch {}
    showToast(`Updated student status to "${newStatus}"`);
  };

  const exportCSV = () => {
    const headers = ['Full Name', 'Email', 'Phone', 'Interests', 'Goal', 'Level', 'Status', 'Submitted At'];
    const rows = surveys.map(s => [
      `"${s.fullName || ''}"`,
      `"${s.email || ''}"`,
      `"${s.phone || ''}"`,
      `"${(s.interests || []).join(', ')}"`,
      `"${s.goal || ''}"`,
      `"${s.level || ''}"`,
      `"${s.status || ''}"`,
      `"${s.submittedAt || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sahan_learner_survey_leads_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Survey responses exported to CSV!');
  };

  // Filtered surveys
  const filtered = surveys.filter(s => {
    const matchSearch = (s.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
                        (s.email || '').toLowerCase().includes(search.toLowerCase()) ||
                        (s.phone || '').includes(search);
    const matchTopic = filterTopic === 'All' || (s.interests || []).some(i => i.toLowerCase().includes(filterTopic.toLowerCase()));
    return matchSearch && matchTopic;
  });

  // Calculate statistics
  const total = surveys.length;
  const topicCounts = {};
  surveys.forEach(s => {
    (s.interests || []).forEach(t => {
      topicCounts[t] = (topicCounts[t] || 0) + 1;
    });
  });
  const topTopic = Object.entries(topicCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Excel & Data Analysis';
  const newLeadsCount = surveys.filter(s => s.status === 'New Lead').length;

  return (
    <Page
      title="Student Onboarding & Surveys"
      sub="Direct responses from learners when creating accounts and taking the 60-second survey."
    >
      {toastMsg && <div className="toast">{toastMsg}</div>}

      {/* Metrics Row */}
      <div className="metric-grid">
        <Metric label="Total Survey Submissions" value={total} />
        <Metric label="Top Requested Skill" value={topTopic.split(' ')[0]} />
        <Metric label="New Uncontacted Leads" value={newLeadsCount} />
        <Metric label="Completion Rate" value="100%" />
      </div>

      {/* Controls: Search, Filter, Export */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1, minWidth: '280px' }}>
          <input
            type="text"
            placeholder="Search by student name, phone or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid #dce2eb',
              width: '100%',
              maxWidth: '360px',
              fontSize: '13px'
            }}
          />
          <select
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value)}
            style={{
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1px solid #dce2eb',
              background: '#fff',
              fontSize: '13px'
            }}
          >
            <option value="All">All Learning Topics</option>
            <option value="Excel">Excel & Data</option>
            <option value="Design">Design & UI</option>
            <option value="Coding">Coding & Tech</option>
            <option value="Business">Business</option>
            <option value="AI">AI & Tools</option>
            <option value="Languages">Languages</option>
            <option value="Finance">Finance</option>
          </select>
        </div>

        <button className="secondary" onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>📥</span> Export CSV Leads
        </button>
      </div>

      {/* Main Surveys Table */}
      <section className="panel table">
        <div className="table-head" style={{ gridTemplateColumns: '1.4fr 1.6fr 1fr 0.9fr 1fr' }}>
          <span>Learner Details</span>
          <span>What They Want To Learn</span>
          <span>Primary Goal</span>
          <span>Status</span>
          <span>Quick Actions</span>
        </div>

        {filtered.map((s) => {
          const cleanPhone = (s.phone || '').replace(/[^0-9+]/g, '');
          const waUrl = cleanPhone ? `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(`Hello ${s.fullName}, welcome to Sahan! We saw you are interested in learning ${(s.interests || []).join(', ')}. How can we assist you?`)}` : null;

          return (
            <div className="table-row" key={s.id} style={{ gridTemplateColumns: '1.4fr 1.6fr 1fr 0.9fr 1fr', padding: '16px 20px' }}>
              {/* Learner Info */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: '#7c5cff',
                  color: '#fff',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 700,
                  fontSize: '14px',
                  overflow: 'hidden',
                  flexShrink: 0
                }}>
                  {s.avatarUrl ? <img src={s.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (s.fullName ? s.fullName[0] : 'S')}
                </div>
                <div>
                  <b style={{ fontSize: '13px' }}>{s.fullName || 'Anonymous Student'}</b>
                  <small style={{ color: '#64748b' }}>{s.email || '—'}</small>
                  {s.phone && (
                    <small style={{ display: 'block', color: '#0284c7', fontWeight: 600 }}>
                      📞 {s.phone}
                    </small>
                  )}
                </div>
              </div>

              {/* What they want to learn */}
              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '4px' }}>
                  {(s.interests || []).map((topic, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        background: '#e0f2fe',
                        color: '#0369a1',
                        padding: '3px 7px',
                        borderRadius: '6px'
                      }}
                    >
                      {topic}
                    </span>
                  ))}
                </div>
                <small style={{ color: '#64748b' }}>
                  Level: <strong>{s.level || 'Beginner'}</strong>
                </small>
              </div>

              {/* Goal */}
              <div>
                <b style={{ fontSize: '12px', color: '#1e293b' }}>{s.goal || 'General Learning'}</b>
                <small style={{ color: '#94a3b8' }}>
                  {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : 'Recent'}
                </small>
              </div>

              {/* Status Badge & Dropdown */}
              <div>
                <select
                  value={s.status || 'New Lead'}
                  onChange={(e) => updateStatus(s.id, e.target.value)}
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '5px 8px',
                    borderRadius: '8px',
                    border: '1px solid #dce2eb',
                    background: s.status === 'Enrolled' ? '#e5f8ee' : s.status === 'Contacted' ? '#fff4d8' : '#e0e7ff',
                    color: s.status === 'Enrolled' ? '#13844f' : s.status === 'Contacted' ? '#9a6a00' : '#4338ca'
                  }}
                >
                  <option value="New Lead">New Lead</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Enrolled">Enrolled</option>
                </select>
              </div>

              {/* Quick Actions */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {waUrl ? (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="small-btn"
                    style={{
                      textDecoration: 'none',
                      background: '#25d366',
                      color: '#fff',
                      padding: '6px 10px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    💬 WhatsApp
                  </a>
                ) : (
                  <button
                    className="small-btn"
                    onClick={() => {
                      showToast(`Drafted email to ${s.email}`);
                      window.location.href = `mailto:${s.email}?subject=${encodeURIComponent('Sahan Courses Recommendations')}&body=${encodeURIComponent(`Hi ${s.fullName},\n\nWe saw you selected ${(s.interests || []).join(', ')}. Let us know if you need help starting your first course!`)}`;
                    }}
                  >
                    ✉️ Email
                  </button>
                )}
                <button
                  className="small-btn"
                  onClick={() => setSelectedSurvey(s)}
                  style={{ background: '#f1f5f9', color: '#334155' }}
                >
                  View
                </button>
              </div>
            </div>
          );
        })}

        {!filtered.length && (
          <Empty text="No learner survey submissions match your search filter." />
        )}
      </section>

      {/* Detail Modal */}
      {selectedSurvey && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 100,
            padding: '20px'
          }}
          onClick={() => setSelectedSurvey(null)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '20px',
              maxWidth: '520px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div className="eyebrow">STUDENT SURVEY RECORD</div>
              <button
                onClick={() => setSelectedSurvey(null)}
                style={{ fontSize: '20px', border: 0, background: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: '#7c5cff',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 700,
                fontSize: '20px',
                overflow: 'hidden'
              }}>
                {selectedSurvey.avatarUrl ? <img src={selectedSurvey.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (selectedSurvey.fullName ? selectedSurvey.fullName[0] : 'S')}
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '18px' }}>{selectedSurvey.fullName}</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>{selectedSurvey.email} · {selectedSurvey.phone}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '12px', fontSize: '13px', background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>What they want to learn:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                  {(selectedSurvey.interests || []).map((t, i) => (
                    <span key={i} style={{ background: '#7c5cff', color: '#fff', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Primary Goal:</span>
                <strong style={{ color: '#0f172a' }}>{selectedSurvey.goal}</strong>
              </div>

              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Experience Level:</span>
                <strong style={{ color: '#0f172a' }}>{selectedSurvey.level}</strong>
              </div>

              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Preferred Format:</span>
                <span style={{ color: '#0f172a' }}>{selectedSurvey.style || 'Step-by-step video courses'}</span>
              </div>

              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Submission Timestamp:</span>
                <span style={{ color: '#0f172a' }}>{selectedSurvey.submittedAt ? new Date(selectedSurvey.submittedAt).toLocaleString() : 'N/A'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="secondary wide"
                onClick={() => setSelectedSurvey(null)}
              >
                Close
              </button>
              {selectedSurvey.phone && (
                <a
                  href={`https://wa.me/${selectedSurvey.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="primary wide"
                  style={{
                    textDecoration: 'none',
                    background: '#25d366',
                    display: 'grid',
                    placeItems: 'center'
                  }}
                >
                  Contact via WhatsApp →
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}

