import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, MapPin, BookOpen } from 'lucide-react'
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

export type CollegeRatings = {
  facilities: number
  coaching: number
  balance: number
  support: number
  culture: number
  equity: number
}

export type CollegeCardData = {
  schoolId: string
  name: string
  division: string
  sanction?: string
  location: string
  logoUrl?: string | null
  ratings: CollegeRatings
  reviewCount: number
  hasReviews?: boolean
  // Optional athlete testimonial surfaced from reviews
  testimonial?: {
    quote: string
    sport: string
    year?: string
  } | null
}

export type CollegeCardProps = {
  data: CollegeCardData
  isSelected?: boolean
  onSelect?: (data: CollegeCardData) => void
}

const METRIC_LABELS: Array<{ key: keyof CollegeRatings; label: string; short: string }> = [
  { key: 'facilities', label: 'Facilities',      short: 'Fac.'     },
  { key: 'coaching',   label: 'Coaching',         short: 'Coach'    },
  { key: 'balance',    label: 'Acad. Balance',    short: 'Bal.'     },
  { key: 'support',    label: 'Support Staff',    short: 'Sup.'     },
  { key: 'culture',    label: 'Team Culture',     short: 'Culture'  },
  { key: 'equity',     label: 'Gender Equity',    short: 'Equity'   },
]

// Custom Recharts tooltip
function RadarTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { metric: string; score: number } }> }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold uppercase tracking-widest text-zinc-400">{d.metric}</p>
      <p className="text-lg font-black text-yellow-400">{d.score.toFixed(1)}<span className="text-xs text-zinc-500"> / 5</span></p>
    </div>
  )
}

export function CollegeCard({ data, isSelected = false, onSelect }: CollegeCardProps) {
  const { name, division, sanction, location, logoUrl, ratings, reviewCount, hasReviews = true, testimonial } = data

  const chartData = useMemo(
    () =>
      METRIC_LABELS.map(({ key, label }) => ({
        metric: label,
        score: ratings[key],
      })),
    [ratings]
  )

  const averageScore = useMemo(() => {
    const values = METRIC_LABELS.map(({ key }) => ratings[key])
    return Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1))
  }, [ratings])

  const compositeColor =
    averageScore >= 4.0 ? '#4ade80' :
    averageScore >= 3.0 ? '#facc15' :
    averageScore >= 2.0 ? '#fb923c' : '#f87171'

  return (
    <motion.div
      whileHover={{ scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className={`group relative flex h-full flex-col gap-5 rounded-2xl border p-6 shadow-xl backdrop-blur-lg transition-colors cursor-pointer outline-none ${
        isSelected
          ? 'border-yellow-500 bg-zinc-900/80 shadow-[0_20px_50px_-20px_rgba(234,179,8,0.5)]'
          : 'border-zinc-800 bg-zinc-900/50 hover:border-yellow-500/50'
      }`}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onClick={() => onSelect?.(data)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(data) }
      }}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-yellow-500/20 px-2.5 py-1">
          <CheckCircle2 className="h-3 w-3 text-yellow-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-400">Selected</span>
        </div>
      )}

      {/* Header: logo + name + meta */}
      <div className="flex items-start gap-4 pr-20">
        {/* Logo */}
        <div
          className="flex-shrink-0 flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-zinc-700"
          style={{ background: 'linear-gradient(135deg, #1c1917 0%, #27272a 100%)' }}
        >
          {logoUrl ? (
            <>
              <img
                src={logoUrl}
                alt={`${name} logo`}
                className="h-full w-full object-contain p-1.5"
                onError={(e) => {
                  const img = e.currentTarget
                  img.style.display = 'none'
                  const fb = img.nextElementSibling as HTMLElement | null
                  if (fb) fb.style.display = 'flex'
                }}
              />
              <span
                className="hidden h-full w-full items-center justify-center text-xl font-black"
                style={{ color: '#eab308', fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic' }}
              >
                {name.charAt(0)}
              </span>
            </>
          ) : (
            <span
              className="flex h-full w-full items-center justify-center text-xl font-black"
              style={{ color: '#eab308', fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic' }}
            >
              {name.charAt(0)}
            </span>
          )}
        </div>

        {/* Name + tags */}
        <div className="flex flex-col gap-1 min-w-0">
          <h3 className="text-base font-black uppercase tracking-tight text-white leading-tight truncate">
            {name}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {division && (
              <span className="inline-flex items-center gap-1 rounded-md bg-yellow-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-yellow-500">
                <BookOpen className="h-2.5 w-2.5" />
                {division}
              </span>
            )}
            {sanction && (
              <span className="inline-flex rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                {sanction}
              </span>
            )}
          </div>
          {location && (
            <p className="flex items-center gap-1 text-xs text-zinc-500">
              <MapPin className="h-2.5 w-2.5" />
              {location}
            </p>
          )}
        </div>
      </div>

      {/* Composite score strip */}
      <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-black/40 px-4 py-2.5">
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Composite Score
          </span>
          {hasReviews ? (
            <span className="text-2xl font-black tabular-nums" style={{ color: compositeColor }}>
              {averageScore}
              <span className="text-xs font-semibold text-zinc-600"> / 5.0</span>
            </span>
          ) : (
            <span className="text-sm font-semibold text-zinc-600 italic">No reviews yet</span>
          )}
        </div>
        <div className="text-right">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Reviews</span>
          <p className="text-lg font-black text-white">{reviewCount.toLocaleString()}</p>
        </div>
      </div>

      {/* Radar chart OR no-review empty state */}
      {hasReviews ? (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="72%" data={chartData}>
              <PolarGrid stroke="rgba(250,204,21,0.2)" radialLines={false} />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 600 }}
              />
              <PolarRadiusAxis
                tick={false}
                axisLine={false}
                tickLine={false}
                domain={[0, 5]}
              />
              <Tooltip content={<RadarTooltip />} />
              <Radar
                name={name}
                dataKey="score"
                stroke="#eab308"
                fill="rgba(234,179,8,0.2)"
                strokeWidth={2}
                dot={{ r: 3, fill: '#eab308', strokeWidth: 0 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-800 py-10 text-center">
          <div className="h-10 w-10 rounded-full border border-zinc-800 bg-zinc-900 flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-zinc-600" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">No reviews yet</p>
            <p className="mt-1 text-[11px] text-zinc-700 max-w-[180px] mx-auto">
              Be the first athlete to rate this program.
            </p>
          </div>
        </div>
      )}

      {/* Per-metric mini bars */}
      {hasReviews && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {METRIC_LABELS.map(({ key, short }) => {
            const val = ratings[key]
            const pct = (val / 5) * 100
            return (
              <div key={key} className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">{short}</span>
                  <span className="text-[10px] font-black tabular-nums text-yellow-500">{val.toFixed(1)}</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-yellow-500 transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Athlete testimonial quote — shown when provided */}
      {testimonial && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
          <p className="text-[11px] italic leading-relaxed text-zinc-400">
            &ldquo;{testimonial.quote}&rdquo;
          </p>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
            {testimonial.sport}{testimonial.year ? ` · ${testimonial.year}` : ''} · Verified Athlete
          </p>
        </div>
      )}
    </motion.div>
  )
}

export default CollegeCard
