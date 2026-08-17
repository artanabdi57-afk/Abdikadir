import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const app = express();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors({ origin: process.env.TEACH_APP_ORIGIN || true, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));

const signPortalToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: '8h', issuer: 'sahan-teach' });
const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Authentication token is required.' });
  try { req.user = jwt.verify(token, JWT_SECRET, { issuer: 'sahan-teach' }); next(); }
  catch { return res.status(401).json({ message: 'Invalid or expired authentication token.' }); }
};
const requireAdmin = (req, res, next) => req.user?.role === 'admin' ? next() : res.status(403).json({ message: 'Admin access required.' });
const ensureActiveInstructor = async (req, res, next) => {
  if (req.user?.role !== 'instructor' || !req.user.instructor_id) return res.status(403).json({ message: 'Instructor access required.' });
  const { data, error } = await supabase.from('instructors').select('*').eq('id', req.user.instructor_id).single();
  if (error || !data) return res.status(403).json({ message: 'Instructor account not found.' });
  if (data.status !== 'active') return res.status(403).json({ message: 'Instructor account is suspended.' });
  req.instructor = data; next();
};

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'sahan-teach-api' }));

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
  const { data, error } = await supabase.auth.signInWithPassword({ email: String(email).trim().toLowerCase(), password });
  if (error || !data.user) return res.status(401).json({ message: 'Invalid email or password.' });
  const user = data.user;
  const [{ data: instructor }, { data: admin }] = await Promise.all([
    supabase.from('instructors').select('*').eq('auth_user_id', user.id).maybeSingle(),
    supabase.from('admins').select('*').eq('auth_user_id', user.id).maybeSingle()
  ]);
  if (admin?.status === 'active') return res.json({ token: signPortalToken({ sub: user.id, role: 'admin', admin_id: admin.id, email: user.email }), user: { role: 'admin', name: admin.name, email: admin.email } });
  if (instructor?.status === 'active') return res.json({ token: signPortalToken({ sub: user.id, role: 'instructor', instructor_id: instructor.id, email: user.email }), user: { role: 'instructor', id: instructor.id, name: instructor.name, email: instructor.email } });
  return res.status(403).json({ message: 'This account is not authorized for teach.sahan.com.' });
});

app.post('/api/auth/magic-link', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!email) return res.status(400).json({ message: 'Email is required.' });
  const [{ data: instructor }, { data: admin }] = await Promise.all([
    supabase.from('instructors').select('id,status').eq('email', email).maybeSingle(),
    supabase.from('admins').select('id,status').eq('email', email).maybeSingle()
  ]);
  if ((!instructor || instructor.status !== 'active') && (!admin || admin.status !== 'active')) return res.status(403).json({ message: 'This email is not an approved Sahan teaching account.' });
  const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo: process.env.TEACH_AUTH_REDIRECT_URL } });
  if (error) return res.status(400).json({ message: error.message });
  res.json({ message: 'Magic link sent. Check your approved email address.' });
});

app.get('/api/auth/google', async (_req, res) => {
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: process.env.TEACH_AUTH_REDIRECT_URL } });
  if (error) return res.status(400).json({ message: error.message });
  res.json({ url: data.url });
});

app.post('/api/auth/exchange', async (req, res) => {
  const accessToken = req.body?.access_token;
  if (!accessToken) return res.status(400).json({ message: 'Supabase access token is required.' });
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) return res.status(401).json({ message: 'Invalid OAuth session.' });
  const [{ data: instructor }, { data: admin }] = await Promise.all([
    supabase.from('instructors').select('*').eq('auth_user_id', user.id).maybeSingle(),
    supabase.from('admins').select('*').eq('auth_user_id', user.id).maybeSingle()
  ]);
  if (admin?.status === 'active') return res.json({ token: signPortalToken({ sub: user.id, role: 'admin', admin_id: admin.id, email: user.email }), user: { role: 'admin', name: admin.name, email: admin.email } });
  if (instructor?.status === 'active') return res.json({ token: signPortalToken({ sub: user.id, role: 'instructor', instructor_id: instructor.id, email: user.email }), user: { role: 'instructor', id: instructor.id, name: instructor.name, email: instructor.email } });
  res.status(403).json({ message: 'Your account is not an approved teaching/admin account.' });
});

app.get('/api/instructor/overview', authenticate, ensureActiveInstructor, async (req, res) => {
  const { data: courses, error } = await supabase.from('sahan_courses').select('id,title,status,admin_approved,rank_score,base_quality_score').eq('instructor_id', req.instructor.id);
  if (error) return res.status(500).json({ message: error.message });
  const ids = courses.map(c => c.id);
  const [{ data: enrollments }, { data: orders }, { data: payouts }] = await Promise.all([
    ids.length ? supabase.from('sahan_enrollments').select('id,course_id,status').in('course_id', ids) : Promise.resolve({ data: [] }),
    ids.length ? supabase.from('sahan_orders').select('course_id,amount,status').in('course_id', ids) : Promise.resolve({ data: [] }),
    supabase.from('payouts').select('amount,status').eq('instructor_id', req.instructor.id)
  ]);
  const revenue = (orders || []).filter(o => o.status === 'paid' || o.status === 'completed').reduce((sum,o)=>sum+Number(o.amount||0),0);
  const pending = (payouts || []).filter(p=>p.status==='pending').reduce((sum,p)=>sum+Number(p.amount||0),0);
  res.json({ courses, enrollments_count:(enrollments||[]).length, revenue, pending_payout:pending });
});

app.get('/api/instructor/courses', authenticate, ensureActiveInstructor, async (req, res) => {
  const { data, error } = await supabase.from('sahan_courses').select('id,title,slug,description,cover_url,category,level,price,currency,status,admin_approved,rank_score,base_quality_score,updated_at').eq('instructor_id', req.instructor.id).order('updated_at', { ascending: false });
  if (error) return res.status(500).json({ message: error.message });
  const ids = data.map(c => c.id);
  const { data: activePromos } = ids.length ? await supabase.from('promotions').select('course_id,tier,weight,start_date,end_date').in('course_id', ids).lte('start_date', new Date().toISOString()).gt('end_date', new Date().toISOString()) : { data: [] };
  const promos = new Map((activePromos || []).map(p => [p.course_id, p]));
  res.json({ courses: data.map(c => ({ ...c, active_promotion: promos.get(c.id) || null })) });
});

app.post('/api/instructor/promotion-requests', authenticate, ensureActiveInstructor, async (req, res) => {
  const { course_id, requested_duration_days, requested_budget } = req.body || {};
  const { data: course, error: courseError } = await supabase.from('sahan_courses').select('id,title').eq('id', course_id).eq('instructor_id', req.instructor.id).single();
  if (courseError || !course) return res.status(404).json({ message: 'Course not found for this instructor.' });
  const { data: existing } = await supabase.from('promotion_requests').select('id').eq('course_id',course_id).eq('status','pending').maybeSingle();
  if (existing) return res.status(409).json({ message: 'This course already has a pending promotion request.' });
  const { data, error } = await supabase.from('promotion_requests').insert({ instructor_id:req.instructor.id,course_id,requested_duration_days,requested_budget }).select('*').single();
  if (error) return res.status(400).json({ message: error.message });
  res.status(201).json({ request:data });
});

app.get('/api/instructor/promotion-requests', authenticate, ensureActiveInstructor, async (req, res) => {
  const { data, error } = await supabase.from('promotion_requests').select('*,sahan_courses(title)').eq('instructor_id', req.instructor.id).order('created_at',{ascending:false});
  if (error) return res.status(500).json({ message:error.message }); res.json({ requests:data });
});

app.get('/api/instructor/payouts', authenticate, ensureActiveInstructor, async (req, res) => {
  const { data, error } = await supabase.from('payouts').select('*').eq('instructor_id',req.instructor.id).order('period_end',{ascending:false});
  if (error) return res.status(500).json({ message:error.message });
  const pending_balance=(data||[]).filter(p=>p.status==='pending').reduce((sum,p)=>sum+Number(p.amount),0);
  res.json({ payouts:data||[],pending_balance });
});

app.get('/api/admin/promotion-requests', authenticate, requireAdmin, async (req,res)=>{const status=req.query.status||'pending';const {data,error}=await supabase.from('promotion_requests').select('*,instructors(name,email),sahan_courses(title,slug)').eq('status',status).order('created_at',{ascending:true});if(error)return res.status(500).json({message:error.message});res.json({requests:data});});
app.post('/api/admin/promotion-requests/:id/approve', authenticate, requireAdmin, async (req,res)=>{const {tier,weight,amount_paid,start_date,end_date}=req.body||{};if(!['boosted','featured'].includes(tier)||Number(weight)<0||Number(weight)>25)return res.status(400).json({message:'Tier or weight is invalid. Keep promotion weight between 0 and 25.'});if(!start_date||!end_date||new Date(end_date)<=new Date(start_date))return res.status(400).json({message:'A valid promotion window is required.'});const {data:request,error:requestError}=await supabase.from('promotion_requests').select('*').eq('id',req.params.id).eq('status','pending').single();if(requestError||!request)return res.status(404).json({message:'Pending promotion request not found.'});const {data:promotion,error}=await supabase.from('promotions').insert({promotion_request_id:request.id,course_id:request.course_id,tier,weight,amount_paid,start_date,end_date}).select('*').single();if(error)return res.status(400).json({message:error.message});const {error:updateError}=await supabase.from('promotion_requests').update({status:'approved',reviewed_by_admin_id:req.user.admin_id,reviewed_at:new Date().toISOString()}).eq('id',request.id);if(updateError)return res.status(500).json({message:updateError.message});res.json({promotion});});
app.post('/api/admin/promotion-requests/:id/reject', authenticate, requireAdmin, async (req,res)=>{const {data,error}=await supabase.from('promotion_requests').update({status:'rejected',admin_notes:req.body?.admin_notes||null,reviewed_by_admin_id:req.user.admin_id,reviewed_at:new Date().toISOString()}).eq('id',req.params.id).eq('status','pending').select('*').single();if(error||!data)return res.status(404).json({message:error?.message||'Pending request not found.'});res.json({request:data});});
app.post('/api/admin/rank-overrides', authenticate, requireAdmin, async (req,res)=>{const {course_id,manual_score}=req.body||{};if(!course_id||Number(manual_score)<-50||Number(manual_score)>50)return res.status(400).json({message:'manual_score must be between -50 and 50.'});const {data,error}=await supabase.from('rank_overrides').upsert({course_id,manual_score,set_by_admin_id:req.user.admin_id,updated_at:new Date().toISOString()}).select('*').single();if(error)return res.status(400).json({message:error.message});res.json({override:data});});
app.get('/api/admin/courses', authenticate, requireAdmin, async (_req,res)=>{const {data,error}=await supabase.from('sahan_courses').select('id,title,slug,instructor_id,base_quality_score,admin_approved,status,rank_score,instructors(name,email),rank_overrides(manual_score)').order('title');if(error)return res.status(500).json({message:error.message});res.json({courses:data});});
app.get('/api/admin/instructors', authenticate, requireAdmin, async (_req,res)=>{const {data,error}=await supabase.from('instructors').select('id,name,email,commission_rate,status,created_at').order('created_at',{ascending:false});if(error)return res.status(500).json({message:error.message});res.json({instructors:data});});
app.post('/api/admin/instructors', authenticate, requireAdmin, async (req,res)=>{const {email,name,bio,avatar_url,commission_rate=.70,password}=req.body||{};if(!email||!name)return res.status(400).json({message:'email and name are required.'});if(Number(commission_rate)<0||Number(commission_rate)>1)return res.status(400).json({message:'commission_rate must be between 0 and 1.'});const temporaryPassword=password||`Sahan-${crypto.randomUUID().slice(0,8)}!`;const {data:created,error:authError}=await supabase.auth.admin.createUser({email:String(email).trim().toLowerCase(),password:temporaryPassword,email_confirm:true,user_metadata:{role:'instructor'}});if(authError)return res.status(400).json({message:authError.message});const {data:instructor,error}=await supabase.from('instructors').insert({auth_user_id:created.user.id,email:String(email).trim().toLowerCase(),name,bio,avatar_url,commission_rate,created_by_admin_id:req.user.admin_id}).select('*').single();if(error){await supabase.auth.admin.deleteUser(created.user.id);return res.status(400).json({message:error.message});}res.status(201).json({instructor,temporary_password:password?undefined:temporaryPassword});});
app.patch('/api/admin/instructors/:id', authenticate, requireAdmin, async (req,res)=>{const allowed={};if(req.body?.commission_rate!==undefined)allowed.commission_rate=req.body.commission_rate;if(req.body?.status)allowed.status=req.body.status;if(allowed.commission_rate!==undefined&&(Number(allowed.commission_rate)<0||Number(allowed.commission_rate)>1))return res.status(400).json({message:'commission_rate must be between 0 and 1.'});if(allowed.status&&!['active','suspended'].includes(allowed.status))return res.status(400).json({message:'Invalid instructor status.'});const {data,error}=await supabase.from('instructors').update(allowed).eq('id',req.params.id).select('*').single();if(error)return res.status(400).json({message:error.message});if(data.auth_user_id&&allowed.status==='suspended')await supabase.auth.admin.updateUserById(data.auth_user_id,{ban_duration:'876000h'});if(data.auth_user_id&&allowed.status==='active')await supabase.auth.admin.updateUserById(data.auth_user_id,{ban_duration:'none'});res.json({instructor:data});});

export default app;
