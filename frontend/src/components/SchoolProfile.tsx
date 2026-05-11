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
      <div className="relative min-h-screen py-32 flex items-center justify-center" style={{ backgroundColor: '#0f0f1a' }}>
        <div
          className="h-10 w-10 animate-spin rounded-full border-4"
          style={{ borderColor: 'rgba(124,126,184,0.20)', borderTopColor: '#7c7eb8' }}
        />
      </div>
    )
  }

  if (error || !school) {
    return (
      <div className="relative min-h-screen pt-32" style={{ backgroundColor: '#0f0f1a', color: '#f0f0f8' }}>
        <div className="mx-auto max-w-3xl px-6">
          <div
            className="rounded-xl p-8"
            style={{ border: '1px solid rgba(248,113,113,0.20)', backgroundColor: 'rgba(248,113,113,0.05)' }}
          >
            <h2 className="text-lg font-semibold" style={{ color: '#fca5a5' }}>School Not Found</h2>
            <p className="mt-2 text-sm" style={{ color: 'rgba(252,165,165,0.60)' }}>
              {error || 'The requested school could not be located.'}
            </p>
          </div>
          <button
            onClick={onBack}
            className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest transition-colors"
            style={{ color: '#8888a8' }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#f0f0f8'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#8888a8'}
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Directory
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative min-h-screen pb-24"
      style={{ backgroundColor: '#0f0f1a', color: '#f0f0f8' }}
    >
      {/* Subtle top glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(ellipse 60% 30% at 50% 0%, rgba(124,126,184,0.07) 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 pt-28">
        {/* Back */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest transition-colors self-start"
          style={{ color: '#555570' }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#f0f0f8'}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#555570'}
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Directory
        </button>

        {/* School header */}
        <section
          className="rounded-xl p-6 sm:p-8 backdrop-blur"
          style={{ border: '1px solid #3a3a5c', backgroundColor: 'rgba(26,26,46,0.60)' }}
        >
          <div className="flex items-start gap-6">
            {/* Logo */}
            <div
              className="flex-shrink-0 h-20 w-20 sm:h-24 sm:w-24 rounded-2xl p-2"
              style={{ border: '1px solid #3a3a5c', backgroundColor: '#0f0f1a', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.60)' }}
            >
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
                  <div
                    className="hidden h-full w-full items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #252540 100%)' }}
                  >
                    <span
                      className="text-3xl font-black tracking-tight"
                      style={{ color: '#7c7eb8', fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic' }}
                    >
                      {school.institution_name.charAt(0)}
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  className="h-full w-full flex items-center justify-center rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #252540 100%)' }}
                >
                  <span
                    className="text-3xl font-black tracking-tight"
                    style={{ color: '#7c7eb8', fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic' }}
                  >
                    {school.institution_name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1 space-y-3">
              <p className="text-2xs font-semibold uppercase tracking-widest" style={{ color: '#7c7eb8' }}>
                {school.classification_name}
              </p>
              <h1
                className="leading-[1.05]"
                style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)', ...serifItalic, color: '#f0f0f8' }}
              >
                {school.institution_name}
              </h1>
              <div className="flex flex-wrap gap-2">
                <ProfileMeta icon={<MapPin className="h-3.5 w-3.5" style={{ color: '#7c7eb8' }} />} label={school.state_cd} />
                <ProfileMeta icon={<Shield className="h-3.5 w-3.5" style={{ color: '#8888a8' }} />} label={school.classification_name} />
                <ProfileMeta icon={<Shield className="h-3.5 w-3.5" style={{ color: '#8888a8' }} />} label={school.sanction_name} />
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
        <section
          className="rounded-xl p-8 backdrop-blur"
          style={{ border: '1px solid #3a3a5c', backgroundColor: 'rgba(26,26,46,0.60)' }}
        >
          <header className="mb-6">
            <p className="text-2xs font-semibold uppercase tracking-widest" style={{ color: '#555570' }}>
              Active Teams
            </p>
            <h2
              className="mt-1"
              style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', ...serifItalic, color: '#f0f0f8' }}
            >
              Sports Programs
            </h2>
            <p className="mt-1 text-xs" style={{ color: '#555570' }}>
              {school.programs.length} programs offered
            </p>
          </header>

          <div className="grid gap-3 md:grid-cols-2">
            {school.programs.map((program, index) => (
              <article
                key={`${program.sport}-${program.gender}-${index}`}
                className="flex items-center justify-between rounded-lg px-4 py-3 transition-colors"
                style={{ border: '1px solid #3a3a5c', backgroundColor: '#1a1a2e' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#4a4a70'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#3a3a5c'}
              >
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#f0f0f8' }}>{program.sport}</p>
                  <p className="text-xs" style={{ color: '#555570' }}>{program.gender}</p>
                </div>
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-1 text-2xs font-semibold uppercase tracking-widest"
                  style={{ border: '1px solid #3a3a5c', backgroundColor: '#252540', color: '#8888a8' }}
                >
                  {program.gender === "Men's" ? "M" : program.gender === "Women's" ? "W" : "Co"}
                </span>
              </article>
            ))}
          </div>
        </section>

        {/* Write a Review CTA */}
        <section
          className="rounded-xl p-6 flex items-center justify-between gap-4"
          style={{ border: '1px solid rgba(124,126,184,0.22)', backgroundColor: 'rgba(124,126,184,0.06)' }}
        >
          <div>
            <p className="text-2xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#7c7eb8' }}>
              Verified Athletes Only
            </p>
            <h2 className="text-base font-bold" style={{ color: '#f0f0f8' }}>Played here? Rate this program.</h2>
            <p className="text-xs mt-1" style={{ color: '#555570' }}>
              Your review is anonymous and helps other athletes make better decisions.
            </p>
          </div>
          <Link
            to={`/submit-review?school_id=${school.school_id}&school_name=${encodeURIComponent(school.institution_name)}`}
            className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-colors"
            style={{ backgroundColor: '#7c7eb8', color: '#0f0f1a', boxShadow: '0 0 24px 0 rgba(124,126,184,0.28)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#9496cc'
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 32px 0 rgba(148,150,204,0.38)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#7c7eb8'
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 24px 0 rgba(124,126,184,0.28)'
            }}
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
  <span
    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs"
    style={{ border: '1px solid #3a3a5c', backgroundColor: '#1a1a2e', color: '#a8a8c0' }}
  >
    {icon}
    {label}
  </span>
)
