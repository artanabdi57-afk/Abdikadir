import 'dotenv/config';
import crypto from 'node:crypto';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const app = express();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
const JWT_SECRET = process.env.JWT_SECRET;
const ISSUER = 'sahan-teach';

app.use(cors({ origin: process.env.TEACH_APP_ORIGIN || true, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));

const signToken = payload => jwt.sign(payload, JWT_SECRET, { expiresIn: '8h', issuer: ISSUER });
const auth = (req, res, next) => {
  const value = req.headers.authorization;
  const token = value?.startsWith('Bearer ') ? value.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Authentication token is required.' });
  try { req.user = jwt.verify(token, JWT_SECRET, { issuer: ISSUER }); next(); }
  catch { return res.status(401).json({ message: 'Invalid or expired authentication token.' }); }
};
const adminOnly = (req, res, next) => req.user?.role === 'admin' ? next() : res.status(403).json({ message: 'Admin access required.' });
const instructorOnly = async (req, res, next) => {
  if (req.user?.role !== 'instructor' || !req.user.instructor_id) return res.status(403).json({ message: 'Instructor access required.' });
  const { data, error } = await supabase.from('instructors').select('*').eq('id', req.user.instructor_id).single();
  if (error || !data || data.status !== 'active') return res.status(403).json({ message: 'Instructor account is not active.' });
  req.instructor = data;
  next();
};
const bad = (res, message, code = 400) => res.status(code).json({ message });

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'sahan-teach-api' }));

app.post('/api/auth/login', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = req.body?.password;
  if (!email || !password) return bad(res, 'Email and password are required.');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return bad(res, 'Invalid email or password.', 401);
  const uid = data.user.id;
  const [{ data: instructor }, { data: admin }] = await Promise.all([
    supabase.from('instructors').select('*').eq('auth_user_id', uid).maybeSingle(),
    supabase.from('admins').select('*').eq('auth_user_id', uid).maybeSingle()
  ]);
  if (admin?.status === 'active') return res.json({ token: signToken({ sub: uid, role: 'admin', admin_id: admin.id, email }), user: { role: 'admin', name: admin.name, email } });
  if (instructor?.status === 'active') return res.json({ token: signToken({ sub: uid, role: 'instructor', instructor_id: instructor.id, email }), user: { role: 'instructor', id: instructor.id, name: instructor.name, email } });
  return bad(res, 'This account is not authorized for teach.sahan.com.', 403);
});

app.post('/api/auth/magic-link', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!email) return bad(res, 'Email is required.');
  const [{ data: instructor }, { data: admin }] = await Promise.all([
    supabase.from('instructors').select('id,status').eq('email', email).maybeSingle(),
    supabase.from('admins').select('id,status').eq('email', email).maybeSingle()
  ]);
  if ((!instructor || instructor.status !== 'active') && (!admin || admin.status !== 'active')) return bad(res, 'This email is not an approved Sahan teaching account.', 403);
  const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo: process.env.TEACH_AUTH_REDIRECT_URL } });
  if (error) return bad(res, error.message);
  res.json({ message: 'Magic link sent.' });
});

app.get('/api/auth/google', async (_req, res) => {
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: process.env.TEACH_AUTH_REDIRECT_URL } });
  if (error) return bad(res, error.message);
  res.json({ url: data.url });
});

app.post('/api/auth/exchange', async (req, res) => {
  const token = req.body?.access_token;
  if (!token) return bad(res, 'Supabase access token is required.');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return bad(res, 'Invalid OAuth session.', 401);
  const [{ data: instructor }, { data: admin }] = await Promise.all([
    supabase.from('instructors').select('*').eq('auth_user_id', user.id).maybeSingle(),
    supabase.from('admins').select('*').eq('auth_user_id', user.id).maybeSingle()
  ]);
  if (admin?.status === 'active') return res.json({ token: signToken({ sub: user.id, role: 'admin', admin_id: admin.id, email: user.email }), user: { role: 'admin', name: admin.name, email: user.email } });
  if (instructor?.status === 'active') return res.json({ token: signToken({ sub: user.id, role: 'instructor', instructor_id: instructor.id, email: user.email }), user: { role: 'instructor', id: instructor.id, name: instructor.name, email: user.email } });
  return bad(res, 'Your account is not an approved teaching/admin account.', 403);
});

app.get('/api/public/courses', async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const { data, error } = await supabase.rpc('get_sahan_course_rankings');
  if (error) return bad(res, error.message, 500);
  res.json({ courses: (data || []).slice(0, limit) });
});

app.get('/api/instructor/overview', auth, instructorOnly, async (req, res) => {
  const { data: courses, error } = await supabase.from('sahan_courses').select('id,title,status,admin_approved,rank_score,base_quality_score').eq('instructor_id', req.instructor.id);
  if (error) return bad(res, error.message, 500);
  const ids = (courses || []).map(c => c.id);
  const [{ data: enrollments }, { data: orders }, { data: payouts }] = await Promise.all([
    ids.length ? supabase.from('sahan_enrollments').select('id,course_id,status').in('course_id', ids) : Promise.resolve({ data: [] }),
    ids.length ? supabase.from('sahan_orders').select('course_id,amount,status').in('course_id', ids) : Promise.resolve({ data: [] }),
    supabase.from('payouts').select('amount,status').eq('instructor_id', req.instructor.id)
  ]);
  const revenue = (orders || []).filter(o => ['paid','completed'].includes(o.status)).reduce((s, o) => s + Number(o.amount || 0), 0);
  const pending = (payouts || []).filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount || 0), 0);
  res.json({ courses: courses || [], enrollments_count: (enrollments || []).length, revenue, pending_payout: pending });
});

app.get('/api/instructor/courses', auth, instructorOnly, async (req, res) => {
  const { data, error } = await supabase.from('sahan_courses').select('id,title,slug,description,cover_url,category,level,price,currency,is_free,status,admin_approved,rank_score,base_quality_score,updated_at').eq('instructor_id', req.instructor.id).order('updated_at', { ascending: false });
  if (error) return bad(res, error.message, 500);
  const ids = (data || []).map(c => c.id);
  const { data: promos } = ids.length ? await supabase.from('promotions').select('course_id,tier,weight,start_date,end_date').in('course_id', ids).lte('start_date', new Date().toISOString()).gt('end_date', new Date().toISOString()) : { data: [] };
  const map = new Map((promos || []).map(p => [p.course_id, p]));
  res.json({ courses: (data || []).map(c => ({ ...c, active_promotion: map.get(c.id) || null })) });
});

app.post('/api/instructor/courses', auth, instructorOnly, async (req, res) => {
  const { title, slug, description, cover_url, category, level = 'All levels', price = 0, currency = 'USD', is_free = false } = req.body || {};
  if (!title) return bad(res, 'Course title is required.');
  const normalizedSlug = String(slug || title).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const { data, error } = await supabase.from('sahan_courses').insert({ title, slug: normalizedSlug, description, cover_url, category, level, price: is_free ? 0 : price, currency, is_free, status: 'draft', admin_approved: false, instructor_id: req.instructor.id }).select('*').single();
  if (error) return bad(res, error.message);
  res.status(201).json({ course: data });
});

app.patch('/api/instructor/courses/:id', auth, instructorOnly, async (req, res) => {
  const allowed = ['title','slug','description','cover_url','category','level','price','currency','is_free'];
  const changes = Object.fromEntries(allowed.filter(k => req.body?.[k] !== undefined).map(k => [k, req.body[k]]));
  if (!Object.keys(changes).length) return bad(res, 'No course changes supplied.');
  const { data, error } = await supabase.from('sahan_courses').update(changes).eq('id', req.params.id).eq('instructor_id', req.instructor.id).select('*').single();
  if (error) return bad(res, error.message, 404);
  res.json({ course: data });
});

app.post('/api/instructor/courses/:id/submit', auth, instructorOnly, async (req, res) => {
  const { data, error } = await supabase.from('sahan_courses').update({ status: 'pending_review', admin_approved: false, updated_at: new Date().toISOString() }).eq('id', req.params.id).eq('instructor_id', req.instructor.id).eq('status', 'draft').select('*').single();
  if (error || !data) return bad(res, 'Only your draft courses can be submitted for review.', 404);
  res.json({ course: data });
});

app.post('/api/instructor/promotion-requests', auth, instructorOnly, async (req, res) => {
  const { course_id, requested_duration_days, requested_budget } = req.body || {};
  if (!course_id || !Number.isInteger(Number(requested_duration_days)) || Number(requested_duration_days) < 1 || Number(requested_duration_days) > 90) return bad(res, 'Choose a promotion duration from 1 to 90 days.');
  const { data: course } = await supabase.from('sahan_courses').select('id,title').eq('id', course_id).eq('instructor_id', req.instructor.id).single();
  if (!course) return bad(res, 'Course not found for this instructor.', 404);
  const { data: existing } = await supabase.from('promotion_requests').select('id').eq('course_id', course_id).eq('status', 'pending').maybeSingle();
  if (existing) return bad(res, 'This course already has a pending promotion request.', 409);
  const { data, error } = await supabase.from('promotion_requests').insert({ instructor_id: req.instructor.id, course_id, requested_duration_days: Number(requested_duration_days), requested_budget }).select('*').single();
  if (error) return bad(res, error.message);
  res.status(201).json({ request: data });
});

app.get('/api/instructor/promotion-requests', auth, instructorOnly, async (req, res) => {
  const { data, error } = await supabase.from('promotion_requests').select('*,sahan_courses(title,slug)').eq('instructor_id', req.instructor.id).order('created_at', { ascending: false });
  if (error) return bad(res, error.message, 500);
  res.json({ requests: data || [] });
});

app.get('/api/instructor/payouts', auth, instructorOnly, async (req, res) => {
  const { data, error } = await supabase.from('payouts').select('*').eq('instructor_id', req.instructor.id).order('period_end', { ascending: false });
  if (error) return bad(res, error.message, 500);
  const pending_balance = (data || []).filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount || 0), 0);
  res.json({ payouts: data || [], pending_balance });
});

app.get('/api/instructor/certificate-template/:courseId', auth, instructorOnly, async (req, res) => {
  const { data, error } = await supabase.from('sahan_certificate_templates').select('*').eq('course_id', req.params.courseId).eq('instructor_id', req.instructor.id).maybeSingle();
  if (error) return bad(res, error.message, 500);
  res.json({ template: data || null });
});

app.put('/api/instructor/certificate-template/:courseId', auth, instructorOnly, async (req, res) => {
  const { data: course } = await supabase.from('sahan_courses').select('id,title').eq('id', req.params.courseId).eq('instructor_id', req.instructor.id).single();
  if (!course) return bad(res, 'Course not found for this instructor.', 404);
  const payload = {
    course_id: course.id,
    instructor_id: req.instructor.id,
    title: req.body?.title || 'Certificate of Completion',
    issuer_name: req.body?.issuer_name || req.instructor.name,
    issuer_title: req.body?.issuer_title || null,
    logo_url: req.body?.logo_url || null,
    signature_url: req.body?.signature_url || null,
    body_text: req.body?.body_text || 'This certificate is awarded for successfully completing the course and meeting the creator’s requirements.',
    eligibility_progress: Math.min(Math.max(Number(req.body?.eligibility_progress ?? 100), 0), 100),
    auto_issue: req.body?.auto_issue !== false,
    updated_at: new Date().toISOString()
  };
  const { data, error } = await supabase.from('sahan_certificate_templates').upsert(payload, { onConflict: 'course_id' }).select('*').single();
  if (error) return bad(res, error.message);
  res.json({ template: data });
});

app.post('/api/instructor/certificates/issue', auth, instructorOnly, async (req, res) => {
  const courseId = req.body?.course_id;
  const learnerId = req.body?.learner_id;
  const learnerName = req.body?.learner_name;
  if (!courseId || !learnerId || !learnerName) return bad(res, 'course_id, learner_id and learner_name are required.');
  const { data: template } = await supabase.from('sahan_certificate_templates').select('id').eq('course_id', courseId).eq('instructor_id', req.instructor.id).maybeSingle();
  if (!template) return bad(res, 'Create the course certificate template first.', 409);
  const { data, error } = await supabase.rpc('issue_sahan_certificate', { p_course_id: courseId, p_learner_id: learnerId, p_learner_name: learnerName });
  if (error) return bad(res, error.message, 409);
  res.status(201).json({ certificate: data });
});

app.get('/api/instructor/certificates', auth, instructorOnly, async (req, res) => {
  const { data, error } = await supabase.from('sahan_certificates').select('*').eq('instructor_id', req.instructor.id).order('issued_at', { ascending: false });
  if (error) return bad(res, error.message, 500);
  res.json({ certificates: data || [] });
});

app.get('/api/admin/promotion-requests', auth, adminOnly, async (req, res) => {
  const status = ['pending','approved','rejected'].includes(req.query.status) ? req.query.status : 'pending';
  const { data, error } = await supabase.from('promotion_requests').select('*,instructors(name,email),sahan_courses(title,slug)').eq('status', status).order('created_at', { ascending: true });
  if (error) return bad(res, error.message, 500);
  res.json({ requests: data || [] });
});

app.post('/api/admin/promotion-requests/:id/approve', auth, adminOnly, async (req, res) => {
  const { tier, weight, amount_paid = 0, start_date, end_date } = req.body || {};
  if (!['boosted','featured'].includes(tier) || Number(weight) < 0 || Number(weight) > 25) return bad(res, 'Tier or weight is invalid. Keep promotion weight between 0 and 25.');
  if (!start_date || !end_date || new Date(end_date) <= new Date(start_date)) return bad(res, 'A valid promotion window is required.');
  const { data: request } = await supabase.from('promotion_requests').select('*').eq('id', req.params.id).eq('status', 'pending').single();
  if (!request) return bad(res, 'Pending promotion request not found.', 404);
  const { data: promotion, error } = await supabase.from('promotions').insert({ promotion_request_id: request.id, course_id: request.course_id, tier, weight: Number(weight), amount_paid: Number(amount_paid), start_date, end_date }).select('*').single();
  if (error) return bad(res, error.message);
  const { error: updateError } = await supabase.from('promotion_requests').update({ status: 'approved', reviewed_by_admin_id: req.user.admin_id, reviewed_at: new Date().toISOString() }).eq('id', request.id);
  if (updateError) return bad(res, updateError.message, 500);
  res.json({ promotion });
});

app.post('/api/admin/promotion-requests/:id/reject', auth, adminOnly, async (req, res) => {
  const { data, error } = await supabase.from('promotion_requests').update({ status: 'rejected', admin_notes: req.body?.admin_notes || null, reviewed_by_admin_id: req.user.admin_id, reviewed_at: new Date().toISOString() }).eq('id', req.params.id).eq('status', 'pending').select('*').single();
  if (error || !data) return bad(res, error?.message || 'Pending request not found.', 404);
  res.json({ request: data });
});

app.get('/api/admin/courses', auth, adminOnly, async (_req, res) => {
  const { data, error } = await supabase.from('sahan_courses').select('id,title,slug,instructor_id,base_quality_score,admin_approved,status,rank_score,instructors(name,email),rank_overrides(manual_score)').order('title');
  if (error) return bad(res, error.message, 500);
  res.json({ courses: data || [] });
});

app.patch('/api/admin/courses/:id/approval', auth, adminOnly, async (req, res) => {
  const approved = req.body?.approved === true;
  const status = approved ? 'published' : (req.body?.status || 'draft');
  const { data, error } = await supabase.from('sahan_courses').update({ admin_approved: approved, status, updated_at: new Date().toISOString() }).eq('id', req.params.id).select('*').single();
  if (error) return bad(res, error.message, 404);
  res.json({ course: data });
});

app.post('/api/admin/rank-overrides', auth, adminOnly, async (req, res) => {
  const { course_id, manual_score } = req.body || {};
  if (!course_id || Number(manual_score) < -50 || Number(manual_score) > 50) return bad(res, 'manual_score must be between -50 and 50.');
  const { data, error } = await supabase.from('rank_overrides').upsert({ course_id, manual_score: Number(manual_score), set_by_admin_id: req.user.admin_id, updated_at: new Date().toISOString() }).select('*').single();
  if (error) return bad(res, error.message);
  res.json({ override: data });
});

app.get('/api/admin/instructors', auth, adminOnly, async (_req, res) => {
  const { data, error } = await supabase.from('instructors').select('id,name,email,commission_rate,status,created_at').order('created_at', { ascending: false });
  if (error) return bad(res, error.message, 500);
  res.json({ instructors: data || [] });
});

app.post('/api/admin/instructors', auth, adminOnly, async (req, res) => {
  const { email, name, bio, avatar_url, commission_rate = 0.70, password } = req.body || {};
  if (!email || !name) return bad(res, 'email and name are required.');
  if (Number(commission_rate) < 0 || Number(commission_rate) > 1) return bad(res, 'commission_rate must be between 0 and 1.');
  const normalizedEmail = String(email).trim().toLowerCase();
  const temporaryPassword = password || `Sahan-${crypto.randomUUID().slice(0, 8)}!`;
  const { data: created, error: authError } = await supabase.auth.admin.createUser({ email: normalizedEmail, password: temporaryPassword, email_confirm: true, user_metadata: { role: 'instructor' } });
  if (authError) return bad(res, authError.message);
  const { data: instructor, error } = await supabase.from('instructors').insert({ auth_user_id: created.user.id, email: normalizedEmail, name, bio, avatar_url, commission_rate: Number(commission_rate), created_by_admin_id: req.user.admin_id }).select('*').single();
  if (error) { await supabase.auth.admin.deleteUser(created.user.id); return bad(res, error.message); }
  res.status(201).json({ instructor, temporary_password: password ? undefined : temporaryPassword });
});

app.patch('/api/admin/instructors/:id', auth, adminOnly, async (req, res) => {
  const changes = {};
  if (req.body?.commission_rate !== undefined) changes.commission_rate = Number(req.body.commission_rate);
  if (req.body?.status !== undefined) changes.status = req.body.status;
  if (changes.commission_rate !== undefined && (changes.commission_rate < 0 || changes.commission_rate > 1)) return bad(res, 'commission_rate must be between 0 and 1.');
  if (changes.status && !['active','suspended'].includes(changes.status)) return bad(res, 'Invalid instructor status.');
  const { data, error } = await supabase.from('instructors').update(changes).eq('id', req.params.id).select('*').single();
  if (error) return bad(res, error.message, 404);
  if (data.auth_user_id && changes.status === 'suspended') await supabase.auth.admin.updateUserById(data.auth_user_id, { ban_duration: '876000h' });
  if (data.auth_user_id && changes.status === 'active') await supabase.auth.admin.updateUserById(data.auth_user_id, { ban_duration: 'none' });
  res.json({ instructor: data });
});

export default app;
