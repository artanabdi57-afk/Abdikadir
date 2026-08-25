import React, { useEffect, useState } from 'react'
import { supabase, getAuthRedirectUrl } from '../lib/supabase'
import '../styles/auth.css'

const friendlyError = (error) => {
  const message = error?.message || 'Something went wrong. Please try again.'
  if (/invalid login credentials/i.test(message)) return 'Email or password is incorrect.'
  if (/email not confirmed/i.test(message)) return 'Please verify your email before signing in.'
  if (/password.*(6|characters)/i.test(message)) return 'Your password must be at least 6 characters.'
  if (/user already registered/i.test(message)) return 'An account with this email already exists. Try signing in.'
  return message
}

export default function Auth({ mode = 'login', onAuthenticated }) {
  const [view, setView] = useState(mode)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setView(mode)
    setError('')
    setMessage('')
  }, [mode])

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    try {
      if (view === 'signup') {
        if (!name.trim()) throw new Error('Please enter your full name.')
        if (password.length < 6) throw new Error('Your password must be at least 6 characters.')
        if (password !== confirm) throw new Error('Passwords do not match.')
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: { full_name: name.trim(), role: 'learner' },
            emailRedirectTo: getAuthRedirectUrl('/auth/callback'),
          },
        })
        if (authError) throw authError
        if (data.session && data.user?.email_confirmed_at) {
          onAuthenticated?.(data.session)
        } else {
          setMessage('Account created. Check your email and click the verification link before signing in.')
          setView('login')
        }
      } else if (view === 'login') {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        })
        if (authError) throw authError
        if (!data.user?.email_confirmed_at) {
          await supabase.auth.signOut()
          throw new Error('Please verify your email before signing in.')
        }
        onAuthenticated?.(data.session)
      } else if (view === 'forgot') {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
          redirectTo: getAuthRedirectUrl('/reset-password'),
        })
        if (authError) throw authError
        setMessage('If an account exists for this email, a password reset link has been sent.')
      } else if (view === 'reset') {
        if (password.length < 6) throw new Error('Your password must be at least 6 characters.')
        if (password !== confirm) throw new Error('Passwords do not match.')
        const { error: authError } = await supabase.auth.updateUser({ password })
        if (authError) throw authError
        setMessage('Password updated successfully. You can now sign in.')
        setPassword('')
        setConfirm('')
        setView('login')
      }
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setBusy(false)
    }
  }

  const title = view === 'signup' ? 'Create your learner account.' : view === 'forgot' ? 'Reset your password.' : view === 'reset' ? 'Choose a new password.' : 'Welcome back to Sahan.'
  const subtitle = view === 'signup' ? 'Create a real Sahan account and keep your learning progress with you.' : view === 'forgot' ? 'Enter your email and we will send you a secure reset link.' : view === 'reset' ? 'Your new password will protect your Sahan account.' : 'Sign in to continue learning.'

  return <main className="auth-page">
    <section className="auth-card">
      <button className="auth-brand" onClick={() => window.location.assign('/')}>S<span>Sahan</span></button>
      <div className="auth-copy"><div className="auth-kicker">SAHAN · LEARNER</div><h1>{title}</h1><p>{subtitle}</p></div>
      {message && <div className="auth-success" role="status">{message}</div>}
      {error && <div className="auth-error" role="alert">{error}</div>}
      <form onSubmit={submit} className="auth-form">
        {view === 'signup' && <label>Full name<input autoComplete="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" required /></label>}
        {view !== 'reset' && <label>Email<input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required /></label>}
        {view !== 'forgot' && <label>Password<input type="password" autoComplete={view === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" required /></label>}
        {(view === 'signup' || view === 'reset') && <label>Confirm password<input type="password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat your password" required /></label>}
        <button className="auth-submit" disabled={busy}>{busy ? 'Please wait…' : view === 'signup' ? 'Create account' : view === 'forgot' ? 'Send reset link' : view === 'reset' ? 'Update password' : 'Sign in'}</button>
      </form>
      <div className="auth-links">
        {view === 'login' && <><button onClick={() => setView('forgot')}>Forgot password?</button><span>New to Sahan?</span><button onClick={() => setView('signup')}>Create account</button></>}
        {view === 'signup' && <><span>Already have an account?</span><button onClick={() => setView('login')}>Sign in</button></>}
        {view === 'forgot' && <button onClick={() => setView('login')}>Back to sign in</button>}
        {view === 'reset' && <button onClick={() => setView('login')}>Back to sign in</button>}
      </div>
      <small className="auth-note">Your account, profile and learning data are stored in Sahan's Supabase backend — not in a demo browser account.</small>
    </section>
  </main>
}
