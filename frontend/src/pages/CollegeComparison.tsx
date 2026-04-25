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

export const CollegeComparison: React.FC = () => {
  const [division, setDivision] = useState('')
  const [state, setState] = useState('')
  const [gender, setGender] = useState('')
  const [page, setPage] = useState(1)
  const [selectedSchools, setSelectedSchools] = useState<ProgramAggregateSchool[]>([])
  const [loadingTimeout, setLoadingTimeout] = React.useState(false)

  const { data: filterData } = useComparisonFilters()

  const filters = useMemo(
    () => ({
      division: division || undefined,
      state: state || undefined,
      gender: gender || undefined,
    }),
    [division, state, gender]
  )

  const { data, isLoading, isError, error, isFetching } = useProgramAggregates({
    filters,
    page,
    pageSize: PAGE_SIZE,
  })

  const schools = data?.data ?? []
  const totalItems = data?.total ?? 0

  // True when no filters are active
  const noFiltersActive = !division && !state && !gender

  React.useEffect(() => {
    if (!isLoading) return
    const timer = setTimeout(() => setLoadingTimeout(true), 8000)
    return () => clearTimeout(timer)
  }, [isLoading])

  const toggleSelection = (school: ProgramAggregateSchool) => {
    setSelectedSchools((prev) => {
      const exists = prev.some((item) => item.schoolId === school.schoolId)
      if (exists) {
        return prev.filter((item) => item.schoolId !== school.schoolId)
      }
      return [...prev, school]
    })
  }

  const isSelected = (schoolId: string) =>
    selectedSchools.some((item) => item.schoolId === schoolId)

  const handleFilterChange = (
    setter: React.Dispatch<React.SetStateAction<string>>
  ) =>
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setter(event.target.value)
      setPage(1)
    }

  return (
    <div className="relative min-h-screen w-full bg-black text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-black via-black to-purple-900/30" />
      <div className="pointer-events-none absolute inset-0 -z-20">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(234, 179, 8, 0.15), transparent 45%), radial-gradient(circle at 80% 0%, rgba(168, 85, 247, 0.2), transparent 40%)',
          }}
        />
      </div>

      <NavBarDemo />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pb-24 pt-32">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl font-black uppercase tracking-tight text-white md:text-6xl">
            College <span className="text-yellow-500">Comparison</span>
          </h1>
          <p className="mt-4 text-lg text-gray-300">
            Select programs to compare culture, support, facilities, and more across the nation.
          </p>
        </motion.section>

        <section className="rounded-2xl border border-yellow-500/25 bg-black/70 p-6 backdrop-blur">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">
                Division
              </label>
              <select
                value={division}
                onChange={handleFilterChange(setDivision)}
                className="rounded-lg border-2 border-yellow-500/30 bg-black/40 px-4 py-3 text-sm font-semibold uppercase tracking-wider text-white focus:border-yellow-500 focus:outline-none focus:ring-4 focus:ring-yellow-500/20"
              >
                <option value="">All Divisions</option>
                {filterData?.divisions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">
                State
              </label>
              <select
                value={state}
                onChange={handleFilterChange(setState)}
                className="rounded-lg border-2 border-yellow-500/30 bg-black/40 px-4 py-3 text-sm font-semibold uppercase tracking-wider text-white focus:border-yellow-500 focus:outline-none focus:ring-4 focus:ring-yellow-500/20"
              >
                <option value="">All States</option>
                {filterData?.states.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">
                Gender
              </label>
              <select
                value={gender}
                onChange={handleFilterChange(setGender)}
                className="rounded-lg border-2 border-yellow-500/30 bg-black/40 px-4 py-3 text-sm font-semibold uppercase tracking-wider text-white focus:border-yellow-500 focus:outline-none focus:ring-4 focus:ring-yellow-500/20"
              >
                <option value="">All Genders</option>
                {filterData?.genders.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">
                Selected
              </div>
              <div className="mt-2 rounded-lg border border-yellow-500/30 bg-black/40 px-4 py-3 text-sm font-semibold text-yellow-300">
                {selectedSchools.length} program{selectedSchools.length === 1 ? '' : 's'}
                {totalItems > 0 && (
                  <span className="ml-2 text-gray-400 font-normal">
                    / {totalItems} matching
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {isLoading && !schools.length && !loadingTimeout ? (
            <div className="col-span-full flex justify-center py-16">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-yellow-500/30 border-b-yellow-500" />
            </div>
          ) : isError || (isLoading && loadingTimeout) ? (
            <div className="col-span-full rounded-2xl border border-yellow-500/20 bg-zinc-900/80 p-12 text-center">
              <p className="text-2xl font-black uppercase tracking-tight text-white">No Reviews Yet</p>
              <p className="mt-3 text-sm text-zinc-400 max-w-sm mx-auto">
                Program rankings appear here once athletes start submitting reviews. Be the first to review your program.
              </p>
            </div>
          ) : !isLoading && schools.length === 0 && totalItems === 0 && noFiltersActive ? (
            // "No Data Yet" state — database has no reviews yet
            <div className="col-span-full rounded-2xl border border-yellow-500/20 bg-zinc-900/80 p-12 text-center">
              <div className="text-5xl mb-4">🏆</div>
              <p className="text-2xl font-black uppercase tracking-tight text-white">
                Rankings Coming Soon
              </p>
              <p className="mt-3 text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                College program rankings appear here once athletes start submitting reviews.
                Be the first to review your program and help others make informed decisions.
              </p>
            </div>
          ) : schools.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-yellow-500/30 bg-black/70 p-8 text-center text-gray-300">
              No programs match your filters yet. Try adjusting your search.
            </div>
          ) : (
            schools.map((school, index) => (
              <motion.div
                key={school.schoolId}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
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
          <div className="flex justify-center text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">
            Updating results…
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

      {/* Sticky compare CTA — visible when 2+ schools are selected */}
      {selectedSchools.length >= 2 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={() =>
              document.getElementById('comparison-table')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="bg-yellow-500 text-black font-black uppercase tracking-widest px-8 py-3 rounded-full shadow-2xl hover:bg-yellow-400 transition-colors text-sm"
          >
            Compare {selectedSchools.length} Programs ↓
          </button>
        </div>
      )}
    </div>
  )
}

export default CollegeComparison
