import React from 'react'

import { useAllSports, useAllStates } from '../hooks/useSupabaseData'
import { Button } from './ui/button'

interface SportsFiltersProps {
  filters: {
    sport: string
    gender: string
    state_cd: string
  }
  onFilterChange: (filters: { sport: string; gender: string; state_cd: string }) => void
}

export const SportsFilters: React.FC<SportsFiltersProps> = ({ filters, onFilterChange }) => {
  const { data: sports, loading: sportsLoading } = useAllSports()
  const { data: states, loading: statesLoading } = useAllStates()

  const handleChange = (field: keyof typeof filters, value: string) => {
    onFilterChange({
      ...filters,
      [field]: value
    })
  }

  return (
    <div
      id="filters"
      className="rounded-xl border border-yellow-500/25 bg-black/70 p-6 shadow-[0_20px_60px_-25px_rgba(234,179,8,0.4)]"
    >
      <div className="mb-6 flex flex-col gap-2">
        <h3 className="text-2xl font-black uppercase tracking-wide text-white">
          Filter Sports Directory
        </h3>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-400">
          Customise your scouting board
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="sport"
            className="text-xs font-semibold uppercase tracking-wide text-gray-300"
          >
            Sport
          </label>
          <select
            id="sport"
            value={filters.sport}
            onChange={(e) => handleChange('sport', e.target.value)}
            className="w-full rounded-lg border-2 border-yellow-500/30 bg-black/40 px-4 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-inner focus:border-yellow-500 focus:outline-none focus:ring-4 focus:ring-yellow-500/20"
            disabled={sportsLoading}
          >
            <option value="">All Sports</option>
            {sports.map((sport) => (
              <option key={sport} value={sport}>
                {sport}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="gender"
            className="text-xs font-semibold uppercase tracking-wide text-gray-300"
          >
            Gender
          </label>
          <select
            id="gender"
            value={filters.gender}
            onChange={(e) => handleChange('gender', e.target.value)}
            className="w-full rounded-lg border-2 border-yellow-500/30 bg-black/40 px-4 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-inner focus:border-yellow-500 focus:outline-none focus:ring-4 focus:ring-yellow-500/20"
          >
            <option value="">All Genders</option>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Coed">Coed</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="state"
            className="text-xs font-semibold uppercase tracking-wide text-gray-300"
          >
            State
          </label>
          <select
            id="state"
            value={filters.state_cd}
            onChange={(e) => handleChange('state_cd', e.target.value)}
            className="w-full rounded-lg border-2 border-yellow-500/30 bg-black/40 px-4 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-inner focus:border-yellow-500 focus:outline-none focus:ring-4 focus:ring-yellow-500/20"
            disabled={statesLoading}
          >
            <option value="">All States</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          variant="outline"
          className="border-2 border-yellow-500 bg-yellow-500/10 px-6 py-2 text-xs font-black uppercase tracking-[0.3em] text-yellow-400 hover:bg-yellow-500/20"
          onClick={() => onFilterChange({ sport: '', gender: '', state_cd: '' })}
        >
          Clear Filters
        </Button>
      </div>
    </div>
  )
}
