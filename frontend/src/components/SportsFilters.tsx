import React from 'react'

import { useAllSports, useAllStates } from '../hooks/useSupabaseData'

interface SportsFiltersProps {
  filters: { sport: string; gender: string; state_cd: string }
  onFilterChange: (filters: { sport: string; gender: string; state_cd: string }) => void
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: '0.5rem',
  border: '1px solid #2a2a3c',
  backgroundColor: 'rgba(20,21,31,0.80)',
  padding: '0.75rem 2.25rem 0.75rem 1rem',
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
      <div className="mb-5 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-black uppercase tracking-tight" style={{ color: '#f0f0f8' }}>
            Filter Programs
          </h3>
          <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: '#555570' }}>
            Narrow your search
          </p>
        </div>
        {hasActiveFilters && (
          <button
            className="text-xs font-bold uppercase tracking-widest transition-colors"
            style={{ color: '#14B8A6' }}
            onClick={() => onFilterChange({ sport: '', gender: '', state_cd: '' })}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#0d9488'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#14B8A6'}
          >
            Clear ×
          </button>
        )}
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
          <div className="relative">
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
            <span
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: '#14B8A6' }}
            >▾</span>
          </div>
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
          <div className="relative">
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
            <span
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: '#14B8A6' }}
            >▾</span>
          </div>
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
          <div className="relative">
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
            <span
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: '#14B8A6' }}
            >▾</span>
          </div>
        </div>
      </div>
    </div>
  )
}
