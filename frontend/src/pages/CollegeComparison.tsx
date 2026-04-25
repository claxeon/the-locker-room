import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'

import NavBarDemo from '../components/layout/GlobalNav'
import ComparisonTable from '../components/ComparisonTable'
import { Pagination } from '../components/Pagination'
import { CollegeCard, CollegeCardData } from '../components/ui/comp-college-card'
import { useComparisonFilters } from '../hooks/useComparisonFilters'
import {
  ProgramAggregateSchool,
  useProgramAggregates,
} from '../hooks/useProgramAggregates'

const PAGE_SIZE = 20

const serifItalic: React.CSSProperties = {
  fontFamily: "'Instrument Serif', Georgia, serif",
  fontStyle: 'italic',
}

const buildCardData = (school: ProgramAggregateSchool): CollegeCardData => ({
  schoolId: school.schoolId,
  name: school.name,
  division: school.division,
  location: school.location,
  logoUrl: school.logoUrl,
  reviewCount: school.reviewCount,
  ratings: {
    facilities: school.facilities,
    coaching: school.coaching,
    balance: school.balance,
    support: school.support,
    culture: school.culture,
    equity: school.equity,
  },
})

const selectCls =
  'rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white focus:border-yellow-500/60 focus:outline-none focus:ring-1 focus:ring-yellow-500/20 transition-colors appearance-none'

export const CollegeComparison: React.FC = () => {
  const [division, setDivision] = useState('')
  const [state, setState] = useState('')
  const [gender, setGender] = useState('')
  const [nameSearch, setNameSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedSchools, setSelectedSchools] = useState<ProgramAggregateSchool[]>([])
  const [loadingTimeout, setLoadingTimeout] = React.useState(false)

  const { data: filterData } = useComparisonFilters()

  // Debounce name search to avoid a query per keystroke
  const [debouncedName, setDebouncedName] = React.useState('')
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedName(nameSearch), 350)
    return () => clearTimeout(t)
  }, [nameSearch])

  const filters = useMemo(
    () => ({
      division: division || undefined,
      state: state || undefined,
      gender: gender || undefined,
      name: debouncedName || undefined,
    }),
    [division, state, gender, debouncedName]
  )

  const noFiltersActive = !division && !state && !gender && !debouncedName

  const { data, isLoading, isError, isFetching } = useProgramAggregates({
    filters,
    page,
    pageSize: PAGE_SIZE,
    enabled: !noFiltersActive,
  })

  const schools = data?.data ?? []
  const totalItems = data?.total ?? 0

  React.useEffect(() => {
    if (!isLoading) return
    const timer = setTimeout(() => setLoadingTimeout(true), 8000)
    return () => clearTimeout(timer)
  }, [isLoading])

  const toggleSelection = (school: ProgramAggregateSchool) => {
    setSelectedSchools((prev) => {
      const exists = prev.some((item) => item.schoolId === school.schoolId)
      if (exists) return prev.filter((item) => item.schoolId !== school.schoolId)
      return [...prev, school]
    })
  }

  const isSelected = (schoolId: string) =>
    selectedSchools.some((item) => item.schoolId === schoolId)

  const handleFilterChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setter(event.target.value)
      setPage(1)
    }

  const handleNameSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNameSearch(event.target.value)
    setPage(1)
  }

  return (
    <div className="relative min-h-screen w-full bg-black text-white">
      {/* Single subtle yellow top-glow — no purple */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 70% 40% at 50% -5%, rgba(234,179,8,0.08) 0%, transparent 70%)',
        }}
      />

      <NavBarDemo />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pb-24 pt-32">
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
            <span className="not-italic" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
              Comparison
            </span>
          </h1>
          <p className="max-w-lg text-sm text-zinc-400">
            Select programs to compare culture, support, facilities, and more across the nation.
          </p>
        </motion.section>

        {/* Filter bar */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
            Find &amp; Filter Programs
          </p>
          {/* Name search — full width on top */}
          <div className="mb-4 flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Search by School Name
            </label>
            <input
              type="text"
              value={nameSearch}
              onChange={handleNameSearch}
              placeholder="e.g. Alabama, Duke, Ohio State…"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-yellow-500/60 focus:outline-none focus:ring-1 focus:ring-yellow-500/20 transition-colors"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                Division
              </label>
              <select value={division} onChange={handleFilterChange(setDivision)} className={selectCls}>
                <option value="">All Divisions</option>
                {filterData?.divisions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                State
              </label>
              <select value={state} onChange={handleFilterChange(setState)} className={selectCls}>
                <option value="">All States</option>
                {filterData?.states.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                Gender
              </label>
              <select value={gender} onChange={handleFilterChange(setGender)} className={selectCls}>
                <option value="">All Genders</option>
                {filterData?.genders.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col justify-end gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                Selected
              </label>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white">
                <span style={serifItalic} className="text-yellow-500">
                  {selectedSchools.length}
                </span>
                <span className="ml-1 text-zinc-400">
                  program{selectedSchools.length === 1 ? '' : 's'}
                </span>
                {totalItems > 0 && (
                  <span className="ml-2 text-zinc-600 text-xs">/ {totalItems} matching</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {noFiltersActive ? (
            /* Default empty state — prompt to search */
            <div className="col-span-full flex flex-col items-center gap-4 rounded-xl border border-dashed border-zinc-800 p-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-yellow-500" aria-hidden="true">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
              <div>
                <p
                  className="text-white"
                  style={{ ...serifItalic, fontSize: 'clamp(1.25rem, 3vw, 1.75rem)' }}
                >
                  Search for programs to compare
                </p>
                <p className="mt-2 text-sm text-zinc-500 max-w-sm mx-auto leading-relaxed">
                  Type a school name above or use the filters to find programs with athlete reviews.
                </p>
              </div>
            </div>
          ) : isLoading && !schools.length && !loadingTimeout ? (
            <div className="col-span-full flex justify-center py-16">
              <div className="h-12 w-12 animate-spin rounded-full border-2 border-zinc-800 border-t-yellow-500" />
            </div>
          ) : isError || (isLoading && loadingTimeout) ? (
            <div className="col-span-full rounded-xl border border-dashed border-zinc-700 p-12 text-center">
              <p className="text-sm font-semibold text-zinc-400">No reviews yet</p>
              <p className="mt-1 text-xs text-zinc-600 max-w-sm mx-auto">
                Program rankings appear here once athletes start submitting reviews.
              </p>
            </div>
          ) : schools.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-zinc-700 p-8 text-center">
              <p className="text-sm text-zinc-400">No programs match your filters.</p>
            </div>
          ) : (
            schools.map((school, index) => (
              <motion.div
                key={school.schoolId}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.04 }}
                className="h-full"
              >
                <CollegeCard
                  data={buildCardData(school)}
                  isSelected={isSelected(school.schoolId)}
                  onSelect={() => toggleSelection(school)}
                />
              </motion.div>
            ))
          )}
        </section>

        {isFetching && schools.length > 0 && (
          <div className="flex justify-center text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Updating…
          </div>
        )}

        <div className="mt-4">
          <Pagination
            currentPage={page}
            totalPages={Math.max(1, Math.ceil((totalItems || 0) / PAGE_SIZE))}
            onPageChange={setPage}
            totalItems={totalItems}
            itemsPerPage={PAGE_SIZE}
          />
        </div>

        {selectedSchools.length >= 2 && (
          <div id="comparison-table">
            <ComparisonTable schools={selectedSchools} />
          </div>
        )}
      </main>

      {/* Sticky compare CTA */}
      {selectedSchools.length >= 2 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={() =>
              document.getElementById('comparison-table')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="bg-yellow-500 text-black font-bold uppercase tracking-widest px-8 py-3 rounded-full shadow-2xl hover:bg-yellow-400 transition-colors text-sm"
          >
            Compare {selectedSchools.length} Programs ↓
          </button>
        </div>
      )}
    </div>
  )
}

export default CollegeComparison
