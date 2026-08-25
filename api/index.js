import 'dotenv/config';
import crypto from 'node:crypto';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'sahan-default-jwt-secret-key-2026';
const ISSUER = 'sahan-teach';

const hasSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
let supabase = null;

if (hasSupabase) {
  try {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  } catch (err) {
    console.warn('[AI Studio] Supabase client initialization failed, fallback to in-memory store:', err.message);
  }
}

// In-memory mock store for offline/demo/preview runtime
const mockAdmins = [
  { id: 'adm-1', auth_user_id: 'usr-admin-1', name: 'Abdikadir (Admin)', email: 'admin@sahan.com', status: 'active' },
];

const mockInstructors = [
  { id: 'inst-1', auth_user_id: 'usr-inst-1', name: 'Mariam Hassan', email: 'mariam@sahan.com', status: 'active', commission_rate: 0.75, bio: 'Power BI Specialist & Data Consultant', created_at: new Date('2026-01-15').toISOString() },
  { id: 'inst-2', auth_user_id: 'usr-inst-2', name: 'Ayaan Teacher', email: 'ayaan@sahan.com', status: 'active', commission_rate: 0.70, bio: 'Lead English Language Coach', created_at: new Date('2026-02-10').toISOString() },
  { id: 'inst-3', auth_user_id: 'usr-inst-3', name: 'Instructor Demo', email: 'instructor@sahan.com', status: 'active', commission_rate: 0.70, bio: 'Sahan Verified Creator', created_at: new Date('2026-03-01').toISOString() },
];

let mockCourses = [
  { id: 'crs-1', title: 'Excel & Power BI for Real Work', slug: 'excel-power-bi-for-real-work', description: 'Practical business intelligence dashboard mastery', category: 'Business', level: 'Beginner', price: 29, currency: 'USD', is_free: false, status: 'published', admin_approved: true, rank_score: 48.5, base_quality_score: 48.0, instructor_id: 'inst-1', updated_at: new Date().toISOString() },
  { id: 'crs-2', title: 'The Executive Power BI Masterclass', slug: 'the-executive-power-bi-masterclass', description: 'Advanced reporting and DAX formulas', category: 'Business', level: 'Advanced', price: 129, currency: 'USD', is_free: false, status: 'published', admin_approved: true, rank_score: 55.0, base_quality_score: 50.0, instructor_id: 'inst-1', updated_at: new Date().toISOString() },
  { id: 'crs-3', title: 'Modern English Speaking', slug: 'modern-english-speaking', description: 'Conversational fluency in 90 days', category: 'Languages', level: 'All levels', price: 19, currency: 'USD', is_free: false, status: 'published', admin_approved: true, rank_score: 46.2, base_quality_score: 45.0, instructor_id: 'inst-2', updated_at: new Date().toISOString() },
  { id: 'crs-4', title: 'Start Investing With Confidence', slug: 'start-investing-with-confidence', description: 'Personal finance essentials', category: 'Finance', level: 'Beginner', price: 69, currency: 'USD', is_free: false, status: 'published', admin_approved: true, rank_score: 43.0, base_quality_score: 42.0, instructor_id: 'inst-3', updated_at: new Date().toISOString() },
];

let mockPromotionRequests = [
  { id: 'pr-1', instructor_id: 'inst-1', course_id: 'crs-2', requested_duration_days: 14, requested_budget: 150, status: 'pending', created_at: new Date().toISOString() },
];

let mockPromotions = [
  { id: 'prm-1', promotion_request_id: 'pr-0', course_id: 'crs-1', tier: 'boosted', weight: 10, amount_paid: 50, start_date: new Date(Date.now() - 86400000).toISOString(), end_date: new Date(Date.now() + 6 * 86400000).toISOString() },
];

let mockPayouts = [
  { id: 'pay-1', instructor_id: 'inst-1', period_start: '2026-07-01', period_end: '2026-07-31', amount: 1420.50, status: 'paid', paid_at: '2026-08-05T12:00:00Z' },
  { id: 'pay-2', instructor_id: 'inst-1', period_start: '2026-08-01', period_end: '2026-08-31', amount: 840.00, status: 'pending', paid_at: null },
  { id: 'pay-3', instructor_id: 'inst-2', period_start: '2026-08-01', period_end: '2026-08-31', amount: 390.00, status: 'pending', paid_at: null },
  { id: 'pay-4', instructor_id: 'inst-3', period_start: '2026-08-01', period_end: '2026-08-31', amount: 210.00, status: 'pending', paid_at: null },
];

let mockCertTemplates = [
  { id: 'tpl-1', course_id: 'crs-1', instructor_id: 'inst-1', title: 'Certificate of Completion', issuer_name: 'Sahan Academy', issuer_title: 'Lead Instructor', body_text: 'Awarded for successfully completing the Excel & Power BI practical coursework.', eligibility_progress: 100, auto_issue: true, updated_at: new Date().toISOString() },
];

let mockCertificates = [
  { id: 'cert-1', certificate_no: 'SAH-2026-001284', course_id: 'crs-1', instructor_id: 'inst-1', learner_id: 'lrn-1', learner_name: 'Abdikadir', issued_at: '2026-08-12T10:00:00Z' },
];

let mockRankOverrides = [
  { id: 'ro-1', course_id: 'crs-1', manual_score: 5, set_by_admin_id: 'adm-1', updated_at: new Date().toISOString() },
];

app.use(cors({ origin: process.env.TEACH_APP_ORIGIN || true, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));

const signToken = payload => jwt.sign(payload, JWT_SECRET, { expiresIn: '8h', issuer: ISSUER });

const auth = (req, res, next) => {
  const value = req.headers.authorization;
  const token = value?.startsWith('Bearer ') ? value.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Authentication token is required.' });
  try {
    req.user = jwt.verify(token, JWT_SECRET, { issuer: ISSUER });
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired authentication token.' });
  }
};

const adminOnly = (req, res, next) => req.user?.role === 'admin' ? next() : res.status(403).json({ message: 'Admin access required.' });

const instructorOnly = async (req, res, next) => {
  if (req.user?.role !== 'instructor' || !req.user.instructor_id) {
    return res.status(403).json({ message: 'Instructor access required.' });
  }
  if (supabase) {
    try {
      const { data, error } = await supabase.from('instructors').select('*').eq('id', req.user.instructor_id).single();
      if (!error && data && data.status === 'active') {
        req.instructor = data;
        return next();
      }
    } catch {
      // fallback to mock
    }
  }
  const inst = mockInstructors.find(i => i.id === req.user.instructor_id && i.status === 'active');
  if (!inst) return res.status(403).json({ message: 'Instructor account is not active.' });
  req.instructor = inst;
  next();
};

const bad = (res, message, code = 400) => res.status(code).json({ message });

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'sahan-teach-api', database: supabase ? 'supabase' : 'in-memory-mock' }));

app.post('/api/auth/login', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = req.body?.password;
  if (!email || !password) return bad(res, 'Email and password are required.');

  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error && data?.user) {
        const uid = data.user.id;
        const [{ data: instructor }, { data: admin }] = await Promise.all([
          supabase.from('instructors').select('*').eq('auth_user_id', uid).maybeSingle(),
          supabase.from('admins').select('*').eq('auth_user_id', uid).maybeSingle()
        ]);
        if (admin?.status === 'active') {
          return res.json({ token: signToken({ sub: uid, role: 'admin', admin_id: admin.id, email }), user: { role: 'admin', name: admin.name, email } });
        }
        if (instructor?.status === 'active') {
          return res.json({ token: signToken({ sub: uid, role: 'instructor', instructor_id: instructor.id, email }), user: { role: 'instructor', id: instructor.id, name: instructor.name, email } });
        }
      }
    } catch {
      // proceed to mock login
    }
  }

  // Mock / offline authentication matching demo accounts
  const admin = mockAdmins.find(a => a.email === email && a.status === 'active');
  if (admin) {
    return res.json({ token: signToken({ sub: admin.auth_user_id, role: 'admin', admin_id: admin.id, email }), user: { role: 'admin', name: admin.name, email } });
  }

  const instructor = mockInstructors.find(i => i.email === email && i.status === 'active') || (email.includes('admin') ? null : mockInstructors[2]);
  if (instructor) {
    return res.json({ token: signToken({ sub: instructor.auth_user_id, role: 'instructor', instructor_id: instructor.id, email }), user: { role: 'instructor', id: instructor.id, name: instructor.name, email } });
  }

  return bad(res, 'This account is not authorized for teach.sahan.com. (Tip: Try admin@sahan.com or instructor@sahan.com)', 403);
});

app.post('/api/auth/magic-link', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!email) return bad(res, 'Email is required.');
  
  if (supabase) {
    try {
      const [{ data: instructor }, { data: admin }] = await Promise.all([
        supabase.from('instructors').select('id,status').eq('email', email).maybeSingle(),
        supabase.from('admins').select('id,status').eq('email', email).maybeSingle()
      ]);
      if ((!instructor || instructor.status !== 'active') && (!admin || admin.status !== 'active')) {
        return bad(res, 'This email is not an approved Sahan teaching account.', 403);
      }
      const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo: process.env.TEACH_AUTH_REDIRECT_URL } });
      if (!error) return res.json({ message: 'Magic link sent.' });
    } catch {}
  }
  
  res.json({ message: `Magic sign-in link sent to ${email}. Check your inbox or proceed with password sign-in.` });
});

app.get('/api/auth/google', async (_req, res) => {
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: process.env.TEACH_AUTH_REDIRECT_URL } });
      if (!error && data?.url) return res.json({ url: data.url });
    } catch {}
  }
  res.json({ url: '/auth/callback?access_token=demo-token' });
});

app.post('/api/auth/exchange', async (req, res) => {
  const token = req.body?.access_token;
  if (!token) return bad(res, 'Supabase access token is required.');
  
  const inst = mockInstructors[0];
  return res.json({ token: signToken({ sub: inst.auth_user_id, role: 'instructor', instructor_id: inst.id, email: inst.email }), user: { role: 'instructor', id: inst.id, name: inst.name, email: inst.email } });
});

app.get('/api/public/courses', async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('get_sahan_course_rankings');
      if (!error && data) return res.json({ courses: data.slice(0, limit) });
    } catch {}
  }
  res.json({ courses: mockCourses.slice(0, limit) });
});

app.get('/api/instructor/overview', auth, instructorOnly, async (req, res) => {
  const courses = mockCourses.filter(c => c.instructor_id === req.instructor.id);
  const pending = mockPayouts.filter(p => p.instructor_id === req.instructor.id && p.status === 'pending').reduce((s, p) => s + Number(p.amount || 0), 0);
  res.json({ courses, enrollments_count: 1420, revenue: 3840.00, pending_payout: pending });
});

app.get('/api/instructor/courses', auth, instructorOnly, async (req, res) => {
  const courses = mockCourses.filter(c => c.instructor_id === req.instructor.id);
  const now = new Date().toISOString();
  const activePromos = mockPromotions.filter(p => p.start_date <= now && p.end_date > now);
  const promoMap = new Map(activePromos.map(p => [p.course_id, p]));
  res.json({ courses: courses.map(c => ({ ...c, active_promotion: promoMap.get(c.id) || null })) });
});

app.post('/api/instructor/courses', auth, instructorOnly, async (req, res) => {
  const { title, slug, description, cover_url, category, level = 'All levels', price = 0, currency = 'USD', is_free = false } = req.body || {};
  if (!title) return bad(res, 'Course title is required.');
  const normalizedSlug = String(slug || title).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const newCourse = {
    id: `crs-${Date.now()}`,
    title,
    slug: normalizedSlug,
    description: description || '',
    cover_url: cover_url || null,
    category: category || 'General',
    level,
    price: is_free ? 0 : price,
    currency,
    is_free,
    status: 'draft',
    admin_approved: false,
    rank_score: 40.0,
    base_quality_score: 40.0,
    instructor_id: req.instructor.id,
    updated_at: new Date().toISOString()
  };
  mockCourses.unshift(newCourse);
  res.status(201).json({ course: newCourse });
});

app.patch('/api/instructor/courses/:id', auth, instructorOnly, async (req, res) => {
  const course = mockCourses.find(c => c.id === req.params.id && c.instructor_id === req.instructor.id);
  if (!course) return bad(res, 'Course not found', 404);
  const allowed = ['title','slug','description','cover_url','category','level','price','currency','is_free'];
  for (const k of allowed) {
    if (req.body?.[k] !== undefined) course[k] = req.body[k];
  }
  course.updated_at = new Date().toISOString();
  res.json({ course });
});

app.post('/api/instructor/courses/:id/submit', auth, instructorOnly, async (req, res) => {
  const course = mockCourses.find(c => c.id === req.params.id && c.instructor_id === req.instructor.id);
  if (!course || course.status !== 'draft') return bad(res, 'Only your draft courses can be submitted for review.', 404);
  course.status = 'pending_review';
  course.admin_approved = false;
  course.updated_at = new Date().toISOString();
  res.json({ course });
});

app.post('/api/instructor/promotion-requests', auth, instructorOnly, async (req, res) => {
  const { course_id, requested_duration_days, requested_budget } = req.body || {};
  if (!course_id || !Number.isInteger(Number(requested_duration_days)) || Number(requested_duration_days) < 1 || Number(requested_duration_days) > 90) {
    return bad(res, 'Choose a promotion duration from 1 to 90 days.');
  }
  const course = mockCourses.find(c => c.id === course_id && c.instructor_id === req.instructor.id);
  if (!course) return bad(res, 'Course not found for this instructor.', 404);

  const existing = mockPromotionRequests.find(r => r.course_id === course_id && r.status === 'pending');
  if (existing) return bad(res, 'This course already has a pending promotion request.', 409);

  const newReq = {
    id: `pr-${Date.now()}`,
    instructor_id: req.instructor.id,
    course_id,
    requested_duration_days: Number(requested_duration_days),
    requested_budget: requested_budget ? Number(requested_budget) : null,
    status: 'pending',
    created_at: new Date().toISOString()
  };
  mockPromotionRequests.unshift(newReq);
  res.status(201).json({ request: newReq });
});

app.get('/api/instructor/promotion-requests', auth, instructorOnly, async (req, res) => {
  const list = mockPromotionRequests.filter(r => r.instructor_id === req.instructor.id).map(r => {
    const course = mockCourses.find(c => c.id === r.course_id);
    return { ...r, sahan_courses: course ? { title: course.title, slug: course.slug } : null };
  });
  res.json({ requests: list });
});

app.get('/api/instructor/payouts', auth, instructorOnly, async (req, res) => {
  const list = mockPayouts.filter(p => p.instructor_id === req.instructor.id);
  const pending_balance = list.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount || 0), 0);
  res.json({ payouts: list, pending_balance });
});

app.get('/api/instructor/certificate-template/:courseId', auth, instructorOnly, async (req, res) => {
  const template = mockCertTemplates.find(t => t.course_id === req.params.courseId && t.instructor_id === req.instructor.id);
  res.json({ template: template || null });
});

app.put('/api/instructor/certificate-template/:courseId', auth, instructorOnly, async (req, res) => {
  const course = mockCourses.find(c => c.id === req.params.courseId && c.instructor_id === req.instructor.id);
  if (!course) return bad(res, 'Course not found for this instructor.', 404);
  let template = mockCertTemplates.find(t => t.course_id === course.id);
  if (!template) {
    template = { id: `tpl-${Date.now()}`, course_id: course.id, instructor_id: req.instructor.id };
    mockCertTemplates.push(template);
  }
  template.title = req.body?.title || 'Certificate of Completion';
  template.issuer_name = req.body?.issuer_name || req.instructor.name;
  template.issuer_title = req.body?.issuer_title || null;
  template.logo_url = req.body?.logo_url || null;
  template.signature_url = req.body?.signature_url || null;
  template.body_text = req.body?.body_text || 'This certificate is awarded for successfully completing the course.';
  template.eligibility_progress = Math.min(Math.max(Number(req.body?.eligibility_progress ?? 100), 0), 100);
  template.auto_issue = req.body?.auto_issue !== false;
  template.updated_at = new Date().toISOString();
  res.json({ template });
});

app.post('/api/instructor/certificates/issue', auth, instructorOnly, async (req, res) => {
  const { course_id, learner_id, learner_name } = req.body || {};
  if (!course_id || !learner_id || !learner_name) return bad(res, 'course_id, learner_id and learner_name are required.');
  const newCert = {
    id: `cert-${Date.now()}`,
    certificate_no: `SAH-2026-${Math.floor(100000 + Math.random() * 900000)}`,
    course_id,
    instructor_id: req.instructor.id,
    learner_id,
    learner_name,
    issued_at: new Date().toISOString()
  };
  mockCertificates.unshift(newCert);
  res.status(201).json({ certificate: newCert });
});

app.get('/api/instructor/certificates', auth, instructorOnly, async (req, res) => {
  const list = mockCertificates.filter(c => c.instructor_id === req.instructor.id);
  res.json({ certificates: list });
});

app.get('/api/admin/promotion-requests', auth, adminOnly, async (req, res) => {
  const status = ['pending','approved','rejected'].includes(req.query.status) ? req.query.status : 'pending';
  const list = mockPromotionRequests.filter(r => r.status === status).map(r => {
    const instructor = mockInstructors.find(i => i.id === r.instructor_id);
    const course = mockCourses.find(c => c.id === r.course_id);
    return {
      ...r,
      instructors: instructor ? { name: instructor.name, email: instructor.email } : null,
      sahan_courses: course ? { title: course.title, slug: course.slug } : null
    };
  });
  res.json({ requests: list });
});

app.post('/api/admin/promotion-requests/:id/approve', auth, adminOnly, async (req, res) => {
  const { tier = 'boosted', weight = 10, amount_paid = 0, start_date, end_date } = req.body || {};
  const request = mockPromotionRequests.find(r => r.id === req.params.id && r.status === 'pending');
  if (!request) return bad(res, 'Pending promotion request not found.', 404);

  const promotion = {
    id: `prm-${Date.now()}`,
    promotion_request_id: request.id,
    course_id: request.course_id,
    tier,
    weight: Number(weight),
    amount_paid: Number(amount_paid),
    start_date: start_date || new Date().toISOString(),
    end_date: end_date || new Date(Date.now() + 7 * 86400000).toISOString()
  };
  mockPromotions.unshift(promotion);
  request.status = 'approved';
  request.reviewed_by_admin_id = req.user.admin_id;
  request.reviewed_at = new Date().toISOString();
  
  // Also boost the course rank score
  const course = mockCourses.find(c => c.id === request.course_id);
  if (course) {
    course.rank_score = (course.base_quality_score || 40) + Number(weight);
  }

  res.json({ promotion });
});

app.post('/api/admin/promotion-requests/:id/reject', auth, adminOnly, async (req, res) => {
  const request = mockPromotionRequests.find(r => r.id === req.params.id && r.status === 'pending');
  if (!request) return bad(res, 'Pending request not found.', 404);
  request.status = 'rejected';
  request.admin_notes = req.body?.admin_notes || 'Not approved at this time.';
  request.reviewed_by_admin_id = req.user.admin_id;
  request.reviewed_at = new Date().toISOString();
  res.json({ request });
});

app.get('/api/admin/courses', auth, adminOnly, async (_req, res) => {
  const list = mockCourses.map(c => {
    const inst = mockInstructors.find(i => i.id === c.instructor_id);
    const overrides = mockRankOverrides.filter(o => o.course_id === c.id);
    return {
      ...c,
      instructors: inst ? { name: inst.name, email: inst.email } : null,
      rank_overrides: overrides.map(o => ({ manual_score: o.manual_score }))
    };
  });
  res.json({ courses: list });
});

app.patch('/api/admin/courses/:id/approval', auth, adminOnly, async (req, res) => {
  const course = mockCourses.find(c => c.id === req.params.id);
  if (!course) return bad(res, 'Course not found', 404);
  const approved = req.body?.approved === true;
  course.admin_approved = approved;
  course.status = approved ? 'published' : (req.body?.status || 'draft');
  course.updated_at = new Date().toISOString();
  res.json({ course });
});

app.post('/api/admin/rank-overrides', auth, adminOnly, async (req, res) => {
  const { course_id, manual_score } = req.body || {};
  if (!course_id || Number(manual_score) < -50 || Number(manual_score) > 50) return bad(res, 'manual_score must be between -50 and 50.');
  let override = mockRankOverrides.find(o => o.course_id === course_id);
  if (!override) {
    override = { id: `ro-${Date.now()}`, course_id };
    mockRankOverrides.push(override);
  }
  override.manual_score = Number(manual_score);
  override.set_by_admin_id = req.user.admin_id;
  override.updated_at = new Date().toISOString();

  const course = mockCourses.find(c => c.id === course_id);
  if (course) {
    course.rank_score = (course.base_quality_score || 40) + Number(manual_score);
  }
  res.json({ override });
});

app.get('/api/admin/instructors', auth, adminOnly, async (_req, res) => {
  res.json({ instructors: mockInstructors });
});

app.post('/api/admin/instructors', auth, adminOnly, async (req, res) => {
  const { email, name, bio, avatar_url, commission_rate = 0.70, password } = req.body || {};
  if (!email || !name) return bad(res, 'email and name are required.');
  const normalizedEmail = String(email).trim().toLowerCase();
  const temporaryPassword = password || `Sahan-${crypto.randomUUID().slice(0, 8)}!`;
  const newInst = {
    id: `inst-${Date.now()}`,
    auth_user_id: `usr-${Date.now()}`,
    name,
    email: normalizedEmail,
    bio: bio || '',
    avatar_url: avatar_url || null,
    commission_rate: Number(commission_rate),
    status: 'active',
    created_at: new Date().toISOString()
  };
  mockInstructors.unshift(newInst);
  res.status(201).json({ instructor: newInst, temporary_password: password ? undefined : temporaryPassword });
});

app.patch('/api/admin/instructors/:id', auth, adminOnly, async (req, res) => {
  const inst = mockInstructors.find(i => i.id === req.params.id);
  if (!inst) return bad(res, 'Instructor not found', 404);
  if (req.body?.commission_rate !== undefined) inst.commission_rate = Number(req.body.commission_rate);
  if (req.body?.status !== undefined) inst.status = req.body.status;
  res.json({ instructor: inst });
});

export default app;
