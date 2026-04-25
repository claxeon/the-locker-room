/**
 * ExploreReviews.tsx — The Locker Room
 *
 * Sprint 3C: Explore Reviews page
 * Discovery/browse page showing top-rated programs, recently reviewed,
 * and trending by sport.
 */

import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Flame,
  Trophy,
  Clock,
  TrendingUp,
  Star,
  ChevronRight,
  Search,
  Filter,
} from 'lucide-react'

import { supabase } from '../lib/supabase'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProgramAggregateRow {
  school_id: number
  sport: string
  review_count: number
  facilities_rating: number
  coaching_rating: number
  balance_rating: number
  support_rating: number
  culture_rating: number
  equity_rating: number
}

interface SchoolRow {
  school_id: number
  institution_name: string
  state_cd: string
  classification_name: string
  slug: string
  logo_url: string | null
}

interface ReviewRow {
  id: string
  school_id: number
  sport: string
  gender: string
  review_text: string | null
  pros: string | null
  cons: string | null
  facilities_rating: number
  coaching_rating: number
  balance_rating: number
  support_rating: number
  culture_rating: number
  equity_rating: number
  helpful_count: number
  is_anonymous: boolean
  created_at: string
}

interface TopRatedSchool {
  school_id: number
  institution_name: string
  state_cd: string
  classification_name: string
  slug: string
  logo_url: string | null
  composite: number
  review_count: number
  dims: {
    facilities: number
    coaching: number
    balance: number
    support: number
    culture: number
    equity: number
  }
  rank: number
}

interface RecentReview extends ReviewRow {
  institution_name: string
  slug: string
}

interface SportTrend {
  sport: string
  cleanName: string
  totalReviews: number
  composite: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeComposite(row: {
  facilities_rating: number
  coaching_rating: number
  balance_rating: number
  support_rating: number
  culture_rating: number
  equity_rating: number
}): number {
  const vals = [
    row.facilities_rating,
    row.coaching_rating,
    row.balance_rating,
    row.support_rating,
    row.culture_rating,
    row.equity_rating,
  ].filter((v) => v != null && v > 0)
  if (vals.length === 0) return 0
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

const cleanSport = (s: string): string =>
  s.replace(/\s+(Men's|Women's|Men|Women|Coed|Mixed)$/i, '').trim()

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function truncate(text: string | null | undefined, max: number): string {
  if (!text) return ''
  return text.length <= max ? text : text.slice(0, max) + '...'
}

function StarRow({ score }: { score: number }) {
  const full = Math.floor(score)
  const partial = score - full
  return (
    <div className="flex gap-0.5 items-center">
      {[1, 2, 3, 4, 5].map((i) => {
        const fill =
          i <= full ? 1 : i === full + 1 ? partial : 0
        return (
          <div key={i} className="relative w-3.5 h-3.5">
            <Star
              size={14}
              className="absolute inset-0 text-zinc-700"
              fill="currentColor"
            />
            {fill > 0 && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star size={14} className="text-yellow-500" fill="currentColor" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

// ── Top Rated Card
interface TopRatedCardProps {
  school: TopRatedSchool
  onClick: () => void
}

function TopRatedCard({ school, onClick }: TopRatedCardProps) {
  const dims = [
    school.dims.facilities,
    school.dims.coaching,
    school.dims.balance,
    school.dims.support,
    school.dims.culture,
    school.dims.equity,
  ]
  const maxDim = Math.max(...dims, 1)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (school.rank - 1) * 0.05 }}
      onClick={onClick}
      className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-5 cursor-pointer hover:border-yellow-500/30 hover:bg-zinc-800/60 transition-all duration-200 group"
    >
      {/* Rank badge */}
      <div className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
        <span className="text-black text-xs font-black">#{school.rank}</span>
      </div>

      {/* Logo + name */}
      <div className="flex items-start gap-3 mb-3 mt-1">
        {school.logo_url ? (
          <img
            src={school.logo_url}
            alt={school.institution_name}
            className="w-10 h-10 rounded-lg object-contain bg-zinc-800 flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
            <Trophy size={18} className="text-zinc-500" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-white font-bold text-sm uppercase tracking-wide leading-tight group-hover:text-yellow-400 transition-colors">
            {school.institution_name}
          </p>
          <p className="text-zinc-500 text-xs mt-0.5">
            {school.state_cd} · {school.classification_name}
          </p>
        </div>
      </div>

      {/* Composite score */}
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-yellow-500 text-3xl font-black">
          {school.composite.toFixed(1)}
        </span>
        <span className="text-zinc-500 text-sm">/5</span>
      </div>

      {/* Dimension bars */}
      <div className="flex flex-col gap-1 mb-3">
        {dims.map((v, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500/60 rounded-full"
                style={{ width: `${(v / maxDim) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Review count + arrow */}
      <div className="flex items-center justify-between">
        <span className="text-zinc-500 text-xs">
          {school.review_count} {school.review_count === 1 ? 'review' : 'reviews'}
        </span>
        <ChevronRight
          size={14}
          className="text-zinc-600 group-hover:text-yellow-500 transition-colors"
        />
      </div>
    </motion.div>
  )
}

// ── Recent Review Card
interface RecentReviewCardProps {
  review: RecentReview
  index: number
  onClick: () => void
}

function RecentReviewCard({ review, index, onClick }: RecentReviewCardProps) {
  const composite = computeComposite(review)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="flex-none w-72 snap-start bg-zinc-900 border border-zinc-800 rounded-2xl p-5 cursor-pointer hover:border-yellow-500/30 hover:bg-zinc-800/60 transition-all duration-200 group"
    >
      {/* School + sport */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-white font-bold text-sm uppercase tracking-wide leading-tight group-hover:text-yellow-400 transition-colors flex-1 min-w-0">
          {review.institution_name}
        </p>
        <span className="flex-none bg-zinc-800 border border-zinc-700 text-zinc-400 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full">
          {cleanSport(review.sport)}
        </span>
      </div>

      {/* Star rating */}
      <div className="flex items-center gap-2 mb-3">
        <StarRow score={composite} />
        <span className="text-yellow-500 text-xs font-bold">{composite.toFixed(1)}</span>
      </div>

      {/* Review text */}
      {review.review_text && (
        <p className="text-zinc-300 text-sm leading-relaxed mb-2">
          "{truncate(review.review_text, 140)}"
        </p>
      )}

      {/* Pros */}
      {review.pros && (
        <p className="text-zinc-500 text-xs mb-2">
          <span className="text-green-500 font-semibold">+ </span>
          {truncate(review.pros, 80)}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-zinc-800">
        <span className="text-zinc-600 text-xs">
          {review.is_anonymous ? 'Anonymous' : 'Verified Athlete'}
        </span>
        <span className="text-zinc-600 text-xs">{relativeTime(review.created_at)}</span>
      </div>
    </motion.div>
  )
}

// ── Sport Trend Chip
interface SportTrendChipProps {
  trend: SportTrend
  index: number
  maxReviews: number
  onClick: () => void
}

function SportTrendChip({ trend, index, maxReviews, onClick }: SportTrendChipProps) {
  const barWidth = maxReviews > 0 ? (trend.totalReviews / maxReviews) * 100 : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 cursor-pointer hover:border-yellow-500/30 hover:bg-zinc-800/60 transition-all duration-200 group"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-white font-bold text-sm uppercase tracking-wide group-hover:text-yellow-400 transition-colors">
          {trend.cleanName}
        </p>
        {trend.totalReviews > 0 && (
          <span className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {trend.totalReviews}
          </span>
        )}
      </div>

      {/* Sparkline bar */}
      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden mb-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${barWidth}%` }}
          transition={{ delay: 0.2 + index * 0.03, duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-yellow-500/70 rounded-full"
        />
      </div>

      <div className="flex items-center justify-between">
        {trend.composite > 0 ? (
          <span className="text-zinc-400 text-xs">
            {trend.composite.toFixed(1)} avg
          </span>
        ) : (
          <span className="text-zinc-600 text-xs">No data yet</span>
        )}
        <ChevronRight
          size={12}
          className="text-zinc-700 group-hover:text-yellow-500 transition-colors"
        />
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Empty states
// ---------------------------------------------------------------------------

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
        <Star size={20} className="text-zinc-600" />
      </div>
      <p className="text-zinc-500 text-sm">{message}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Fallback sport chips for empty state
// ---------------------------------------------------------------------------

const FALLBACK_SPORTS: SportTrend[] = [
  'Basketball',
  'Football',
  'Soccer',
  'Baseball',
  'Softball',
  'Volleyball',
  'Tennis',
  'Swimming',
].map((name) => ({
  sport: name,
  cleanName: name,
  totalReviews: 0,
  composite: 0,
}))

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export function ExploreReviews() {
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')

  // Data state
  const [topRated, setTopRated] = useState<TopRatedSchool[]>([])
  const [recentReviews, setRecentReviews] = useState<RecentReview[]>([])
  const [sportTrends, setSportTrends] = useState<SportTrend[]>([])

  // Loading state
  const [loadingTop, setLoadingTop] = useState(true)
  const [loadingRecent, setLoadingRecent] = useState(true)
  const [loadingTrends, setLoadingTrends] = useState(true)

  // ---------------------------------------------------------------------------
  // Fetch Section 1 — Top Rated Programs
  // ---------------------------------------------------------------------------
  const fetchTopRated = useCallback(async () => {
    setLoadingTop(true)
    try {
      const { data: aggData, error: aggError } = await supabase
        .from('program_aggregates')
        .select(
          'school_id, sport, review_count, facilities_rating, coaching_rating, balance_rating, support_rating, culture_rating, equity_rating'
        )
        .gt('review_count', 0)
        .order('facilities_rating', { ascending: false })
        .limit(50)

      if (aggError || !aggData || aggData.length === 0) {
        setTopRated([])
        return
      }

      // Group by school_id, compute composite per school (weighted by review_count)
      const schoolMap = new Map<
        number,
        {
          school_id: number
          totalReviews: number
          weightedSum: number
          dims: { facilities: number; coaching: number; balance: number; support: number; culture: number; equity: number }
          dimCounts: { facilities: number; coaching: number; balance: number; support: number; culture: number; equity: number }
        }
      >()

      for (const row of aggData as ProgramAggregateRow[]) {
        const existing = schoolMap.get(row.school_id)
        const composite = computeComposite(row)
        if (!existing) {
          schoolMap.set(row.school_id, {
            school_id: row.school_id,
            totalReviews: row.review_count,
            weightedSum: composite * row.review_count,
            dims: {
              facilities: row.facilities_rating * row.review_count,
              coaching: row.coaching_rating * row.review_count,
              balance: row.balance_rating * row.review_count,
              support: row.support_rating * row.review_count,
              culture: row.culture_rating * row.review_count,
              equity: row.equity_rating * row.review_count,
            },
            dimCounts: {
              facilities: row.review_count,
              coaching: row.review_count,
              balance: row.review_count,
              support: row.review_count,
              culture: row.review_count,
              equity: row.review_count,
            },
          })
        } else {
          existing.totalReviews += row.review_count
          existing.weightedSum += composite * row.review_count
          existing.dims.facilities += row.facilities_rating * row.review_count
          existing.dims.coaching += row.coaching_rating * row.review_count
          existing.dims.balance += row.balance_rating * row.review_count
          existing.dims.support += row.support_rating * row.review_count
          existing.dims.culture += row.culture_rating * row.review_count
          existing.dims.equity += row.equity_rating * row.review_count
          existing.dimCounts.facilities += row.review_count
          existing.dimCounts.coaching += row.review_count
          existing.dimCounts.balance += row.review_count
          existing.dimCounts.support += row.review_count
          existing.dimCounts.culture += row.review_count
          existing.dimCounts.equity += row.review_count
        }
      }

      // Sort by composite score, take top 6
      const sorted = Array.from(schoolMap.values())
        .map((s) => ({
          school_id: s.school_id,
          composite: s.totalReviews > 0 ? s.weightedSum / s.totalReviews : 0,
          review_count: s.totalReviews,
          dims: {
            facilities: s.dimCounts.facilities > 0 ? s.dims.facilities / s.dimCounts.facilities : 0,
            coaching: s.dimCounts.coaching > 0 ? s.dims.coaching / s.dimCounts.coaching : 0,
            balance: s.dimCounts.balance > 0 ? s.dims.balance / s.dimCounts.balance : 0,
            support: s.dimCounts.support > 0 ? s.dims.support / s.dimCounts.support : 0,
            culture: s.dimCounts.culture > 0 ? s.dims.culture / s.dimCounts.culture : 0,
            equity: s.dimCounts.equity > 0 ? s.dims.equity / s.dimCounts.equity : 0,
          },
        }))
        .sort((a, b) => b.composite - a.composite)
        .slice(0, 6)

      if (sorted.length === 0) {
        setTopRated([])
        return
      }

      // Fetch school info for those IDs
      const schoolIds = sorted.map((s) => s.school_id)
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .select('school_id, institution_name, state_cd, classification_name, slug, logo_url')
        .in('school_id', schoolIds)

      if (schoolError || !schoolData) {
        setTopRated([])
        return
      }

      const schoolInfoMap = new Map<number, SchoolRow>()
      for (const s of schoolData as SchoolRow[]) {
        schoolInfoMap.set(s.school_id, s)
      }

      const result: TopRatedSchool[] = sorted
        .map((s, idx) => {
          const info = schoolInfoMap.get(s.school_id)
          if (!info) return null
          return {
            ...info,
            composite: s.composite,
            review_count: s.review_count,
            dims: s.dims,
            rank: idx + 1,
          } as TopRatedSchool
        })
        .filter(Boolean) as TopRatedSchool[]

      setTopRated(result)
    } catch {
      setTopRated([])
    } finally {
      setLoadingTop(false)
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Fetch Section 2 — Recently Reviewed
  // ---------------------------------------------------------------------------
  const fetchRecentReviews = useCallback(async () => {
    setLoadingRecent(true)
    try {
      const { data: reviewData, error: reviewError } = await supabase
        .from('reviews')
        .select(
          'id, school_id, sport, gender, review_text, pros, cons, facilities_rating, coaching_rating, balance_rating, support_rating, culture_rating, equity_rating, helpful_count, is_anonymous, created_at'
        )
        .eq('moderation_status', 'approved')
        .order('created_at', { ascending: false })
        .limit(6)

      if (reviewError || !reviewData || reviewData.length === 0) {
        setRecentReviews([])
        return
      }

      const rows = reviewData as ReviewRow[]
      const seenIds = new Set<number>()
      const uniqueSchoolIds: number[] = []
      for (const r of rows) {
        if (!seenIds.has(r.school_id)) {
          seenIds.add(r.school_id)
          uniqueSchoolIds.push(r.school_id)
        }
      }

      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .select('school_id, institution_name, slug')
        .in('school_id', uniqueSchoolIds)

      if (schoolError) {
        setRecentReviews([])
        return
      }

      const schoolInfoMap = new Map<number, { institution_name: string; slug: string }>()
      for (const s of (schoolData ?? []) as { school_id: number; institution_name: string; slug: string }[]) {
        schoolInfoMap.set(s.school_id, { institution_name: s.institution_name, slug: s.slug })
      }

      const enriched: RecentReview[] = rows.map((r) => ({
        ...r,
        institution_name: schoolInfoMap.get(r.school_id)?.institution_name ?? 'Unknown School',
        slug: schoolInfoMap.get(r.school_id)?.slug ?? '',
      }))

      setRecentReviews(enriched)
    } catch {
      setRecentReviews([])
    } finally {
      setLoadingRecent(false)
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Fetch Section 3 — Trending by Sport
  // ---------------------------------------------------------------------------
  const fetchSportTrends = useCallback(async () => {
    setLoadingTrends(true)
    try {
      const { data, error } = await supabase
        .from('program_aggregates')
        .select(
          'sport, review_count, facilities_rating, coaching_rating, balance_rating, support_rating, culture_rating, equity_rating'
        )
        .gt('review_count', 0)

      if (error || !data || data.length === 0) {
        setSportTrends(FALLBACK_SPORTS)
        return
      }

      // Group by sport
      const sportMap = new Map<
        string,
        { totalReviews: number; weightedSum: number }
      >()

      for (const row of data as ProgramAggregateRow[]) {
        const composite = computeComposite(row)
        const clean = cleanSport(row.sport)
        const existing = sportMap.get(clean)
        if (!existing) {
          sportMap.set(clean, {
            totalReviews: row.review_count,
            weightedSum: composite * row.review_count,
          })
        } else {
          existing.totalReviews += row.review_count
          existing.weightedSum += composite * row.review_count
        }
      }

      const trends: SportTrend[] = Array.from(sportMap.entries())
        .map(([cleanName, val]) => ({
          sport: cleanName,
          cleanName,
          totalReviews: val.totalReviews,
          composite: val.totalReviews > 0 ? val.weightedSum / val.totalReviews : 0,
        }))
        .sort((a, b) => b.totalReviews - a.totalReviews)
        .slice(0, 8)

      setSportTrends(trends.length > 0 ? trends : FALLBACK_SPORTS)
    } catch {
      setSportTrends(FALLBACK_SPORTS)
    } finally {
      setLoadingTrends(false)
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Kick off all fetches in parallel
  // ---------------------------------------------------------------------------
  useEffect(() => {
    Promise.all([fetchTopRated(), fetchRecentReviews(), fetchSportTrends()])
  }, [fetchTopRated, fetchRecentReviews, fetchSportTrends])

  // ---------------------------------------------------------------------------
  // Search submit
  // ---------------------------------------------------------------------------
  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    navigate('/directory#filters')
  }

  // ---------------------------------------------------------------------------
  // Skeleton loader
  // ---------------------------------------------------------------------------
  function CardSkeleton({ count = 3 }: { count?: number }) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 animate-pulse"
          >
            <div className="w-16 h-4 bg-zinc-800 rounded mb-3" />
            <div className="w-full h-3 bg-zinc-800 rounded mb-2" />
            <div className="w-2/3 h-3 bg-zinc-800 rounded mb-4" />
            <div className="w-12 h-8 bg-zinc-800 rounded" />
          </div>
        ))}
      </div>
    )
  }

  function RowSkeleton({ count = 3 }: { count?: number }) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex-none w-72 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 animate-pulse"
          >
            <div className="w-full h-4 bg-zinc-800 rounded mb-3" />
            <div className="w-1/2 h-3 bg-zinc-800 rounded mb-4" />
            <div className="w-full h-3 bg-zinc-800 rounded mb-2" />
            <div className="w-full h-3 bg-zinc-800 rounded" />
          </div>
        ))}
      </div>
    )
  }

  const maxSportReviews = Math.max(...sportTrends.map((t) => t.totalReviews), 1)

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-black text-white">
      {/* ── Hero Header ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        {/* Gold gradient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(234,179,8,0.12) 0%, transparent 70%)',
          }}
        />

        <div className="relative max-w-6xl mx-auto px-6 pt-28 pb-16 sm:pt-32 sm:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-4"
          >
            <Flame size={24} className="text-yellow-500" />
            <span className="text-yellow-500 text-xs font-black uppercase tracking-[0.25em]">
              Explore Reviews
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-white mb-4 leading-tight"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}
          >
            Discover what athletes
            <br />
            <span className="text-yellow-500" style={{ fontStyle: 'italic' }}>are saying</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-zinc-400 text-lg max-w-xl mb-8"
          >
            Discover what athletes are saying about programs across the nation.
          </motion.p>

          {/* Search bar */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2 max-w-xl"
          >
            <div className="flex-1 flex items-center gap-3 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 focus-within:border-yellow-500/50 transition-colors">
              <Search size={16} className="text-zinc-500 flex-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search programs, schools, sports..."
                className="flex-1 bg-transparent text-white text-sm placeholder-zinc-600 outline-none"
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-bold px-5 py-3 rounded-xl transition-colors"
            >
              <Filter size={14} />
              Filter
            </button>
          </motion.form>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 pb-32 space-y-20">

        {/* ── Section 1: Top Rated Programs ─────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-1">
            <Trophy size={14} className="text-yellow-500" />
            <h2 className="text-zinc-400 text-[10px] font-semibold uppercase tracking-widest">
              Top Rated Programs
            </h2>
          </div>
          <p className="text-zinc-700 text-xs mb-6 ml-[26px]">
            Ranked by verified athlete reviews
          </p>

          {loadingTop ? (
            <CardSkeleton count={6} />
          ) : topRated.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 py-12 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600">No ratings yet</p>
              <p className="mt-1 text-xs text-zinc-700">Be the first athlete to review a program</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {topRated.map((school) => (
                <TopRatedCard
                  key={school.school_id}
                  school={school}
                  onClick={() => navigate(`/school/${school.slug}`)}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Section 2: Recently Reviewed ──────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-1">
            <Clock size={14} className="text-yellow-500" />
            <h2 className="text-zinc-400 text-[10px] font-semibold uppercase tracking-widest">
              Recently Reviewed
            </h2>
          </div>
          <p className="text-zinc-700 text-xs mb-6 ml-[26px]">
            Latest verified athlete reviews
          </p>

          {loadingRecent ? (
            <RowSkeleton count={3} />
          ) : recentReviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 py-12 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600">No reviews yet</p>
              <p className="mt-1 text-xs text-zinc-700">Be the first athlete to share your experience</p>
            </div>
          ) : (
            <div className="overflow-x-auto pb-4 -mx-6 px-6">
              <div className="flex gap-4 snap-x snap-mandatory w-max">
                {recentReviews.map((review, i) => (
                  <RecentReviewCard
                    key={review.id}
                    review={review}
                    index={i}
                    onClick={() =>
                      review.slug ? navigate(`/school/${review.slug}`) : undefined
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── Section 3: Trending by Sport ──────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-1">
            <TrendingUp size={14} className="text-yellow-500" />
            <h2 className="text-zinc-400 text-[10px] font-semibold uppercase tracking-widest">
              Trending by Sport
            </h2>
          </div>
          <p className="text-zinc-700 text-xs mb-6 ml-[26px]">
            Sports with the most athlete activity
          </p>

          {loadingTrends ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-pulse">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                  <div className="w-24 h-4 bg-zinc-800 rounded mb-2" />
                  <div className="w-full h-1 bg-zinc-800 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {sportTrends.map((trend, i) => (
                <SportTrendChip
                  key={trend.cleanName}
                  trend={trend}
                  index={i}
                  maxReviews={maxSportReviews}
                  onClick={() => navigate('/directory')}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── CTA Strip ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center"
        >
          <Flame size={20} className="text-yellow-500 mx-auto mb-5" />
          <h3
            className="text-white mb-2"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic', fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
          >
            Share Your Experience
          </h3>
          <p className="text-zinc-500 text-sm mb-7 max-w-sm mx-auto leading-relaxed">
            Help future athletes make informed decisions. Your honest review matters.
          </p>
          <button
            onClick={() => navigate('/directory')}
            className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm px-6 py-3 rounded-xl transition-colors"
          >
            Find Your Program
            <ChevronRight size={14} />
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default ExploreReviews
