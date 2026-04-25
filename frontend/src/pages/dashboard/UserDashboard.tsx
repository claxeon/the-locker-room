/**
 * UserDashboard.tsx — The Locker Room
 *
 * Sprint 2A: User Dashboard
 * Three-tab authenticated dashboard: My Reviews | Verification | Profile
 */

import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Shield,
  FileText,
  Edit2,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  ChevronRight,
  LogOut,
  Award,
  AlertCircle,
} from 'lucide-react'

import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SchoolInfo {
  institution_name: string
  slug: string
}

interface Review {
  id: string
  school_id: number
  user_id: string
  sport: string
  gender: string
  facilities_rating: number
  coaching_rating: number
  balance_rating: number
  support_rating: number
  culture_rating: number
  equity_rating: number
  review_text: string | null
  pros: string | null
  cons: string | null
  helpful_count: number
  flagged_count: number
  is_anonymous: boolean
  moderation_status: 'pending' | 'approved' | 'rejected'
  created_at: string
  schools?: SchoolInfo | null
}

interface RosterSubmission {
  id: string
  user_id: string
  school_id: number | null
  sport: string | null
  gender: string | null
  graduation_year: number | null
  roster_url: string | null
  notes: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

type Tab = 'reviews' | 'verification' | 'profile'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function avgRating(review: Review): number {
  const vals = [
    review.facilities_rating,
    review.coaching_rating,
    review.balance_rating,
    review.support_rating,
    review.culture_rating,
    review.equity_rating,
  ].filter((v) => typeof v === 'number')
  if (vals.length === 0) return 0
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

function truncate(text: string | null | undefined, max: number): string {
  if (!text) return ''
  return text.length > max ? text.slice(0, max).trimEnd() + '…' : text
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

// Skeleton loader block
function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-zinc-800 rounded-lg ${className ?? ''}`}
    />
  )
}

// Star rating display
function StarRating({ value }: { value: number }) {
  const rounded = Math.round(value * 2) / 2
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rounded.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= rounded
        return (
          <Star
            key={i}
            size={14}
            className={filled ? 'text-yellow-500 fill-yellow-500' : 'text-zinc-600'}
          />
        )
      })}
      <span className="ml-1.5 text-xs text-zinc-400">{rounded.toFixed(1)}</span>
    </div>
  )
}

// Moderation status pill
function ModerationBadge({ status }: { status: Review['moderation_status'] }) {
  const map = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    approved: 'bg-green-500/20 text-green-400 border-green-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  }
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${map[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

// Review card
function ReviewSummaryCard({ review }: { review: Review }) {
  const avg = avgRating(review)
  const schoolName =
    review.schools?.institution_name ?? `School #${review.school_id}`
  const slug = review.schools?.slug ?? ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors"
    >
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-white font-semibold text-sm">{schoolName}</p>
          <p className="text-zinc-400 text-xs mt-0.5">
            {review.sport} · {review.gender} · {formatDate(review.created_at)}
          </p>
        </div>
        <ModerationBadge status={review.moderation_status} />
      </div>

      {/* Stars */}
      <div className="mb-3">
        <StarRating value={avg} />
      </div>

      {/* Review text snippet */}
      {review.review_text && (
        <p className="text-zinc-300 text-sm leading-relaxed mb-3">
          {truncate(review.review_text, 120)}
        </p>
      )}

      {/* Pros / Cons */}
      {(review.pros || review.cons) && (
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          {review.pros && (
            <div className="flex-1 bg-zinc-800 rounded-lg px-3 py-2">
              <p className="text-green-400 text-xs font-semibold uppercase tracking-wide mb-1">
                Pros
              </p>
              <p className="text-zinc-300 text-xs">{truncate(review.pros, 60)}</p>
            </div>
          )}
          {review.cons && (
            <div className="flex-1 bg-zinc-800 rounded-lg px-3 py-2">
              <p className="text-red-400 text-xs font-semibold uppercase tracking-wide mb-1">
                Cons
              </p>
              <p className="text-zinc-300 text-xs">{truncate(review.cons, 60)}</p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-zinc-500 text-xs">
          {review.helpful_count} found helpful
        </span>
        {slug && (
          <Link
            to={`/school/${slug}`}
            className="flex items-center gap-1 text-yellow-500 hover:text-yellow-400 text-xs font-medium transition-colors"
          >
            View School <ChevronRight size={12} />
          </Link>
        )}
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Tab 1: My Reviews
// ---------------------------------------------------------------------------

function ReviewsTab({ userId }: { userId: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchReviews() {
      setLoading(true)
      setError(null)

      // Try with join first
      const { data, error: fetchError } = await supabase
        .from('reviews')
        .select('*, schools(institution_name, slug)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        // Fall back to reviews only, then fetch school data separately
        const { data: reviewsOnly, error: fallbackError } = await supabase
          .from('reviews')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (fallbackError) {
          setError(fallbackError.message)
          setLoading(false)
          return
        }

        const reviewList = (reviewsOnly ?? []) as Review[]

        // Fetch school names separately for unique school_ids
        const schoolIds = Array.from(new Set(reviewList.map((r) => r.school_id)))
        if (schoolIds.length > 0) {
          const { data: schools } = await supabase
            .from('schools')
            .select('school_id, institution_name, slug')
            .in('school_id', schoolIds)

          const schoolMap: Record<number, SchoolInfo> = {}
          if (schools) {
            for (const s of schools as Array<{ school_id: number; institution_name: string; slug: string }>) {
              schoolMap[s.school_id] = {
                institution_name: s.institution_name,
                slug: s.slug,
              }
            }
          }

          setReviews(
            reviewList.map((r) => ({
              ...r,
              schools: schoolMap[r.school_id] ?? null,
            }))
          )
        } else {
          setReviews(reviewList)
        }
      } else {
        setReviews((data ?? []) as Review[])
      }

      setLoading(false)
    }

    fetchReviews()
  }, [userId])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
            <SkeletonBlock className="h-4 w-48" />
            <SkeletonBlock className="h-3 w-32" />
            <SkeletonBlock className="h-16 w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 flex items-start gap-3">
        <AlertCircle size={20} className="text-red-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-red-400 font-semibold text-sm">Failed to load reviews</p>
          <p className="text-red-300/70 text-xs mt-1">{error}</p>
        </div>
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText size={28} className="text-zinc-500" />
        </div>
        <h3 className="text-white font-semibold text-lg mb-2">No reviews yet</h3>
        <p className="text-zinc-400 text-sm mb-6 max-w-sm mx-auto">
          Share your experience as a collegiate athlete to help others make informed decisions.
        </p>
        <Link
          to="/directory"
          className="inline-flex items-center gap-2 bg-yellow-500 text-black font-bold px-5 py-2.5 rounded-lg hover:bg-yellow-400 transition-colors text-sm"
        >
          <Edit2 size={15} /> Write Your First Review
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewSummaryCard key={review.id} review={review} />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tab 2: Verification
// ---------------------------------------------------------------------------

interface VerificationTabProps {
  userId: string
  schoolId: string | null
  sport: string | null
  gender: string | null
  graduationYear: number | null
  verificationStatus: 'pending' | 'approved' | 'rejected'
}

function StepIcon({ state }: { state: 'complete' | 'pending' | 'rejected' | 'not_started' }) {
  if (state === 'complete')
    return <CheckCircle size={22} className="text-green-400" />
  if (state === 'pending')
    return <Clock size={22} className="text-yellow-400" />
  if (state === 'rejected')
    return <XCircle size={22} className="text-red-400" />
  return (
    <div className="w-5.5 h-5.5 rounded-full border-2 border-zinc-600 bg-transparent" />
  )
}

function VerificationTab({
  userId,
  schoolId,
  sport,
  gender,
  graduationYear,
  verificationStatus,
}: VerificationTabProps) {
  const [submission, setSubmission] = useState<RosterSubmission | null>(null)
  const [submissionLoading, setSubmissionLoading] = useState(true)
  const [formData, setFormData] = useState({
    roster_url: '',
    notes: '',
    sport: sport ?? '',
    graduation_year: graduationYear ?? new Date().getFullYear(),
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const fetchSubmission = useCallback(async () => {
    setSubmissionLoading(true)
    const { data } = await supabase
      .from('roster_submissions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    setSubmission((data as RosterSubmission) ?? null)
    setSubmissionLoading(false)
  }, [userId])

  useEffect(() => {
    fetchSubmission()
  }, [fetchSubmission])

  async function handleSubmitRoster(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)

    const { error } = await supabase.from('roster_submissions').insert({
      user_id: userId,
      school_id: schoolId ? parseInt(schoolId, 10) : null,
      sport: formData.sport || null,
      gender: gender ?? null,
      graduation_year: formData.graduation_year || null,
      roster_url: formData.roster_url,
      notes: formData.notes || null,
      status: 'pending',
    })

    if (error) {
      setSubmitError(error.message)
    } else {
      setSubmitSuccess(true)
      await fetchSubmission()
    }
    setSubmitting(false)
  }

  // Determine step states
  const step1State: 'complete' | 'pending' | 'rejected' | 'not_started' = 'complete' // always complete if logged in
  let step2State: 'complete' | 'pending' | 'rejected' | 'not_started' = 'not_started'
  let step3State: 'complete' | 'pending' | 'rejected' | 'not_started' = 'not_started'

  if (submission) {
    step2State = 'complete'
    if (submission.status === 'approved' || verificationStatus === 'approved')
      step3State = 'complete'
    else if (submission.status === 'rejected' || verificationStatus === 'rejected')
      step3State = 'rejected'
    else step3State = 'pending'
  } else if (verificationStatus === 'approved') {
    step2State = 'complete'
    step3State = 'complete'
  }

  const showForm =
    verificationStatus !== 'approved' &&
    !submission &&
    !submitSuccess &&
    !submissionLoading

  const showResubmit =
    (verificationStatus === 'rejected' || submission?.status === 'rejected') &&
    !submitSuccess &&
    !submissionLoading

  return (
    <div className="space-y-6">
      {/* Approved banner */}
      {verificationStatus === 'approved' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/15 border border-green-500/30 rounded-xl p-5 flex items-center gap-4"
        >
          <Award size={32} className="text-green-400 shrink-0" />
          <div>
            <p className="text-green-300 font-bold text-lg">Verified Athlete ✓</p>
            <p className="text-green-400/70 text-sm mt-0.5">
              Your athlete status has been confirmed. You can submit reviews.
            </p>
          </div>
        </motion.div>
      )}

      {/* Step tracker */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-white font-semibold text-base mb-6">Verification Journey</h3>
        <div className="space-y-0">
          {[
            {
              step: 1,
              label: 'Email Verified',
              desc: 'You created an account and confirmed your email.',
              state: step1State,
            },
            {
              step: 2,
              label: 'Roster Evidence Submitted',
              desc: 'You uploaded a link or document proving your roster membership.',
              state: step2State,
            },
            {
              step: 3,
              label: 'Admin Review',
              desc:
                step3State === 'rejected'
                  ? 'Your submission was not approved. Please re-submit with additional evidence.'
                  : step3State === 'complete'
                  ? 'Your verification has been approved by our team.'
                  : 'Our team will review your submission within 1–3 business days.',
              state: step3State,
            },
          ].map((item, idx) => (
            <div key={item.step} className="flex gap-4">
              {/* Vertical line + icon */}
              <div className="flex flex-col items-center">
                <div className="mt-0.5">
                  <StepIcon state={item.state} />
                </div>
                {idx < 2 && (
                  <div className="w-px flex-1 bg-zinc-700 my-2" />
                )}
              </div>
              {/* Content */}
              <div className={`pb-6 ${idx === 2 ? 'pb-0' : ''}`}>
                <p className="text-white font-medium text-sm">{item.label}</p>
                <p className="text-zinc-400 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                {item.step === 2 && submission && (
                  <p className="text-zinc-500 text-xs mt-1">
                    Submitted {formatDate(submission.created_at)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {submissionLoading && (
        <div className="space-y-2">
          <SkeletonBlock className="h-10 w-full" />
          <SkeletonBlock className="h-24 w-full" />
        </div>
      )}

      {/* Submit success */}
      {submitSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 border border-green-500/30 rounded-xl p-5 flex items-start gap-3"
        >
          <CheckCircle size={20} className="text-green-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-green-300 font-semibold text-sm">Submission received!</p>
            <p className="text-green-400/70 text-xs mt-1">
              Our team will review your roster evidence within 1–3 business days. You'll be
              notified once a decision is made.
            </p>
          </div>
        </motion.div>
      )}

      {/* Submission form — initial or re-submit */}
      {(showForm || showResubmit) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
        >
          {showResubmit && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-5 flex items-start gap-3">
              <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-red-400 font-semibold text-xs">Submission not approved</p>
                {submission?.notes && (
                  <p className="text-red-300/70 text-xs mt-1">{submission.notes}</p>
                )}
                <p className="text-red-300/70 text-xs mt-1">
                  Please provide additional evidence and re-submit.
                </p>
              </div>
            </div>
          )}

          <h3 className="text-white font-semibold text-base mb-5 flex items-center gap-2">
            <Upload size={18} className="text-yellow-500" />
            Submit Roster Evidence
          </h3>

          <form onSubmit={handleSubmitRoster} className="space-y-4">
            <div>
              <label className="block text-zinc-300 text-sm font-medium mb-1.5">
                Link to Roster Page or Document *
              </label>
              <input
                type="url"
                required
                value={formData.roster_url}
                onChange={(e) => setFormData((p) => ({ ...p, roster_url: e.target.value }))}
                placeholder="https://example.com/team-roster"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-yellow-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-300 text-sm font-medium mb-1.5">
                  Sport
                </label>
                <input
                  type="text"
                  value={formData.sport}
                  onChange={(e) => setFormData((p) => ({ ...p, sport: e.target.value }))}
                  placeholder="e.g. Basketball"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-yellow-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-zinc-300 text-sm font-medium mb-1.5">
                  Graduation Year
                </label>
                <input
                  type="number"
                  min={2000}
                  max={2035}
                  value={formData.graduation_year}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, graduation_year: parseInt(e.target.value, 10) }))
                  }
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-300 text-sm font-medium mb-1.5">
                Additional Notes
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Any context that helps verify your roster status…"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-yellow-500 transition-colors resize-none"
              />
            </div>

            {submitError && (
              <div className="flex items-center gap-2 text-red-400 text-xs">
                <AlertCircle size={14} />
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-yellow-500 text-black font-bold py-2.5 rounded-lg hover:bg-yellow-400 transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <Upload size={15} />
                  Submit Roster Evidence
                </>
              )}
            </button>
          </form>
        </motion.div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tab 3: Profile
// ---------------------------------------------------------------------------

interface ProfileTabProps {
  userId: string
  userEmail: string | undefined
  initialProfile: {
    full_name: string | null
    school_id: string | null
    sport: string | null
    gender: string | null
    graduation_year: number | null
  }
  onSignOut: () => void
}

function ProfileTab({ userId, userEmail, initialProfile, onSignOut }: ProfileTabProps) {
  const [formData, setFormData] = useState({
    full_name: initialProfile.full_name ?? '',
    sport: initialProfile.sport ?? '',
    gender: initialProfile.gender ?? '',
    graduation_year: initialProfile.graduation_year ?? new Date().getFullYear(),
  })
  const [schoolName, setSchoolName] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Fetch school name from school_id
  useEffect(() => {
    if (!initialProfile.school_id) return
    const fetchSchool = async () => {
      const { data } = await supabase
        .from('schools')
        .select('institution_name')
        .eq('school_id', parseInt(initialProfile.school_id as string, 10))
        .maybeSingle()
      if (data) {
        setSchoolName((data as { institution_name: string }).institution_name)
      }
    }
    fetchSchool()
  }, [initialProfile.school_id])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaveError(null)
    setSaveMsg(null)

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name || null,
        sport: formData.sport || null,
        gender: formData.gender || null,
        graduation_year: formData.graduation_year || null,
      })
      .eq('id', userId)

    setSaving(false)
    if (error) {
      setSaveError(error.message)
    } else {
      setSaveMsg('Saved!')
      setTimeout(() => setSaveMsg(null), 2000)
    }
  }

  const genderOptions = ["Men's", "Women's", "Mixed", "Co-ed"]

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-white font-semibold text-base mb-5 flex items-center gap-2">
          <Edit2 size={18} className="text-yellow-500" />
          Edit Profile
        </h3>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-zinc-300 text-sm font-medium mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData((p) => ({ ...p, full_name: e.target.value }))}
              placeholder="Your full name"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-yellow-500 transition-colors"
            />
          </div>

          {/* Email — read only */}
          <div>
            <label className="block text-zinc-300 text-sm font-medium mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={userEmail ?? ''}
              readOnly
              className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-2.5 text-zinc-400 text-sm cursor-not-allowed"
            />
          </div>

          {/* School — read only */}
          <div>
            <label className="block text-zinc-300 text-sm font-medium mb-1.5">
              School
            </label>
            <input
              type="text"
              value={schoolName ?? (initialProfile.school_id ? 'Loading…' : 'Not set')}
              readOnly
              className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-2.5 text-zinc-400 text-sm cursor-not-allowed"
            />
            <p className="text-zinc-500 text-xs mt-1">
              Contact support to update your school affiliation.
            </p>
          </div>

          {/* Sport */}
          <div>
            <label className="block text-zinc-300 text-sm font-medium mb-1.5">
              Sport
            </label>
            <input
              type="text"
              value={formData.sport}
              onChange={(e) => setFormData((p) => ({ ...p, sport: e.target.value }))}
              placeholder="e.g. Basketball, Soccer, Swimming"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-yellow-500 transition-colors"
            />
          </div>

          {/* Gender Division */}
          <div>
            <label className="block text-zinc-300 text-sm font-medium mb-1.5">
              Gender Division
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData((p) => ({ ...p, gender: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500 transition-colors"
            >
              <option value="">Select division</option>
              {genderOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Graduation Year */}
          <div>
            <label className="block text-zinc-300 text-sm font-medium mb-1.5">
              Graduation Year
            </label>
            <input
              type="number"
              min={2000}
              max={2035}
              value={formData.graduation_year}
              onChange={(e) =>
                setFormData((p) => ({ ...p, graduation_year: parseInt(e.target.value, 10) }))
              }
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500 transition-colors"
            />
          </div>

          {/* Error */}
          {saveError && (
            <div className="flex items-center gap-2 text-red-400 text-xs">
              <AlertCircle size={14} />
              {saveError}
            </div>
          )}

          {/* Save button */}
          <div className="flex items-center gap-4 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="bg-yellow-500 text-black font-bold px-6 py-2.5 rounded-lg hover:bg-yellow-400 transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                'Save Changes'
              )}
            </button>

            {/* Inline success toast */}
            <AnimatePresence>
              {saveMsg && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 text-green-400 text-sm font-medium"
                >
                  <CheckCircle size={16} />
                  {saveMsg}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </form>
      </div>

      {/* Sign Out */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-white font-semibold text-sm mb-3">Account Actions</h3>
        <button
          onClick={onSignOut}
          className="flex items-center gap-2 border border-zinc-600 text-zinc-300 hover:border-red-500/60 hover:text-red-400 px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// UserDashboard — Main
// ---------------------------------------------------------------------------

export function UserDashboard() {
  const { user, profile, loading } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('reviews')

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'reviews', label: 'My Reviews', icon: FileText },
    { id: 'verification', label: 'Verification', icon: Shield },
    { id: 'profile', label: 'Profile', icon: User },
  ]

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/')
  }

  // Avatar initial
  const avatarInitial =
    profile?.full_name?.charAt(0)?.toUpperCase() ??
    user?.email?.charAt(0)?.toUpperCase() ??
    '?'

  const displayName = profile?.full_name ?? user?.email ?? 'Athlete'

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24 sm:pb-8">
      {/* Page header */}
      <div className="border-b border-zinc-800 bg-zinc-900/60 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 sm:pt-20 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            {/* Avatar */}
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="w-14 h-14 rounded-full object-cover border-2 border-yellow-500/40"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-yellow-500/20 border-2 border-yellow-500/40 flex items-center justify-center shrink-0">
                <span className="text-yellow-400 font-bold text-xl">{avatarInitial}</span>
              </div>
            )}

            {/* Name + status */}
            <div>
              <h1 className="text-2xl font-bold text-white">My Dashboard</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-zinc-400 text-sm">{displayName}</p>
                {profile?.verification_status === 'approved' && (
                  <span className="inline-flex items-center gap-1 bg-green-500/20 text-green-400 text-xs font-medium px-2 py-0.5 rounded-full border border-green-500/30">
                    <CheckCircle size={11} /> Verified
                  </span>
                )}
                {profile?.verification_status === 'pending' && (
                  <span className="inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium px-2 py-0.5 rounded-full border border-yellow-500/30">
                    <Clock size={11} /> Pending Verification
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Tab bar */}
          <div className="mt-6 flex gap-1 border-b border-zinc-800 -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? 'text-yellow-400' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Icon size={15} />
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500 rounded-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8">
        <AnimatePresence mode="wait">
          {activeTab === 'reviews' && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <ReviewsTab userId={user.id} />
            </motion.div>
          )}

          {activeTab === 'verification' && (
            <motion.div
              key="verification"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <VerificationTab
                userId={user.id}
                schoolId={profile?.school_id ?? null}
                sport={profile?.sport ?? null}
                gender={profile?.gender ?? null}
                graduationYear={profile?.graduation_year ?? null}
                verificationStatus={profile?.verification_status ?? 'pending'}
              />
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <ProfileTab
                userId={user.id}
                userEmail={user.email}
                initialProfile={{
                  full_name: profile?.full_name ?? null,
                  school_id: profile?.school_id ?? null,
                  sport: profile?.sport ?? null,
                  gender: profile?.gender ?? null,
                  graduation_year: profile?.graduation_year ?? null,
                }}
                onSignOut={handleSignOut}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default UserDashboard
