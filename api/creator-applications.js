import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://dwmwdhybmpfjqvkbgqsj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ message: 'Creator applications are not configured yet. Missing SUPABASE_SERVICE_ROLE_KEY on the server.' });
  }

  const { name, email, teaching_topic, bio } = req.body || {};
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const cleanName = String(name || '').trim();
  const cleanTopic = String(teaching_topic || '').trim();

  if (!cleanName || !normalizedEmail || !cleanTopic) {
    return res.status(400).json({ message: 'Enter your full name, your Sahan account email, and what you want to teach.' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const { data: existing, error: existingError } = await supabase
      .from('sahan_creator_applications')
      .select('id,status')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existingError) {
      return res.status(500).json({ message: `Unable to check your application: ${existingError.message}` });
    }
    if (existing?.status === 'pending') {
      return res.status(409).json({ message: 'Your creator application is already pending admin review.' });
    }
    if (existing?.status === 'approved') {
      return res.status(409).json({ message: 'This Sahan account is already approved as a creator.' });
    }

    const payload = {
      name: cleanName,
      email: normalizedEmail,
      teaching_topic: cleanTopic,
      bio: String(bio || '').trim(),
      status: 'pending',
      admin_notes: null,
      reviewed_at: null,
      reviewed_by_admin_id: null,
    };

    const { error } = existing
      ? await supabase.from('sahan_creator_applications').update(payload).eq('id', existing.id)
      : await supabase.from('sahan_creator_applications').insert(payload);

    if (error) {
      return res.status(500).json({ message: `Unable to submit your application: ${error.message}` });
    }

    return res.status(201).json({
      message: 'Application submitted successfully. Your request is now waiting for admin approval.'
    });
  } catch (error) {
    return res.status(500).json({ message: error?.message || 'Unexpected server error while submitting the application.' });
  }
}
