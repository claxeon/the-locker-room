import React from 'react'
import { motion } from 'framer-motion'
import { User, Shield } from 'lucide-react'
import { StarRating } from './StarRating'

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
  const composite = computeComposite(review)

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
      className="group relative overflow-hidden rounded-2xl border border-yellow-500/25 bg-black/60 p-6 backdrop-blur transition-shadow duration-300 hover:shadow-[0_20px_40px_-20px_rgba(234,179,8,0.3)]"
    >
      {/* Subtle hover gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-purple-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative space-y-5">
        {/* Header row */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-yellow-500/30 bg-yellow-500/10">
              {review.is_anonymous ? (
                <Shield className="h-4 w-4 text-yellow-400" />
              ) : (
                <User className="h-4 w-4 text-yellow-400" />
              )}
            </span>
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-white">
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
              <span className="inline-flex items-center rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.25em] text-yellow-300">
                {review.sport}
              </span>
            )}
            {review.gender && (
              <span className="inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.25em] text-purple-300">
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

        {/* Divider */}
        {review.review_text && (
          <div className="border-t border-yellow-500/10 pt-4">
            <p className="text-sm leading-relaxed text-gray-300">
              {review.review_text}
            </p>
          </div>
        )}

        {/* Footer — date */}
        <p className="text-xs text-gray-600">
          {formatDate(review.created_at)}
        </p>
      </div>
    </motion.article>
  )
}
