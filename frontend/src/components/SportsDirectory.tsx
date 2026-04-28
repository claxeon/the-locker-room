import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'


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
      <div className="relative mx-auto max-w-lg px-6 pt-32 text-center">
        <div className="flex flex-col items-center gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-red-400">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight text-white">
              Unable to Load Programs
            </h2>
            <p className="mt-2 text-sm text-zinc-500 leading-relaxed max-w-sm mx-auto">
              We couldn't connect to our database right now. This is usually temporary —
              try refreshing the page or check back in a moment.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="rounded-full border border-zinc-800 bg-zinc-900 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:border-yellow-500/40 hover:text-yellow-400 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  )

  if (error) {
    return renderError()
  }

  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-zinc-950" />
      <div className="absolute inset-0 opacity-30">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(234,179,8,0.15), transparent 45%), radial-gradient(circle at 80% 0%, rgba(234,179,8,0.05), transparent 40%)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-10 px-4 pb-16 pt-24">
        <motion.header
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-yellow-500">Programs</p>
          <h1
            className="text-white leading-tight"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
          >
            Explore the{' '}
            <span style={{ fontStyle: 'italic' }}>Locker Room</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-500">
            Find verified athletic programs across the nation. Filter by sport,
            gender, and location to uncover the perfect fit for your next chapter.
          </p>
        </motion.header>

        <motion.section
          className="grid gap-6 md:grid-cols-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-left">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Total Programs</span>
            <p className="mt-2 leading-none text-yellow-500" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic', fontSize: 'clamp(2rem, 4vw, 2.75rem)' }}>
              {loading ? '—' : totalCount.toLocaleString()}
            </p>
            <p className="mt-2 text-xs text-zinc-600">Verified teams with transparent NIL and culture insights.</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-left">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Sports Covered</span>
            <p className="mt-2 leading-none text-yellow-500" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic', fontSize: 'clamp(2rem, 4vw, 2.75rem)' }}>50+</p>
            <p className="mt-2 text-xs text-zinc-600">From basketball and football to emerging coed programs.</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-left">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Athletes in Network</span>
            <p className="mt-2 leading-none text-yellow-500" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic', fontSize: 'clamp(2rem, 4vw, 2.75rem)' }}>10K+</p>
            <p className="mt-2 text-xs text-zinc-600">Student athletes sharing real-time reviews and data.</p>
          </div>
        </motion.section>

        <SportsFilters filters={filters} onFilterChange={setFilters} />

        <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-6 py-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Sports Directory
            </h2>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
              {loading ? 'Loading…' : `${totalCount.toLocaleString()} programs`}
            </div>
          </header>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-yellow-500/30 border-b-yellow-500" />
            </div>
          ) : schools.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
                No programs found
              </p>
              <p className="mt-2 text-xs text-zinc-700">
                Adjust your filters to discover more opportunities.
              </p>
            </div>
          ) : (
            <>
              <div className="px-4 pb-6 pt-4">
                <div className="flex flex-col gap-2">
                  {schools.map((school) => (
                    <SchoolCard
                      key={`${school.school_id}`}
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
