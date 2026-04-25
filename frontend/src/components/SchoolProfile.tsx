import React, { useState } from 'react'
import { ArrowLeft, MapPin, Shield, Trophy } from 'lucide-react'

import { useSchoolProfile } from '../hooks/useSupabaseData'
import { SchoolProfile as SchoolProfileType } from '../lib/supabase'
import { ReviewsSection } from './reviews/ReviewsSection'
import { SchoolScorecard } from './scorecard/SchoolScorecard'
import { ReviewAnalytics } from './scorecard/ReviewAnalytics'

interface SchoolProfileProps {
  slug: string
  onBack: () => void
}

/**
 * Same deterministic campus image pool as SchoolCard.
 * Keyed by school_id so the same school always shows the same photo.
 */
const CAMPUS_PHOTO_IDS = [
  'photo-1562774053-701939374585',
  'photo-1498243691581-b145c3f54a5a',
  'photo-1541339907198-e08756dedf3f',
  'photo-1607237138185-eedd9c632b0b',
  'photo-1571260899304-425eee4c7efc',
  'photo-1581362072978-14998d01fdaa',
  'photo-1519452575417-564c1401ecc0',
  'photo-1523050854058-8df90110c9f1',
  'photo-1574958269340-fa927503f3dd',
  'photo-1594608661623-aa0bd3a69d98',
  'photo-1568667256549-094345857637',
  'photo-1580582932707-520aed937b7b',
  'photo-1509062522246-3755977927d7',
  'photo-1597733336794-12d05021d510',
  'photo-1565034946487-077786996e27',
  'photo-1534796636912-3b95b3ab5986',
  'photo-1477959858617-67f85cf4f1df',
  'photo-1527576539890-dfa815648363',
  'photo-1463947628408-f8581a2f4aca',
  'photo-1566073771259-6a8506099945',
]

function getHeroUrl(schoolId: number): string {
  const photoId = CAMPUS_PHOTO_IDS[schoolId % CAMPUS_PHOTO_IDS.length]
  return `https://images.unsplash.com/${photoId}?w=1200&h=280&fit=crop&auto=format&q=70`
}

const serifItalic: React.CSSProperties = {
  fontFamily: "'Instrument Serif', Georgia, serif",
  fontStyle: 'italic',
}

export const SchoolProfile: React.FC<SchoolProfileProps> = ({ slug, onBack }) => {
  const { data: schools, loading, error } = useSchoolProfile(slug)
  const school = schools[0] as SchoolProfileType | undefined
  // Must be declared before any early returns (Rules of Hooks)
  const [heroBroken, setHeroBroken] = useState(false)

  if (loading) {
    return (
      <div className="relative min-h-screen bg-black py-32 flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-800 border-t-yellow-500" />
      </div>
    )
  }

  if (error || !school) {
    return (
      <div className="relative min-h-screen bg-black pt-32 text-white">
        <div className="mx-auto max-w-3xl px-6">
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-8">
            <h2 className="text-lg font-semibold text-red-300">School Not Found</h2>
            <p className="mt-2 text-sm text-red-400/70">
              {error || 'The requested school could not be located.'}
            </p>
          </div>
          <button
            onClick={onBack}
            className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Directory
          </button>
        </div>
      </div>
    )
  }

  const heroUrl = getHeroUrl(school.school_id)

  return (
    <div className="relative min-h-screen bg-black pb-24 text-white">

      {/* ── Campus Hero Banner ── */}
      {!heroBroken && (
        <div className="relative h-52 sm:h-64 w-full overflow-hidden">
          <img
            src={heroUrl}
            alt={`${school.institution_name} campus`}
            className="h-full w-full object-cover"
            onError={() => setHeroBroken(true)}
          />
          {/* Dramatic gradient: black top (for nav), transparent mid, black bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black" />
          {/* Subtle yellow left accent */}
          <div className="absolute left-0 top-0 h-full w-1 bg-yellow-500/40" />
        </div>
      )}

      {/* Top glow fallback (no image) */}
      {heroBroken && (
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse 60% 35% at 50% -5%, rgba(234,179,8,0.07) 0%, transparent 70%)',
          }}
        />
      )}

      <div className={`relative mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 ${heroBroken ? 'pt-28' : 'pt-6'}`}>
        {/* Back button — editorial ghost style */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors self-start"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Directory
        </button>

        {/* School header card — pulled up slightly to overlap hero */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-8 backdrop-blur">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-yellow-500">
                {school.classification_name}
              </p>
              <h1
                className="leading-[1.05] text-white"
                style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', ...serifItalic }}
              >
                {school.institution_name}
              </h1>
              <div className="flex flex-wrap gap-3">
                <ProfileMeta icon={<MapPin className="h-3.5 w-3.5 text-yellow-500" />} label={school.state_cd} />
                <ProfileMeta icon={<Shield className="h-3.5 w-3.5 text-zinc-400" />} label={school.classification_name} />
                <ProfileMeta icon={<Shield className="h-3.5 w-3.5 text-zinc-400" />} label={school.sanction_name} />
              </div>
            </div>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 p-2">
              {school.logo_url ? (
                <img
                  src={school.logo_url}
                  alt={`${school.institution_name} logo`}
                  className="h-full w-full object-contain"
                  onError={(event) => {
                    const target = event.currentTarget
                    target.onerror = null
                    target.src = `https://placehold.co/128x128/27272a/eab308?text=${school.institution_name.charAt(0)}`
                  }}
                />
              ) : (
                <Trophy className="h-7 w-7 text-yellow-500" />
              )}
            </div>
          </div>
        </section>

        <SchoolScorecard
          schoolId={school.school_id}
          schoolName={school.institution_name}
        />

        <ReviewAnalytics schoolId={school.school_id} />

        {/* Sports Programs */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-8 backdrop-blur">
          <header className="mb-6">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
              Active Teams
            </p>
            <h2
              className="mt-1 text-white"
              style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', ...serifItalic }}
            >
              Sports Programs
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              {school.programs.length} programs offered
            </p>
          </header>

          <div className="grid gap-3 md:grid-cols-2">
            {school.programs.map((program, index) => (
              <article
                key={`${program.sport}-${program.gender}-${index}`}
                className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 transition-colors hover:border-zinc-700"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{program.sport}</p>
                  <p className="text-xs text-zinc-500">{program.gender}</p>
                </div>
                <span className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                  {program.gender === "Men's" ? "M" : program.gender === "Women's" ? "W" : "Co"}
                </span>
              </article>
            ))}
          </div>
        </section>

        <ReviewsSection
          schoolId={school.school_id}
          schoolName={school.institution_name}
        />
      </div>
    </div>
  )
}

const ProfileMeta = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300">
    {icon}
    {label}
  </span>
)
