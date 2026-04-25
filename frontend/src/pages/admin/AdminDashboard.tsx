import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

// ─────────────────────────────────────────────
// Type definitions
// ─────────────────────────────────────────────

type TabId = 'pending' | 'users' | 'reviews'

type VerificationStatus = 'pending' | 'approved' | 'rejected'
type ModerationStatus = 'pending' | 'approved' | 'removed'

interface RosterSubmission {
  id: string
  user_id: string
  status: 'pending' | 'approved' | 'rejected'
  evidence_text: string
  submitted_at: string
  reviewed_by: string | null
  reviewed_at: string | null
  admin_notes: string | null
  // joined from profiles
  athlete_name: string | null
  email: string | null
  school_name: string | null
  sport: string | null
  gender: string | null
  graduation_year: number | null
}

interface UserRow {
  id: string
  email: string | null
  full_name: string | null
  school_name: string | null
  sport: string | null
  gender: string | null
  graduation_year: number | null
  verification_status: VerificationStatus
  is_admin: boolean
  created_at: string
}

interface ReviewRow {
  id: string
  user_id: string
  school_id: string
  sport: string | null
  gender: string | null
  is_anonymous: boolean
  review_text: string | null
  moderation_status: ModerationStatus
  moderation_notes: string | null
  submitted_at: string
  // ratings
  rating_coaching: number | null
  rating_facilities: number | null
  rating_culture: number | null
  rating_academic_support: number | null
  rating_playing_time: number | null
  rating_overall: number | null
  // joined
  school_name: string | null
  reviewer_name: string | null
}

// ─────────────────────────────────────────────
// Utility components
// ─────────────────────────────────────────────

const Spinner: React.FC = () => (
  <div className="flex items-center justify-center py-20">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />
  </div>
)

const ErrorBanner: React.FC<{ message: string }> = ({ message }) => (
  <div className="rounded border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-300">
    {message}
  </div>
)

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="mb-3 h-10 w-10 opacity-40"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
    <p className="text-sm uppercase tracking-widest">{message}</p>
  </div>
)

const StatusBadge: React.FC<{ status: VerificationStatus }> = ({ status }) => {
  const styles: Record<VerificationStatus, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    approved: 'bg-green-500/20 text-green-400 border-green-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  }
  return (
    <span
      className={`rounded border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${styles[status]}`}
    >
      {status}
    </span>
  )
}

const RatingDot: React.FC<{ label: string; value: number | null }> = ({
  label,
  value,
}) => (
  <div className="flex flex-col items-center gap-0.5">
    <span className="text-xs uppercase tracking-wider text-zinc-400">{label}</span>
    <span className="text-lg font-bold text-yellow-400">{value ?? '–'}</span>
  </div>
)

// ─────────────────────────────────────────────
// Tab 1 — Pending Verifications
// ─────────────────────────────────────────────

const PendingVerificationsTab: React.FC<{ adminUserId: string }> = ({
  adminUserId,
}) => {
  const [submissions, setSubmissions] = useState<RosterSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rejectingIds, setRejectingIds] = useState<Record<string, boolean>>({})
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({})

  const fetchSubmissions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('roster_submissions')
        .select(
          `
          id,
          user_id,
          status,
          evidence_text,
          submitted_at,
          reviewed_by,
          reviewed_at,
          admin_notes,
          profiles (
            full_name,
            email,
            school_name,
            sport,
            gender,
            graduation_year
          )
        `
        )
        .eq('status', 'pending')
        .order('submitted_at', { ascending: true })

      if (fetchError) throw fetchError

      const rows: RosterSubmission[] = ((data ?? []) as Record<string, unknown>[]).map(
        (row) => {
          const profile =
            (row['profiles'] as Record<string, unknown> | null) ?? {}
          return {
            id: row['id'] as string,
            user_id: row['user_id'] as string,
            status: row['status'] as RosterSubmission['status'],
            evidence_text: (row['evidence_text'] as string) ?? '',
            submitted_at: row['submitted_at'] as string,
            reviewed_by: (row['reviewed_by'] as string | null) ?? null,
            reviewed_at: (row['reviewed_at'] as string | null) ?? null,
            admin_notes: (row['admin_notes'] as string | null) ?? null,
            athlete_name: (profile['full_name'] as string | null) ?? null,
            email: (profile['email'] as string | null) ?? null,
            school_name: (profile['school_name'] as string | null) ?? null,
            sport: (profile['sport'] as string | null) ?? null,
            gender: (profile['gender'] as string | null) ?? null,
            graduation_year: (profile['graduation_year'] as number | null) ?? null,
          }
        }
      )

      setSubmissions(rows)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submissions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSubmissions()
  }, [fetchSubmissions])

  const handleApprove = async (sub: RosterSubmission): Promise<void> => {
    // Optimistic remove
    setSubmissions((prev) => prev.filter((s) => s.id !== sub.id))

    const now = new Date().toISOString()

    await supabase
      .from('roster_submissions')
      .update({ status: 'approved', reviewed_by: adminUserId, reviewed_at: now })
      .eq('id', sub.id)

    await supabase
      .from('profiles')
      .update({ verification_status: 'approved' })
      .eq('id', sub.user_id)
  }

  const handleRejectOpen = (id: string): void => {
    setRejectingIds((prev) => ({ ...prev, [id]: true }))
    setRejectNotes((prev) => ({ ...prev, [id]: '' }))
  }

  const handleRejectConfirm = async (sub: RosterSubmission): Promise<void> => {
    const notes = rejectNotes[sub.id] ?? ''
    if (!notes.trim()) return

    // Optimistic remove
    setSubmissions((prev) => prev.filter((s) => s.id !== sub.id))
    setRejectingIds((prev) => {
      const next = { ...prev }
      delete next[sub.id]
      return next
    })

    const now = new Date().toISOString()

    await supabase
      .from('roster_submissions')
      .update({
        status: 'rejected',
        admin_notes: notes.trim(),
        reviewed_by: adminUserId,
        reviewed_at: now,
      })
      .eq('id', sub.id)

    await supabase
      .from('profiles')
      .update({
        verification_status: 'rejected',
        verification_notes: notes.trim(),
      })
      .eq('id', sub.user_id)
  }

  const handleRejectCancel = (id: string): void => {
    setRejectingIds((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  if (loading) return <Spinner />
  if (error) return <ErrorBanner message={error} />
  if (submissions.length === 0) return <EmptyState message="No pending verifications" />

  return (
    <div className="space-y-5">
      <AnimatePresence initial={false}>
        {submissions.map((sub) => (
          <motion.div
            key={sub.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-6"
          >
            {/* Header row */}
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-bold uppercase tracking-wide text-white">
                  {sub.athlete_name ?? 'Unknown Athlete'}
                </p>
                <p className="text-sm text-zinc-400">{sub.email ?? '—'}</p>
              </div>
              <div className="text-right text-xs text-zinc-500">
                Submitted{' '}
                {new Date(sub.submitted_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </div>

            {/* Meta pills */}
            <div className="mb-4 flex flex-wrap gap-2 text-xs">
              {sub.school_name && (
                <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                  {sub.school_name}
                </span>
              )}
              {sub.sport && (
                <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                  {sub.sport}
                </span>
              )}
              {sub.gender && (
                <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                  {sub.gender}
                </span>
              )}
              {sub.graduation_year && (
                <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                  Class of {sub.graduation_year}
                </span>
              )}
            </div>

            {/* Evidence */}
            <div className="mb-5">
              <p className="mb-1 text-xs uppercase tracking-widest text-zinc-500">
                Submitted Evidence
              </p>
              <blockquote className="rounded-lg border-l-4 border-yellow-500 bg-zinc-800/60 px-4 py-3 text-sm leading-relaxed text-zinc-200 whitespace-pre-wrap">
                {sub.evidence_text || 'No evidence provided.'}
              </blockquote>
            </div>

            {/* Reject inline input */}
            {rejectingIds[sub.id] && (
              <div className="mb-4 space-y-2">
                <label className="text-xs uppercase tracking-widest text-zinc-400">
                  Rejection Notes (required)
                </label>
                <textarea
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  rows={3}
                  placeholder="Reason for rejection…"
                  value={rejectNotes[sub.id] ?? ''}
                  onChange={(e) =>
                    setRejectNotes((prev) => ({
                      ...prev,
                      [sub.id]: e.target.value,
                    }))
                  }
                />
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              {!rejectingIds[sub.id] ? (
                <>
                  <button
                    onClick={() => {
                      void handleApprove(sub)
                    }}
                    className="rounded-lg bg-green-600 px-5 py-2 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-green-500 active:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectOpen(sub.id)}
                    className="rounded-lg bg-red-700/80 px-5 py-2 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-red-600 active:bg-red-800"
                  >
                    Reject
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      void handleRejectConfirm(sub)
                    }}
                    disabled={!rejectNotes[sub.id]?.trim()}
                    className="rounded-lg bg-red-600 px-5 py-2 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Confirm Reject
                  </button>
                  <button
                    onClick={() => handleRejectCancel(sub.id)}
                    className="rounded-lg border border-zinc-700 px-5 py-2 text-sm font-bold uppercase tracking-widest text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────
// Tab 2 — All Users
// ─────────────────────────────────────────────

const AllUsersTab: React.FC = () => {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select(
          'id, email, full_name, school_name, sport, gender, graduation_year, verification_status, is_admin, created_at'
        )
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setUsers((data as UserRow[]) ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleRevoke = async (userId: string): Promise<void> => {
    // Optimistic update
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, verification_status: 'pending' as VerificationStatus } : u
      )
    )
    await supabase
      .from('profiles')
      .update({ verification_status: 'pending' })
      .eq('id', userId)
  }

  const filtered = users.filter((u) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      (u.full_name ?? '').toLowerCase().includes(q) ||
      (u.email ?? '').toLowerCase().includes(q)
    )
  })

  if (loading) return <Spinner />
  if (error) return <ErrorBanner message={error} />

  return (
    <div className="space-y-4">
      {/* Search */}
      <input
        type="text"
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-white placeholder-zinc-500 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
      />

      {filtered.length === 0 ? (
        <EmptyState message="No users found" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80">
                {['Name', 'Email', 'School', 'Sport', 'Status', 'Joined', 'Actions'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-zinc-400"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, idx) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.02, duration: 0.2 }}
                  className="border-b border-zinc-800/60 bg-zinc-950 transition-colors hover:bg-zinc-900"
                >
                  <td className="px-4 py-3 font-medium text-white">
                    {u.full_name ?? '—'}
                    {u.is_admin && (
                      <span className="ml-2 rounded bg-yellow-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-yellow-400">
                        Admin
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{u.email ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-300">{u.school_name ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-300">{u.sport ?? '—'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={u.verification_status} />
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {new Date(u.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    {u.verification_status === 'approved' && !u.is_admin && (
                      <button
                        onClick={() => {
                          void handleRevoke(u.id)
                        }}
                        className="rounded border border-zinc-700 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-400 transition-colors hover:border-red-600 hover:text-red-400"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Tab 3 — Review Moderation
// ─────────────────────────────────────────────

interface ReviewModerationTabProps {
  onCountUpdate: (count: number) => void
}

const ReviewModerationTab: React.FC<ReviewModerationTabProps> = ({
  onCountUpdate,
}) => {
  const [reviews, setReviews] = useState<ReviewRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [flaggingIds, setFlaggingIds] = useState<Record<string, boolean>>({})
  const [flagNotes, setFlagNotes] = useState<Record<string, string>>({})

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('reviews')
        .select(
          `
          id,
          user_id,
          school_id,
          sport,
          gender,
          is_anonymous,
          review_text,
          moderation_status,
          moderation_notes,
          submitted_at,
          rating_coaching,
          rating_facilities,
          rating_culture,
          rating_academic_support,
          rating_playing_time,
          rating_overall,
          schools ( institution_name ),
          profiles ( full_name )
        `
        )
        .eq('moderation_status', 'pending')
        .order('submitted_at', { ascending: true })

      if (fetchError) throw fetchError

      const rows: ReviewRow[] = ((data ?? []) as Record<string, unknown>[]).map((row) => {
        const school = (row['schools'] as Record<string, unknown> | null) ?? {}
        const profile = (row['profiles'] as Record<string, unknown> | null) ?? {}
        return {
          id: row['id'] as string,
          user_id: row['user_id'] as string,
          school_id: row['school_id'] as string,
          sport: (row['sport'] as string | null) ?? null,
          gender: (row['gender'] as string | null) ?? null,
          is_anonymous: (row['is_anonymous'] as boolean) ?? false,
          review_text: (row['review_text'] as string | null) ?? null,
          moderation_status: row['moderation_status'] as ModerationStatus,
          moderation_notes: (row['moderation_notes'] as string | null) ?? null,
          submitted_at: row['submitted_at'] as string,
          rating_coaching: (row['rating_coaching'] as number | null) ?? null,
          rating_facilities: (row['rating_facilities'] as number | null) ?? null,
          rating_culture: (row['rating_culture'] as number | null) ?? null,
          rating_academic_support: (row['rating_academic_support'] as number | null) ?? null,
          rating_playing_time: (row['rating_playing_time'] as number | null) ?? null,
          rating_overall: (row['rating_overall'] as number | null) ?? null,
          school_name: (school['institution_name'] as string | null) ?? null,
          reviewer_name: (profile['full_name'] as string | null) ?? null,
        }
      })

      setReviews(rows)
      onCountUpdate(rows.length)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }, [onCountUpdate])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const handleApproveReview = async (reviewId: string): Promise<void> => {
    setReviews((prev) => {
      const next = prev.filter((r) => r.id !== reviewId)
      onCountUpdate(next.length)
      return next
    })
    await supabase
      .from('reviews')
      .update({ moderation_status: 'approved' })
      .eq('id', reviewId)
  }

  const handleFlagOpen = (id: string): void => {
    setFlaggingIds((prev) => ({ ...prev, [id]: true }))
    setFlagNotes((prev) => ({ ...prev, [id]: '' }))
  }

  const handleFlagConfirm = async (reviewId: string): Promise<void> => {
    const notes = flagNotes[reviewId] ?? ''
    setReviews((prev) => {
      const next = prev.filter((r) => r.id !== reviewId)
      onCountUpdate(next.length)
      return next
    })
    setFlaggingIds((prev) => {
      const next = { ...prev }
      delete next[reviewId]
      return next
    })

    await supabase
      .from('reviews')
      .update({
        moderation_status: 'removed',
        moderation_notes: notes.trim() || null,
      })
      .eq('id', reviewId)
  }

  const handleFlagCancel = (id: string): void => {
    setFlaggingIds((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  if (loading) return <Spinner />
  if (error) return <ErrorBanner message={error} />
  if (reviews.length === 0) return <EmptyState message="No pending reviews" />

  return (
    <div className="space-y-5">
      <AnimatePresence initial={false}>
        {reviews.map((review) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-6"
          >
            {/* Header */}
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-base font-bold uppercase tracking-wide text-white">
                  {review.school_name ?? 'Unknown School'}
                </p>
                <p className="text-xs text-zinc-400">
                  {review.is_anonymous ? 'Anonymous' : (review.reviewer_name ?? 'Unknown')}{' '}
                  ·{' '}
                  {new Date(review.submitted_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {review.sport && (
                  <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                    {review.sport}
                  </span>
                )}
                {review.gender && (
                  <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                    {review.gender}
                  </span>
                )}
              </div>
            </div>

            {/* Ratings row */}
            <div className="mb-4 flex flex-wrap gap-5 rounded-lg bg-zinc-800/50 px-4 py-3">
              <RatingDot label="Coaching" value={review.rating_coaching} />
              <RatingDot label="Facilities" value={review.rating_facilities} />
              <RatingDot label="Culture" value={review.rating_culture} />
              <RatingDot label="Academics" value={review.rating_academic_support} />
              <RatingDot label="Play Time" value={review.rating_playing_time} />
              <RatingDot label="Overall" value={review.rating_overall} />
            </div>

            {/* Review text */}
            {review.review_text && (
              <div className="mb-4">
                <p className="mb-1 text-xs uppercase tracking-widest text-zinc-500">
                  Review
                </p>
                <p className="rounded-lg bg-zinc-800/60 px-4 py-3 text-sm leading-relaxed text-zinc-200">
                  {review.review_text}
                </p>
              </div>
            )}

            {/* Flag notes input */}
            {flaggingIds[review.id] && (
              <div className="mb-4 space-y-2">
                <label className="text-xs uppercase tracking-widest text-zinc-400">
                  Removal Notes (optional)
                </label>
                <textarea
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  rows={2}
                  placeholder="Reason for removal…"
                  value={flagNotes[review.id] ?? ''}
                  onChange={(e) =>
                    setFlagNotes((prev) => ({
                      ...prev,
                      [review.id]: e.target.value,
                    }))
                  }
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              {!flaggingIds[review.id] ? (
                <>
                  <button
                    onClick={() => {
                      void handleApproveReview(review.id)
                    }}
                    className="rounded-lg bg-green-600 px-5 py-2 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-green-500"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleFlagOpen(review.id)}
                    className="rounded-lg bg-red-700/80 px-5 py-2 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-red-600"
                  >
                    Flag / Remove
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      void handleFlagConfirm(review.id)
                    }}
                    className="rounded-lg bg-red-600 px-5 py-2 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-red-500"
                  >
                    Confirm Remove
                  </button>
                  <button
                    onClick={() => handleFlagCancel(review.id)}
                    className="rounded-lg border border-zinc-700 px-5 py-2 text-sm font-bold uppercase tracking-widest text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────
// Main AdminDashboard
// ─────────────────────────────────────────────

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user, profile, loading } = useAuth()
  const [activeTab, setActiveTab] = useState<TabId>('pending')
  const [pendingReviewCount, setPendingReviewCount] = useState(0)

  const isAdmin = profile?.is_admin === true

  // Access control — redirect non-admins to home
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/', { replace: true, state: { message: 'Not authorized' } })
    }
  }, [loading, user, isAdmin, navigate])

  // Show spinner while auth resolves
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Spinner />
      </div>
    )
  }

  // Guard render until redirect fires
  if (!user || !isAdmin) return null

  interface TabDefinition {
    id: TabId
    label: string
    badge?: number
  }

  const TABS: TabDefinition[] = [
    { id: 'pending', label: 'Pending Verifications' },
    { id: 'users', label: 'All Users' },
    {
      id: 'reviews',
      label: 'Review Moderation',
      badge: pendingReviewCount > 0 ? pendingReviewCount : undefined,
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top bar */}
      <div className="border-b border-zinc-800 bg-zinc-950">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
                The Locker Room
              </p>
              <h1 className="mt-0.5 text-2xl font-black uppercase tracking-tight text-white">
                Admin Dashboard
              </h1>
            </div>
            <div className="text-right text-xs text-zinc-500">
              <p className="font-medium text-zinc-300">
                {profile?.full_name ?? user.email ?? 'Admin'}
              </p>
              <p className="uppercase tracking-wider">Administrator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <nav className="flex gap-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${
                  activeTab === tab.id
                    ? 'text-yellow-400'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab.label}
                {tab.badge !== undefined && (
                  <span className="rounded-full bg-yellow-500 px-1.5 py-0.5 text-[10px] font-black leading-none text-black">
                    {tab.badge}
                  </span>
                )}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500"
                  />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab content */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <AnimatePresence mode="wait">
          {activeTab === 'pending' && (
            <motion.div
              key="pending"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <PendingVerificationsTab adminUserId={user.id} />
            </motion.div>
          )}
          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <AllUsersTab />
            </motion.div>
          )}
          {activeTab === 'reviews' && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ReviewModerationTab onCountUpdate={setPendingReviewCount} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// FILE 2 — App.tsx additions
// ─────────────────────────────────────────────────────────────────────────────
//
// STEP 1: Add this import near the top of App.tsx with your other page imports:
//
//   import { AdminDashboard } from './pages/admin/AdminDashboard'
//
//
// STEP 2: If you don't already have a ProtectedRoute component, add this before
//         the App function definition in App.tsx:
//
//   import { Navigate } from 'react-router-dom'
//   import { useAuth } from './hooks/useAuth'
//
//   const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//     const { user, loading } = useAuth()
//     if (loading) {
//       return (
//         <div className="flex min-h-screen items-center justify-center bg-black">
//           <div className="h-8 w-8 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />
//         </div>
//       )
//     }
//     if (!user) return <Navigate to="/" replace />
//     return <>{children}</>
//   }
//
//
// STEP 3: Inside the <Routes> block in your App function, add this route:
//
//   <Route
//     path="/admin"
//     element={
//       <ProtectedRoute>
//         <AdminDashboard />
//       </ProtectedRoute>
//     }
//   />
//
//
// NOTES:
//   - AdminDashboard performs its own is_admin check and redirects to "/" if the
//     authenticated user is not an admin — ProtectedRoute only blocks guests.
//   - The existing useAuth hook at frontend/src/hooks/useAuth.ts is used as-is.
//   - No changes are needed to useAuth.ts.
// ─────────────────────────────────────────────────────────────────────────────
