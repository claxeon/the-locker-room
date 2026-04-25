import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Target, Users } from 'lucide-react'

import { useSportsDirectory } from '../hooks/useSupabaseData'
import { Pagination } from './Pagination'
import { SchoolCard } from './SchoolCard'
import { SportsFilters } from './SportsFilters'

interface SportsDirectoryProps {
  onSchoolClick?: (slug: string) => void
}

export const SportsDirectory: React.FC<SportsDirectoryProps> = ({ onSchoolClick }) => {
  const [filters, setFilters] = useState({
    sport: '',
    gender: '',
    state_cd: '',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  const { data: schools, loading, error, totalCount } = useSportsDirectory(filters, currentPage, pageSize)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  const totalPages = Math.ceil(totalCount / pageSize)

  const renderError = () => (
    <div className="relative min-h-screen bg-black py-16 text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-black to-purple-900/20" />
      <div className="relative mx-auto max-w-4xl px-6">
        <div className="border-4 border-red-500/40 bg-red-500/10 p-8 text-center">
          <h2 className="text-3xl font-black uppercase text-red-300">
            Error Loading Sports Directory
          </h2>
          <p className="mt-4 text-red-200">{error}</p>
          <p className="mt-2 text-sm font-medium uppercase tracking-wider text-red-200/70">
            Check browser console for debugging details
          </p>
        </div>
      </div>
    </div>
  )

  if (error) {
    return renderError()
  }

  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-purple-900/40" />
      <div className="absolute inset-0 opacity-30">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(234,179,8,0.15), transparent 45%), radial-gradient(circle at 80% 0%, rgba(168,85,247,0.2), transparent 40%)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-10 px-4 pb-16 pt-24">
        <motion.header
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
        >
          <h1 className="mt-6 text-5xl font-black uppercase tracking-tight text-white md:text-6xl">
            Explore The Locker Room
          </h1>
          <p className="mt-4 text-lg text-gray-300">
            Find verified athletic programs across the nation. Filter by sport,
            gender, and location to uncover the perfect fit for your next
            chapter.
          </p>
        </motion.header>

        <motion.section
          className="grid gap-6 md:grid-cols-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="rounded-xl border border-yellow-500/20 bg-white/5 p-6 text-left">
            <span className="text-sm font-semibold uppercase tracking-wider text-yellow-500">
              Total Programs
            </span>
            <p className="mt-2 text-3xl font-black text-white">
              {loading ? '—' : totalCount.toLocaleString()}
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Verified teams with transparent NIL and culture insights.
            </p>
          </div>
          <div className="rounded-xl border border-yellow-500/20 bg-white/5 p-6 text-left">
            <span className="text-sm font-semibold uppercase tracking-wider text-yellow-500">
              Sports Covered
            </span>
            <p className="mt-2 flex items-center gap-3 text-3xl font-black text-white">
              <Target className="h-8 w-8 text-purple-300" />
              50+
            </p>
            <p className="mt-2 text-sm text-gray-400">
              From basketball and football to emerging coed programs.
            </p>
          </div>
          <div className="rounded-xl border border-yellow-500/20 bg-white/5 p-6 text-left">
            <span className="text-sm font-semibold uppercase tracking-wider text-yellow-500">
              Athletes In Network
            </span>
            <p className="mt-2 flex items-center gap-3 text-3xl font-black text-white">
              <Users className="h-8 w-8 text-teal-300" />
              10K+
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Student athletes sharing real-time reviews and data.
            </p>
          </div>
        </motion.section>

        <SportsFilters filters={filters} onFilterChange={setFilters} />

        <section className="overflow-hidden rounded-xl border border-yellow-500/25 bg-black/60 backdrop-blur">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-yellow-500/30 px-6 py-5">
            <h2 className="text-3xl font-black uppercase tracking-tight text-white">
              Sports Directory
            </h2>
            <div className="text-sm font-semibold uppercase tracking-wider text-gray-300">
              {loading ? 'Loading programs…' : `${totalCount} total programs`}
            </div>
          </header>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-yellow-500/30 border-b-yellow-500" />
            </div>
          ) : schools.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-2xl font-black uppercase text-white">
                No Programs Found
              </p>
              <p className="mt-3 text-sm uppercase tracking-wider text-gray-400">
                Adjust your filters to discover more opportunities.
              </p>
            </div>
          ) : (
            <>
              <div className="px-6 pb-10 pt-8">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {schools.map((school) => (
                    <SchoolCard
                      key={`${school.school_id}-${school.sport}-${school.gender}`}
                      school={school}
                      onClick={() => onSchoolClick?.(school.slug)}
                    />
                  ))}
                </div>
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={totalCount}
                itemsPerPage={pageSize}
              />
            </>
          )}
        </section>
      </div>
    </div>
  )
}
