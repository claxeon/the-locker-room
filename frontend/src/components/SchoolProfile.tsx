import React from 'react'
import { ArrowLeft, MapPin, Shield, Trophy, SpotlightIcon } from 'lucide-react'

import { useSchoolProfile } from '../hooks/useSupabaseData'
import { SchoolProfile as SchoolProfileType } from '../lib/supabase'
import { Button } from './ui/button'

interface SchoolProfileProps {
  slug: string
  onBack: () => void
}

export const SchoolProfile: React.FC<SchoolProfileProps> = ({ slug, onBack }) => {
  const { data: schools, loading, error } = useSchoolProfile(slug)
  const school = schools[0] as SchoolProfileType | undefined

  if (loading) {
    return (
      <div className="relative min-h-screen bg-black py-16">
        <BackgroundGlow />
        <div className="relative mx-auto flex max-w-3xl items-center justify-center px-6">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-yellow-500/30 border-b-yellow-500" />
        </div>
      </div>
    )
  }

  if (error || !school) {
    return (
      <div className="relative min-h-screen bg-black py-16 text-white">
        <BackgroundGlow />
        <div className="relative mx-auto max-w-3xl px-6">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-8 backdrop-blur">
            <h2 className="text-2xl font-black uppercase tracking-wide text-red-200">
              School Not Found
            </h2>
            <p className="mt-4 text-sm text-red-100/80">
              {error || 'The requested school could not be located. Please try again later.'}
            </p>
          </div>
          <div className="mt-6">
            <Button
              variant="outline"
              className="border-2 border-yellow-500 bg-yellow-500/10 px-6 py-2 text-xs font-black uppercase tracking-[0.3em] text-yellow-400 hover:bg-yellow-500/20"
              onClick={onBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Directory
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-black pb-24 pt-28 text-white">
      <BackgroundGlow />
      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-8 px-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            className="border-2 border-yellow-500 bg-yellow-500/10 px-6 py-2 text-xs font-black uppercase tracking-[0.3em] text-yellow-400 hover:bg-yellow-500/20"
            onClick={onBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Directory
          </Button>
        </div>

        <section className="relative overflow-hidden rounded-2xl border border-yellow-500/30 bg-black/70 p-8 backdrop-blur">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-transparent to-purple-500/20 opacity-25" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.35em] text-yellow-400">
                <SpotlightIcon className="h-4 w-4" /> Spotlight Program
              </span>
              <h1 className="text-4xl font-black uppercase tracking-tight text-white md:text-5xl">
                {school.institution_name}
              </h1>
              <div className="grid gap-4 text-sm text-gray-200 md:grid-cols-3">
                <ProfileMeta icon={<MapPin className="h-4 w-4 text-yellow-400" />} label="State" value={school.state_cd} />
                <ProfileMeta icon={<Shield className="h-4 w-4 text-purple-300" />} label="Division" value={school.classification_name} />
                <ProfileMeta icon={<Shield className="h-4 w-4 text-teal-300" />} label="Sanction" value={school.sanction_name} />
              </div>
            </div>
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-xl border border-yellow-500/40 bg-black/70 p-2">
              {school.logo_url ? (
                <img
                  src={school.logo_url}
                  alt={`${school.institution_name} logo`}
                  className="h-full w-full object-contain"
                  onError={(event) => {
                    const target = event.currentTarget
                    target.onerror = null
                    target.src = `https://placehold.co/128x128/eab308/000000?text=${school.institution_name.charAt(0)}`
                  }}
                />
              ) : (
                <Trophy className="h-10 w-10 text-yellow-400" />
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-yellow-500/25 bg-black/70 p-8 backdrop-blur">
          <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tight text-white">
                Sports Programs
              </h2>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-400">
                {school.programs.length} Active Teams
              </p>
            </div>
          </header>

          <div className="grid gap-4 md:grid-cols-2">
            {school.programs.map((program, index) => (
              <article
                key={`${program.sport}-${program.gender}-${index}`}
                className="group relative overflow-hidden rounded-xl border border-yellow-500/30 bg-black/60 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-yellow-500 hover:shadow-[0_20px_40px_-20px_rgba(234,179,8,0.35)]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-purple-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-wide text-white">
                      {program.sport}
                    </h3>
                    <p className="text-sm text-gray-300">{program.gender}</p>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.3em] text-yellow-300">
                    {program.gender}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

const BackgroundGlow = () => (
  <>
    <div className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-br from-black via-black to-purple-900/30" />
    <div className="pointer-events-none absolute inset-0 -z-10" style={{
      backgroundImage:
        'radial-gradient(circle at 20% 20%, rgba(234, 179, 8, 0.15), transparent 45%), radial-gradient(circle at 80% 0%, rgba(168, 85, 247, 0.2), transparent 40%)',
    }} />
  </>
)

type ProfileMetaProps = {
  icon: React.ReactNode
  label: string
  value: string
}

const ProfileMeta = ({ icon, label, value }: ProfileMetaProps) => (
  <div className="flex items-center gap-3 rounded-lg border border-yellow-500/20 bg-black/60 px-4 py-3">
    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-yellow-500/30 bg-yellow-500/10">
      {icon}
    </span>
    <div className="flex flex-col">
      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">
        {label}
      </span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  </div>
)
