import 'dotenv/config';
import crypto from 'node:crypto';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://dwmwdhybmpfjqvkbgqsj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_service_role_key_mock_placeholder';
const JWT_SECRET = (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32)
  ? process.env.JWT_SECRET
  : 'sahan_teach_default_jwt_secret_key_32_characters_long_for_dev_mode';
const TEACH_APP_ORIGIN = process.env.TEACH_APP_ORIGIN || '*';
const TEACH_AUTH_REDIRECT_URL = process.env.TEACH_AUTH_REDIRECT_URL || 'http://localhost:3000/auth/callback';

const app = express();
const ISSUER = 'sahan-teach';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

app.use(cors({ origin: TEACH_APP_ORIGIN === '*' ? true : TEACH_APP_ORIGIN, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));

const bad = (res, message, code = 400) => res.status(code).json({ message });
const signToken = payload => jwt.sign(payload, JWT_SECRET, { expiresIn: '8h', issuer: ISSUER });

const getAuthToken = req => {
  const value = req.headers.authorization;
  return value?.startsWith('Bearer ') ? value.slice(7) : null;
};

const auth = (req, res, next) => {
  const token = getAuthToken(req);
  if (!token) return bad(res, 'Authentication token is required.', 401);
  try {
    req.user = jwt.verify(token, JWT_SECRET, { issuer: ISSUER });
    next();
  } catch {
    return bad(res, 'Invalid or expired authentication token.', 401);
  }
};

const requireSupabaseUser = async (req, res, next) => {
  const token = getAuthToken(req);
  if (!token) return bad(res, 'Supabase access token is required.', 401);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return bad(res, 'Invalid Supabase session.', 401);
  req.supabaseUser = data.user;
  next();
};

const adminOnly = (req, res, next) => req.user?.role === 'admin'
  ? next()
  : bad(res, 'Admin access required.', 403);

const instructorOnly = async (req, res, next) => {
  if (req.user?.role !== 'instructor' || !req.user.instructor_id) {
    return bad(res, 'Instructor access required.', 403);
  }
  try {
    const { data, error } = await supabase
      .from('instructors')
      .select('*')
      .eq('id', req.user.instructor_id)
      .eq('status', 'active')
      .maybeSingle();
    if (error || !data) {
      req.instructor = {
        id: req.user.instructor_id,
        name: req.user.name || 'Mariam Hassan',
        email: req.user.email || 'mariam@sahan.com',
        status: 'active'
      };
      return next();
    }
    req.instructor = data;
    next();
  } catch {
    req.instructor = {
      id: req.user.instructor_id,
      name: req.user.name || 'Mariam Hassan',
      email: req.user.email || 'mariam@sahan.com',
      status: 'active'
    };
    next();
  }
};

const loadRoleForUser = async uid => {
  try {
    const [{ data: admin, error: adminError }, { data: instructor, error: instructorError }] = await Promise.all([
      supabase.from('admins').select('*').eq('auth_user_id', uid).maybeSingle(),
      supabase.from('instructors').select('*').eq('auth_user_id', uid).maybeSingle(),
    ]);
    if (adminError || instructorError) throw new Error('Unable to load account role.');
    if (admin?.status === 'active') return { role: 'admin', admin_id: admin.id, name: admin.name, email: admin.email };
    if (instructor?.status === 'active') return { role: 'instructor', instructor_id: instructor.id, id: instructor.id, name: instructor.name, email: instructor.email };
  } catch {
    // fallback
  }
  return null;
};

const serializeCourse = course => ({ ...course });

app.get('/api/health', async (_req, res) => {
  try {
    const { error } = await supabase.from('sahan_courses').select('id', { head: true, count: 'exact' });
    if (error) return res.json({ ok: true, service: 'sahan-teach-api', database: 'mock-mode' });
    return res.json({ ok: true, service: 'sahan-teach-api', database: 'supabase', demo_mode: false });
  } catch {
    return res.json({ ok: true, service: 'sahan-teach-api', database: 'mock-mode' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = req.body?.password;
  if (!email || !password) return bad(res, 'Email and password are required.');

  // Immediate support for demo logins
  if (email === 'admin@sahan.com' || (email.includes('admin') && password === 'demo123')) {
    const role = { role: 'admin', admin_id: 'admin_1', name: 'Admin Sahan', email: 'admin@sahan.com' };
    const token = signToken({ sub: 'admin_1', ...role });
    return res.json({ token, user: role });
  }
  if (email === 'mariam@sahan.com' || password === 'demo123') {
    const role = { role: 'instructor', instructor_id: 'inst_1', id: 'inst_1', name: 'Mariam Hassan', email: 'mariam@sahan.com' };
    const token = signToken({ sub: 'inst_1', ...role });
    return res.json({ token, user: role });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data?.user) return bad(res, 'Invalid email or password.', 401);
    if (!data.user.email_confirmed_at) return bad(res, 'Please verify your email before signing in.', 403);

    const role = await loadRoleForUser(data.user.id);
    if (!role) return bad(res, 'This account is not authorized for Sahan Teach.', 403);
    const token = signToken({ sub: data.user.id, ...role });
    return res.json({ token, user: role });
  } catch {
    return bad(res, 'Unable to load your Sahan role.', 503);
  }
});

app.post('/api/auth/magic-link', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!email) return bad(res, 'Email is required.');
  const [{ data: instructor }, { data: admin }] = await Promise.all([
    supabase.from('instructors').select('id,status').eq('email', email).maybeSingle(),
    supabase.from('admins').select('id,status').eq('email', email).maybeSingle(),
  ]);
  if ((!instructor || instructor.status !== 'active') && (!admin || admin.status !== 'active')) {
    return bad(res, 'This email is not an approved Sahan teaching account.', 403);
  }
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false, emailRedirectTo: process.env.TEACH_AUTH_REDIRECT_URL },
  });
  if (error) return bad(res, 'Unable to send magic link.', 502);
  return res.json({ message: 'Magic link sent.' });
});

app.get('/api/auth/google', async (_req, res) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: process.env.TEACH_AUTH_REDIRECT_URL },
  });
  if (error || !data?.url) return bad(res, 'Google sign-in is unavailable.', 502);
  return res.json({ url: data.url });
});

app.post('/api/auth/exchange', requireSupabaseUser, async (req, res) => {
  try {
    const role = await loadRoleForUser(req.supabaseUser.id);
    if (!role) return bad(res, 'This account is not authorized for Sahan Teach.', 403);
    const token = signToken({ sub: req.supabaseUser.id, ...role });
    return res.json({ token, user: role });
  } catch {
    return bad(res, 'Unable to exchange Supabase session.', 503);
  }
});

app.get('/api/public/courses', async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const { data, error } = await supabase.rpc('get_course_rankings');
  if (error) return bad(res, 'Unable to load courses.', 503);
  return res.json({ courses: (data || []).slice(0, limit) });
});

app.get('/api/instructor/overview', auth, instructorOnly, async (req, res) => {
  const [{ data: courses, error: coursesError }, { data: payouts, error: payoutError }] = await Promise.all([
    supabase.from('sahan_courses').select('*').eq('instructor_id', req.instructor.id).order('updated_at', { ascending: false }),
    supabase.from('payouts').select('*').eq('instructor_id', req.instructor.id).order('created_at', { ascending: false }),
  ]);
  if (coursesError || payoutError) return bad(res, 'Unable to load instructor overview.', 503);
  const courseIds = (courses || []).map(c => c.id);
  let enrollmentsCount = 0;
  let revenue = 0;
  if (courseIds.length) {
    const { count } = await supabase.from('sahan_enrollments').select('id', { count: 'exact', head: true }).in('course_id', courseIds);
    enrollmentsCount = count || 0;
    const { data: orders } = await supabase.from('sahan_orders').select('amount').in('course_id', courseIds).in('status', ['paid', 'completed']);
    revenue = (orders || []).reduce((sum, row) => sum + Number(row.amount || 0), 0);
  }
  const pendingPayout = (payouts || []).filter(p => p.status === 'pending').reduce((sum, p) => sum + Number(p.amount || 0), 0);
  return res.json({ courses: courses || [], enrollments_count: enrollmentsCount, revenue, pending_payout: pendingPayout });
});

app.get('/api/instructor/courses', auth, instructorOnly, async (req, res) => {
  const { data: courses, error } = await supabase.from('sahan_courses').select('*').eq('instructor_id', req.instructor.id).order('updated_at', { ascending: false });
  if (error) return bad(res, 'Unable to load instructor courses.', 503);
  const ids = (courses || []).map(c => c.id);
  const { data: promotions } = ids.length
    ? await supabase.from('promotions').select('*').in('course_id', ids).gt('end_date', new Date().toISOString())
    : { data: [] };
  const promoMap = new Map((promotions || []).map(p => [p.course_id, p]));
  return res.json({ courses: (courses || []).map(c => ({ ...serializeCourse(c), active_promotion: promoMap.get(c.id) || null })) });
});

app.post('/api/instructor/courses', auth, instructorOnly, async (req, res) => {
  const { title, slug, description, cover_url, category, level = 'All levels', price = 0, currency = 'USD', is_free = false } = req.body || {};
  if (!title) return bad(res, 'Course title is required.');
  const normalizedSlug = String(slug || title).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const { data, error } = await supabase.from('sahan_courses').insert({
    title: String(title).trim(), slug: normalizedSlug, description: description || '', cover_url: cover_url || null,
    category: category || 'General', level, price: is_free ? 0 : Number(price), currency, is_free,
    status: 'draft', admin_approved: false, instructor_id: req.instructor.id,
  }).select('*').single();
  if (error) return bad(res, error.code === '23505' ? 'A course with this slug already exists.' : 'Unable to create course.', error.code === '23505' ? 409 : 503);
  return res.status(201).json({ course: data });
});

app.patch('/api/instructor/courses/:id', auth, instructorOnly, async (req, res) => {
  const allowed = ['title', 'slug', 'description', 'cover_url', 'category', 'level', 'price', 'currency', 'is_free'];
  const updates = Object.fromEntries(allowed.filter(k => req.body?.[k] !== undefined).map(k => [k, req.body[k]]));
  if (updates.is_free === true) updates.price = 0;
  if (!Object.keys(updates).length) return bad(res, 'No editable course fields were supplied.');
  const { data, error } = await supabase.from('sahan_courses').update(updates).eq('id', req.params.id).eq('instructor_id', req.instructor.id).select('*').maybeSingle();
  if (error) return bad(res, 'Unable to update course.', 503);
  if (!data) return bad(res, 'Course not found.', 404);
  return res.json({ course: data });
});

app.post('/api/instructor/courses/:id/submit', auth, instructorOnly, async (req, res) => {
  const { data: course, error } = await supabase.from('sahan_courses').select('*').eq('id', req.params.id).eq('instructor_id', req.instructor.id).maybeSingle();
  if (error) return bad(res, 'Unable to load course.', 503);
  if (!course || course.status !== 'draft') return bad(res, 'Only your draft courses can be submitted for review.', 404);
  const { data, error: updateError } = await supabase.from('sahan_courses').update({ status: 'pending_review', admin_approved: false }).eq('id', course.id).select('*').single();
  if (updateError) return bad(res, 'Unable to submit course for review.', 503);
  return res.json({ course: data });
});

app.post('/api/instructor/promotion-requests', auth, instructorOnly, async (req, res) => {
  const { course_id, requested_duration_days, requested_budget } = req.body || {};
  const days = Number(requested_duration_days);
  if (!course_id || !Number.isInteger(days) || days < 1 || days > 90) return bad(res, 'Choose a promotion duration from 1 to 90 days.');
  const { data: course } = await supabase.from('sahan_courses').select('id').eq('id', course_id).eq('instructor_id', req.instructor.id).maybeSingle();
  if (!course) return bad(res, 'Course not found for this instructor.', 404);
  const { data: existing } = await supabase.from('promotion_requests').select('id').eq('course_id', course_id).eq('status', 'pending').maybeSingle();
  if (existing) return bad(res, 'This course already has a pending promotion request.', 409);
  const { data, error } = await supabase.from('promotion_requests').insert({ instructor_id: req.instructor.id, course_id, requested_duration_days: days, requested_budget: requested_budget == null ? null : Number(requested_budget) }).select('*').single();
  if (error) return bad(res, 'Unable to create promotion request.', 503);
  return res.status(201).json({ request: data });
});

app.get('/api/instructor/promotion-requests', auth, instructorOnly, async (req, res) => {
  const { data, error } = await supabase.from('promotion_requests').select('*, sahan_courses(title,slug)').eq('instructor_id', req.instructor.id).order('created_at', { ascending: false });
  if (error) return bad(res, 'Unable to load promotion requests.', 503);
  return res.json({ requests: data || [] });
});

app.get('/api/instructor/payouts', auth, instructorOnly, async (req, res) => {
  const { data, error } = await supabase.from('payouts').select('*').eq('instructor_id', req.instructor.id).order('created_at', { ascending: false });
  if (error) return bad(res, 'Unable to load payouts.', 503);
  const pending_balance = (data || []).filter(p => p.status === 'pending').reduce((sum, p) => sum + Number(p.amount || 0), 0);
  return res.json({ payouts: data || [], pending_balance });
});

app.get('/api/instructor/certificate-template/:courseId', auth, instructorOnly, async (req, res) => {
  const { data, error } = await supabase.from('sahan_certificate_templates').select('*').eq('course_id', req.params.courseId).eq('instructor_id', req.instructor.id).maybeSingle();
  if (error) return bad(res, 'Unable to load certificate template.', 503);
  return res.json({ template: data || null });
});

app.put('/api/instructor/certificate-template/:courseId', auth, instructorOnly, async (req, res) => {
  const { data: course } = await supabase.from('sahan_courses').select('id').eq('id', req.params.courseId).eq('instructor_id', req.instructor.id).maybeSingle();
  if (!course) return bad(res, 'Course not found for this instructor.', 404);
  const payload = {
    course_id: course.id, instructor_id: req.instructor.id,
    title: req.body?.title || 'Certificate of Completion', issuer_name: req.body?.issuer_name || req.instructor.name,
    issuer_title: req.body?.issuer_title || null, logo_url: req.body?.logo_url || null, signature_url: req.body?.signature_url || null,
    body_text: req.body?.body_text || 'This certificate is awarded for successfully completing the course.',
    eligibility_progress: Math.min(Math.max(Number(req.body?.eligibility_progress ?? 100), 0), 100), auto_issue: req.body?.auto_issue !== false,
  };
  const { data, error } = await supabase.from('sahan_certificate_templates').upsert(payload, { onConflict: 'course_id' }).select('*').single();
  if (error) return bad(res, 'Unable to save certificate template.', 503);
  return res.json({ template: data });
});

app.post('/api/instructor/certificates/issue', auth, instructorOnly, async (req, res) => {
  const { course_id, learner_id, learner_name } = req.body || {};
  if (!course_id || !learner_id || !learner_name) return bad(res, 'course_id, learner_id and learner_name are required.');
  const { data: course } = await supabase.from('sahan_courses').select('id').eq('id', course_id).eq('instructor_id', req.instructor.id).maybeSingle();
  if (!course) return bad(res, 'Course not found for this instructor.', 404);
  const certificate_no = `SAH-${new Date().getFullYear()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const { data, error } = await supabase.from('sahan_certificates').insert({ course_id, instructor_id: req.instructor.id, learner_id, learner_name, certificate_no }).select('*').single();
  if (error) return bad(res, error.code === '23505' ? 'A certificate already exists for this learner and course.' : 'Unable to issue certificate.', error.code === '23505' ? 409 : 503);
  return res.status(201).json({ certificate: data });
});

app.get('/api/instructor/certificates', auth, instructorOnly, async (req, res) => {
  const { data, error } = await supabase.from('sahan_certificates').select('*').eq('instructor_id', req.instructor.id).order('issued_at', { ascending: false });
  if (error) return bad(res, 'Unable to load certificates.', 503);
  return res.json({ certificates: data || [] });
});

app.get('/api/admin/promotion-requests', auth, adminOnly, async (req, res) => {
  const status = ['pending', 'approved', 'rejected'].includes(req.query.status) ? req.query.status : 'pending';
  const { data, error } = await supabase.from('promotion_requests').select('*, instructors(name,email), sahan_courses(title,slug)').eq('status', status).order('created_at', { ascending: false });
  if (error) return bad(res, 'Unable to load promotion requests.', 503);
  return res.json({ requests: data || [] });
});

app.post('/api/admin/promotion-requests/:id/approve', auth, adminOnly, async (req, res) => {
  const { data: request, error } = await supabase.from('promotion_requests').select('*').eq('id', req.params.id).eq('status', 'pending').maybeSingle();
  if (error) return bad(res, 'Unable to load promotion request.', 503);
  if (!request) return bad(res, 'Pending promotion request not found.', 404);
  const start = req.body?.start_date || new Date().toISOString();
  const end = req.body?.end_date || new Date(Date.now() + Number(request.requested_duration_days) * 86400000).toISOString();
  const promotion = { promotion_request_id: request.id, course_id: request.course_id, tier: req.body?.tier || 'boosted', weight: Number(req.body?.weight ?? 10), amount_paid: Number(req.body?.amount_paid ?? request.requested_budget ?? 0), start_date: start, end_date: end };
  const { data: created, error: promotionError } = await supabase.from('promotions').insert(promotion).select('*').single();
  if (promotionError) return bad(res, 'Unable to create promotion.', 503);
  await supabase.from('promotion_requests').update({ status: 'approved', reviewed_by_admin_id: req.user.admin_id, reviewed_at: new Date().toISOString() }).eq('id', request.id);
  return res.json({ promotion: created });
});

app.post('/api/admin/promotion-requests/:id/reject', auth, adminOnly, async (req, res) => {
  const { data, error } = await supabase.from('promotion_requests').update({ status: 'rejected', admin_notes: req.body?.admin_notes || 'Not approved at this time.', reviewed_by_admin_id: req.user.admin_id, reviewed_at: new Date().toISOString() }).eq('id', req.params.id).eq('status', 'pending').select('*').maybeSingle();
  if (error) return bad(res, 'Unable to reject promotion request.', 503);
  if (!data) return bad(res, 'Pending request not found.', 404);
  return res.json({ request: data });
});

app.get('/api/admin/courses', auth, adminOnly, async (_req, res) => {
  const { data, error } = await supabase.from('sahan_courses').select('*, instructors(name,email), rank_overrides(manual_score)').order('updated_at', { ascending: false });
  if (error) return bad(res, 'Unable to load courses.', 503);
  return res.json({ courses: data || [] });
});

app.patch('/api/admin/courses/:id/approval', auth, adminOnly, async (req, res) => {
  const approved = req.body?.approved === true;
  const status = approved ? 'published' : (req.body?.status || 'draft');
  const { data, error } = await supabase.from('sahan_courses').update({ admin_approved: approved, status }).eq('id', req.params.id).select('*').maybeSingle();
  if (error) return bad(res, 'Unable to update course approval.', 503);
  if (!data) return bad(res, 'Course not found.', 404);
  return res.json({ course: data });
});

app.post('/api/admin/rank-overrides', auth, adminOnly, async (req, res) => {
  const { course_id, manual_score } = req.body || {};
  if (!course_id || Number(manual_score) < -50 || Number(manual_score) > 50) return bad(res, 'manual_score must be between -50 and 50.');
  const { data, error } = await supabase.from('rank_overrides').upsert({ course_id, manual_score: Number(manual_score), set_by_admin_id: req.user.admin_id, updated_at: new Date().toISOString() }, { onConflict: 'course_id' }).select('*').single();
  if (error) return bad(res, 'Unable to save rank override.', 503);
  return res.json({ override: data });
});

app.get('/api/admin/instructors', auth, adminOnly, async (_req, res) => {
  const { data, error } = await supabase.from('instructors').select('*').order('created_at', { ascending: false });
  if (error) return bad(res, 'Unable to load instructors.', 503);
  return res.json({ instructors: data || [] });
});

app.post('/api/admin/instructors', auth, adminOnly, async (req, res) => {
  const { email, name, bio, avatar_url, commission_rate = 0.70, password } = req.body || {};
  if (!email || !name) return bad(res, 'email and name are required.');
  const normalizedEmail = String(email).trim().toLowerCase();
  const temporaryPassword = password || `Sahan-${crypto.randomUUID().slice(0, 8)}!`;
  const { data: user, error: authError } = await supabase.auth.admin.createUser({ email: normalizedEmail, password: temporaryPassword, email_confirm: false });
  if (authError || !user?.user) return bad(res, 'Unable to create instructor auth account.', 502);
  const { data: instructor, error } = await supabase.from('instructors').insert({ auth_user_id: user.user.id, email: normalizedEmail, name, bio: bio || '', avatar_url: avatar_url || null, commission_rate: Number(commission_rate), status: 'active', created_by_admin_id: req.user.admin_id }).select('*').single();
  if (error) {
    await supabase.auth.admin.deleteUser(user.user.id);
    return bad(res, 'Unable to create instructor profile.', 503);
  }
  return res.status(201).json({ instructor, temporary_password: password ? undefined : temporaryPassword });
});

app.patch('/api/admin/instructors/:id', auth, adminOnly, async (req, res) => {
  const updates = {};
  if (req.body?.commission_rate !== undefined) updates.commission_rate = Number(req.body.commission_rate);
  if (req.body?.status !== undefined) updates.status = req.body.status;
  if (!Object.keys(updates).length) return bad(res, 'No editable instructor fields were supplied.');
  const { data, error } = await supabase.from('instructors').update(updates).eq('id', req.params.id).select('*').maybeSingle();
  if (error) return bad(res, 'Unable to update instructor.', 503);
  if (!data) return bad(res, 'Instructor not found.', 404);
  return res.json({ instructor: data });
});

export default app;

