import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

import { useSportsDirectory } from '../hooks/useSupabaseData'
import { Pagination } from './Pagination'
import { SchoolCard } from './SchoolCard'
import { SportsFilters } from './SportsFilters'

interface SportsDirectoryProps {
  onSchoolClick?: (slug: string) => void
}

const serifStyle: React.CSSProperties = {
  fontFamily: "'Instrument Serif', Georgia, serif",
  fontStyle: 'italic',
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

  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  const totalPages = Math.ceil(totalCount / pageSize)

  if (error) {
    return (
      <div className="relative min-h-screen py-16" style={{ backgroundColor: '#0A0E1A', color: '#f0f0f8' }}>
        <div className="relative mx-auto max-w-lg px-6 pt-32 text-center">
          <div className="flex flex-col items-center gap-5">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{ border: '1px solid rgba(248,113,113,0.30)', backgroundColor: 'rgba(248,113,113,0.08)' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: '#f87171' }}>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight" style={{ color: '#f0f0f8' }}>
                Unable to Load Programs
              </h2>
              <p className="mt-2 text-sm leading-relaxed max-w-sm mx-auto" style={{ color: '#555570' }}>
                We couldn't connect to our database right now. This is usually temporary —
                try refreshing the page or check back in a moment.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="rounded-full px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-colors"
              style={{ border: '1px solid #2a2a3c', backgroundColor: '#14151F', color: '#f0f0f8' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(20,184,166,0.40)'
                ;(e.currentTarget as HTMLButtonElement).style.color = '#14B8A6'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#2a2a3c'
                ;(e.currentTarget as HTMLButtonElement).style.color = '#f0f0f8'
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative min-h-screen"
      style={{ backgroundColor: '#0A0E1A', color: '#f0f0f8' }}
    >
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 20% 20%, rgba(20,184,166,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 0%, rgba(20,184,166,0.04) 0%, transparent 40%)',
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-10 px-4 pb-16 pt-24">
        {/* Page header */}
        <motion.header
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: '#14B8A6' }}>
            Programs
          </p>
          <h1
            className="leading-tight"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(2.5rem, 6vw, 4.5rem)", color: '#F5EFE0' }}
          >
            Explore the{' '}
            <span style={{ fontStyle: 'italic' }}>Locker Room</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed" style={{ color: '#555570' }}>
            Find verified athletic programs across the nation. Filter by sport,
            gender, and location to uncover the perfect fit for your next chapter.
          </p>
        </motion.header>

        {/* Stats bar */}
        <motion.section
          className="grid gap-4 md:grid-cols-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {[
            {
              label: 'Total Programs',
              value: loading ? '—' : totalCount.toLocaleString(),
              sub: 'Verified teams with transparent culture insights.',
            },
            {
              label: 'Sports Covered',
              value: '50+',
              sub: 'From basketball and football to emerging coed programs.',
            },
            {
              label: 'Schools Indexed',
              value: '1,086',
              sub: 'Colleges and universities across all 50 states.',
            },
          ].map(({ label, value, sub }) => (
            <div
              key={label}
              className="rounded-xl p-6 text-left"
              style={{ border: '1px solid #2a2a3c', backgroundColor: '#14151F' }}
            >
              <span className="text-2xs font-semibold uppercase tracking-widest" style={{ color: '#555570' }}>
                {label}
              </span>
              <p
                className="mt-2 leading-none"
                style={{ ...serifStyle, fontSize: 'clamp(2rem, 4vw, 2.75rem)', color: '#14B8A6' }}
              >
                {value}
              </p>
              <p className="mt-2 text-xs" style={{ color: '#2a2a3c' }}>{sub}</p>
            </div>
          ))}
        </motion.section>

        {/* Filters */}
        <SportsFilters filters={filters} onFilterChange={setFilters} />

        {/* Directory table */}
        <section
          className="overflow-hidden rounded-2xl"
          style={{ border: '1px solid #2a2a3c', backgroundColor: 'rgba(26,26,46,0.40)' }}
        >
          <header
            className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
            style={{ borderBottom: '1px solid #2a2a3c' }}
          >
            <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#8888a8' }}>
              Sports Directory
            </h2>
            <div className="text-2xs font-semibold uppercase tracking-widest" style={{ color: '#555570' }}>
              {loading ? 'Loading…' : `${totalCount.toLocaleString()} programs`}
            </div>
          </header>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div
                className="h-12 w-12 animate-spin rounded-full border-4"
                style={{ borderColor: 'rgba(20,184,166,0.20)', borderTopColor: '#14B8A6' }}
              />
            </div>
          ) : schools.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#555570' }}>
                No programs found
              </p>
              <p className="mt-2 text-xs" style={{ color: '#2a2a3c' }}>
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
