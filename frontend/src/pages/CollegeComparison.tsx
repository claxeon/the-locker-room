/**
 * College Comparison page
 *
 * Redesigned to:
 *   1. Search the FULL directory (1,086 schools) via useSchoolSearch — not just reviewed ones
 *   2. Show "no reviews yet" state on cards for schools without data
 *   3. Pull accreditation / sanction body into card metadata
 *   4. Overlay multi-school radar in the ComparisonTable
 *   5. Per-metric bar chart rows with animated fills
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import NavBarDemo from '../components/layout/GlobalNav'
import ComparisonTable from '../components/ComparisonTable'
import { CollegeCard, CollegeCardData } from '../components/ui/comp-college-card'
import { useSchoolSearch, SchoolSearchResult } from '../hooks/useSchoolSearch'
import { Search, X, Info } from 'lucide-react'

const serifItalic: React.CSSProperties = {
  fontFamily: "'Instrument Serif', Georgia, serif",
  fontStyle: 'italic',
}

const MAX_SELECTIONS = 4

function toCardData(s: SchoolSearchResult): CollegeCardData {
  return {
    schoolId: String(s.schoolId),
    name: s.name,
    division: s.division,
    sanction: s.sanction,
    location: s.location,
    logoUrl: s.logoUrl,
    reviewCount: s.reviewCount,
    hasReviews: s.hasReviews,
    ratings: {
      facilities: s.facilities,
      coaching:   s.coaching,
      balance:    s.balance,
      support:    s.support,
      culture:    s.culture,
      equity:     s.equity,
    },
  }
}

export const CollegeComparison: React.FC = () => {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [selectedSchools, setSelectedSchools] = useState<SchoolSearchResult[]>([])

  // Debounce — 350ms
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedQuery(val), 350)
  }

  const { data: results = [], isLoading: searching } = useSchoolSearch(debouncedQuery)

  const toggleSelection = (school: SchoolSearchResult) => {
    setSelectedSchools((prev) => {
      const exists = prev.some((s) => s.schoolId === school.schoolId)
      if (exists) return prev.filter((s) => s.schoolId !== school.schoolId)
      if (prev.length >= MAX_SELECTIONS) return prev // cap at 4
      return [...prev, school]
    })
  }

  const isSelected = (id: number) => selectedSchools.some((s) => s.schoolId === id)

  const clearAll = () => setSelectedSchools([])

  const showResults = debouncedQuery.trim().length >= 2
  const showCompare = selectedSchools.length >= 2

  return (
    <div className="relative min-h-screen w-full bg-black text-white">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 70% 40% at 50% -5%, rgba(234,179,8,0.07) 0%, transparent 70%)',
        }}
      />

      <NavBarDemo />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pb-32 pt-32">

        {/* Editorial header */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-3"
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest text-yellow-500">
            Programs
          </p>
          <h1
            className="leading-[1.05] text-white"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', ...serifItalic }}
          >
            College{' '}
            <span className="not-italic font-black uppercase tracking-tight">Comparison</span>
          </h1>
          <p className="max-w-lg text-sm text-zinc-400 leading-relaxed">
            Search any of our 1,086 indexed programs. Select up to 4 to compare culture,
            coaching, facilities, gender equity, and more — side by side.
          </p>
        </motion.section>

        {/* Search bar */}
        <section className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={handleQueryChange}
              placeholder="Search any school — e.g. Duke, Ohio State, Alabama…"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 py-4 pl-11 pr-4 text-sm text-white placeholder-zinc-600 focus:border-yellow-500/60 focus:outline-none focus:ring-1 focus:ring-yellow-500/20 transition-colors"
              autoComplete="off"
            />
            {query && (
              <button
                onClick={() => { setQuery(''); setDebouncedQuery('') }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Selection pills */}
          {selectedSchools.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Comparing:
              </span>
              {selectedSchools.map((school, idx) => {
                const colors = ['#eab308', '#22d3ee', '#fb7185', '#a78bfa']
                return (
                  <span
                    key={school.schoolId}
                    className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-semibold text-white"
                  >
                    <span
                      className="h-2 w-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: colors[idx] }}
                    />
                    {school.name}
                    <button
                      onClick={() => toggleSelection(school)}
                      className="ml-1 text-zinc-600 hover:text-white transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )
              })}
              <button
                onClick={clearAll}
                className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 hover:text-zinc-400 transition-colors ml-1"
              >
                Clear all
              </button>
              {selectedSchools.length >= MAX_SELECTIONS && (
                <span className="text-[10px] font-semibold uppercase tracking-widest text-yellow-500/70">
                  Max 4 programs
                </span>
              )}
            </div>
          )}
        </section>

        {/* Search results grid */}
        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-5 rounded-xl border border-dashed border-zinc-800 py-20 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">
                <Search className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-white" style={{ ...serifItalic, fontSize: 'clamp(1.25rem, 3vw, 1.75rem)' }}>
                  Search any program to compare
                </p>
                <p className="mt-2 text-sm text-zinc-500 max-w-sm mx-auto leading-relaxed">
                  Type at least 2 characters to search all 1,086 schools in our database.
                  Select up to 4 programs to compare them side by side.
                </p>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Try searching</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['Alabama', 'Duke', 'Ohio State', 'USC', 'Notre Dame'].map((name) => (
                    <button
                      key={name}
                      onClick={() => { setQuery(name); setDebouncedQuery(name) }}
                      className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-400 hover:border-yellow-500/50 hover:text-white transition-colors"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : searching ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-16"
            >
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-800 border-t-yellow-500" />
            </motion.div>
          ) : results.length === 0 ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border border-dashed border-zinc-800 py-12 text-center"
            >
              <p className="text-sm text-zinc-500">No schools found for &ldquo;{debouncedQuery}&rdquo;</p>
              <p className="mt-1 text-xs text-zinc-700">Try a shorter name or check spelling.</p>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4"
            >
              {/* Info banner when results have no reviews */}
              {results.every((r) => !r.hasReviews) && (
                <div className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                  <Info className="h-4 w-4 text-yellow-500/70 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    These programs haven't been reviewed yet. You can still add them to your comparison — 
                    their cards will show a placeholder and you can be the first to rate them.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {results.map((school, index) => (
                  <motion.div
                    key={school.schoolId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.04 }}
                    className={`h-full transition-opacity ${isSelected(school.schoolId) || selectedSchools.length < MAX_SELECTIONS ? '' : 'opacity-50 pointer-events-none'}`}
                  >
                    <CollegeCard
                      data={toCardData(school)}
                      isSelected={isSelected(school.schoolId)}
                      onSelect={() => toggleSelection(school)}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Comparison table — shown when ≥ 2 selected */}
        <AnimatePresence>
          {showCompare && (
            <motion.div
              key="table"
              id="comparison-table"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.5 }}
            >
              <ComparisonTable schools={selectedSchools} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Sticky compare CTA */}
      <AnimatePresence>
        {showCompare && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
          >
            <button
              onClick={() =>
                document
                  .getElementById('comparison-table')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
              className="rounded-full bg-yellow-500 px-8 py-3 text-sm font-black uppercase tracking-widest text-black shadow-2xl shadow-yellow-500/30 hover:bg-yellow-400 transition-colors"
            >
              Compare {selectedSchools.length} Programs ↓
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CollegeComparison
