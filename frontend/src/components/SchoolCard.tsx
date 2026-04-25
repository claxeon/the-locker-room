import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

import { SportsDirectoryEntry } from '../lib/supabase'

interface SchoolCardProps {
  school: SportsDirectoryEntry
  onClick?: () => void
}

const cardVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
}

/**
 * Deterministically pick an Unsplash photo ID for a school's campus image.
 * We use a curated list of beautiful university campus photos.
 * The choice is seeded by state + first letter of institution name for
 * visual variety without randomness (same school = same image every render).
 */
const CAMPUS_PHOTO_IDS = [
  'photo-1562774053-701939374585', // campus aerial brick
  'photo-1498243691581-b145c3f54a5a', // classic university building
  'photo-1541339907198-e08756dedf3f', // campus lawn
  'photo-1607237138185-eedd9c632b0b', // autumn campus
  'photo-1571260899304-425eee4c7efc', // modern university
  'photo-1581362072978-14998d01fdaa', // lecture hall exterior
  'photo-1519452575417-564c1401ecc0', // stone university gate
  'photo-1523050854058-8df90110c9f1', // campus path
  'photo-1574958269340-fa927503f3dd', // sports complex
  'photo-1594608661623-aa0bd3a69d98', // university library
  'photo-1568667256549-094345857637', // college dorms
  'photo-1580582932707-520aed937b7b', // campus green
  'photo-1509062522246-3755977927d7', // university clock tower
  'photo-1597733336794-12d05021d510', // modern campus building
  'photo-1565034946487-077786996e27', // ivy covered building
  'photo-1541339907198-e08756dedf3f', // campus overview
  'photo-1534796636912-3b95b3ab5986', // indoor sports facility
  'photo-1477959858617-67f85cf4f1df', // campus skyline
  'photo-1527576539890-dfa815648363', // architectural detail
  'photo-1463947628408-f8581a2f4aca', // stadium exterior
]

function getCampusPhotoId(school: SportsDirectoryEntry): string {
  // Deterministic seed: school_id mod array length
  const idx = school.school_id % CAMPUS_PHOTO_IDS.length
  return CAMPUS_PHOTO_IDS[idx]
}

export const SchoolCard: React.FC<SchoolCardProps> = ({ school, onClick }) => {
  const [imgError, setImgError] = useState(false)
  const photoId = getCampusPhotoId(school)
  const heroUrl = `https://images.unsplash.com/${photoId}?w=600&h=120&fit=crop&auto=format&q=60`

  const handleLogoError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = `https://placehold.co/64x64/18181b/eab308?text=${school.institution_name.charAt(0)}`
  }

  return (
    <motion.div
      className={`group overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900 ${
        onClick ? 'cursor-pointer' : ''
      }`}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      onClick={onClick}
    >
      {/* Campus hero image strip */}
      {!imgError && (
        <div className="relative h-[72px] w-full overflow-hidden">
          <img
            src={heroUrl}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
          {/* Gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-zinc-900/80" />
          {/* Yellow left-rail accent overlaid on image */}
          <div className="absolute left-0 top-0 h-full w-0.5 bg-yellow-500/60 group-hover:bg-yellow-500 transition-colors" />
        </div>
      )}

      {/* Card body */}
      <div className="flex items-center gap-4 px-5 py-4">
        {/* Yellow left-rail accent (fallback when no image) */}
        {imgError && (
          <div className="h-10 w-0.5 flex-shrink-0 rounded-full bg-yellow-500/50 transition-colors group-hover:bg-yellow-500" />
        )}

        {/* Logo */}
        {school.logo_url ? (
          <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-zinc-800 bg-black/80 p-1.5">
            <img
              src={school.logo_url}
              alt={`${school.institution_name} logo`}
              className="h-full w-full object-contain"
              onError={handleLogoError}
            />
          </div>
        ) : (
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900">
            <span className="text-xl font-black text-yellow-500">
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

        {/* Chips — zinc for gender (no purple) */}
        <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
          <span className="rounded-full border border-yellow-500/25 bg-yellow-500/10 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-yellow-400">
            {school.sport}
          </span>
          <span className="rounded-full border border-zinc-700/50 bg-zinc-800/60 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-zinc-400">
            {school.gender}
          </span>
        </div>

        {/* Arrow */}
        {onClick && (
          <ChevronRight className="h-4 w-4 flex-shrink-0 text-zinc-700 transition-colors group-hover:text-yellow-500" />
        )}
      </div>
    </motion.div>
  )
}
