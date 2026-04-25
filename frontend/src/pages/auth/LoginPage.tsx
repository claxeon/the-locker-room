/**
 * LoginPage — The Locker Room
 *
 * Features:
 *   - Email + password sign-in via supabase.auth.signInWithPassword
 *   - Inline error display
 *   - "Forgot password?" flow — resets to a small inline state that sends a
 *     reset email via supabase.auth.resetPasswordForEmail
 *   - On success: navigates to /directory
 *   - Link to /signup at the bottom
 */

import React, { useState, FormEvent, ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

// ---------------------------------------------------------------------------
// Shared field styles — mirrors the dark design system used across TLR
// ---------------------------------------------------------------------------

const INPUT_BASE =
  "w-full bg-black border border-white/20 rounded text-white placeholder-white/30 px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-500 transition-colors";

const LABEL_BASE =
  "block text-xs font-semibold uppercase tracking-widest text-white/60 mb-1.5";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type View = "login" | "forgot" | "forgot-sent";

export function LoginPage() {
  const navigate = useNavigate();

  // ── View state (login / forgot password flow)
  const [view, setView] = useState<View>("login");

  // ── Login form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  // ── Forgot password
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);
  const [sendingReset, setSendingReset] = useState(false);

  // ── Login handler
  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Successful login — navigate to the directory.
      navigate("/directory");
    } catch (err: unknown) {
      setLoginError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setLoggingIn(false);
    }
  }

  // ── Forgot password handler
  async function handleForgotPassword(e: FormEvent) {
    e.preventDefault();
    setResetError(null);
    setSendingReset(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        resetEmail.trim(),
        {
          // Redirect the user back to the app after they click the reset link.
          // Adjust this URL to match your production domain / Reset Password page.
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      setView("forgot-sent");
    } catch (err: unknown) {
      setResetError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setSendingReset(false);
    }
  }

  // ── Forgot-password: success screen
  if (view === "forgot-sent") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="text-yellow-500 text-5xl">✉️</div>
          <h2 className="text-2xl font-black uppercase tracking-widest text-white">
            Check your inbox
          </h2>
          <p className="text-white/50 text-sm leading-relaxed">
            If an account exists for{" "}
            <span className="text-yellow-500">{resetEmail}</span>, we've sent a
            password reset link. It may take a couple of minutes.
          </p>
          <button
            onClick={() => {
              setView("login");
              setResetEmail("");
              setResetError(null);
            }}
            className="text-yellow-500 hover:text-yellow-400 text-sm font-semibold transition-colors"
          >
            ← Back to sign in
          </button>
        </div>
      </div>
    );
  }

  // ── Forgot-password: input screen
  if (view === "forgot") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <p className="text-yellow-500 text-xs font-bold uppercase tracking-widest">
              The Locker Room
            </p>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white">
              Reset password
            </h1>
            <p className="text-white/40 text-sm">
              Enter your .edu email and we'll send you a reset link.
            </p>
          </div>

          {resetError && (
            <div
              role="alert"
              className="bg-red-950/60 border border-red-500/40 text-red-300 rounded px-4 py-3 text-sm"
            >
              {resetError}
            </div>
          )}

          <form onSubmit={handleForgotPassword} noValidate className="space-y-5">
            <div>
              <label htmlFor="resetEmail" className={LABEL_BASE}>
                University email
              </label>
              <input
                id="resetEmail"
                type="email"
                autoComplete="email"
                value={resetEmail}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setResetEmail(e.target.value)
                }
                placeholder="jsmith@university.edu"
                className={INPUT_BASE}
                required
              />
            </div>

            <button
              type="submit"
              disabled={sendingReset}
              className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-500/40 disabled:cursor-not-allowed text-black font-black uppercase tracking-widest text-sm py-3 rounded transition-colors"
            >
              {sendingReset ? "Sending link…" : "Send reset link"}
            </button>
          </form>

          <button
            onClick={() => {
              setView("login");
              setResetError(null);
            }}
            className="w-full text-center text-white/30 hover:text-white/60 text-sm transition-colors"
          >
            ← Back to sign in
          </button>
        </div>
      </div>
    );
  }

  // ── Main login form
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <p className="text-yellow-500 text-xs font-bold uppercase tracking-widest">
            The Locker Room
          </p>
          <h1 className="text-4xl font-black uppercase tracking-tight text-white">
            Sign in
          </h1>
          <p className="text-white/40 text-sm">
            Welcome back. Athletes only.
          </p>
        </div>

        {/* Error banner */}
        {loginError && (
          <div
            role="alert"
            className="bg-red-950/60 border border-red-500/40 text-red-300 rounded px-4 py-3 text-sm"
          >
            {loginError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} noValidate className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className={LABEL_BASE}>
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setEmail(e.target.value);
                if (loginError) setLoginError(null);
              }}
              placeholder="jsmith@university.edu"
              className={INPUT_BASE}
              required
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className={LABEL_BASE + " mb-0"}>
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  // Pre-fill the reset email with whatever the user typed.
                  setResetEmail(email);
                  setView("forgot");
                }}
                className="text-xs text-white/30 hover:text-yellow-500 transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setPassword(e.target.value);
                if (loginError) setLoginError(null);
              }}
              placeholder="••••••••"
              className={INPUT_BASE}
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loggingIn}
            className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-500/40 disabled:cursor-not-allowed text-black font-black uppercase tracking-widest text-sm py-3 rounded transition-colors"
          >
            {loggingIn ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {/* Sign up link */}
        <p className="text-center text-white/30 text-sm">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-yellow-500 hover:text-yellow-400 transition-colors font-semibold"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
