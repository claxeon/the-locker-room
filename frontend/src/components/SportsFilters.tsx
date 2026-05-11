import React from 'react'

import { useAllSports, useAllStates } from '../hooks/useSupabaseData'

interface SportsFiltersProps {
  filters: {
    sport: string
    gender: string
    state_cd: string
  }
  onFilterChange: (filters: { sport: string; gender: string; state_cd: string }) => void
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: '0.5rem',
  border: '1px solid #2a2a3c',
  backgroundColor: 'rgba(20,21,31,0.80)',
  padding: '0.75rem 1rem',
  fontSize: '0.75rem',
  fontWeight: 600,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#f0f0f8',
  outline: 'none',
  appearance: 'none' as const,
  WebkitAppearance: 'none' as const,
  cursor: 'pointer',
}

export const SportsFilters: React.FC<SportsFiltersProps> = ({ filters, onFilterChange }) => {
  const { data: sports, loading: sportsLoading } = useAllSports()
  const { data: states, loading: statesLoading } = useAllStates()

  const handleChange = (field: keyof typeof filters, value: string) => {
    onFilterChange({ ...filters, [field]: value })
  }

  const hasActiveFilters = filters.sport || filters.gender || filters.state_cd

  return (
    <div
      id="filters"
      className="rounded-xl p-6"
      style={{
        border: '1px solid rgba(20,184,166,0.18)',
        backgroundColor: 'rgba(20,21,31,0.60)',
        boxShadow: '0 16px 48px -12px rgba(20,184,166,0.10)',
      }}
    >
      <div className="mb-5 flex flex-col gap-1">
        <h3 className="text-sm font-black uppercase tracking-tight" style={{ color: '#f0f0f8' }}>
          Filter Programs
        </h3>
        <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: '#555570' }}>
          Narrow your search
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Sport */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="sport"
            className="text-2xs font-semibold uppercase tracking-label"
            style={{ color: '#8888a8' }}
          >
            Sport
          </label>
          <select
            id="sport"
            value={filters.sport}
            onChange={(e) => handleChange('sport', e.target.value)}
            style={selectStyle}
            disabled={sportsLoading}
          >
            <option value="">All Sports</option>
            {sports.map((sport) => (
              <option key={sport} value={sport}>{sport}</option>
            ))}
          </select>
        </div>

        {/* Gender */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="gender"
            className="text-2xs font-semibold uppercase tracking-label"
            style={{ color: '#8888a8' }}
          >
            Gender
          </label>
          <select
            id="gender"
            value={filters.gender}
            onChange={(e) => handleChange('gender', e.target.value)}
            style={selectStyle}
          >
            <option value="">All Genders</option>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Coed">Coed</option>
          </select>
        </div>

        {/* State */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="state"
            className="text-2xs font-semibold uppercase tracking-label"
            style={{ color: '#8888a8' }}
          >
            State
          </label>
          <select
            id="state"
            value={filters.state_cd}
            onChange={(e) => handleChange('state_cd', e.target.value)}
            style={selectStyle}
            disabled={statesLoading}
          >
            <option value="">All States</option>
            {states.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-5 flex justify-end">
          <button
            className="rounded-lg px-5 py-2 text-2xs font-black uppercase tracking-widest transition-colors"
            style={{
              border: '1px solid #2a2a3c',
              backgroundColor: 'transparent',
              color: '#8888a8',
            }}
            onClick={() => onFilterChange({ sport: '', gender: '', state_cd: '' })}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#14B8A6'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#14B8A6'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#2a2a3c'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#8888a8'
            }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}
