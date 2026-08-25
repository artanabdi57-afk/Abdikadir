import React, { useEffect, useState } from 'react';
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
  const [email, setEmail] = useState('mariam@sahan.com');
  const [password, setPassword] = useState('demo123');
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

  const fillQuick = (role) => {
    if (role === 'admin') {
      setEmail('admin@sahan.com');
      setPassword('demo123');
    } else {
      setEmail('mariam@sahan.com');
      setPassword('demo123');
    }
  };

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="logo" style={{ cursor: 'pointer' }} onClick={onNavigateHome}>
          <span>S</span>
          <div>
            <b>Sahan</b>
            <small>Teach & Admin Portal</small>
          </div>
        </div>
        <div className="eyebrow">INSTRUCTOR & PARTNER PORTAL</div>
        <h1>Teach what you know.</h1>
        <p className="muted">Manage courses, track earnings and request promotion on Sahan.</p>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button type="button" className="secondary" style={{ flex: 1, padding: '8px', fontSize: '11px' }} onClick={() => fillQuick('instructor')}>
            Demo Instructor
          </button>
          <button type="button" className="secondary" style={{ flex: 1, padding: '8px', fontSize: '11px' }} onClick={() => fillQuick('admin')}>
            Demo Admin
          </button>
        </div>

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
        <p className="login-note" style={{ marginTop: '12px' }}>Instructor accounts are verified for quality. Demo logins provided above.</p>
      </div>
    </div>
  );
}

function Shell({ user, go, logout, admin, onNavigateHome, children }) {
  return (
    <div className="portal">
      <aside>
        <div className="brand" style={{ cursor: 'pointer' }} onClick={onNavigateHome}>
          <span>S</span>
          <div>
            <b>Sahan</b>
            <small>Teach</small>
          </div>
        </div>
        <div className="portal-label">{admin ? 'ADMIN CONTROL' : 'INSTRUCTOR PORTAL'}</div>
        {admin ? (
          <Nav
            go={go}
            items={[
              ['/admin/promotion-queue', 'Promotion queue', '↗'],
              ['/admin/courses', 'Course ranking', '◎'],
              ['/admin/instructors', 'Instructors', '♙'],
            ]}
          />
        ) : (
          <Nav
            go={go}
            items={[
              ['/dashboard', 'Dashboard', '⌂'],
              ['/courses', 'Courses', '▤'],
              ['/payouts', 'Payouts', '$'],
            ]}
          />
        )}
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
          <div>
            <span className="crumb">{admin ? 'ADMIN' : 'TEACH'}</span>
            <strong>{admin ? 'Sahan control center' : 'Instructor workspace'}</strong>
          </div>
          <button className="header-link" onClick={onNavigateHome}>Open learner app ↗</button>
        </header>
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
  if (path === '/admin/courses') return <AdminCourses setError={setError} />;
  if (path === '/admin/instructors') return <AdminInstructors setError={setError} />;
  return <AdminQueue setError={setError} />;
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
  const [duration, setDuration] = useState(7);
  const [budget, setBudget] = useState('50');
  const [busy, setBusy] = useState(false);

  const load = () =>
    Promise.all([api('/instructor/courses'), api('/instructor/promotion-requests')])
      .then(([c, r]) => {
        setCourse((c.courses || []).find((x) => x.id === id));
        setRequests((r.requests || []).filter((x) => x.course_id === id));
      })
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/instructor/promotion-requests', {
        method: 'POST',
        body: JSON.stringify({
          course_id: id,
          requested_duration_days: Number(duration),
          requested_budget: budget ? Number(budget) : null,
        }),
      });
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (!course) return <Page title="Promotion" sub="Loading…" />;

  return (
    <Page title={`Promote “${course.title}”`} sub="Paid promotion increases visibility without replacing quality signals.">
      <div style={{ marginBottom: '14px' }}>
        <button className="link" onClick={() => go('/courses')}>← Back to courses</button>
      </div>
      <div className="grid-2">
        <section className="panel">
          <span className="eyebrow">CURRENT RANK</span>
          <div className="rank-big">{Number(course.rank_score || 0).toFixed(1)}</div>
          <p className="muted">
            Quality score {Number(course.base_quality_score || 0).toFixed(1)} · {course.active_promotion ? `Active ${course.active_promotion.tier} boost` : 'No active boost'}
          </p>
          <div className="notice">Promotion weight is capped at 25 and expires automatically at its end date.</div>
        </section>
        <section className="panel">
          <PanelTitle title="Request a promotion" />
          <form onSubmit={submit} className="form-grid">
            <label>
              Duration
              <select value={duration} onChange={(e) => setDuration(e.target.value)}>
                <option value="3">3 days</option>
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
              </select>
            </label>
            <label>
              Budget (optional)
              <input type="number" min="0" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="USD" />
            </label>
            <button className="primary wide" disabled={busy}>{busy ? 'Submitting…' : 'Request promotion'}</button>
          </form>
        </section>
      </div>
      <section className="panel">
        <PanelTitle title="Request history" />
        {requests.length ? (
          requests.map((r) => (
            <div className="request" key={r.id}>
              <div>
                <b>{r.requested_duration_days} days</b>
                <small>{new Date(r.created_at).toLocaleString()} · Budget ${r.requested_budget ?? 'not specified'}</small>
              </div>
              <Badge tone={r.status === 'approved' ? 'green' : r.status === 'rejected' ? 'red' : 'amber'}>{r.status}</Badge>
            </div>
          ))
        ) : (
          <Empty text="No promotion requests yet." />
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

  const load = () =>
    api('/admin/promotion-requests?status=pending')
      .then((b) => setItems(b.requests || []))
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

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
      } else {
        await api(`/admin/promotion-requests/${item.id}/reject`, {
          method: 'POST',
          body: JSON.stringify({ admin_notes: 'Not approved at this time.' }),
        });
      }
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <Page title="Promotion queue" sub="Review visibility requests from approved instructors.">
      <section className="panel table">
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
        {!items.length && <Empty text="No pending promotion requests." />}
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
