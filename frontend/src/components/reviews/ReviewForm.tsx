import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, ShieldCheck, ChevronDown } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { StarRating } from './StarRating'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReviewFormProps {
  schoolId?: number   // pre-fill from URL param (ignored if profile locks it)
  schoolName?: string // display only
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

interface Affiliation {
  school_id: number
  sport: string
  gender: string
  verified: boolean
  school_name?: string
}

const RATING_LABELS: { key: keyof RatingsState; label: string }[] = [
  { key: 'facilities', label: 'Facilities' },
  { key: 'coaching', label: 'Coaching' },
  { key: 'balance', label: 'Academic Balance' },
  { key: 'support', label: 'Support Staff' },
  { key: 'culture', label: 'Team Culture' },
  { key: 'equity', label: 'Gender Equity' },
]

const INITIAL_RATINGS: RatingsState = {
  facilities: 0,
  coaching: 0,
  balance: 0,
  support: 0,
  culture: 0,
  equity: 0,
}

// ---------------------------------------------------------------------------
// ReviewForm
// ---------------------------------------------------------------------------

export const ReviewForm: React.FC<ReviewFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { user, profile, loading: authLoading } = useAuth()

  // ── Build verified affiliation list from profile ────────────────────────────
  const affiliations = useMemo<Affiliation[]>(() => {
    if (!profile) return []

    const list: Affiliation[] = []

    // Primary
    if (profile.school_id && profile.sport) {
      list.push({
        school_id: Number(profile.school_id),
        sport: profile.sport,
        gender: profile.gender ?? '',
        verified: profile.verification_status === 'approved',
      })
    }

    // Secondaries
    const secondaries = (profile as any).secondary_affiliations
    if (Array.isArray(secondaries)) {
      for (const aff of secondaries) {
        list.push({
          school_id: Number(aff.school_id),
          sport: aff.sport ?? '',
          gender: aff.gender ?? '',
          verified: Boolean(aff.verified),
        })
      }
    }

    return list
  }, [profile])

  // Verified affiliations only — the ones the athlete can actually review under
  const verifiedAffiliations = useMemo(
    () => affiliations.filter((a) => a.verified),
    [affiliations]
  )

  // Pending (unverified secondary) affiliations
  const pendingAffiliations = useMemo(
    () => affiliations.filter((a) => !a.verified),
    [affiliations]
  )

  // ── Active affiliation state ────────────────────────────────────────────────
  const [activeAffil, setActiveAffil] = useState<Affiliation | null>(null)
  const [affilPickerOpen, setAffilPickerOpen] = useState(false)

  // Hydrate school names for affiliations
  const [schoolNames, setSchoolNames] = useState<Record<number, string>>({})
  useEffect(() => {
    const ids = affiliations.map((a) => a.school_id).filter(Boolean)
    if (ids.length === 0) return
    supabase
      .from('schools')
      .select('school_id, institution_name')
      .in('school_id', ids)
      .then(({ data }) => {
        if (!data) return
        const map: Record<number, string> = {}
        for (const s of data as { school_id: number; institution_name: string }[]) {
          map[s.school_id] = s.institution_name
        }
        setSchoolNames(map)
      })
  }, [affiliations])

  // Default to first verified affiliation
  useEffect(() => {
    if (verifiedAffiliations.length > 0 && !activeAffil) {
      setActiveAffil(verifiedAffiliations[0])
    }
  }, [verifiedAffiliations, activeAffil])

  // ── Review content ──────────────────────────────────────────────────────────
  const [ratings, setRatings] = useState<RatingsState>(INITIAL_RATINGS)
  const [reviewText, setReviewText] = useState('')
  const [pros, setPros] = useState('')
  const [cons, setCons] = useState('')
  const [yearStart, setYearStart] = useState<number | ''>('')
  const [yearEnd, setYearEnd] = useState<number | ''>('')
  const [isAnonymous, setIsAnonymous] = useState(true)

  // ── Submission state ────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Check for existing review under this affiliation ────────────────────────
  const [alreadyReviewed, setAlreadyReviewed] = useState(false)
  useEffect(() => {
    if (!user || !activeAffil) return
    setAlreadyReviewed(false)
    supabase
      .from('reviews')
      .select('id')
      .eq('user_id', user.id)
      .eq('school_id', activeAffil.school_id)
      .eq('sport', activeAffil.sport)
      .maybeSingle()
      .then(({ data }) => setAlreadyReviewed(!!data))
  }, [user, activeAffil])

  const handleRatingChange = (key: keyof RatingsState) => (val: number) => {
    setRatings((prev) => ({ ...prev, [key]: val }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!activeAffil) {
      setError('No verified affiliation selected.')
      return
    }

    const missingRatings = RATING_LABELS.filter(({ key }) => ratings[key] === 0)
    if (missingRatings.length > 0) {
      setError(`Please rate: ${missingRatings.map((r) => r.label).join(', ')}`)
      return
    }

    if (!user) return

    setSubmitting(true)
    try {
      const { error: insertError } = await supabase.from('reviews').insert({
        school_id: activeAffil.school_id,
        user_id: user.id,
        sport: activeAffil.sport,
        gender: activeAffil.gender || null,
        year_attended_start: yearStart !== '' ? Number(yearStart) : null,
        year_attended_end: yearEnd !== '' ? Number(yearEnd) : null,
        facilities_rating: ratings.facilities,
        coaching_rating: ratings.coaching,
        balance_rating: ratings.balance,
        support_rating: ratings.support,
        culture_rating: ratings.culture,
        equity_rating: ratings.equity,
        review_text: reviewText.trim() || null,
        pros: pros.trim() || null,
        cons: cons.trim() || null,
        is_anonymous: isAnonymous,
        moderation_status: 'pending',
      })

      if (insertError) throw insertError

      setSubmitted(true)
      setTimeout(() => onSuccess(), 3000)
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

  // ── Guards ──────────────────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[rgba(20,184,166,0.30)] border-b-[#14B8A6]" />
      </div>
    )
  }

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-[#2a2a3c] bg-[rgba(20,21,31,0.60)] p-8 text-center backdrop-blur"
      >
        <p className="text-base font-semibold text-white">Sign in to Leave a Review</p>
        <p className="mt-2 text-sm text-gray-400">
          Sign in with your .edu email to share your experience.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-block rounded-lg bg-[#14B8A6] px-8 py-3 text-xs font-bold uppercase tracking-widest text-black"
        >
          Sign In
        </Link>
        <button onClick={onCancel} className="mt-4 block w-full text-sm text-gray-500 hover:text-gray-300 transition-colors">
          Cancel
        </button>
      </motion.div>
    )
  }

  // Not yet verified at all
  if (!profile || profile.verification_status === 'pending') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-[#2a2a3c] bg-[rgba(20,21,31,0.60)] p-8 text-center backdrop-blur"
      >
        <AlertCircle className="mx-auto mb-4 h-10 w-10 text-[#14B8A6]" />
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#14B8A6]">
          Verification Pending
        </p>
        <p className="mt-3 text-sm text-gray-300 max-w-sm mx-auto leading-relaxed">
          Your roster is under review. You'll be able to post once an admin approves your account — usually within 24 hours.
        </p>
        <button onClick={onCancel} className="mt-6 text-sm text-gray-500 hover:text-gray-300 transition-colors">
          Close
        </button>
      </motion.div>
    )
  }

  if (profile.verification_status === 'rejected') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-[#2a2a3c] bg-[rgba(20,21,31,0.60)] p-8 text-center backdrop-blur"
      >
        <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-400" />
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">
          Verification Rejected
        </p>
        <p className="mt-3 text-sm text-gray-300">
          Your verification was not approved. Contact support if you believe this is an error.
        </p>
        <button onClick={onCancel} className="mt-6 text-sm text-gray-500 hover:text-gray-300 transition-colors">
          Close
        </button>
      </motion.div>
    )
  }

  // Verified but no primary affiliation set (shouldn't happen, but handle it)
  if (!profile.school_id || !profile.sport) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-[#2a2a3c] bg-[rgba(20,21,31,0.60)] p-8 text-center backdrop-blur"
      >
        <AlertCircle className="mx-auto mb-4 h-10 w-10 text-[#14B8A6]" />
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#14B8A6]">
          Profile Incomplete
        </p>
        <p className="mt-3 text-sm text-gray-300 max-w-sm mx-auto leading-relaxed">
          Your profile is missing a school or sport. Visit your dashboard to complete it before submitting a review.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-block rounded-lg bg-[#14B8A6] px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-black"
        >
          Go to Dashboard
        </Link>
      </motion.div>
    )
  }

  // Already reviewed this school+sport
  if (alreadyReviewed && activeAffil) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-[#2a2a3c] bg-[rgba(20,21,31,0.60)] p-8 text-center backdrop-blur"
      >
        <CheckCircle className="mx-auto mb-4 h-10 w-10 text-[#14B8A6]" />
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#14B8A6]">
          Already Reviewed
        </p>
        <p className="mt-3 text-sm text-gray-300 max-w-sm mx-auto leading-relaxed">
          You've already submitted a review for{' '}
          <span className="text-white font-semibold">
            {schoolNames[activeAffil.school_id] ?? `School #${activeAffil.school_id}`}
          </span>{' '}
          — {activeAffil.sport}. Each athlete can leave one review per program.
        </p>
        {verifiedAffiliations.length > 1 && (
          <p className="mt-2 text-xs text-[#555570]">
            You have other verified programs — switch above to review one of them.
          </p>
        )}
        <button onClick={onCancel} className="mt-6 text-sm text-gray-500 hover:text-gray-300 transition-colors">
          Close
        </button>
      </motion.div>
    )
  }

  // Success
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-[#2a2a3c] bg-[rgba(20,21,31,0.60)] p-10 text-center backdrop-blur"
      >
        <CheckCircle className="mx-auto mb-4 h-14 w-14 text-[#14B8A6]" />
        <h3 className="text-lg font-semibold text-white">Review Submitted!</h3>
        <p className="mt-3 text-sm leading-relaxed text-gray-300">
          Your review is pending moderation and will appear once approved — usually within 24 hours.
        </p>
      </motion.div>
    )
  }

  const activeSchoolName = activeAffil
    ? (schoolNames[activeAffil.school_id] ?? `School #${activeAffil.school_id}`)
    : ''

  // ── Full form ───────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[#2a2a3c] bg-[rgba(20,21,31,0.60)] backdrop-blur"
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[#2a2a3c] p-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold text-white">Write a Review</h2>

          {/* Affiliation selector — only shown when multiple verified programs */}
          {verifiedAffiliations.length > 1 ? (
            <div className="relative mt-2">
              <button
                type="button"
                onClick={() => setAffilPickerOpen((o) => !o)}
                className="flex items-center gap-2 text-sm text-[#14B8A6] hover:text-white transition-colors"
              >
                <ShieldCheck size={14} className="flex-none" />
                <span className="font-semibold">{activeSchoolName}</span>
                <span className="text-[#555570]">·</span>
                <span className="text-[#8888a8]">{activeAffil?.sport}</span>
                <ChevronDown size={12} className={`text-[#555570] transition-transform ${affilPickerOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {affilPickerOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute top-full left-0 mt-1 z-20 min-w-[260px] bg-[#14151F] border border-[#2a2a3c] rounded-xl overflow-hidden shadow-xl shadow-black/40"
                  >
                    {verifiedAffiliations.map((aff, i) => {
                      const name = schoolNames[aff.school_id] ?? `School #${aff.school_id}`
                      const isActive = activeAffil?.school_id === aff.school_id && activeAffil?.sport === aff.sport
                      return (
                        <button
                          key={`${aff.school_id}-${aff.sport}`}
                          type="button"
                          onClick={() => {
                            setActiveAffil(aff)
                            setAffilPickerOpen(false)
                            // Reset form content when switching affiliation
                            setRatings(INITIAL_RATINGS)
                            setReviewText('')
                            setPros('')
                            setCons('')
                            setYearStart('')
                            setYearEnd('')
                            setError(null)
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                            i !== verifiedAffiliations.length - 1 ? 'border-b border-[#1E1F2E]' : ''
                          } ${isActive ? 'bg-[rgba(20,184,166,0.08)]' : 'hover:bg-[#1E1F2E]'}`}
                        >
                          <ShieldCheck
                            size={14}
                            className={isActive ? 'text-[#14B8A6]' : 'text-[#555570]'}
                          />
                          <div className="min-w-0">
                            <p className={`text-sm font-semibold truncate ${isActive ? 'text-[#14B8A6]' : 'text-white'}`}>
                              {name}
                            </p>
                            <p className="text-xs text-[#555570] truncate">{aff.sport}{aff.gender ? ` · ${aff.gender}` : ''}</p>
                          </div>
                        </button>
                      )
                    })}

                    {/* Pending secondaries — shown greyed out */}
                    {pendingAffiliations.length > 0 && (
                      <>
                        <div className="px-4 py-2 border-t border-[#1E1F2E]">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#3a3a52]">
                            Awaiting Verification
                          </p>
                        </div>
                        {pendingAffiliations.map((aff) => (
                          <div
                            key={`${aff.school_id}-${aff.sport}-pending`}
                            className="flex items-center gap-3 px-4 py-3 opacity-40 cursor-not-allowed"
                          >
                            <AlertCircle size={14} className="text-[#555570] flex-none" />
                            <div className="min-w-0">
                              <p className="text-sm text-white truncate">
                                {schoolNames[aff.school_id] ?? `School #${aff.school_id}`}
                              </p>
                              <p className="text-xs text-[#555570]">{aff.sport} · Verification pending</p>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            // Single affiliation — just show it locked
            <div className="mt-1.5 flex items-center gap-2">
              <ShieldCheck size={13} className="text-[#14B8A6] flex-none" />
              <p className="text-sm text-[#14B8A6] font-semibold">{activeSchoolName}</p>
              {activeAffil?.sport && (
                <>
                  <span className="text-[#3a3a52]">·</span>
                  <p className="text-sm text-[#8888a8]">{activeAffil.sport}</p>
                </>
              )}
              {activeAffil?.gender && (
                <>
                  <span className="text-[#3a3a52]">·</span>
                  <p className="text-sm text-[#555570]">{activeAffil.gender}</p>
                </>
              )}
            </div>
          )}

          <p className="mt-1 text-xs text-[#3a3a52]">
            Reviews are scoped to your verified program. One review per school &amp; sport.
          </p>
        </div>

        <button
          onClick={onCancel}
          className="ml-4 rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-colors flex-none"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">

        {/* Years attended */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-[#8888a8]">
            Your Tenure
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="yearStart" className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                Year Started <span className="normal-case text-gray-600">(optional)</span>
              </label>
              <input
                id="yearStart"
                type="number"
                min={1950}
                max={new Date().getFullYear()}
                value={yearStart}
                onChange={(e) => setYearStart(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 2021"
                className="rounded-lg border border-[rgba(20,184,166,0.20)] bg-[rgba(15,15,26,0.60)] px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-[rgba(20,184,166,0.50)] focus:outline-none focus:ring-1 focus:ring-[rgba(20,184,166,0.30)] transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="yearEnd" className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                Year Ended <span className="normal-case text-gray-600">(optional)</span>
              </label>
              <input
                id="yearEnd"
                type="number"
                min={1950}
                max={new Date().getFullYear() + 4}
                value={yearEnd}
                onChange={(e) => setYearEnd(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 2025"
                className="rounded-lg border border-[rgba(20,184,166,0.20)] bg-[rgba(15,15,26,0.60)] px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-[rgba(20,184,166,0.50)] focus:outline-none focus:ring-1 focus:ring-[rgba(20,184,166,0.30)] transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Star ratings */}
        <section className="space-y-5">
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-[#8888a8]">
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

        {/* Pros */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="pros" className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
              Pros <span className="normal-case text-gray-600">(optional)</span>
            </label>
            <span className={`text-xs tabular-nums ${pros.length > 450 ? 'text-[#14B8A6]' : 'text-gray-600'}`}>
              {pros.length}/500
            </span>
          </div>
          <textarea
            id="pros"
            value={pros}
            onChange={(e) => { if (e.target.value.length <= 500) setPros(e.target.value) }}
            rows={3}
            placeholder="What did you like? (facilities, culture, coaching quality…)"
            className="w-full rounded-lg border border-green-500/20 bg-[rgba(15,15,26,0.60)] px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-green-500/40 focus:outline-none focus:ring-1 focus:ring-green-500/20 transition-colors resize-none"
          />
        </section>

        {/* Cons */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="cons" className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
              Cons <span className="normal-case text-gray-600">(optional)</span>
            </label>
            <span className={`text-xs tabular-nums ${cons.length > 450 ? 'text-[#14B8A6]' : 'text-gray-600'}`}>
              {cons.length}/500
            </span>
          </div>
          <textarea
            id="cons"
            value={cons}
            onChange={(e) => { if (e.target.value.length <= 500) setCons(e.target.value) }}
            rows={3}
            placeholder="What could be improved?"
            className="w-full rounded-lg border border-red-500/20 bg-[rgba(15,15,26,0.60)] px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-red-500/40 focus:outline-none focus:ring-1 focus:ring-red-500/20 transition-colors resize-none"
          />
        </section>

        {/* Written review */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="reviewText" className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
              Written Review <span className="normal-case text-gray-600">(optional)</span>
            </label>
            <span className={`text-xs tabular-nums ${reviewText.length > 950 ? 'text-[#14B8A6]' : 'text-gray-600'}`}>
              {reviewText.length}/1000
            </span>
          </div>
          <textarea
            id="reviewText"
            value={reviewText}
            onChange={(e) => { if (e.target.value.length <= 1000) setReviewText(e.target.value) }}
            rows={5}
            placeholder="Share your overall experience — anything the Pros/Cons didn't cover…"
            className="w-full rounded-lg border border-[rgba(20,184,166,0.20)] bg-[rgba(15,15,26,0.60)] px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-[rgba(20,184,166,0.50)] focus:outline-none focus:ring-1 focus:ring-[rgba(20,184,166,0.30)] transition-colors resize-none"
          />
        </section>

        {/* Anonymity toggle */}
        <section className="space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Visibility</span>
            <span className="rounded bg-[#1E1F2E] px-2 py-0.5 text-[10px] text-[#555570] leading-tight">
              {isAnonymous ? 'Your name is hidden. School & sport are still shown.' : 'Your display name will be visible on this review.'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsAnonymous((prev) => !prev)}
            className="flex items-center gap-3 group"
            aria-pressed={isAnonymous}
          >
            <span className={`relative inline-flex h-6 w-11 items-center rounded-full border-2 transition-colors ${
              isAnonymous ? 'border-[#14B8A6] bg-[rgba(20,184,166,0.20)]' : 'border-gray-600 bg-gray-800'
            }`}>
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                isAnonymous ? 'translate-x-5' : 'translate-x-1'
              }`} />
            </span>
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
              {isAnonymous ? (
                <><span className="font-semibold text-[#14B8A6]">Anonymous</span>{' — '}Your username will be hidden</>
              ) : (
                <><span className="font-semibold text-white">Public</span>{' — '}Your name will be shown</>
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
            className="rounded-lg border border-[#2a2a3c] bg-transparent px-6 py-3 text-xs font-semibold uppercase tracking-widest text-[#8888a8] hover:border-[#3a3a52] hover:text-[#c4c4dc] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || alreadyReviewed}
            className="rounded-lg bg-[#14B8A6] px-8 py-3 text-xs font-bold uppercase tracking-widest text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </div>
      </form>
    </motion.div>
  )
}
