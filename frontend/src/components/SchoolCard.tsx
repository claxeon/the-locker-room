import React from 'react'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

import { SportsDirectoryEntry, SchoolProfile } from '../lib/supabase'

type SchoolCardData = SportsDirectoryEntry | SchoolProfile

interface SchoolCardProps {
  school: SchoolCardData
  onClick?: () => void
}

const cardVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
}

export const SchoolCard: React.FC<SchoolCardProps> = ({ school, onClick }) => {
  const handleLogoError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget
    img.style.display = 'none'
    const fallback = img.nextElementSibling as HTMLElement | null
    if (fallback) fallback.style.display = 'flex'
  }

  const sportLabel = 'sport' in school && school.sport
    ? school.sport
    : 'programs' in school && Array.isArray(school.programs)
    ? `${school.programs.length} sport${school.programs.length !== 1 ? 's' : ''}`
    : ''
  const genderLabel = 'gender' in school && school.gender
    ? school.gender
    : null

  return (
    <motion.div
      className="group flex items-center gap-4 rounded-2xl px-5 py-4 transition-all duration-200"
      style={{
        border: '1px solid rgba(58,58,92,0.80)',
        backgroundColor: 'rgba(20,21,31,0.60)',
        cursor: onClick ? 'pointer' : 'default',
      }}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      onClick={onClick}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = '#3a3a52'
        el.style.backgroundColor = 'rgba(30,31,46,0.90)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = 'rgba(58,58,92,0.80)'
        el.style.backgroundColor = 'rgba(20,21,31,0.60)'
      }}
    >
      {/* Periwinkle left-rail accent */}
      <div
        className="h-10 w-0.5 flex-shrink-0 rounded-full transition-colors"
        style={{ backgroundColor: 'rgba(20,184,166,0.40)' }}
      />

      {/* Logo */}
      {school.logo_url ? (
        <div className="relative h-14 w-14 flex-shrink-0">
          <div
            className="h-14 w-14 overflow-hidden rounded-xl p-1.5"
            style={{ border: '1px solid #2a2a3c', backgroundColor: 'rgba(10,14,26,0.80)' }}
          >
            <img
              src={school.logo_url}
              alt={`${school.institution_name} logo`}
              className="h-full w-full object-contain"
              onError={handleLogoError}
            />
            {/* Fallback revealed on img error */}
            <span
              className="hidden h-full w-full items-center justify-center text-lg font-black"
              style={{ color: '#14B8A6', fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic' }}
              aria-label={school.institution_name}
            >
              {school.institution_name.charAt(0)}
            </span>
          </div>
        </div>
      ) : (
        <div
          className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl"
          style={{
            border: '1px solid #2a2a3c',
            background: 'linear-gradient(135deg, #14151F 0%, #1E1F2E 100%)',
          }}
        >
          <span
            className="text-lg font-black tracking-tight"
            style={{ color: '#14B8A6', fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic' }}
          >
            {school.institution_name.charAt(0)}
          </span>
        </div>
      )}

      {/* Name + meta */}
      <div className="min-w-0 flex-1">
        <h3
          className="truncate text-sm font-bold uppercase tracking-wide transition-colors"
          style={{ color: '#F5EFE0' }}
        >
          {school.institution_name}
        </h3>
        <p className="mt-0.5 text-2xs font-medium uppercase tracking-wider" style={{ color: '#555570' }}>
          {school.state_cd}&nbsp;·&nbsp;{school.classification_name}&nbsp;·&nbsp;{school.sanction_name}
        </p>
      </div>

      {/* Chips */}
      <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
        {sportLabel && (
          <span
            className="rounded-full px-2.5 py-0.5 text-2xs font-semibold uppercase tracking-wide"
            style={{
              border: '1px solid rgba(20,184,166,0.25)',
              backgroundColor: 'rgba(20,184,166,0.10)',
              color: '#14B8A6',
            }}
          >
            {sportLabel}
          </span>
        )}
        {genderLabel && (
          <span
            className="rounded-full px-2.5 py-0.5 text-2xs font-semibold uppercase tracking-wide"
            style={{
              border: '1px solid rgba(58,58,92,0.50)',
              backgroundColor: 'rgba(30,31,46,0.60)',
              color: '#8888a8',
            }}
          >
            {genderLabel}
          </span>
        )}
      </div>

      {/* Arrow */}
      {onClick && (
        <ChevronRight
          className="h-4 w-4 flex-shrink-0 transition-colors"
          style={{ color: '#2a2a3c' }}
        />
      )}
    </motion.div>
  )
}
