/**
 * ComparisonTable
 *
 * Shown when ≥ 2 schools are selected. Renders:
 *   1. Overlay dual/multi radar — all selected schools on one chart with distinct colors
 *   2. Per-metric bar chart rows — visual bars + numeric scores, winner highlighted
 *   3. Accreditation / sanction row
 *   4. Sport count row
 *   5. Review count row
 */

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'
import { Trophy, Users, BookOpen, BarChart2 } from 'lucide-react'

import { ProgramAggregateSchool } from '../hooks/useProgramAggregates'
import { SchoolSearchResult } from '../hooks/useSchoolSearch'

// Accept either type so both hooks can feed the table
export type ComparableSchool = ProgramAggregateSchool | SchoolSearchResult

type ComparisonTableProps = {
  schools: ComparableSchool[]
}

// Normalize to a common shape
type NormalizedSchool = {
  schoolId: string
  name: string
  division: string
  sanction: string
  reviewCount: number
  hasReviews: boolean
  facilities: number
  coaching: number
  balance: number
  support: number
  culture: number
  equity: number
}

function normalize(s: ComparableSchool): NormalizedSchool {
  if ('hasReviews' in s) {
    // SchoolSearchResult
    return {
      schoolId: String(s.schoolId),
      name: s.name,
      division: s.division,
      sanction: s.sanction ?? '',
      reviewCount: s.reviewCount,
      hasReviews: s.hasReviews,
      facilities: s.facilities,
      coaching: s.coaching,
      balance: s.balance,
      support: s.support,
      culture: s.culture,
      equity: s.equity,
    }
  }
  // ProgramAggregateSchool
  return {
    schoolId: s.schoolId,
    name: s.name,
    division: s.division,
    sanction: '',
    reviewCount: s.reviewCount,
    hasReviews: s.reviewCount > 0,
    facilities: s.facilities,
    coaching: s.coaching,
    balance: s.balance,
    support: s.support,
    culture: s.culture,
    equity: s.equity,
  }
}

const METRICS = [
  { key: 'facilities' as const, label: 'Facilities',       icon: '🏟️'  },
  { key: 'coaching'   as const, label: 'Coaching',          icon: '🎯'  },
  { key: 'balance'    as const, label: 'Academic Balance',  icon: '📚'  },
  { key: 'support'    as const, label: 'Support Staff',     icon: '🤝'  },
  { key: 'culture'    as const, label: 'Team Culture',      icon: '🏆'  },
  { key: 'equity'     as const, label: 'Gender Equity',     icon: '⚖️'  },
]

// Color palette — yellow accent for first school, then teal, coral, violet
const SCHOOL_COLORS = [
  '#eab308',  // yellow-500
  '#22d3ee',  // cyan-400
  '#fb7185',  // rose-400
  '#a78bfa',  // violet-400
]

const EPSILON = 0.001

function composite(s: NormalizedSchool) {
  return Number(
    ((s.facilities + s.coaching + s.balance + s.support + s.culture + s.equity) / 6).toFixed(2)
  )
}

// Metric bar row
function MetricRow({ label, icon, schools, columnMaxes }: {
  label: string
  icon: string
  schools: NormalizedSchool[]
  columnMaxes: Record<string, number>
}) {
  const key = METRICS.find((m) => m.label === label)?.key
  if (!key) return null

  return (
    <tr className="group">
      <td className="py-3 pl-4 pr-6">
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">{label}</span>
        </div>
      </td>
      {schools.map((school, idx) => {
        const val = school[key]
        const isLeader = Math.abs(val - columnMaxes[key]) < EPSILON && school.hasReviews
        const pct = (val / 5) * 100
        const color = SCHOOL_COLORS[idx] ?? '#eab308'
        return (
          <td key={school.schoolId} className="px-4 py-3">
            {school.hasReviews ? (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="h-2 flex-1 mr-3 overflow-hidden rounded-full bg-zinc-800">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: isLeader ? color : `${color}80`, width: `${pct}%` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                    />
                  </div>
                  <span
                    className={`min-w-[2.5rem] text-right text-sm font-black tabular-nums ${isLeader ? 'text-yellow-300' : 'text-zinc-300'}`}
                    style={{ color: isLeader ? color : undefined }}
                  >
                    {val.toFixed(1)}
                    {isLeader && <Trophy className="inline h-3 w-3 ml-0.5 mb-0.5" style={{ color }} />}
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-xs italic text-zinc-700">—</span>
            )}
          </td>
        )
      })}
    </tr>
  )
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ schools }) => {
  const normalized = useMemo(() => schools.map(normalize), [schools])

  const columnMaxes = useMemo(() => {
    const keys = METRICS.map((m) => m.key)
    return Object.fromEntries(
      keys.map((k) => [k, Math.max(...normalized.map((s) => s[k] ?? 0))])
    )
  }, [normalized])

  const compositeMax = useMemo(
    () => Math.max(...normalized.map((s) => composite(s))),
    [normalized]
  )

  // Recharts radar data — one entry per metric, one key per school
  const radarData = useMemo(
    () =>
      METRICS.map(({ key, label }) => ({
        metric: label,
        ...Object.fromEntries(normalized.map((s) => [s.name, s[key]])),
      })),
    [normalized]
  )

  const schoolsWithReviews = normalized.filter((s) => s.hasReviews)

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-8 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-500/10">
          <BarChart2 className="h-4 w-4 text-yellow-500" />
        </div>
        <div>
          <h3 className="text-lg font-black uppercase tracking-tight text-white">
            Side-by-Side Comparison
          </h3>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
            Leader scores highlighted per category
          </p>
        </div>
      </div>

      {/* Overlay multi-school radar */}
      {schoolsWithReviews.length >= 2 ? (
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <span className="h-px flex-1 bg-zinc-800" />
            Program Profile Overlay
            <span className="h-px flex-1 bg-zinc-800" />
          </p>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" radialLines={false} />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fill: '#71717a', fontSize: 10, fontWeight: 600 }}
                />
                <PolarRadiusAxis
                  tick={false}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 5]}
                />
                <Tooltip
                  contentStyle={{
                    background: '#09090b',
                    border: '1px solid #27272a',
                    borderRadius: '0.75rem',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#71717a' }}
                />
                {normalized.map((school, idx) =>
                  school.hasReviews ? (
                    <Radar
                      key={school.schoolId}
                      name={school.name.length > 22 ? `${school.name.slice(0, 22)}…` : school.name}
                      dataKey={school.name}
                      stroke={SCHOOL_COLORS[idx] ?? '#eab308'}
                      fill={`${SCHOOL_COLORS[idx] ?? '#eab308'}18`}
                      strokeWidth={2}
                      dot={{ r: 3, fill: SCHOOL_COLORS[idx] ?? '#eab308', strokeWidth: 0 }}
                    />
                  ) : null
                )}
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : schoolsWithReviews.length === 1 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 px-6 py-4 text-center">
          <p className="text-xs text-zinc-600">
            Overlay chart requires at least 2 programs with reviews. Add another reviewed program to see the comparison radar.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-800 px-6 py-4 text-center">
          <p className="text-xs text-zinc-600">
            None of the selected programs have reviews yet. Be the first athlete to rate these programs.
          </p>
        </div>
      )}

      {/* Metric-by-metric bar table */}
      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
          <span className="h-px flex-1 bg-zinc-800" />
          Category Breakdown
          <span className="h-px flex-1 bg-zinc-800" />
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-0.5">
            <thead>
              <tr>
                <th className="pb-3 pl-4 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-600 w-40">
                  Metric
                </th>
                {normalized.map((school, idx) => (
                  <th key={school.schoolId} className="pb-3 px-4 text-left">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: SCHOOL_COLORS[idx] ?? '#eab308' }}
                      />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white truncate max-w-[160px]">
                        {school.name}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {METRICS.map(({ label, icon, key }) => (
                <MetricRow
                  key={key}
                  label={label}
                  icon={icon}
                  schools={normalized}
                  columnMaxes={columnMaxes}
                />
              ))}

              {/* Composite row */}
              <tr className="border-t border-zinc-800">
                <td className="py-4 pl-4 pr-6">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-300">Composite</span>
                  </div>
                </td>
                {normalized.map((school, idx) => {
                  const comp = composite(school)
                  const isLeader = Math.abs(comp - compositeMax) < EPSILON && school.hasReviews
                  const color = SCHOOL_COLORS[idx] ?? '#eab308'
                  return (
                    <td key={school.schoolId} className="px-4 py-4">
                      {school.hasReviews ? (
                        <span
                          className="text-2xl font-black tabular-nums"
                          style={{ color: isLeader ? color : '#d4d4d8' }}
                        >
                          {comp.toFixed(2)}
                          {isLeader && <span className="ml-1 text-sm">👑</span>}
                        </span>
                      ) : (
                        <span className="text-sm italic text-zinc-700">—</span>
                      )}
                    </td>
                  )
                })}
              </tr>

              {/* Sanction / accreditation row */}
              <tr className="border-t border-zinc-800/50">
                <td className="py-3 pl-4 pr-6">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-3.5 w-3.5 text-zinc-500" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Governing Body</span>
                  </div>
                </td>
                {normalized.map((school) => (
                  <td key={school.schoolId} className="px-4 py-3">
                    <span className="inline-flex rounded-md bg-zinc-800 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                      {school.sanction || school.division || '—'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Review count row */}
              <tr className="border-t border-zinc-800/50">
                <td className="py-3 pl-4 pr-6">
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-zinc-500" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Athlete Reviews</span>
                  </div>
                </td>
                {normalized.map((school) => (
                  <td key={school.schoolId} className="px-4 py-3">
                    <span className="text-sm font-black text-white">
                      {school.reviewCount.toLocaleString()}
                    </span>
                    {!school.hasReviews && (
                      <span className="ml-2 text-[10px] text-zinc-700 italic">Be first</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}

export default ComparisonTable
