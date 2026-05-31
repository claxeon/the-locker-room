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

    const title = `${school.institution_name} Athletics Reviews — The Locker Room`
    const description = `Anonymous, verified reviews of ${school.institution_name} athletic programs. Read what student-athletes say about coaching, facilities, culture, and equity at ${school.institution_name}.`
    const url = `https://the-locker-room.app/school/${slug}`

    document.title = title

    const setMeta = (selector: string, attr: string, content: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement | null
      if (!el) {
        el = document.createElement('meta')
        const [attrName, attrVal] = selector.match(/\[([^=]+)=['"]([^'"]+)['"]\]/)?.slice(1) ?? [attr, '']
        el.setAttribute(attrName, attrVal)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    // Standard
    setMeta("meta[name='description']", 'name', description)
    setMeta("meta[name='robots']", 'name', 'index, follow')

    // Canonical
    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical) }
    canonical.href = url

    // Open Graph
    setMeta("meta[property='og:title']", 'property', title)
    setMeta("meta[property='og:description']", 'property', description)
    setMeta("meta[property='og:url']", 'property', url)
    setMeta("meta[property='og:type']", 'property', 'website')
    if (school.logo_url) setMeta("meta[property='og:image']", 'property', school.logo_url)

    // Twitter
    setMeta("meta[name='twitter:card']", 'name', 'summary_large_image')
    setMeta("meta[name='twitter:title']", 'name', title)
    setMeta("meta[name='twitter:description']", 'name', description)
    if (school.logo_url) setMeta("meta[name='twitter:image']", 'name', school.logo_url)

    // JSON-LD structured data
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'CollegeOrUniversity',
      name: school.institution_name,
      url: url,
      address: { '@type': 'PostalAddress', addressRegion: school.state_cd, addressCountry: 'US' },
      description: description,
    }
    let ldScript = document.querySelector('#school-jsonld') as HTMLScriptElement | null
    if (!ldScript) {
      ldScript = document.createElement('script')
      ldScript.id = 'school-jsonld'
      ldScript.type = 'application/ld+json'
      document.head.appendChild(ldScript)
    }
    ldScript.textContent = JSON.stringify(jsonLd)

    return () => {
      document.title = 'The Locker Room — Verified Athlete Reviews of College Sports Programs'
      document.querySelector('#school-jsonld')?.remove()
      canonical?.remove()
    }
  }, [school, slug])

  if (loading) {
    return (
      <div className="relative min-h-screen py-32 flex items-center justify-center" style={{ backgroundColor: '#0A0E1A' }}>
        <div
          className="h-10 w-10 animate-spin rounded-full border-4"
          style={{ borderColor: 'rgba(20,184,166,0.20)', borderTopColor: '#14B8A6' }}
        />
      </div>
    )
  }

  if (error || !school) {
    return (
      <div className="relative min-h-screen pt-32" style={{ backgroundColor: '#0A0E1A', color: '#f0f0f8' }}>
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
      style={{ backgroundColor: '#0A0E1A', color: '#f0f0f8' }}
    >
      {/* Subtle top glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(ellipse 60% 30% at 50% 0%, rgba(20,184,166,0.06) 0%, transparent 70%)',
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
          style={{ border: '1px solid #2a2a3c', backgroundColor: 'rgba(20,21,31,0.60)' }}
        >
          <div className="flex items-start gap-6">
            {/* Logo */}
            <div
              className="flex-shrink-0 h-20 w-20 sm:h-24 sm:w-24 rounded-2xl p-2"
              style={{ border: '1px solid #2a2a3c', backgroundColor: '#0A0E1A', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.60)' }}
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
                    style={{ background: 'linear-gradient(135deg, #14151F 0%, #1E1F2E 100%)' }}
                  >
                    <span
                      className="text-3xl font-black tracking-tight"
                      style={{ color: '#14B8A6', fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic' }}
                    >
                      {school.institution_name.charAt(0)}
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  className="h-full w-full flex items-center justify-center rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #14151F 0%, #1E1F2E 100%)' }}
                >
                  <span
                    className="text-3xl font-black tracking-tight"
                    style={{ color: '#14B8A6', fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic' }}
                  >
                    {school.institution_name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1 space-y-3">
              <p className="text-2xs font-semibold uppercase tracking-widest" style={{ color: '#14B8A6' }}>
                {school.classification_name}
              </p>
              <h1
                className="leading-[1.05]"
                style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)', ...serifItalic, color: '#F5EFE0' }}
              >
                {school.institution_name}
              </h1>
              <div className="flex flex-wrap gap-2">
                <ProfileMeta icon={<MapPin className="h-3.5 w-3.5" style={{ color: '#14B8A6' }} />} label={school.state_cd} />
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
          style={{ border: '1px solid #2a2a3c', backgroundColor: 'rgba(20,21,31,0.60)' }}
        >
          <header className="mb-6">
            <p className="text-2xs font-semibold uppercase tracking-widest" style={{ color: '#555570' }}>
              Active Teams
            </p>
            <h2
              className="mt-1"
              style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', ...serifItalic, color: '#F5EFE0' }}
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
                style={{ border: '1px solid #2a2a3c', backgroundColor: '#14151F' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#3a3a52'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#2a2a3c'}
              >
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#f0f0f8' }}>{program.sport}</p>
                  <p className="text-xs" style={{ color: '#555570' }}>{program.gender}</p>
                </div>
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-1 text-2xs font-semibold uppercase tracking-widest"
                  style={{ border: '1px solid #2a2a3c', backgroundColor: '#1E1F2E', color: '#8888a8' }}
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
          style={{ border: '1px solid rgba(20,184,166,0.18)', backgroundColor: 'rgba(124,126,184,0.06)' }}
        >
          <div>
            <p className="text-2xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#14B8A6' }}>
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
            style={{ backgroundColor: '#14B8A6', color: '#0A0E1A', boxShadow: '0 0 24px 0 rgba(124,126,184,0.28)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#14B8A6'
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 32px 0 rgba(148,150,204,0.38)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#14B8A6'
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
    style={{ border: '1px solid #2a2a3c', backgroundColor: '#14151F', color: '#a8a8c0' }}
  >
    {icon}
    {label}
  </span>
)
