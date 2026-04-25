import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

import { ProgramAggregateSchool } from '../hooks/useProgramAggregates'

type ComparisonTableProps = {
  schools: ProgramAggregateSchool[]
}

const metrics = [
  { key: 'facilities', label: 'Facilities' },
  { key: 'coaching', label: 'Coaching' },
  { key: 'balance', label: 'Balance' },
  { key: 'support', label: 'Support' },
  { key: 'culture', label: 'Culture' },
  { key: 'equity', label: 'Equity' },
] as const

type MetricKey = typeof metrics[number]['key']

const EPSILON = 0.001

const toComposite = (school: ProgramAggregateSchool) =>
  Number(
    (
      (school.facilities +
        school.coaching +
        school.balance +
        school.support +
        school.culture +
        school.equity) /
      6
    ).toFixed(2)
  )

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ schools }) => {
  const columnMax = useMemo(() => {
    const baseMax = metrics.reduce<Record<MetricKey, number>>((acc, metric) => {
      acc[metric.key] = Math.max(...schools.map((school) => school[metric.key] ?? 0))
      return acc
    }, {} as Record<MetricKey, number>)

    return {
      ...baseMax,
      composite: Math.max(...schools.map((school) => toComposite(school))),
    }
  }, [schools])

  return (
    <div className="rounded-2xl border border-yellow-500/30 bg-black/70 p-6 backdrop-blur">
      <header className="mb-6">
        <h3 className="text-2xl font-black uppercase tracking-tight text-white">
          Side-by-Side Comparison
        </h3>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-400">
          Highlighted scores indicate the leader in each category
        </p>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left text-sm font-semibold uppercase tracking-[0.25em] text-gray-400">
              <th className="w-1/6 rounded-l-xl bg-yellow-500/5 px-4 py-3 text-white">
                School
              </th>
              {metrics.map((metric) => (
                <th key={metric.key} className="bg-yellow-500/5 px-4 py-3">
                  {metric.label}
                </th>
              ))}
              <th className="rounded-r-xl bg-yellow-500/5 px-4 py-3">
                Composite
              </th>
            </tr>
          </thead>
          <tbody>
            {schools.map((school) => {
              const composite = toComposite(school)
              return (
                <tr key={school.schoolId} className="text-sm text-gray-200">
                  <td className="rounded-l-xl border border-yellow-500/20 bg-black/60 px-4 py-4 font-semibold text-white">
                    <div className="flex flex-col">
                      <span className="text-base font-black uppercase tracking-wide text-yellow-300">
                        {school.name}
                      </span>
                      <span className="text-xs uppercase tracking-[0.3em] text-gray-400">
                        {school.division}
                      </span>
                    </div>
                  </td>
                  {metrics.map((metric) => {
                    const value = school[metric.key]
                    const isLeader = Math.abs(value - columnMax[metric.key]) < EPSILON
                    return (
                      <motion.td
                        key={metric.key}
                        className={`border border-yellow-500/20 px-4 py-4 text-center font-semibold transition-colors ${
                          isLeader
                            ? 'bg-yellow-500/20 text-yellow-200'
                            : 'bg-black/60 text-gray-200'
                        }`}
                        layout
                      >
                        {value.toFixed(2)}
                      </motion.td>
                    )
                  })}
                  <motion.td
                    className={`rounded-r-xl border border-yellow-500/20 px-4 py-4 text-center font-semibold transition-colors ${
                      Math.abs(composite - columnMax.composite) < EPSILON
                        ? 'bg-yellow-500/20 text-yellow-200'
                        : 'bg-black/60 text-gray-200'
                    }`}
                    layout
                  >
                    {composite.toFixed(2)}
                  </motion.td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ComparisonTable
