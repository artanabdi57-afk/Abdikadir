import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://dwmwdhybmpfjqvkbgqsj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ message: 'Creator applications are not configured yet. Missing SUPABASE_SERVICE_ROLE_KEY on the server.' });
  }

  const { name, email, teaching_topic, bio } = req.body || {};
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const cleanName = String(name || '').trim();
  const cleanTopic = String(teaching_topic || '').trim();
  const cleanBio = String(bio || '').trim();

  if (!cleanName || !normalizedEmail || !cleanTopic) {
    return res.status(400).json({ message: 'Enter your full name, your Sahan account email, and what you want to teach.' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // The application must belong to an existing Sahan learner account.
    const { data: usersPage, error: usersError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (usersError) {
      return res.status(503).json({ message: 'Unable to verify your Sahan account.' });
    }

    const account = (usersPage?.users || []).find(
      user => String(user.email || '').trim().toLowerCase() === normalizedEmail
    );

    if (!account) {
      return res.status(404).json({ message: 'Create your Sahan learner account first, then apply using the same email.' });
    }

    if (!account.email_confirmed_at) {
      return res.status(403).json({ message: 'Please verify your Sahan account email before applying.' });
    }

    const { data: existing, error: existingError } = await supabase
      .from('sahan_creator_applications')
      .select('id,status,user_id')
      .or(`user_id.eq.${account.id},email.eq.${normalizedEmail}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingError) {
      return res.status(503).json({ message: 'Unable to check your application.' });
    }
    if (existing?.status === 'pending') {
      return res.status(409).json({ message: 'Your creator application is already pending admin review.' });
    }
    if (existing?.status === 'approved') {
      return res.status(409).json({ message: 'This Sahan account is already approved as a creator.' });
    }

    const payload = {
      user_id: account.id,
      full_name: cleanName,
      email: normalizedEmail,
      expertise: cleanTopic,
      experience: cleanBio || null,
      status: 'pending',
      reviewed_by: null,
      reviewed_at: null,
      rejection_reason: null,
      updated_at: new Date().toISOString(),
    };

    const { error } = existing
      ? await supabase.from('sahan_creator_applications').update(payload).eq('id', existing.id)
      : await supabase.from('sahan_creator_applications').insert(payload);

    if (error) {
      console.error('creator application persistence failed', error);
      return res.status(503).json({ message: 'Unable to submit your creator application.' });
    }

    return res.status(201).json({
      message: 'Application submitted successfully. Your request is now waiting for admin approval.'
    });
  } catch (error) {
    console.error('creator application error', error);
    return res.status(503).json({ message: 'Unable to submit your creator application.' });
  }
}
