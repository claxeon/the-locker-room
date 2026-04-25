import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Shield, ThumbsUp, Flag, CheckCircle, XCircle } from 'lucide-react'
import { StarRating } from './StarRating'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

export interface Review {
  id: string
  school_id: string
  user_id: string
  sport: string | null
  gender: string | null
  year_attended_start: number | null
  year_attended_end: number | null
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
  moderation_status: string
  created_at: string
  reviewer_name?: string
}

interface ReviewCardProps {
  review: Review
}

const RATING_CATEGORIES: {
  key: keyof Pick<
    Review,
    | 'facilities_rating'
    | 'coaching_rating'
    | 'balance_rating'
    | 'support_rating'
    | 'culture_rating'
    | 'equity_rating'
  >
  label: string
}[] = [
  { key: 'facilities_rating', label: 'Facilities' },
  { key: 'coaching_rating', label: 'Coaching' },
  { key: 'balance_rating', label: 'Academic Balance' },
  { key: 'support_rating', label: 'Support Staff' },
  { key: 'culture_rating', label: 'Team Culture' },
  { key: 'equity_rating', label: 'Gender Equity' },
]

const FLAG_REASONS = [
  'Inaccurate',
  'Inappropriate',
  'Spam',
  'Conflict of interest',
]

const formatDate = (iso: string): string => {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

const computeComposite = (review: Review): number => {
  const values = RATING_CATEGORIES.map(({ key }) => review[key] as number)
  const sum = values.reduce((a, b) => a + b, 0)
  return Math.round((sum / values.length) * 10) / 10
}

const RatingBar: React.FC<{ label: string; value: number }> = ({
  label,
  value,
}) => {
  const pct = (value / 5) * 100
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 shrink-0 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
        {label}
      </span>
      <div className="relative flex-1 h-1.5 rounded-full bg-gray-800 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-yellow-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-7 text-right text-xs font-black tabular-nums text-yellow-400">
        {value.toFixed(1)}
      </span>
    </div>
  )
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const { user } = useAuth()
  const composite = computeComposite(review)

  // ── Helpful vote state ─────────────────────────────────────────────────────
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count ?? 0)
  const [hasVotedHelpful, setHasVotedHelpful] = useState(false)
  const [helpfulLoading, setHelpfulLoading] = useState(false)

  // ── Flag state ─────────────────────────────────────────────────────────────
  const [hasFlagged, setHasFlagged] = useState(false)
  const [flagMenuOpen, setFlagMenuOpen] = useState(false)
  const [flagging, setFlagging] = useState(false)
  const flagRef = useRef<HTMLDivElement>(null)

  // ── Load existing votes for current user ───────────────────────────────────
  useEffect(() => {
    if (!user) return
    const checkVotes = async () => {
      const { data } = await supabase
        .from('review_votes')
        .select('vote_type')
        .eq('review_id', review.id)
        .eq('user_id', user.id)
      if (data) {
        setHasVotedHelpful(data.some((v) => v.vote_type === 'helpful'))
        setHasFlagged(data.some((v) => v.vote_type === 'flag'))
      }
    }
    checkVotes()
  }, [user, review.id])

  // ── Close flag dropdown on outside click ──────────────────────────────────
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (flagRef.current && !flagRef.current.contains(e.target as Node)) {
        setFlagMenuOpen(false)
      }
    }
    if (flagMenuOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [flagMenuOpen])

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleHelpful = async () => {
    if (!user || helpfulLoading) return

    setHelpfulLoading(true)
    const prevCount = helpfulCount
    const prevVoted = hasVotedHelpful

    // Optimistic update
    if (hasVotedHelpful) {
      setHelpfulCount((c) => c - 1)
      setHasVotedHelpful(false)
    } else {
      setHelpfulCount((c) => c + 1)
      setHasVotedHelpful(true)
    }

    try {
      if (prevVoted) {
        const { error } = await supabase
          .from('review_votes')
          .delete()
          .eq('review_id', review.id)
          .eq('user_id', user.id)
          .eq('vote_type', 'helpful')
        if (error) throw error
        // Decrement via RPC (bypasses RLS on reviews table)
        await supabase.rpc('increment_helpful_count', { p_review_id: review.id, p_delta: -1 })
      } else {
        const { error } = await supabase
          .from('review_votes')
          .insert({ review_id: review.id, user_id: user.id, vote_type: 'helpful' })
        if (error) throw error
        // Increment via RPC (bypasses RLS on reviews table)
        await supabase.rpc('increment_helpful_count', { p_review_id: review.id, p_delta: 1 })
      }
    } catch {
      // Revert optimistic update on error
      setHelpfulCount(prevCount)
      setHasVotedHelpful(prevVoted)
    } finally {
      setHelpfulLoading(false)
    }
  }

  const handleFlagReason = async (reason: string) => {
    if (!user || flagging) return
    setFlagMenuOpen(false)
    setFlagging(true)
    try {
      const { error } = await supabase
        .from('review_votes')
        .insert({
          review_id: review.id,
          user_id: user.id,
          vote_type: 'flag',
          flag_reason: reason,
        })
      if (error) throw error
      // Increment via RPC (bypasses RLS on reviews table)
      await supabase.rpc('increment_flagged_count', { p_review_id: review.id, p_delta: 1 })
      setHasFlagged(true)
    } catch {
      // Silently ignore duplicate flag errors
    } finally {
      setFlagging(false)
    }
  }

  const displayName =
    review.is_anonymous || !review.reviewer_name
      ? 'Anonymous Athlete'
      : review.reviewer_name

  const yearRange =
    review.year_attended_start && review.year_attended_end
      ? `${review.year_attended_start}–${review.year_attended_end}`
      : review.year_attended_start
      ? `${review.year_attended_start}–Present`
      : null

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 p-6 transition-colors duration-200 hover:border-zinc-700"
    >
      {/* Subtle hover gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-yellow-500/3 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative space-y-5">
        {/* Header row */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-800 bg-zinc-800">
              {review.is_anonymous ? (
                <Shield className="h-4 w-4 text-yellow-400" />
              ) : (
                <User className="h-4 w-4 text-yellow-400" />
              )}
            </span>
            <div>
              <p className="text-sm font-semibold text-white">
                {displayName}
              </p>
              {yearRange && (
                <p className="text-xs text-gray-500">{yearRange}</p>
              )}
            </div>
          </div>

          {/* Composite score */}
          <div className="flex flex-col items-end">
            <span className="text-3xl font-black tabular-nums text-yellow-400 leading-none">
              {composite.toFixed(1)}
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              / 5.0
            </span>
          </div>
        </div>

        {/* Sport + gender badge */}
        {(review.sport || review.gender) && (
          <div className="flex flex-wrap gap-2">
            {review.sport && (
              <span className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-800 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-300">
                {review.sport}
              </span>
            )}
            {review.gender && (
              <span className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-800/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                {review.gender}
              </span>
            )}
          </div>
        )}

        {/* Rating bars */}
        <div className="space-y-2.5">
          {RATING_CATEGORIES.map(({ key, label }) => (
            <RatingBar key={key} label={label} value={review[key] as number} />
          ))}
        </div>

        {/* Review text */}
        {review.review_text && (
          <div className="border-t border-zinc-800 pt-4">
            <p className="text-sm leading-relaxed text-gray-300">
              {review.review_text}
            </p>
          </div>
        )}

        {/* Pros block */}
        {review.pros && (
          <div className="border-l-2 border-green-500/40 pl-3">
            <div className="flex items-center gap-1.5 mb-1">
              <CheckCircle className="h-3.5 w-3.5 text-green-400 shrink-0" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-green-400">
                Pros
              </span>
            </div>
            <p className="text-sm leading-relaxed text-green-300">
              {review.pros}
            </p>
          </div>
        )}

        {/* Cons block */}
        {review.cons && (
          <div className="border-l-2 border-red-500/40 pl-3">
            <div className="flex items-center gap-1.5 mb-1">
              <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-red-400">
                Cons
              </span>
            </div>
            <p className="text-sm leading-relaxed text-red-300">
              {review.cons}
            </p>
          </div>
        )}

        {/* Footer row — date + actions */}
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-gray-600">{formatDate(review.created_at)}</p>

          <div className="flex items-center gap-3">
            {/* Helpful button */}
            <button
              onClick={handleHelpful}
              disabled={helpfulLoading}
              aria-label="Mark as helpful"
              className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] transition-colors disabled:opacity-60 ${
                hasVotedHelpful
                  ? 'text-yellow-400'
                  : 'text-gray-500 hover:text-yellow-400'
              } ${!user ? 'cursor-default' : ''}`}
            >
              <ThumbsUp
                className={`h-3.5 w-3.5 ${hasVotedHelpful ? 'fill-yellow-400' : ''}`}
              />
              <span>Helpful ({helpfulCount})</span>
            </button>

            {/* Flag / Report button */}
            <div className="relative" ref={flagRef}>
              {hasFlagged ? (
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-red-500/60 cursor-default">
                  <Flag className="h-3.5 w-3.5" />
                  <span>Reported</span>
                </span>
              ) : (
                <button
                  onClick={() => {
                    if (!user) return
                    setFlagMenuOpen((prev) => !prev)
                  }}
                  aria-label="Report review"
                  className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] transition-colors text-gray-600 hover:text-red-400 ${
                    !user ? 'cursor-default' : ''
                  }`}
                >
                  <Flag className="h-3.5 w-3.5" />
                  <span>Report</span>
                </button>
              )}

              {/* Flag reason dropdown */}
              <AnimatePresence>
                {flagMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 bottom-full mb-2 z-50 w-44 rounded-xl border border-gray-700 bg-gray-950 shadow-xl overflow-hidden"
                  >
                    <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
                      Reason
                    </p>
                    {FLAG_REASONS.map((reason) => (
                      <button
                        key={reason}
                        onClick={() => handleFlagReason(reason)}
                        className="w-full text-left px-3 py-2.5 text-xs text-gray-300 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                      >
                        {reason}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
