import React, { useEffect } from 'react'
import { ArrowLeft, MapPin, PenSquare, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useSchoolProfile } from '../hooks/useSupabaseData'
import { SchoolProfile as SchoolProfileType } from '../lib/supabase'
import { ReviewsSection } from './reviews/ReviewsSection'
import { SchoolScorecard } from './scorecard/SchoolScorecard'
import { ReviewAnalytics } from './scorecard/ReviewAnalytics'

interface SchoolProfileProps {
  slug: string
  onBack: () => void
}


const serifItalic: React.CSSProperties = {
  fontFamily: "'Instrument Serif', Georgia, serif",
  fontStyle: 'italic',
}

export const SchoolProfile: React.FC<SchoolProfileProps> = ({ slug, onBack }) => {
  const { data: schools, loading, error } = useSchoolProfile(slug)
  const school = schools[0] as SchoolProfileType | undefined

  // Dynamic meta tags for SEO + social sharing
  useEffect(() => {
    if (!school) return
    const title = `${school.institution_name} Athletics — The Locker Room`
    document.title = title
    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property='${property}']`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute('property', property)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }
    setMeta('og:title', title)
    setMeta('og:description', `Read anonymous verified reviews of ${school.institution_name} athletic programs. Facilities, coaching, culture, gender equity ratings from real student-athletes.`)
    setMeta('og:url', `https://the-locker-room-zeta.vercel.app/school/${slug}`)
    if (school.logo_url) setMeta('og:image', school.logo_url)
    return () => { document.title = 'The Locker Room — Glassdoor for College Sports' }
  }, [school, slug])

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

  return (
    <div className="relative min-h-screen bg-black pb-24 text-white">

      {/* Subtle top glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(ellipse 60% 30% at 50% 0%, rgba(234,179,8,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 pt-28">
        {/* Back button */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors self-start"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Directory
        </button>

        {/* School header — logo left, info right */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 backdrop-blur">
          <div className="flex items-start gap-6">
            {/* Logo — large, prominent */}
            <div className="flex-shrink-0 h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border border-zinc-700 bg-black p-2 shadow-lg shadow-black/60">
{school.logo_url ? (
                <div className="relative h-full w-full">
                  <img
                    src={school.logo_url}
                    alt={`${school.institution_name} logo`}
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      const img = e.currentTarget
                      img.style.display = 'none'
                      const fb = img.nextElementSibling as HTMLElement | null
                      if (fb) fb.style.display = 'flex'
                    }}
                  />
                  {/* Fallback: shown when img fails */}
                  <div
                    className="hidden h-full w-full items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #1c1917 0%, #27272a 100%)' }}
                  >
                    <span
                      className="text-3xl font-black tracking-tight"
                      style={{ color: '#eab308', fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic' }}
                    >
                      {school.institution_name.charAt(0)}
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  className="h-full w-full flex items-center justify-center rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #1c1917 0%, #27272a 100%)' }}
                >
                  <span
                    className="text-3xl font-black tracking-tight"
                    style={{ color: '#eab308', fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic' }}
                  >
                    {school.institution_name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1 space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-yellow-500">
                {school.classification_name}
              </p>
              <h1
                className="leading-[1.05] text-white"
                style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)', ...serifItalic }}
              >
                {school.institution_name}
              </h1>
              <div className="flex flex-wrap gap-2">
                <ProfileMeta icon={<MapPin className="h-3.5 w-3.5 text-yellow-500" />} label={school.state_cd} />
                <ProfileMeta icon={<Shield className="h-3.5 w-3.5 text-zinc-400" />} label={school.classification_name} />
                <ProfileMeta icon={<Shield className="h-3.5 w-3.5 text-zinc-400" />} label={school.sanction_name} />
              </div>
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

        {/* Write a Review CTA — primary conversion action */}
        <section className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-yellow-500 mb-1">Verified Athletes Only</p>
            <h2 className="text-base font-bold text-white">Played here? Rate this program.</h2>
            <p className="text-xs text-zinc-500 mt-1">Your review is anonymous and helps other athletes make better decisions.</p>
          </div>
          <Link
            to="/submit-review"
            className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 transition-colors px-5 py-2.5 text-xs font-black uppercase tracking-widest text-black"
          >
            <PenSquare className="h-3.5 w-3.5" />
            Write a Review
          </Link>
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
