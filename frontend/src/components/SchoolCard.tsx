import React from 'react'
import { motion } from 'framer-motion'
import { MapPin, Shield, SpotlightIcon } from 'lucide-react'

import { Button } from './ui/button'
import { SportsDirectoryEntry } from '../lib/supabase'

interface SchoolCardProps {
  school: SportsDirectoryEntry
  onClick?: () => void
}

const cardVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
}

export const SchoolCard: React.FC<SchoolCardProps> = ({ school, onClick }) => {
  const handleLogoError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const target = event.currentTarget
    target.src = `https://placehold.co/128x128/eab308/000000?text=${school.institution_name.charAt(0)}`
  }

  return (
    <motion.div
      className={`group relative overflow-hidden border-4 border-yellow-500/30 bg-black/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-yellow-500 hover:shadow-[0_20px_40px_-15px_rgba(234,179,8,0.45)] ${
        onClick ? 'cursor-pointer' : ''
      }`}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      onClick={onClick}
    >
      <div className="absolute -inset-1 opacity-0 transition-opacity duration-300 group-hover:opacity-20">
        <div className="h-full w-full bg-gradient-to-br from-yellow-500/40 via-transparent to-purple-500/30" />
      </div>

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-yellow-400">
            <SpotlightIcon className="h-3.5 w-3.5" />
            Spotlight Program
          </span>
          <h3 className="text-2xl font-black uppercase text-white">
            {school.institution_name}
          </h3>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300">
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-yellow-500" />
              {school.state_cd}
            </span>
            <span className="inline-flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-400" />
              {school.classification_name}
            </span>
            <span className="inline-flex items-center gap-2">
              <Shield className="h-4 w-4 text-teal-300" />
              {school.sanction_name}
            </span>
          </div>
        </div>

        {school.logo_url && (
          <div className="h-20 w-20 overflow-hidden rounded-lg border-2 border-yellow-500/40 bg-black/70">
            <img
              src={school.logo_url}
              alt={`${school.institution_name} logo`}
              className="h-full w-full object-contain p-2"
              onError={handleLogoError}
            />
          </div>
        )}
      </div>

      <div className="relative z-10 mt-6 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-yellow-300">
          {school.sport}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/15 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-purple-200">
          {school.gender}
        </span>
      </div>

      {onClick && (
        <div className="relative z-10 mt-6 flex justify-end">
          <Button
            variant="outline"
            className="border-2 border-yellow-500 bg-yellow-500/15 px-6 py-2 text-sm font-black uppercase tracking-wider text-yellow-400 hover:bg-yellow-500/25"
          >
            View Details
          </Button>
        </div>
      )}
    </motion.div>
  )
}
