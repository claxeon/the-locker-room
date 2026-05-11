/**
 * LoginPage — The Locker Room
 * Redesigned: navy/periwinkle palette
 */

import React, { useState, FormEvent, ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

// ── Shared input/label styles (navy palette)
const INPUT_BASE: React.CSSProperties = {
  width: '100%',
  backgroundColor: 'rgba(20,21,31,0.80)',
  border: '1px solid #2a2a3c',
  borderRadius: '0.625rem',
  color: '#f0f0f8',
  padding: '0.75rem 1rem',
  fontSize: '0.875rem',
  outline: 'none',
  transition: 'border-color 0.15s',
}

const LABEL_BASE: React.CSSProperties = {
  display: 'block',
  fontSize: '0.625rem',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  color: '#8888a8',
  marginBottom: '0.375rem',
}

type View = "login" | "forgot" | "forgot-sent";

export function LoginPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);
  const [sendingReset, setSendingReset] = useState(false);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw new Error(error.message);
      navigate("/directory");
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleForgotPassword(e: FormEvent) {
    e.preventDefault();
    setResetError(null);
    setSendingReset(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw new Error(error.message);
      setView("forgot-sent");
    } catch (err: unknown) {
      setResetError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setSendingReset(false);
    }
  }

  const pageWrap = {
    minHeight: '100vh',
    backgroundColor: '#0A0E1A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  } as React.CSSProperties

  // ── forgot-sent ──
  if (view === "forgot-sent") {
    return (
      <div style={pageWrap}>
        <div style={{ maxWidth: '28rem', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
            style={{ border: '1px solid rgba(20,184,166,0.30)', backgroundColor: 'rgba(20,184,166,0.10)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 28, height: 28, color: '#14B8A6' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#f0f0f8', marginBottom: '0.5rem' }}>
              Check your inbox
            </h2>
            <p style={{ color: '#555570', fontSize: '0.875rem', lineHeight: 1.6 }}>
              If an account exists for{" "}
              <span style={{ color: '#14B8A6' }}>{resetEmail}</span>
              , we've sent a password reset link. It may take a couple of minutes.
            </p>
          </div>
          <button
            onClick={() => { setView("login"); setResetEmail(""); setResetError(null); }}
            style={{ color: '#14B8A6', fontSize: '0.875rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#14B8A6'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#14B8A6'}
          >
            ← Back to sign in
          </button>
        </div>
      </div>
    );
  }

  // ── forgot form ──
  if (view === "forgot") {
    return (
      <div style={pageWrap}>
        <div style={{ maxWidth: '28rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p style={{ fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#14B8A6' }}>
              The Locker Room
            </p>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#f0f0f8' }}>
              Reset password
            </h1>
            <p style={{ color: '#555570', fontSize: '0.875rem' }}>
              Enter your .edu email and we'll send you a reset link.
            </p>
          </div>

          {resetError && (
            <div role="alert" style={{ backgroundColor: 'rgba(127,29,29,0.40)', border: '1px solid rgba(239,68,68,0.35)', color: '#fca5a5', borderRadius: '0.5rem', padding: '0.75rem 1rem', fontSize: '0.875rem' }}>
              {resetError}
            </div>
          )}

          <form onSubmit={handleForgotPassword} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label htmlFor="resetEmail" style={LABEL_BASE}>University email</label>
              <input
                id="resetEmail"
                type="email"
                autoComplete="email"
                value={resetEmail}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setResetEmail(e.target.value)}
                placeholder="jsmith@university.edu"
                style={{ ...INPUT_BASE, caretColor: '#14B8A6' }}
                onFocus={e => (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(124,126,184,0.60)'}
                onBlur={e => (e.currentTarget as HTMLInputElement).style.borderColor = '#2a2a3c'}
                required
              />
            </div>
            <button
              type="submit"
              disabled={sendingReset}
              style={{
                width: '100%',
                backgroundColor: sendingReset ? 'rgba(20,184,166,0.40)' : '#14B8A6',
                color: '#0A0E1A',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                fontSize: '0.75rem',
                padding: '0.875rem',
                borderRadius: '0.625rem',
                border: 'none',
                cursor: sendingReset ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={e => { if (!sendingReset) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#14B8A6' }}
              onMouseLeave={e => { if (!sendingReset) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#14B8A6' }}
            >
              {sendingReset ? "Sending link…" : "Send reset link"}
            </button>
          </form>

          <button
            onClick={() => { setView("login"); setResetError(null); }}
            style={{ width: '100%', textAlign: 'center', color: '#555570', fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#a8a8c0'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#555570'}
          >
            ← Back to sign in
          </button>
        </div>
      </div>
    );
  }

  // ── main login ──
  return (
    <div style={pageWrap}>
      <div style={{ maxWidth: '28rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <p style={{ fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#14B8A6' }}>
            The Locker Room
          </p>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#f0f0f8' }}>
            Sign in
          </h1>
          <p style={{ color: '#555570', fontSize: '0.875rem' }}>Welcome back. Athletes only.</p>
        </div>

        {loginError && (
          <div role="alert" style={{ backgroundColor: 'rgba(127,29,29,0.40)', border: '1px solid rgba(239,68,68,0.35)', color: '#fca5a5', borderRadius: '0.5rem', padding: '0.75rem 1rem', fontSize: '0.875rem' }}>
            {loginError}
          </div>
        )}

        <form onSubmit={handleLogin} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label htmlFor="email" style={LABEL_BASE}>Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => { setEmail(e.target.value); if (loginError) setLoginError(null); }}
              placeholder="jsmith@university.edu"
              style={{ ...INPUT_BASE, caretColor: '#14B8A6' }}
              onFocus={e => (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(124,126,184,0.60)'}
              onBlur={e => (e.currentTarget as HTMLInputElement).style.borderColor = '#2a2a3c'}
              required
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
              <label htmlFor="password" style={{ ...LABEL_BASE, marginBottom: 0 }}>Password</label>
              <button
                type="button"
                onClick={() => { setResetEmail(email); setView("forgot"); }}
                style={{ fontSize: '0.75rem', color: '#555570', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#14B8A6'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#555570'}
              >
                Forgot password?
              </button>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => { setPassword(e.target.value); if (loginError) setLoginError(null); }}
              placeholder="••••••••"
              style={{ ...INPUT_BASE, caretColor: '#14B8A6' }}
              onFocus={e => (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(124,126,184,0.60)'}
              onBlur={e => (e.currentTarget as HTMLInputElement).style.borderColor = '#2a2a3c'}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loggingIn}
            style={{
              width: '100%',
              backgroundColor: loggingIn ? 'rgba(20,184,166,0.40)' : '#14B8A6',
              color: '#0A0E1A',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontSize: '0.75rem',
              padding: '0.875rem',
              borderRadius: '0.625rem',
              border: 'none',
              cursor: loggingIn ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.15s',
              boxShadow: loggingIn ? 'none' : '0 0 24px 0 rgba(124,126,184,0.28)',
            }}
            onMouseEnter={e => { if (!loggingIn) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#14B8A6' }}
            onMouseLeave={e => { if (!loggingIn) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#14B8A6' }}
          >
            {loggingIn ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#555570', fontSize: '0.875rem' }}>
          Don't have an account?{" "}
          <Link
            to="/signup"
            style={{ color: '#14B8A6', fontWeight: 600, textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#14B8A6'}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#14B8A6'}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
