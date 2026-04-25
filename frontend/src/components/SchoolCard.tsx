import React from 'react'
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

export const SchoolCard: React.FC<SchoolCardProps> = ({ school, onClick }) => {
  const handleLogoError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = `https://placehold.co/64x64/18181b/eab308?text=${school.institution_name.charAt(0)}`
  }

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
        <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl border border-zinc-800 bg-black/60">
          <img
            src={school.logo_url}
            alt={`${school.institution_name} logo`}
            className="h-full w-full object-contain p-1.5"
            onError={handleLogoError}
          />
        </div>
      ) : (
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900">
          <span className="text-base font-black text-yellow-500">
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
        <span className="rounded-full border border-yellow-500/25 bg-yellow-500/10 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-yellow-400">
          {school.sport}
        </span>
        <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-purple-300">
          {school.gender}
        </span>
      </div>

      {/* Arrow */}
      {onClick && (
        <ChevronRight className="h-4 w-4 flex-shrink-0 text-zinc-700 transition-colors group-hover:text-yellow-500" />
      )}
    </motion.div>
  )
}
