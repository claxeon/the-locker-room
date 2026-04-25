import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
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
  location: string
  logoUrl?: string | null
  ratings: CollegeRatings
  reviewCount: number
}

export type CollegeCardProps = {
  data: CollegeCardData
  isSelected?: boolean
  onSelect?: (data: CollegeCardData) => void
}

const ratingLabels: Array<keyof CollegeRatings> = [
  'facilities',
  'coaching',
  'balance',
  'support',
  'culture',
  'equity',
]

export function CollegeCard({ data, isSelected = false, onSelect }: CollegeCardProps) {
  const { name, division, location, logoUrl, ratings, reviewCount } = data

  const chartData = useMemo(
    () =>
      ratingLabels.map((key) => ({
        metric: key.charAt(0).toUpperCase() + key.slice(1),
        score: ratings[key],
      })),
    [ratings]
  )

  const averageScore = useMemo(() => {
    const values = ratingLabels.map((key) => ratings[key])
    const total = values.reduce((acc, value) => acc + value, 0)
    return Number((total / values.length).toFixed(1))
  }, [ratings])

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      className={`group relative flex h-full flex-col gap-6 rounded-2xl border ${
        isSelected ? 'border-yellow-500 bg-yellow-500/15 shadow-[0_20px_45px_-20px_rgba(234,179,8,0.6)]' : 'border-yellow-500/30 bg-white/5'
      } p-6 shadow-xl backdrop-blur-lg transition-colors`}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={() => onSelect?.(data)}
      onKeyDown={(event) => {
        if (!onSelect) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(data)
        }
      }}
    >
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-500/10 via-yellow-500/0 to-purple-500/10 transition-opacity duration-300 ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-yellow-500/40"
            style={{ background: 'linear-gradient(135deg, #09090b 0%, #27272a 100%)' }}
          >
            {logoUrl ? (
              <>
                <img
                  src={logoUrl}
                  alt={`${name} logo`}
                  className="h-full w-full object-contain p-1.5"
                  onError={(event) => {
                    const img = event.currentTarget
                    img.style.display = 'none'
                    const fb = img.nextElementSibling as HTMLElement | null
                    if (fb) fb.style.display = 'flex'
                  }}
                />
                <span
                  className="hidden h-full w-full items-center justify-center text-xl font-black tracking-tight"
                  style={{ color: '#eab308', fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic' }}
                >
                  {name.charAt(0)}
                </span>
              </>
            ) : (
              <span
                className="flex h-full w-full items-center justify-center text-xl font-black tracking-tight"
                style={{ color: '#eab308', fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic' }}
              >
                {name.charAt(0)}
              </span>
            )}
          </div>

          <div>
            <h3 className="text-2xl font-black uppercase tracking-tight text-white">
              {name}
            </h3>
            <p className="text-sm font-semibold uppercase tracking-wider text-yellow-300">
              {division}
            </p>
            <p className="text-sm text-gray-300">{location}</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Composite
          </div>
          <div className="text-3xl font-black text-yellow-400">{averageScore}</div>
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            {reviewCount.toLocaleString()} Reviews
          </div>
        </div>
      </div>

      <div className="relative h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
            <PolarGrid stroke="rgba(250, 204, 21, 0.35)" radialLines={false} />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: '#facc15', fontSize: 12, fontWeight: 600 }}
            />
            <PolarRadiusAxis
              tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              angle={90}
              domain={[0, 5]}
            />
            <Radar
              name={name}
              dataKey="score"
              stroke="#facc15"
              fill="rgba(250, 204, 21, 0.35)"
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

export default CollegeCard
