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
    // Hide broken img and show the initials fallback via sibling trick:
    // Remove src so the img element disappears, then reveal the sibling fallback.
    const img = event.currentTarget
    img.style.display = 'none'
    const fallback = img.nextElementSibling as HTMLElement | null
    if (fallback) fallback.style.display = 'flex'
  }

  // Support both old SportsDirectoryEntry (sport/gender) and new SchoolProfile (programs array)
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
      className={`group flex items-center gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 px-5 py-4 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900 ${
        onClick ? 'cursor-pointer' : ''
      }`}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      onClick={onClick}
    >
      {/* Yellow left-rail accent */}
      <div className="h-10 w-0.5 flex-shrink-0 rounded-full bg-yellow-500/50 transition-colors group-hover:bg-yellow-500" />

      {/* Logo */}
      {school.logo_url ? (
        <div className="relative h-14 w-14 flex-shrink-0">
          <div className="h-14 w-14 overflow-hidden rounded-xl border border-zinc-800 bg-black/80 p-1.5">
            <img
              src={school.logo_url}
              alt={`${school.institution_name} logo`}
              className="h-full w-full object-contain"
              onError={handleLogoError}
            />
            {/* Hidden fallback revealed on img error */}
            <span
              className="hidden h-full w-full items-center justify-center text-lg font-black text-yellow-500"
              aria-label={school.institution_name}
            >
              {school.institution_name.charAt(0)}
            </span>
          </div>
        </div>
      ) : (
        <div
          className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-zinc-800"
          style={{ background: 'linear-gradient(135deg, #1c1917 0%, #27272a 100%)' }}
        >
          <span
            className="text-lg font-black tracking-tight"
            style={{ color: '#eab308', fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic' }}
          >
            {school.institution_name.charAt(0)}
          </span>
        </div>
      )}

      {/* Name + meta */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-bold uppercase tracking-wide text-white transition-colors group-hover:text-yellow-400">
          {school.institution_name}
        </h3>
        <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-600">
          {school.state_cd}&nbsp;·&nbsp;{school.classification_name}&nbsp;·&nbsp;{school.sanction_name}
        </p>
      </div>

      {/* Chips */}
      <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
        {sportLabel && (
          <span className="rounded-full border border-yellow-500/25 bg-yellow-500/10 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-yellow-400">
            {sportLabel}
          </span>
        )}
        {genderLabel && (
          <span className="rounded-full border border-zinc-700/50 bg-zinc-800/60 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-zinc-400">
            {genderLabel}
          </span>
        )}
      </div>

      {/* Arrow */}
      {onClick && (
        <ChevronRight className="h-4 w-4 flex-shrink-0 text-zinc-700 transition-colors group-hover:text-yellow-500" />
      )}
    </motion.div>
  )
}
