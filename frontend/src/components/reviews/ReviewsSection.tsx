import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PenLine, X, MessageSquarePlus } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { ReviewCard, Review } from './ReviewCard'
import { ReviewForm } from './ReviewForm'

interface ReviewsSectionProps {
  schoolId: string
  schoolName: string
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
  { key: 'balance_rating', label: 'Acad. Balance' },
  { key: 'support_rating', label: 'Support Staff' },
  { key: 'culture_rating', label: 'Team Culture' },
  { key: 'equity_rating', label: 'Gender Equity' },
]

const AggregateBar: React.FC<{ label: string; value: number }> = ({
  label,
  value,
}) => {
  const pct = (value / 5) * 100
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
          {label}
        </span>
        <span className="text-xs font-black tabular-nums text-yellow-400">
          {value.toFixed(1)}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-yellow-500 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  schoolId,
  schoolName,
}) => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('reviews')
        .select('*')
        .eq('school_id', schoolId)
        .eq('moderation_status', 'approved')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setReviews((data as Review[]) ?? [])
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not load reviews.'
      )
    } finally {
      setLoading(false)
    }
  }, [schoolId])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  // ── Aggregate stats ─────────────────────────────────────────────────────────
  const aggregates = RATING_CATEGORIES.map(({ key, label }) => {
    const avg =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + (r[key] as number), 0) /
          reviews.length
        : 0
    return { label, value: Math.round(avg * 10) / 10 }
  })

  const overallAvg =
    reviews.length > 0
      ? Math.round(
          (aggregates.reduce((sum, a) => sum + a.value, 0) /
            aggregates.length) *
            10
        ) / 10
      : 0

  const handleSuccess = () => {
    setModalOpen(false)
    // Refresh reviews list after a brief delay
    setTimeout(fetchReviews, 500)
  }

  return (
    <section className="rounded-2xl border border-yellow-500/25 bg-black/60 p-8 backdrop-blur">
      {/* Section header */}
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight text-white">
            Athlete Reviews
          </h2>
          <p className="mt-1 text-sm font-semibold uppercase tracking-[0.3em] text-gray-400">
            {loading
              ? 'Loading…'
              : reviews.length > 0
              ? `${reviews.length} verified review${reviews.length !== 1 ? 's' : ''}`
              : 'No reviews yet'}
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border-2 border-yellow-500 bg-yellow-500/10 px-6 py-3 text-xs font-black uppercase tracking-[0.3em] text-yellow-400 hover:bg-yellow-500/20 transition-colors"
        >
          <PenLine className="h-4 w-4" />
          Write a Review
        </button>
      </header>

      {/* Aggregate scorecard */}
      {reviews.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-xl border border-yellow-500/20 bg-black/40 p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">
              Overall Score
            </span>
            <span className="text-4xl font-black tabular-nums text-yellow-400 leading-none">
              {overallAvg.toFixed(1)}
              <span className="ml-1 text-lg font-semibold text-gray-500">/ 5</span>
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {aggregates.map(({ label, value }) => (
              <AggregateBar key={label} label={label} value={value} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-2xl border border-yellow-500/10 bg-white/5"
            />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && reviews.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-6 rounded-xl border border-yellow-500/10 bg-black/20 py-16 text-center"
        >
          <MessageSquarePlus className="h-14 w-14 text-yellow-500/40" />
          <div className="space-y-2">
            <p className="text-lg font-black uppercase tracking-tight text-white">
              No Reviews Yet
            </p>
            <p className="text-sm text-gray-500">
              Be the first athlete to review this program.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-yellow-500 bg-yellow-500/10 px-8 py-3 text-xs font-black uppercase tracking-[0.3em] text-yellow-400 hover:bg-yellow-500/20 transition-colors"
          >
            <PenLine className="h-4 w-4" />
            Write the First Review
          </button>
        </motion.div>
      )}

      {/* Review list */}
      {!loading && !error && reviews.length > 0 && (
        <div className="space-y-5">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      {/* Review form modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setModalOpen(false)
            }}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            {/* Modal content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#eab308 transparent' }}
            >
              {/* Close button (outside form) */}
              <button
                onClick={() => setModalOpen(false)}
                className="absolute right-4 top-4 z-20 rounded-full p-1 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>

              <ReviewForm
                schoolId={schoolId}
                schoolName={schoolName}
                onSuccess={handleSuccess}
                onCancel={() => setModalOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
