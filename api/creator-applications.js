import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://dwmwdhybmpfjqvkbgqsj.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_ne4m2N6HRJU9OZd6JJEnjA_gk78plxG';

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

  const { name, email, teaching_topic, bio } = req.body || {};
  const cleanName = String(name || '').trim();
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const cleanTopic = String(teaching_topic || '').trim();
  const cleanBio = String(bio || '').trim();

  if (!cleanName || !normalizedEmail || !cleanTopic) {
    return res.status(400).json({ message: 'Enter your full name, your Sahan account email, and what you want to teach.' });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await supabase.rpc('submit_creator_application', {
      p_name: cleanName,
      p_email: normalizedEmail,
      p_teaching_topic: cleanTopic,
      p_bio: cleanBio || null,
    });

    if (error) {
      console.error('creator application RPC failed', error);
      const message = error.message || 'Unable to submit your creator application.';
      const status = message.includes('already pending') || message.includes('already approved') ? 409 : message.includes('Create your Sahan') ? 404 : message.includes('verify') ? 403 : 503;
      return res.status(status).json({ message });
    }

    return res.status(201).json(data || {
      success: true,
      status: 'pending',
      message: 'Application submitted successfully. Your request is now waiting for admin approval.'
    });
  } catch (error) {
    console.error('creator application error', error);
    return res.status(503).json({ message: 'Unable to submit your creator application.' });
  }
}
