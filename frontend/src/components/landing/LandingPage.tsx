import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BadgeCheck,
  BicepsFlexed,
  ChevronRight,
  Target,
  Trophy,
  TrendingUp,
  Users,
} from "lucide-react"

// ─── Social icon paths ────────────────────────────────────────────────────────
const socialLinks = [
  { label: "Instagram", href: "https://instagram.com",  d: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" },
  { label: "Twitter/X",  href: "https://twitter.com",   d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.738-8.835L1.254 2.25H8.08l4.259 5.635L18.243 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  { label: "LinkedIn",   href: "https://linkedin.com",  d: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
]

const features = [
  {
    icon: BadgeCheck,
    title: "Verified Reviews",
    description: "Only verified student-athletes can post reviews. Every submission is manually reviewed against roster evidence.",
  },
  {
    icon: Users,
    title: "Team Culture",
    description: "Six-dimension scoring: facilities, coaching, life balance, academic support, culture, and gender equity.",
  },
  {
    icon: Trophy,
    title: "Athlete Scorecard",
    description: "Every program gets a visual scorecard with category breakdowns so recruits can compare at a glance.",
  },
  {
    icon: Target,
    title: "College Comparison",
    description: "Side-by-side radar charts across up to 3 programs. Find the right fit before committing.",
  },
  {
    icon: Award,
    title: "Gender Equity Ratings",
    description: "Dedicated equity dimension surfaces how programs treat Men's and Women's teams differently.",
  },
  {
    icon: TrendingUp,
    title: "Anonymous by Default",
    description: "All reviews are anonymous. Athletes can speak freely without fear of coaching staff retaliation.",
  },
]

const proofData = [
  { name: "NJCAA", programs: 2800 },
  { name: "NAIA", programs: 4200 },
  { name: "NCAA D3", programs: 5100 },
  { name: "NCAA D2", programs: 3400 },
  { name: "NCAA D1", programs: 3500 },
]

const proofStats = [
  { label: "Schools Indexed", value: "1,086" },
  { label: "Sports Programs", value: "19,000+" },
  { label: "Sanctioning Bodies", value: "6" },
  { label: "Sports Tracked", value: "90+" },
]

const testimonials = [
  {
    quote: "Recruits deserve to know what they're getting into. Coaches get feedback through official channels — we never did. This changes that.",
    name: "Verified D1 Athlete",
    designation: "Baseball · Abilene Christian University",
  },
  {
    quote: "The gender equity dimension is something no recruiting service has ever tracked. Women's programs need this data.",
    name: "Beta Tester",
    designation: "Softball · Early Access",
  },
  {
    quote: "Anonymous reviews mean athletes can actually be honest. That's the whole game.",
    name: "Beta Tester",
    designation: "Track & Field · Early Access",
  },
]

type LandingPageProps = {
  onGetStarted?: () => void
}

const serifStyle: React.CSSProperties = {
  fontFamily: "'Instrument Serif', Georgia, serif",
  fontStyle: "italic",
}

// ─── Radar Chart ──────────────────────────────────────────────────────────────

const RADAR_AXES = [
  "FACILITIES",
  "COACHING",
  "LIFE BALANCE",
  "ACADEMIC SUPPORT",
  "TEAM CULTURE",
  "GENDER EQUITY",
]

const RADAR_PROFILES: { label: string; scores: number[] }[] = [
  { label: "BALANCED PROGRAM",              scores: [78, 82, 75, 80, 85, 77] },
  { label: "ELITE FACILITIES, POOR EQUITY", scores: [95, 88, 45, 60, 55, 30] },
  { label: "STRONG CULTURE, MODEST RESOURCES", scores: [55, 90, 88, 75, 95, 85] },
]

/** Convert (angle, value, cx, cy, r) → {x, y} on the SVG canvas */
function polarPoint(
  angleDeg: number,
  value: number,
  cx: number,
  cy: number,
  r: number,
): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  const d = (value / 100) * r
  return { x: cx + d * Math.cos(rad), y: cy + d * Math.sin(rad) }
}

/** Build an SVG polygon points string from scores */
function buildPoints(scores: number[], cx: number, cy: number, r: number): string {
  return scores
    .map((s, i) => {
      const { x, y } = polarPoint((360 / scores.length) * i, s, cx, cy, r)
      return `${x},${y}`
    })
    .join(" ")
}

/** Linear interpolation between two score arrays */
function lerpScores(a: number[], b: number[], t: number): number[] {
  return a.map((v, i) => v + (b[i] - v) * t)
}

const CYCLE_HOLD = 4000   // ms to hold each profile
const MORPH_DURATION = 800 // ms for morph transition
const MORPH_STEPS = 40     // animation frames
const LABEL_FADE = 200     // ms for label fade each direction

const HeroRadarCard = () => {
  const n = RADAR_AXES.length
  // Expanded viewBox (420×420) so long axis labels like "GENDER EQUITY" and
  // "LIFE BALANCE" never clip against the card edge.
  const cx = 210
  const cy = 210
  const r = 120      // polygon radius — same visual scale as before
  const labelR = 158 // label placement radius (enough margin for longest labels)
  const gridLevels = [20, 40, 60, 80, 100]

  const [profileIdx, setProfileIdx] = useState(0)
  const [displayScores, setDisplayScores] = useState(RADAR_PROFILES[0].scores)
  const [labelText, setLabelText] = useState(RADAR_PROFILES[0].label)
  const [labelVisible, setLabelVisible] = useState(true)
  const [paused, setPaused] = useState(false)

  const pausedRef = useRef(false)
  const profileIdxRef = useRef(0)

  // Keep refs in sync so the interval closure always has current values
  useEffect(() => { pausedRef.current = paused }, [paused])
  useEffect(() => { profileIdxRef.current = profileIdx }, [profileIdx])

  useEffect(() => {
    let frameId: ReturnType<typeof setTimeout>

    const startMorph = (fromIdx: number, toIdx: number) => {
      const from = RADAR_PROFILES[fromIdx].scores
      const to   = RADAR_PROFILES[toIdx].scores
      let step = 0

      const tick = () => {
        step++
        const t = step / MORPH_STEPS
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t // ease-in-out
        setDisplayScores(lerpScores(from, to, ease))
        if (step < MORPH_STEPS) {
          frameId = setTimeout(tick, MORPH_DURATION / MORPH_STEPS)
        } else {
          setDisplayScores(to)
        }
      }
      tick()
    }

    const cycle = () => {
      frameId = setTimeout(() => {
        if (pausedRef.current) {
          // Re-schedule check
          cycle()
          return
        }
        const nextIdx = (profileIdxRef.current + 1) % RADAR_PROFILES.length

        // 1. Fade out label
        setLabelVisible(false)

        // 2. After fade-out, swap text + start morph
        const fromIdx = profileIdxRef.current
        frameId = setTimeout(() => {
          setLabelText(RADAR_PROFILES[nextIdx].label)
          setLabelVisible(true)
          setProfileIdx(nextIdx)
          startMorph(fromIdx, nextIdx)

          // 3. Schedule next cycle after hold
          cycle()
        }, LABEL_FADE)
      }, CYCLE_HOLD)
    }

    cycle()
    return () => clearTimeout(frameId)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const points = buildPoints(displayScores, cx, cy, r)

  return (
    <div
      className="relative flex-shrink-0 rounded-2xl"
      style={{
        width: 'clamp(280px, 38vw, 400px)',
        aspectRatio: '1 / 1',
        backgroundColor: '#1a1a2e',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: 'clamp(20px, 4vw, 32px)',
        boxSizing: 'border-box',
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Card header */}
      <div className="mb-3">
        <p
          className="text-2xs font-semibold uppercase tracking-widest"
          style={{ color: '#555570', letterSpacing: '0.18em' }}
        >
          Sample Scorecard
        </p>
        <p
          className="mt-1 font-semibold"
          style={{
            fontSize: '16px',
            color: '#f0f0f8',
            fontFamily: 'Satoshi, Inter, sans-serif',
            opacity: labelVisible ? 1 : 0,
            transition: `opacity ${LABEL_FADE}ms ease`,
            minHeight: '24px',
          }}
        >
          {labelText}
        </p>
      </div>

      {/* SVG Radar */}
      <svg
        viewBox="0 0 420 420"
        className="w-full"
        style={{ display: 'block', flex: '1 1 auto' }}
        aria-hidden="true"
      >
        {/* Concentric gridlines */}
        {gridLevels.map((level) => {
          const pts = Array.from({ length: n }, (_, i) => {
            const { x, y } = polarPoint((360 / n) * i, level, cx, cy, r)
            return `${x},${y}`
          }).join(" ")
          return (
            <polygon
              key={level}
              points={pts}
              fill="none"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="1"
            />
          )
        })}

        {/* Axis spokes */}
        {Array.from({ length: n }, (_, i) => {
          const { x, y } = polarPoint((360 / n) * i, 100, cx, cy, r)
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="1"
            />
          )
        })}

        {/* Data polygon — filled */}
        <polygon
          points={points}
          fill="rgba(124,126,184,0.18)"
          stroke="#7c7eb8"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Vertex dots */}
        {displayScores.map((score, i) => {
          const { x, y } = polarPoint((360 / n) * i, score, cx, cy, r)
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={3.5}
              fill="#7c7eb8"
            />
          )
        })}

        {/* Axis labels */}
        {RADAR_AXES.map((label, i) => {
          const angle = (360 / n) * i
          const { x, y } = polarPoint(angle, 100, cx, cy, labelR)
          // Anchor and offset based on horizontal position
          const isLeft  = x < cx - 10
          const isRight = x > cx + 10
          const anchor = isLeft ? 'end' : isRight ? 'start' : 'middle'
          // Small vertical nudge for top/bottom labels
          const dy = y < cy - 10 ? -6 : y > cy + 10 ? 14 : 5
          return (
            <text
              key={label}
              x={x}
              y={y + dy}
              textAnchor={anchor}
              fill="#555570"
              fontSize="9"
              fontFamily="Satoshi, Inter, sans-serif"
              fontWeight="600"
              letterSpacing="0.12em"
              style={{ textTransform: 'uppercase' }}
            >
              {label}
            </text>
          )
        })}
      </svg>

      {/* Caption */}
      <p
        className="mt-2 text-center"
        style={{
          fontSize: '11px',
          color: '#555570',
          fontFamily: 'Satoshi, Inter, sans-serif',
          letterSpacing: '0.08em',
          textTransform: 'uppercase' as const,
        }}
      >
        Cycling through sample profiles
      </p>
    </div>
  )
}

// ─── HeroSection ──────────────────────────────────────────────────────────────
const HeroSection = ({ onGetStarted }: { onGetStarted?: () => void }) => {
  const heroRef = useRef<HTMLElement | null>(null)
  const [{ x, y }, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const node = heroRef.current
    if (!node) return
    const handleMouseMove = (e: MouseEvent) => {
      const rect = node.getBoundingClientRect()
      setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }
    node.addEventListener("mousemove", handleMouseMove)
    return () => node.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <section
      ref={heroRef}
      id="hero-section"
      className="relative flex min-h-screen w-full items-center overflow-hidden"
      style={{
        backgroundColor: '#0f0f1a',
        paddingLeft:  'clamp(24px, 8vw, 80px)',
        paddingRight: 'clamp(24px, 8vw, 80px)',
        paddingTop: '96px',    // clear fixed header
        paddingBottom: '64px',
      }}
    >
      {/* Periwinkle radial glow — top center */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% -5%, rgba(124,126,184,0.13) 0%, transparent 70%)",
        }}
      />
      {/* Subtle bottom vignette */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-40"
        style={{
          background: "linear-gradient(to bottom, transparent, rgba(15,15,26,0.85))",
        }}
      />
      {/* Mouse-follow glow */}
      <motion.div
        className="pointer-events-none absolute h-72 w-72 rounded-full blur-3xl"
        style={{ backgroundColor: 'rgba(124,126,184,0.08)' }}
        animate={{ x: x - 144, y: y - 144 }}
        transition={{ type: "spring", damping: 35, stiffness: 180 }}
      />

      {/* Two-column layout */}
      <div
        className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center gap-16 lg:flex-row lg:items-center"
        style={{ gap: 'clamp(40px, 6vw, 64px)' }}
      >
        {/* ── LEFT COLUMN — Text content ── */}
        <div className="flex flex-1 flex-col items-start">
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-widest"
            style={{
              borderColor: 'rgba(124,126,184,0.35)',
              backgroundColor: 'rgba(124,126,184,0.10)',
              color: '#9496cc',
            }}
          >
            <BicepsFlexed className="h-3.5 w-3.5" />
            For Student Athletes
          </motion.div>

          {/* Primary headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            style={{
              fontSize: 'clamp(2.8rem, 6.5vw, 4.5rem)',
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontWeight: 700,
              color: '#f0f0f8',
              lineHeight: 1.02,
              letterSpacing: '-0.02em',
              marginTop: '24px',
            }}
          >
            Giving
            <br />
            athletes a voice.
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="font-medium uppercase tracking-[0.2em]"
            style={{ color: '#555570', fontSize: '13px', marginTop: '24px' }}
          >
            Rate.&nbsp;&nbsp;Review.&nbsp;&nbsp;Reform.
          </motion.p>

          {/* Supporting paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.42 }}
            style={{
              color: '#8888a8',
              fontSize: '18px',
              lineHeight: 1.5,
              marginTop: '32px',
              maxWidth: '480px',
              fontFamily: 'Satoshi, Inter, sans-serif',
            }}
          >
            Six-dimension scorecards. Verified reviews. Anonymous by default.
          </motion.p>

          {/* Primary CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            style={{ marginTop: '40px' }}
          >
            <button
              onClick={onGetStarted}
              className="group inline-flex items-center gap-3 rounded-xl px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all"
              style={{
                backgroundColor: '#7c7eb8',
                color: '#0f0f1a',
                boxShadow: '0 0 32px 0 rgba(124,126,184,0.30)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#9496cc'
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 40px 0 rgba(148,150,204,0.40)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#7c7eb8'
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 32px 0 rgba(124,126,184,0.30)'
              }}
            >
              Get Started
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </motion.div>
        </div>

        {/* ── RIGHT COLUMN — Radar chart card ── */}
        <motion.div
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
          className="flex w-full flex-shrink-0 justify-center lg:w-auto"
        >
          <HeroRadarCard />
        </motion.div>
      </div>
    </section>
  )
}

// ─── Sanctioning ticker ───────────────────────────────────────────────────────
const SanctioningBodiesSection = () => {
  const bodies = ["NCAA", "NAIA", "NJCAA", "CCCAA", "USCAA", "NWAC"]
  const repeated = [...bodies, ...bodies, ...bodies]

  return (
    <section
      className="relative w-full overflow-hidden py-8"
      style={{ borderTop: '1px solid #3a3a5c', backgroundColor: '#0f0f1a' }}
    >
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ["0%", "-33.333%"] }}
        transition={{ ease: "linear", duration: 18, repeat: Infinity }}
      >
        {repeated.map((name, i) => (
          <span
            key={i}
            className="mx-10 text-sm font-semibold uppercase tracking-[0.25em]"
            style={{ color: i % 6 === 0 ? '#7c7eb8' : '#3a3a5c' }}
          >
            {name}
          </span>
        ))}
      </motion.div>
    </section>
  )
}

// ─── Features ─────────────────────────────────────────────────────────────────
const FeaturesSection = () => (
  <section id="features" className="w-full px-6 py-28" style={{ backgroundColor: '#0f0f1a' }}>
    <div className="mx-auto max-w-6xl">
      <div className="mb-16">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: '#7c7eb8' }}>
          Platform
        </p>
        <h2
          className="leading-tight"
          style={{ ...serifStyle, fontSize: "clamp(2.5rem, 6vw, 4rem)", color: '#f0f0f8' }}
        >
          Built for{' '}
          <span style={{ fontStyle: 'normal', fontWeight: 900, letterSpacing: '-0.02em', fontFamily: 'Satoshi, Inter, sans-serif' }}>
            Champions
          </span>
        </h2>
      </div>

      {/* Grid with inner border lines — no outer border */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        style={{ gap: '1px', backgroundColor: '#3a3a5c' }}
      >
        {features.map(({ icon: Icon, title, description }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
            viewport={{ once: true }}
            className="group flex flex-col gap-4 p-8 transition-colors"
            style={{ backgroundColor: '#0f0f1a' }}
            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.backgroundColor = '#1a1a2e'}
            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.backgroundColor = '#0f0f1a'}
          >
            <div className="flex items-center gap-3">
              <div
                className="rounded-lg p-2.5"
                style={{
                  border: '1px solid rgba(124,126,184,0.20)',
                  backgroundColor: 'rgba(124,126,184,0.08)',
                }}
              >
                <Icon className="h-5 w-5" style={{ color: '#7c7eb8' }} />
              </div>
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#f0f0f8' }}>
              {title}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: '#555570' }}>{description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
)

// ─── Proof ────────────────────────────────────────────────────────────────────
const ProofSection = () => (
  <section id="proof" className="w-full px-6 py-28" style={{ backgroundColor: '#1a1a2e' }}>
    <div className="mx-auto max-w-6xl">
      <div className="mb-12">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: '#7c7eb8' }}>
          By the numbers
        </p>
        <h2
          className="leading-tight"
          style={{ ...serifStyle, fontSize: "clamp(2rem, 5vw, 3.5rem)", color: '#f0f0f8' }}
        >
          The numbers{' '}
          <span
            style={{ fontStyle: 'normal', fontWeight: 900, letterSpacing: '-0.02em', fontFamily: 'Satoshi, Inter, sans-serif', color: '#7c7eb8' }}
          >
            don't lie
          </span>
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed" style={{ color: '#555570' }}>
          Every number below is real data from our database — 1,086 schools, 19,081 sports programs across 6 sanctioning bodies.
        </p>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {proofStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-6"
            style={{ border: '1px solid #3a3a5c', backgroundColor: '#252540' }}
          >
            <p
              className="leading-none"
              style={{ ...serifStyle, fontSize: "clamp(2rem, 4vw, 2.75rem)", color: '#7c7eb8' }}
            >
              {stat.value}
            </p>
            <p className="mt-2 text-2xs font-semibold uppercase tracking-widest" style={{ color: '#555570' }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div
        className="rounded-2xl p-6 md:p-8"
        style={{ border: '1px solid #3a3a5c', backgroundColor: '#252540' }}
      >
        <p className="mb-6 text-xs font-semibold uppercase tracking-widest" style={{ color: '#555570' }}>
          Programs indexed · by sanctioning body
        </p>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={proofData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="colorAccent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c7eb8" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#7c7eb8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                stroke="transparent"
                tick={{ fill: '#555570', fontSize: 10, fontFamily: "Satoshi, sans-serif" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="transparent"
                tick={{ fill: '#555570', fontSize: 10, fontFamily: "Satoshi, sans-serif" }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a2e',
                  borderColor: '#3a3a5c',
                  borderRadius: '0.75rem',
                  color: '#7c7eb8',
                  fontSize: 12,
                  fontFamily: "Satoshi, sans-serif",
                }}
                cursor={{ stroke: '#3a3a5c', strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="programs"
                stroke="#7c7eb8"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#colorAccent)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  </section>
)

// ─── Testimonials ─────────────────────────────────────────────────────────────
const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = testimonials[activeIndex]

  useEffect(() => {
    const t = setInterval(() => setActiveIndex((i) => (i + 1) % testimonials.length), 6000)
    return () => clearInterval(t)
  }, [])

  return (
    <section
      id="athlete-voices"
      className="w-full px-6 py-28"
      style={{ scrollMarginTop: '80px', backgroundColor: '#0f0f1a' }}
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: '#7c7eb8' }}>
            Athlete Voices
          </p>
          <h2
            className="leading-tight"
            style={{ ...serifStyle, fontSize: "clamp(2rem, 5vw, 3.5rem)", color: '#f0f0f8' }}
          >
            What athletes are{' '}
            <span style={{ color: '#7c7eb8' }}>saying</span>
          </h2>
        </div>

        <div
          className="relative rounded-2xl px-8 py-12 text-center md:px-16"
          style={{ border: '1px solid #3a3a5c', backgroundColor: '#1a1a2e' }}
        >
          {/* Quote mark */}
          <div
            className="mb-6 text-6xl leading-none"
            style={{ ...serifStyle, color: 'rgba(124,126,184,0.35)' }}
            aria-hidden="true"
          >
            "
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active.name + active.designation}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
            >
              <p
                className="mx-auto max-w-2xl text-xl leading-relaxed md:text-2xl"
                style={{ ...serifStyle, color: '#f0f0f8' }}
              >
                {active.quote}
              </p>
              <div className="mt-8">
                <p className="text-sm font-bold uppercase tracking-wide" style={{ color: '#a8a8c0' }}>
                  {active.name}
                </p>
                <p className="mt-1 text-xs uppercase tracking-widest" style={{ color: '#555570' }}>
                  {active.designation}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="mt-10 flex items-center justify-center gap-6">
            <button
              onClick={() => setActiveIndex((i) => (i - 1 + testimonials.length) % testimonials.length)}
              className="rounded-full p-2.5 transition-colors"
              style={{ border: '1px solid #3a3a5c', backgroundColor: '#252540', color: '#8888a8' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(124,126,184,0.50)'
                ;(e.currentTarget as HTMLButtonElement).style.color = '#9496cc'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#3a3a5c'
                ;(e.currentTarget as HTMLButtonElement).style.color = '#8888a8'
              }}
              aria-label="Previous"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: i === activeIndex ? '1.5rem' : '0.375rem',
                    backgroundColor: i === activeIndex ? '#7c7eb8' : '#3a3a5c',
                  }}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={() => setActiveIndex((i) => (i + 1) % testimonials.length)}
              className="rounded-full p-2.5 transition-colors"
              style={{ border: '1px solid #3a3a5c', backgroundColor: '#252540', color: '#8888a8' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(124,126,184,0.50)'
                ;(e.currentTarget as HTMLButtonElement).style.color = '#9496cc'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#3a3a5c'
                ;(e.currentTarget as HTMLButtonElement).style.color = '#8888a8'
              }}
              aria-label="Next"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
const FooterSection = () => (
  <footer
    className="w-full"
    style={{ borderTop: '1px solid #3a3a5c', backgroundColor: '#0f0f1a' }}
  >
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-col items-center gap-6">
        {/* Wordmark */}
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5" style={{ color: '#7c7eb8' }} />
          <span
            className="text-2xl"
            style={{ ...serifStyle, color: '#f0f0f8' }}
          >
            The Locker Room
          </span>
        </div>

        <p className="max-w-sm text-center text-xs leading-relaxed" style={{ color: '#555570' }}>
          Empowering student athletes with transparency, data, and community.
          Your career, your choice.
        </p>

        {/* Social icons */}
        <div className="flex items-center gap-3">
          {socialLinks.map(({ label, href, d }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="flex h-9 w-9 items-center justify-center rounded-full transition-colors"
              style={{ border: '1px solid #3a3a5c', backgroundColor: '#1a1a2e', color: '#555570' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = '#4a4a70'
                ;(e.currentTarget as HTMLAnchorElement).style.color = '#9496cc'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = '#3a3a5c'
                ;(e.currentTarget as HTMLAnchorElement).style.color = '#555570'
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d={d} />
              </svg>
            </a>
          ))}
        </div>

        <div
          className="w-full pt-8 flex flex-col items-center gap-3"
          style={{ borderTop: '1px solid #1a1a2e' }}
        >
          <div className="flex items-center gap-6">
            <a href="/privacy" className="text-2xs font-semibold uppercase tracking-widest transition-colors" style={{ color: '#555570' }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#8888a8'}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#555570'}
            >Privacy Policy</a>
            <span style={{ color: '#3a3a5c' }}>·</span>
            <a href="/terms" className="text-2xs font-semibold uppercase tracking-widest transition-colors" style={{ color: '#555570' }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#8888a8'}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#555570'}
            >Terms of Service</a>
            <span style={{ color: '#3a3a5c' }}>·</span>
            <a href="mailto:contact@thelockerroom.app" className="text-2xs font-semibold uppercase tracking-widest transition-colors" style={{ color: '#555570' }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#8888a8'}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#555570'}
            >Contact</a>
          </div>
          <p className="text-2xs font-semibold uppercase tracking-widest" style={{ color: '#3a3a5c' }}>
            © 2026 The Locker Room. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  </footer>
)

// ─── Export ───────────────────────────────────────────────────────────────────
export const LandingPage = ({ onGetStarted }: LandingPageProps) => (
  <div className="w-full" style={{ backgroundColor: '#0f0f1a', color: '#f0f0f8' }}>
    <HeroSection onGetStarted={onGetStarted} />
    <SanctioningBodiesSection />
    <FeaturesSection />
    <ProofSection />
    <TestimonialsSection />
    <FooterSection />
  </div>
)

export default LandingPage
