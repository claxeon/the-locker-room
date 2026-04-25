/**
 * ResetPasswordPage — The Locker Room
 *
 * Handles the password reset flow after a user clicks the reset link from email.
 * The link contains a hash with type=recovery and an access_token.
 *
 * Flow:
 *  1. On mount, parse the URL hash for type=recovery + access_token
 *  2. Call supabase.auth.setSession to activate the recovery session
 *  3. Also listen via onAuthStateChange for PASSWORD_RECOVERY event (belt-and-suspenders)
 *  4. Show the "set new password" form once recovery session is active
 *  5. On submit, call supabase.auth.updateUser({ password })
 *  6. On success, show confirmation + redirect to /dashboard after 2s
 */

import React, { useEffect, useState, useRef, FormEvent, ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, Lock, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'

// ---------------------------------------------------------------------------
// Style constants — TLR dark design system
// ---------------------------------------------------------------------------

const INPUT_BASE =
  'w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500/50 transition-colors text-sm'

const LABEL_BASE =
  'block text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2'

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type PageState = 'loading' | 'form' | 'success' | 'error'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [pageState, setPageState] = useState<PageState>('loading')
  const [initError, setInitError] = useState<string | null>(null)

  // Form state
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Prevent double-processing
  const sessionSetRef = useRef(false)

  useEffect(() => {
    let unsubscribe: (() => void) | null = null

    async function init() {
      // 1. Parse the URL hash for recovery tokens
      const hash = window.location.hash
      const params = new URLSearchParams(hash.replace(/^#/, ''))
      const type = params.get('type')
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token') ?? ''

      if (type === 'recovery' && accessToken && !sessionSetRef.current) {
        sessionSetRef.current = true
        try {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          if (error) {
            setInitError(error.message)
            setPageState('error')
            return
          }
          setPageState('form')
        } catch (err: unknown) {
          setInitError(
            err instanceof Error ? err.message : 'Failed to initialize reset session.'
          )
          setPageState('error')
        }
        return
      }

      // 2. Belt-and-suspenders: listen for PASSWORD_RECOVERY auth event
      const { data } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY' && !sessionSetRef.current) {
          sessionSetRef.current = true
          setPageState('form')
        }
      })
      unsubscribe = () => data.subscription.unsubscribe()

      // 3. If no hash token and no recovery event after a short wait, show error
      // (user may have landed here without a valid link)
      setTimeout(() => {
        setPageState((prev) => {
          if (prev === 'loading') {
            setInitError(
              'No password reset link detected. Please request a new reset link from the login page.'
            )
            return 'error'
          }
          return prev
        })
      }, 2000)
    }

    init()

    return () => {
      unsubscribe?.()
    }
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.')
      return
    }

    setSubmitting(true)

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw new Error(error.message)

      setPageState('success')

      // Auto-redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : 'An unexpected error occurred.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Render: Loading
  // ---------------------------------------------------------------------------

  if (pageState === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-zinc-400 text-sm">Verifying reset link…</p>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Render: Error (bad or expired link)
  // ---------------------------------------------------------------------------

  if (pageState === 'error') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center space-y-5"
        >
          <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={28} className="text-red-400" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2">
              The Locker Room
            </p>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white mb-2">
              Link Expired
            </h1>
            <p className="text-zinc-400 text-sm leading-relaxed">
              {initError ?? 'This reset link is invalid or has expired.'}
            </p>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl py-3 text-sm uppercase tracking-widest transition-colors"
          >
            Back to Sign In
          </button>
        </motion.div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Render: Success
  // ---------------------------------------------------------------------------

  if (pageState === 'success') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center space-y-5"
        >
          <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle size={28} className="text-green-400" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2">
              The Locker Room
            </p>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white mb-2">
              Password Updated
            </h1>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Your password has been changed. Redirecting you to your dashboard…
            </p>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-1 overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, ease: 'linear' }}
              className="h-full bg-yellow-500 rounded-full"
            />
          </div>
        </motion.div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Render: Form
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="space-y-2">
          <p className="text-yellow-500 text-xs font-bold uppercase tracking-widest">
            The Locker Room
          </p>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">
            Set New Password
          </h1>
          <p className="text-zinc-400 text-sm">
            Choose a strong password for your account.
          </p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* New Password */}
            <div>
              <label className={LABEL_BASE}>New Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                  <Lock size={15} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setPassword(e.target.value)
                    if (formError) setFormError(null)
                  }}
                  placeholder="Min. 8 characters"
                  className={`${INPUT_BASE} pl-10 pr-10`}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className={LABEL_BASE}>Confirm Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                  <Lock size={15} />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setConfirmPassword(e.target.value)
                    if (formError) setFormError(null)
                  }}
                  placeholder="Re-enter your new password"
                  className={`${INPUT_BASE} pl-10 pr-10`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Password strength hint */}
            {password.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex gap-1 flex-1">
                  {[1, 2, 3, 4].map((i) => {
                    const strength = Math.min(Math.floor(password.length / 3), 4)
                    return (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i <= strength
                            ? strength <= 1
                              ? 'bg-red-500'
                              : strength <= 2
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                            : 'bg-zinc-700'
                        }`}
                      />
                    )
                  })}
                </div>
                <span className="text-xs text-zinc-500">
                  {password.length < 8
                    ? 'Too short'
                    : password.length < 12
                    ? 'Fair'
                    : 'Strong'}
                </span>
              </div>
            )}

            {/* Error */}
            <AnimatePresence>
              {formError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  role="alert"
                  className="flex items-start gap-2.5 bg-red-950/60 border border-red-500/40 text-red-300 rounded-xl px-4 py-3 text-sm"
                >
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  {formError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-500/40 disabled:cursor-not-allowed text-black font-black uppercase tracking-widest text-sm py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Updating…
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-zinc-500 text-xs">
          Remember your password?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-yellow-500 hover:text-yellow-400 font-semibold transition-colors"
          >
            Sign in
          </button>
        </p>
      </motion.div>
    </div>
  )
}

export default ResetPasswordPage
