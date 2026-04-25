import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, TrendingUp, Users, Award, Shield, BarChart3, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SchoolScorecardProps {
  schoolId: number
  schoolName: string
}

interface ProgramAggregate {
  sport: string
  review_count: number
  facilities_rating: number
  coaching_rating: number
  balance_rating: number
  support_rating: number
  culture_rating: number
  equity_rating: number
}

interface SportBreakdownItem {
  sport: string
  reviewCount: number
  overall: number
}

interface SchoolStats {
  overall: number
  facilities: number
  coaching: number
  balance: number
  support: number
  culture: number
  equity: number
  totalReviews: number
  sportBreakdown: SportBreakdownItem[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

function computeStats(aggregates: ProgramAggregate[], totalReviews: number): SchoolStats {
  let wFacilities = 0
  let wCoaching = 0
  let wBalance = 0
  let wSupport = 0
  let wCulture = 0
  let wEquity = 0
  let totalWeight = 0

  const sportBreakdown: SportBreakdownItem[] = []

  for (const row of aggregates) {
    const w = row.review_count
    totalWeight += w
    wFacilities += row.facilities_rating * w
    wCoaching   += row.coaching_rating   * w
    wBalance    += row.balance_rating    * w
    wSupport    += row.support_rating    * w
    wCulture    += row.culture_rating    * w
    wEquity     += row.equity_rating     * w

    const sportOverall = (
      row.facilities_rating +
      row.coaching_rating +
      row.balance_rating +
      row.support_rating +
      row.culture_rating +
      row.equity_rating
    ) / 6

    sportBreakdown.push({
      sport: row.sport,
      reviewCount: row.review_count,
      overall: round1(sportOverall),
    })
  }

  if (totalWeight === 0) {
    return {
      overall: 0,
      facilities: 0,
      coaching: 0,
      balance: 0,
      support: 0,
      culture: 0,
      equity: 0,
      totalReviews,
      sportBreakdown: [],
    }
  }

  const facilities = round1(wFacilities / totalWeight)
  const coaching   = round1(wCoaching   / totalWeight)
  const balance    = round1(wBalance    / totalWeight)
  const support    = round1(wSupport    / totalWeight)
  const culture    = round1(wCulture    / totalWeight)
  const equity     = round1(wEquity     / totalWeight)
  const overall    = round1((facilities + coaching + balance + support + culture + equity) / 6)

  // sort sports descending by reviewCount
  sportBreakdown.sort((a, b) => b.reviewCount - a.reviewCount)

  return { overall, facilities, coaching, balance, support, culture, equity, totalReviews, sportBreakdown }
}

// ─── Color coding ─────────────────────────────────────────────────────────────

function scoreColor(value: number): { text: string; fill: string } {
  if (value >= 4.5) return { text: 'text-green-400',  fill: '#22c55e' }
  if (value >= 3.5) return { text: 'text-yellow-400', fill: '#EAB308' }
  if (value >= 2.5) return { text: 'text-orange-400', fill: '#f97316' }
  return              { text: 'text-red-400',    fill: '#ef4444' }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const DIMENSIONS: Array<{ label: string; key: keyof SchoolStats }> = [
  { label: 'Facilities',        key: 'facilities' },
  { label: 'Coaching',          key: 'coaching'   },
  { label: 'Academic Balance',  key: 'balance'    },
  { label: 'Support Staff',     key: 'support'    },
  { label: 'Team Culture',      key: 'culture'    },
  { label: 'Gender Equity',     key: 'equity'     },
]

// SVG Ring for overall score
interface ScoreRingProps {
  score: number // 0-5
  animate: boolean
}

function ScoreRing({ score, animate }: ScoreRingProps) {
  const radius = 70
  const stroke = 10
  const normalizedRadius = radius - stroke / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const pct = score / 5
  const dashOffset = circumference * (1 - (animate ? pct : 0))
  const { fill } = scoreColor(score)

  return (
    <svg
      height={radius * 2}
      width={radius * 2}
      style={{ transform: 'rotate(-90deg)' }}
    >
      {/* Track */}
      <circle
        stroke="#27272a"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      {/* Score arc */}
      <motion.circle
        stroke={fill}
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: dashOffset }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </svg>
  )
}

// Dimension bar row
interface DimBarProps {
  label: string
  value: number
  index: number
}

function DimBar({ label, value, index }: DimBarProps) {
  const pct = Math.round((value / 5) * 100)
  const { text, fill } = scoreColor(value)

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-zinc-400">{label}</span>
        <span className={`text-sm font-black tabular-nums ${text}`}>{value.toFixed(1)}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-zinc-800">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: fill }}
          initial={{ width: '0%' }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: index * 0.08, duration: 0.7, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

// Sport chip
interface SportChipProps {
  item: SportBreakdownItem
  isTop: boolean
}

function SportChip({ item, isTop }: SportChipProps) {
  const { text } = scoreColor(item.overall)
  return (
    <div
      className={`flex shrink-0 flex-col gap-1 rounded-xl border px-4 py-3 text-sm ${
        isTop
          ? 'border-yellow-500/50 bg-yellow-500/10'
          : 'border-zinc-700 bg-zinc-800'
      }`}
    >
      <span className="font-black uppercase tracking-wide text-white">{item.sport}</span>
      <div className="flex items-center gap-1.5">
        <Star className="h-3 w-3 text-yellow-400" />
        <span className={`font-black ${text}`}>{item.overall.toFixed(1)}</span>
        <span className="text-xs text-zinc-500">· {item.reviewCount} review{item.reviewCount !== 1 ? 's' : ''}</span>
      </div>
    </div>
  )
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="h-6 w-48 rounded-xl bg-zinc-800" />
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="h-48 w-full rounded-xl bg-zinc-800 md:w-56" />
        <div className="flex flex-1 flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-7 w-full rounded-xl bg-zinc-800" />
          ))}
        </div>
      </div>
    </div>
  )
}

// Empty state
function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
        <Star className="h-8 w-8 text-zinc-600" />
      </div>
      <p className="text-lg font-black uppercase tracking-tight text-white">No Ratings Yet</p>
      <p className="max-w-xs text-sm text-zinc-500">
        Be the first athlete to review this program. Your insight helps future recruits make informed decisions.
      </p>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SchoolScorecard({ schoolId, schoolName }: SchoolScorecardProps) {
  const [aggregates, setAggregates] = useState<ProgramAggregate[]>([])
  const [totalReviews, setTotalReviews] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [ringAnimated, setRingAnimated] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      setLoading(true)
      setError(null)
      setRingAnimated(false)

      try {
        const [aggResult, countResult] = await Promise.all([
          supabase
            .from('program_aggregates')
            .select('sport, review_count, facilities_rating, coaching_rating, balance_rating, support_rating, culture_rating, equity_rating')
            .eq('school_id', schoolId)
            .gt('review_count', 0),
          supabase
            .from('reviews')
            .select('*', { count: 'exact', head: true })
            .eq('school_id', schoolId)
            .eq('moderation_status', 'approved'),
        ])

        if (cancelled) return

        if (aggResult.error) throw new Error(aggResult.error.message)
        if (countResult.error) throw new Error(countResult.error.message)

        setAggregates((aggResult.data as ProgramAggregate[]) ?? [])
        setTotalReviews(countResult.count ?? 0)
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load scorecard data')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void fetchData()

    return () => {
      cancelled = true
    }
  }, [schoolId])

  // Trigger ring animation one frame after data loads
  useEffect(() => {
    if (!loading && aggregates.length > 0) {
      const id = setTimeout(() => setRingAnimated(true), 50)
      return () => clearTimeout(id)
    }
  }, [loading, aggregates])

  const hasReviews = aggregates.length > 0
  const stats: SchoolStats | null = hasReviews
    ? computeStats(aggregates, totalReviews)
    : null

  const overallColor = stats ? scoreColor(stats.overall) : { text: 'text-yellow-400', fill: '#EAB308' }
  const topSport = stats && stats.sportBreakdown.length > 0 ? stats.sportBreakdown[0] : null

  return (
    <motion.section
      className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 md:p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Section header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/10">
          <BarChart3 className="h-4 w-4 text-yellow-500" />
        </div>
        <h2 className="text-xl font-black uppercase tracking-tight text-white">
          Athlete Scorecard
        </h2>
        {stats && (
          <span className="ml-auto text-xs font-semibold uppercase tracking-widest text-zinc-500">
            {stats.totalReviews} verified review{stats.totalReviews !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Body */}
      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      ) : !hasReviews ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-8">
          {/* Two-column: ring + bars */}
          <div className="flex flex-col gap-8 md:flex-row md:items-center">
            {/* Left — overall ring */}
            <div className="flex flex-col items-center gap-3 md:w-56 md:shrink-0">
              <div className="relative flex items-center justify-center">
                <ScoreRing score={stats!.overall} animate={ringAnimated} />
                {/* Center label (rotated back to normal inside the rotated SVG container) */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className={`text-4xl font-black leading-none ${overallColor.text}`}>
                    {stats!.overall.toFixed(1)}
                  </span>
                  <span className="text-sm text-zinc-400">/ 5</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
                  Overall Score
                </span>
                <span className="text-xs text-zinc-500">
                  {stats!.totalReviews} verified review{stats!.totalReviews !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Right — dimension bars */}
            <div className="flex flex-1 flex-col gap-4">
              {DIMENSIONS.map((dim, i) => (
                <DimBar
                  key={dim.key}
                  label={dim.label}
                  value={stats![dim.key] as number}
                  index={i}
                />
              ))}
            </div>
          </div>

          {/* Sport breakdown — only if >1 sport */}
          {stats!.sportBreakdown.length > 1 && (
            <div className="flex flex-col gap-3">
              <span className="text-xs font-black uppercase tracking-widest text-zinc-500">
                By Sport
              </span>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {stats!.sportBreakdown.map((item) => (
                  <SportChip
                    key={item.sport}
                    item={item}
                    isTop={topSport?.sport === item.sport}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.section>
  )
}
