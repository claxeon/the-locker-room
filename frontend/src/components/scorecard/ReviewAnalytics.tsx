import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Users, TrendingUp, Shield, Star } from 'lucide-react'
import { supabase } from '../../lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReviewAnalyticsProps {
  schoolId: number
}

interface ReviewRow {
  sport: string
  gender: string
  facilities_rating: number
  coaching_rating: number
  balance_rating: number
  support_rating: number
  culture_rating: number
  equity_rating: number
  helpful_count: number
  created_at: string
}

interface ProgramAgg {
  sport: string
  review_count: number
  facilities_rating: number
  coaching_rating: number
  balance_rating: number
  support_rating: number
  culture_rating: number
  equity_rating: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function compositeScore(row: {
  facilities_rating: number
  coaching_rating: number
  balance_rating: number
  support_rating: number
  culture_rating: number
  equity_rating: number
}): number {
  return (
    (row.facilities_rating +
      row.coaching_rating +
      row.balance_rating +
      row.support_rating +
      row.culture_rating +
      row.equity_rating) /
    6
  )
}

function avgComposite(rows: ReviewRow[]): number {
  if (rows.length === 0) return 0
  return rows.reduce((sum, r) => sum + compositeScore(r), 0) / rows.length
}

function cleanSport(sport: string): string {
  return sport.replace(/\s+(Men's|Women's|Men|Women|Coed|Mixed)$/i, '').trim()
}

function barColor(score: number): string {
  if (score >= 4.5) return 'bg-green-500'
  if (score >= 3.5) return 'bg-yellow-500'
  if (score >= 2.5) return 'bg-orange-500'
  return 'bg-red-500'
}

function getLast6Months(): { month: string; key: string }[] {
  const now = new Date()
  const result: { month: string; key: string }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    result.push({
      month: d.toLocaleString('default', { month: 'short' }),
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
    })
  }
  return result
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string
}) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="text-zinc-500">{icon}</span>
      <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
        {label}
      </span>
    </div>
  )
}

function GenderChip({ gender }: { gender: string }) {
  const lower = gender.toLowerCase()
  if (lower.includes("men's") || lower === 'men') {
    return (
      <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-400">
        {gender}
      </span>
    )
  }
  if (lower.includes("women's") || lower === 'women') {
    return (
      <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-purple-400">
        {gender}
      </span>
    )
  }
  return (
    <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal-400">
      {gender}
    </span>
  )
}

// ─── Section 1: Gender Equity ─────────────────────────────────────────────────

function GenderEquitySection({ reviews }: { reviews: ReviewRow[] }) {
  const mens = reviews.filter((r) => r.gender === "Men's")
  const womens = reviews.filter((r) => r.gender === "Women's")
  const mixed = reviews.filter((r) => r.gender === 'Mixed')

  const mensAvg = avgComposite(mens)
  const womensAvg = avgComposite(womens)
  const mixedAvg = avgComposite(mixed)
  const gap = Math.abs(mensAvg - womensAvg)

  const hasMens = mens.length > 0
  const hasWomens = womens.length > 0
  const hasMixed = mixed.length > 0
  const hasAny = hasMens || hasWomens || hasMixed

  let gapLabel = ''
  let gapClass = ''
  if (hasMens && hasWomens) {
    if (gap < 0.3) {
      gapLabel = 'Strong equity — programs rate similarly across genders'
      gapClass = 'text-green-400 bg-green-500/10 border-green-500/30'
    } else if (gap <= 0.7) {
      gapLabel = "Moderate gap — some difference between Men's and Women's experiences"
      gapClass = 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
    } else {
      gapLabel = 'Significant gap — notable difference in athlete experiences by gender'
      gapClass = 'text-red-400 bg-red-500/10 border-red-500/30'
    }
  }

  const bars: { label: string; score: number; barClass: string; missing: boolean; missingLabel?: string }[] = []

  if (hasMens) {
    bars.push({ label: "Men's Program", score: mensAvg, barClass: 'bg-blue-500', missing: false })
  } else {
    bars.push({ label: "Men's Program", score: 0, barClass: 'bg-blue-500', missing: true, missingLabel: "No data for Men's yet" })
  }

  if (hasWomens) {
    bars.push({ label: "Women's Program", score: womensAvg, barClass: 'bg-purple-500', missing: false })
  } else {
    bars.push({ label: "Women's Program", score: 0, barClass: 'bg-purple-500', missing: true, missingLabel: "No data for Women's yet" })
  }

  if (hasMixed) {
    bars.push({ label: 'Mixed Program', score: mixedAvg, barClass: 'bg-teal-500', missing: false })
  }

  return (
    <div>
      <SectionHeader icon={<Users className="h-4 w-4" />} label="Gender Equity Scoring" />
      {!hasAny ? (
        <p className="text-sm text-zinc-500">No gender data yet</p>
      ) : (
        <div className="space-y-3">
          {bars.map((bar) => (
            <div key={bar.label} className="flex items-center gap-3">
              <span className="w-36 shrink-0 text-xs text-zinc-400">{bar.label}</span>
              {bar.missing ? (
                <span className="text-xs italic text-zinc-600">{bar.missingLabel}</span>
              ) : (
                <>
                  <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
                    <motion.div
                      className={`absolute left-0 top-0 h-full rounded-full ${bar.barClass}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(bar.score / 5) * 100}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right text-xs font-semibold text-white">
                    {bar.score.toFixed(1)}
                  </span>
                </>
              )}
            </div>
          ))}

          {hasMens && hasWomens && (
            <div className={`mt-4 rounded-lg border px-3 py-2 text-xs ${gapClass}`}>
              <span className="font-semibold">Equity gap {gap.toFixed(2)}</span>
              {' — '}
              {gapLabel}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Section 2: Sport Breakdown ───────────────────────────────────────────────

function SportBreakdownSection({ aggs }: { aggs: ProgramAgg[] }) {
  const sorted = [...aggs]
    .sort((a, b) => {
      const aComp =
        (a.facilities_rating + a.coaching_rating + a.balance_rating + a.support_rating + a.culture_rating + a.equity_rating) / 6
      const bComp =
        (b.facilities_rating + b.coaching_rating + b.balance_rating + b.support_rating + b.culture_rating + b.equity_rating) / 6
      return bComp - aComp
    })
    .slice(0, 8)

  function getGenderFromSport(sport: string): string {
    const m = sport.match(/\s+(Men's|Women's|Men|Women|Coed|Mixed)$/i)
    return m ? m[1] : 'Mixed'
  }

  return (
    <div>
      <SectionHeader icon={<BarChart3 className="h-4 w-4" />} label="Sport Breakdown" />
      {sorted.length === 0 ? (
        <p className="text-sm text-zinc-500">No sport breakdown yet</p>
      ) : (
        <div className="space-y-2.5">
          {sorted.map((agg, index) => {
            const comp =
              (agg.facilities_rating + agg.coaching_rating + agg.balance_rating + agg.support_rating + agg.culture_rating + agg.equity_rating) / 6
            const gender = getGenderFromSport(agg.sport)
            const displayName = cleanSport(agg.sport)
            return (
              <motion.div
                key={agg.sport}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06, duration: 0.35 }}
                className="flex items-center gap-3"
              >
                <div className="flex w-40 shrink-0 items-center gap-1.5">
                  <span className="truncate text-xs font-medium text-zinc-300">{displayName}</span>
                  <GenderChip gender={gender} />
                </div>
                <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
                  <motion.div
                    className={`absolute left-0 top-0 h-full rounded-full ${barColor(comp)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(comp / 5) * 100}%` }}
                    transition={{ delay: index * 0.06, duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-xs font-semibold text-white">
                  {comp.toFixed(1)}
                </span>
                <span className="w-16 shrink-0 text-right text-[10px] text-zinc-500">
                  {agg.review_count} reviews
                </span>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Section 3: Activity Timeline ─────────────────────────────────────────────

function ActivityTimelineSection({ reviews }: { reviews: ReviewRow[] }) {
  const months = getLast6Months()
  const countMap: Record<string, number> = {}
  for (const m of months) countMap[m.key] = 0

  for (const r of reviews) {
    const d = new Date(r.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (key in countMap) countMap[key]++
  }

  const counts = months.map((m) => countMap[m.key])
  const maxCount = Math.max(...counts, 1)
  const allZero = counts.every((c) => c === 0)

  return (
    <div>
      <SectionHeader icon={<TrendingUp className="h-4 w-4" />} label="Review Activity — Last 6 Months" />
      {allZero ? (
        <p className="text-sm text-zinc-500">No review activity yet</p>
      ) : (
        <div className="flex h-20 items-end gap-2">
          {months.map((m, i) => {
            const count = countMap[m.key]
            const heightPct = (count / maxCount) * 100
            return (
              <div key={m.key} className="flex flex-1 flex-col items-center gap-1">
                <motion.div
                  className="w-full rounded-t bg-yellow-500"
                  style={{ height: `${Math.max(heightPct, count > 0 ? 8 : 2)}%` }}
                  initial={{ scaleY: 0, originY: '100%' }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: i * 0.06, duration: 0.4, ease: 'easeOut' }}
                  title={`${count} review${count !== 1 ? 's' : ''}`}
                />
                <span className="text-[10px] text-zinc-500">{m.month}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function SkeletonPulse() {
  return (
    <div className="h-32 animate-pulse rounded-xl bg-zinc-800" />
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ReviewAnalytics({ schoolId }: ReviewAnalyticsProps) {
  const [reviews, setReviews] = useState<ReviewRow[]>([])
  const [aggs, setAggs] = useState<ProgramAgg[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const [reviewsRes, aggsRes] = await Promise.all([
          supabase
            .from('reviews')
            .select(
              'sport, gender, facilities_rating, coaching_rating, balance_rating, support_rating, culture_rating, equity_rating, helpful_count, created_at'
            )
            .eq('school_id', schoolId)
            .eq('moderation_status', 'approved'),
          supabase
            .from('program_aggregates')
            .select(
              'sport, review_count, facilities_rating, coaching_rating, balance_rating, support_rating, culture_rating, equity_rating'
            )
            .eq('school_id', schoolId)
            .gt('review_count', 0),
        ])

        if (cancelled) return

        if (reviewsRes.error) throw reviewsRes.error
        if (aggsRes.error) throw aggsRes.error

        setReviews((reviewsRes.data as ReviewRow[]) ?? [])
        setAggs((aggsRes.data as ProgramAgg[]) ?? [])
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load analytics')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [schoolId])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <SkeletonPulse />
        <SkeletonPulse />
        <div className="md:col-span-2">
          <SkeletonPulse />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
        <div className="flex items-center gap-2 text-red-400">
          <Star className="h-4 w-4 shrink-0" />
          <span className="text-sm font-semibold">Could not load review analytics</span>
        </div>
        <p className="mt-1 text-xs text-red-300/70">{error}</p>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-2">
        <Shield className="h-5 w-5 text-yellow-500" />
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Review Analytics
        </h2>
      </div>

      {/* Row 1: two columns */}
      <div className="grid gap-8 md:grid-cols-2">
        <GenderEquitySection reviews={reviews} />
        <SportBreakdownSection aggs={aggs} />
      </div>

      {/* Row 2: full-width timeline */}
      <div className="border-t border-zinc-800 pt-6 mt-6">
        <ActivityTimelineSection reviews={reviews} />
      </div>
    </div>
  )
}
