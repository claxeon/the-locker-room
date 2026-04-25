import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { StarRating } from './StarRating'

interface ReviewFormProps {
  schoolId: string
  schoolName: string
  onSuccess: () => void
  onCancel: () => void
}

interface RatingsState {
  facilities: number
  coaching: number
  balance: number
  support: number
  culture: number
  equity: number
}

const RATING_LABELS: { key: keyof RatingsState; label: string }[] = [
  { key: 'facilities', label: 'Facilities' },
  { key: 'coaching', label: 'Coaching' },
  { key: 'balance', label: 'Academic Balance' },
  { key: 'support', label: 'Support Staff' },
  { key: 'culture', label: 'Team Culture' },
  { key: 'equity', label: 'Gender Equity' },
]

export const ReviewForm: React.FC<ReviewFormProps> = ({
  schoolId,
  schoolName,
  onSuccess,
  onCancel,
}) => {
  const { user, profile, loading: authLoading } = useAuth()

  const [sport, setSport] = useState(profile?.sport ?? '')
  const [gender, setGender] = useState('')
  const [yearStart, setYearStart] = useState<number | ''>('')
  const [yearEnd, setYearEnd] = useState<number | ''>('')
  const [ratings, setRatings] = useState<RatingsState>({
    facilities: 0,
    coaching: 0,
    balance: 0,
    support: 0,
    culture: 0,
    equity: 0,
  })
  const [reviewText, setReviewText] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRatingChange = (key: keyof RatingsState) => (val: number) => {
    setRatings((prev) => ({ ...prev, [key]: val }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate all ratings
    const missingRatings = RATING_LABELS.filter(({ key }) => ratings[key] === 0)
    if (missingRatings.length > 0) {
      setError(
        `Please rate: ${missingRatings.map((r) => r.label).join(', ')}`
      )
      return
    }

    if (!user) return

    setSubmitting(true)
    try {
      const { error: insertError } = await supabase.from('reviews').insert({
        school_id: schoolId,
        user_id: user.id,
        sport: sport.trim() || null,
        gender: gender || null,
        year_attended_start: yearStart !== '' ? Number(yearStart) : null,
        year_attended_end: yearEnd !== '' ? Number(yearEnd) : null,
        facilities_rating: ratings.facilities,
        coaching_rating: ratings.coaching,
        balance_rating: ratings.balance,
        support_rating: ratings.support,
        culture_rating: ratings.culture,
        equity_rating: ratings.equity,
        review_text: reviewText.trim() || null,
        is_anonymous: isAnonymous,
        moderation_status: 'pending',
      })

      if (insertError) throw insertError

      setSubmitted(true)
      // Give user time to read the success message before closing
      setTimeout(() => {
        onSuccess()
      }, 3000)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  // ── Auth loading state ──────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-yellow-500/30 border-b-yellow-500" />
      </div>
    )
  }

  // ── Not logged in ───────────────────────────────────────────────────────────
  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-yellow-500/25 bg-black/60 p-8 text-center backdrop-blur"
      >
        <p className="text-lg font-black uppercase tracking-tight text-white">
          Sign in to Leave a Review
        </p>
        <p className="mt-2 text-sm text-gray-400">
          Sign in with your .edu email to leave a review for {schoolName}.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-block border-2 border-yellow-500 bg-yellow-500/10 px-8 py-3 text-xs font-black uppercase tracking-[0.3em] text-yellow-400 hover:bg-yellow-500/20 transition-colors rounded-lg"
        >
          Sign In
        </Link>
        <button
          onClick={onCancel}
          className="mt-4 block w-full text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          Cancel
        </button>
      </motion.div>
    )
  }

  // ── Verification gating ─────────────────────────────────────────────────────
  if (profile && profile.verification_status !== 'approved') {
    const messages: Record<string, string> = {
      pending:
        "Your roster verification is under review. You'll be able to post once an admin approves your account.",
      rejected:
        'Your verification was not approved. Contact support.',
    }
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-yellow-500/25 bg-black/60 p-8 text-center backdrop-blur"
      >
        <AlertCircle className="mx-auto mb-4 h-10 w-10 text-yellow-400" />
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-400">
          Verification {profile.verification_status === 'pending' ? 'Pending' : 'Required'}
        </p>
        <p className="mt-3 text-sm text-gray-300">
          {messages[profile.verification_status] ?? messages['pending']}
        </p>
        <button
          onClick={onCancel}
          className="mt-6 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          Close
        </button>
      </motion.div>
    )
  }

  // ── Success state ───────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-yellow-500/25 bg-black/60 p-10 text-center backdrop-blur"
      >
        <CheckCircle className="mx-auto mb-4 h-14 w-14 text-yellow-400" />
        <h3 className="text-xl font-black uppercase tracking-tight text-white">
          Review Submitted!
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-gray-300">
          Your review has been submitted and is pending moderation. It will appear once approved.
        </p>
      </motion.div>
    )
  }

  // ── Full form ───────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-yellow-500/25 bg-black/60 backdrop-blur"
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-yellow-500/20 p-6">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">
            Write a Review
          </h2>
          <p className="mt-1 text-sm font-semibold uppercase tracking-[0.2em] text-yellow-400">
            {schoolName}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {/* Basic info */}
        <section className="space-y-5">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">
            Your Program
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="sport"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400"
              >
                Sport
              </label>
              <input
                id="sport"
                type="text"
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                placeholder="e.g. Soccer"
                className="rounded-lg border border-yellow-500/20 bg-black/60 px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-yellow-500/60 focus:outline-none focus:ring-1 focus:ring-yellow-500/30 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="gender"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400"
              >
                Gender
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="rounded-lg border border-yellow-500/20 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-yellow-500/60 focus:outline-none focus:ring-1 focus:ring-yellow-500/30 transition-colors appearance-none"
              >
                <option value="" className="text-gray-400">Select…</option>
                <option value="Men's">Men's</option>
                <option value="Women's">Women's</option>
                <option value="Co-ed">Co-ed</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="yearStart"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400"
              >
                Year Attended (Start)
              </label>
              <input
                id="yearStart"
                type="number"
                min={1950}
                max={new Date().getFullYear()}
                value={yearStart}
                onChange={(e) =>
                  setYearStart(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="e.g. 2020"
                className="rounded-lg border border-yellow-500/20 bg-black/60 px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-yellow-500/60 focus:outline-none focus:ring-1 focus:ring-yellow-500/30 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="yearEnd"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400"
              >
                Year Attended (End)
              </label>
              <input
                id="yearEnd"
                type="number"
                min={1950}
                max={new Date().getFullYear() + 4}
                value={yearEnd}
                onChange={(e) =>
                  setYearEnd(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="e.g. 2024"
                className="rounded-lg border border-yellow-500/20 bg-black/60 px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-yellow-500/60 focus:outline-none focus:ring-1 focus:ring-yellow-500/30 transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Star ratings */}
        <section className="space-y-5">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">
            Rate Your Experience
          </h3>
          <div className="grid gap-5 sm:grid-cols-2">
            {RATING_LABELS.map(({ key, label }) => (
              <StarRating
                key={key}
                label={label}
                value={ratings[key]}
                onChange={handleRatingChange(key)}
              />
            ))}
          </div>
        </section>

        {/* Review text */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="reviewText"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400"
            >
              Written Review{' '}
              <span className="normal-case text-gray-600">(optional)</span>
            </label>
            <span
              className={`text-xs tabular-nums ${
                reviewText.length > 950 ? 'text-yellow-400' : 'text-gray-600'
              }`}
            >
              {reviewText.length}/1000
            </span>
          </div>
          <textarea
            id="reviewText"
            value={reviewText}
            onChange={(e) => {
              if (e.target.value.length <= 1000) setReviewText(e.target.value)
            }}
            rows={5}
            placeholder="Share your experience with this program — facilities, culture, coaching quality, support…"
            className="w-full rounded-lg border border-yellow-500/20 bg-black/60 px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-yellow-500/60 focus:outline-none focus:ring-1 focus:ring-yellow-500/30 transition-colors resize-none"
          />
        </section>

        {/* Anonymity toggle */}
        <section>
          <button
            type="button"
            onClick={() => setIsAnonymous((prev) => !prev)}
            className="flex items-center gap-3 group"
            aria-pressed={isAnonymous}
          >
            <span
              className={`relative inline-flex h-6 w-11 items-center rounded-full border-2 transition-colors ${
                isAnonymous
                  ? 'border-yellow-500 bg-yellow-500/20'
                  : 'border-gray-600 bg-gray-800'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  isAnonymous ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </span>
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
              {isAnonymous ? (
                <>
                  <span className="font-semibold text-yellow-400">Anonymous</span>
                  {' — '}Your username will be hidden
                </>
              ) : (
                <>
                  <span className="font-semibold text-white">Public</span>
                  {' — '}Your name will be shown
                </>
              )}
            </span>
          </button>
        </section>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
              <p className="text-sm text-red-300">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-700 bg-transparent px-6 py-3 text-xs font-black uppercase tracking-[0.3em] text-gray-400 hover:border-gray-500 hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg border-2 border-yellow-500 bg-yellow-500/10 px-8 py-3 text-xs font-black uppercase tracking-[0.3em] text-yellow-400 hover:bg-yellow-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </div>
      </form>
    </motion.div>
  )
}
