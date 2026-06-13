import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

import {
  ChevronRight,
  Trophy,
} from "lucide-react"

// ─── Social icon paths ────────────────────────────────────────────────────────
const socialLinks = [
  { label: "Instagram", href: "https://instagram.com",  d: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" },
  { label: "Twitter/X",  href: "https://twitter.com",   d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.738-8.835L1.254 2.25H8.08l4.259 5.635L18.243 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  { label: "LinkedIn",   href: "https://linkedin.com",  d: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
]

const proofData = [
  { name: "NCAA D3", programs: 5100 },
  { name: "NCAA D1", programs: 3500 },
  { name: "NCAA D2", programs: 3400 },
  { name: "NAIA",    programs: 4200 },
  { name: "NJCAA",   programs: 2800 },
].sort((a, b) => b.programs - a.programs)

const proofStats = [
  { label: "Schools Indexed", value: "1,086" },
  { label: "Sports Programs", value: "19,000+" },
  { label: "Sanctioning Bodies", value: "6" },
  { label: "Sports Tracked", value: "90+" },
]



type LandingPageProps = {
  onGetStarted?: () => void
}

const serifStyle: React.CSSProperties = {
  fontFamily: "'Instrument Serif', Georgia, serif",
  fontStyle: "italic",
}

// ─── Palette constants ────────────────────────────────────────────────────────
const BG          = '#0A0E1A'
const SURFACE     = '#14151F'
const SURFACE2    = '#1E1F2E'
const BORDER      = '#2a2a3c'
const ACCENT      = '#14B8A6'
const ACCENT_GLOW = 'rgba(20,184,166,0.28)'
const ACCENT_HOVER= '#0d9488'
const CREAM       = '#F5EFE0'
const LAV         = '#9B97B5'   // lavender-quiet — charts ONLY
const LAV_FILL    = 'rgba(155,151,181,0.18)'
const TEXT        = '#f0f0f8'
const MUTED       = '#8888a8'
const DIM         = '#555570'

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

function polarPoint(
  angleDeg: number,
  value: number,
  cx: number,
  cy: number,
  r: number,
): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180
  const d = (value / 100) * r
  return { x: cx + d * Math.cos(rad), y: cy + d * Math.sin(rad) }
}

function axisAngle(i: number, n: number): number {
  return -90 + (360 / n) * i
}

function buildPoints(scores: number[], cx: number, cy: number, r: number): string {
  const n = scores.length
  return scores
    .map((s, i) => {
      const { x, y } = polarPoint(axisAngle(i, n), s, cx, cy, r)
      return `${x},${y}`
    })
    .join(" ")
}

function lerpScores(a: number[], b: number[], t: number): number[] {
  return a.map((v, i) => v + (b[i] - v) * t)
}

const CYCLE_HOLD = 4000
const MORPH_DURATION = 800
const MORPH_STEPS = 40
const LABEL_FADE = 200

const HeroRadarCard = () => {
  const n = RADAR_AXES.length
  const cx = 170
  const cy = 170
  const r = 88
  const labelR = 114
  const gridLevels = [20, 40, 60, 80, 100]

  const [profileIdx, setProfileIdx] = useState(0)
  const [displayScores, setDisplayScores] = useState(RADAR_PROFILES[0].scores)
  const [outgoingLabel, setOutgoingLabel] = useState<string | null>(null)
  const [incomingLabel, setIncomingLabel] = useState(RADAR_PROFILES[0].label)
  const [crossfading, setCrossfading] = useState(false)
  const [paused, setPaused] = useState(false)

  const pausedRef = useRef(false)
  const profileIdxRef = useRef(0)

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
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
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
        if (pausedRef.current) { cycle(); return }

        const fromIdx = profileIdxRef.current
        const nextIdx = (fromIdx + 1) % RADAR_PROFILES.length

        setOutgoingLabel(RADAR_PROFILES[fromIdx].label)
        setIncomingLabel(RADAR_PROFILES[nextIdx].label)
        setCrossfading(true)

        frameId = setTimeout(() => {
          setCrossfading(false)
          setOutgoingLabel(null)
          setProfileIdx(nextIdx)
          startMorph(fromIdx, nextIdx)
          cycle()
        }, LABEL_FADE * 2)
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
        backgroundColor: SURFACE,
        border: '1px solid rgba(255,255,255,0.08)',
        padding: 'clamp(20px, 4vw, 32px)',
        boxSizing: 'border-box',
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <motion.div
        className="mb-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
      >
        <p
          className="text-2xs font-semibold uppercase tracking-widest"
          style={{ color: DIM, letterSpacing: '0.18em' }}
        >
          Sample Scorecard
        </p>
        <div className="relative mt-1" style={{ minHeight: '24px' }}>
          {outgoingLabel !== null && (
            <p
              className="absolute inset-0 font-semibold"
              style={{
                fontSize: '16px',
                color: CREAM,
                fontFamily: 'Satoshi, Inter, sans-serif',
                opacity: crossfading ? 0 : 1,
                transition: `opacity ${LABEL_FADE}ms ease`,
                pointerEvents: 'none',
              }}
            >
              {outgoingLabel}
            </p>
          )}
          <p
            className="font-semibold"
            style={{
              fontSize: '16px',
              color: CREAM,
              fontFamily: 'Satoshi, Inter, sans-serif',
              opacity: crossfading ? 1 : (outgoingLabel !== null ? 0 : 1),
              transition: `opacity ${LABEL_FADE}ms ease`,
            }}
          >
            {incomingLabel}
          </p>
        </div>
      </motion.div>

      <svg
        viewBox="0 0 340 340"
        className="w-full"
        style={{ display: 'block', flex: '1 1 auto', overflow: 'visible' }}
        overflow="visible"
        aria-hidden="true"
      >
        {gridLevels.map((level) => {
          const pts = Array.from({ length: n }, (_, i) => {
            const { x, y } = polarPoint(axisAngle(i, n), level, cx, cy, r)
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

        {Array.from({ length: n }, (_, i) => {
          const { x, y } = polarPoint(axisAngle(i, n), 100, cx, cy, r)
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

        {/* Data polygon — lavender-quiet fill + stroke (charts ONLY) */}
        <polygon
          points={points}
          fill={LAV_FILL}
          stroke={LAV}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Vertex dots — lavender-quiet */}
        {displayScores.map((score, i) => {
          const { x, y } = polarPoint(axisAngle(i, n), score, cx, cy, r)
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={3.5}
              fill={LAV}
            />
          )
        })}

        {RADAR_AXES.map((label, i) => {
          const { x, y } = polarPoint(axisAngle(i, n), 100, cx, cy, labelR)
          const isLeft  = x < cx - 10
          const isRight = x > cx + 10
          const anchor = isLeft ? 'end' : isRight ? 'start' : 'middle'
          const dy = y < cy - 10 ? -6 : y > cy + 10 ? 14 : 5
          return (
            <text
              key={label}
              x={x}
              y={y + dy}
              textAnchor={anchor}
              fill={DIM}
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

      <p
        className="mt-2 text-center"
        style={{
          fontSize: '11px',
          color: DIM,
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
        backgroundColor: BG,
        paddingLeft:  'clamp(24px, 8vw, 80px)',
        paddingRight: 'clamp(24px, 8vw, 80px)',
        paddingTop: '96px',
        paddingBottom: '64px',
      }}
    >
      {/* Teal radial glow — top center */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% -5%, rgba(20,184,166,0.09) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-40"
        style={{
          background: `linear-gradient(to bottom, transparent, rgba(10,14,26,0.85))`,
        }}
      />
      <motion.div
        className="pointer-events-none absolute h-72 w-72 rounded-full blur-3xl"
        style={{ backgroundColor: 'rgba(20,184,166,0.06)' }}
        animate={{ x: x - 144, y: y - 144 }}
        transition={{ type: "spring", damping: 35, stiffness: 180 }}
      />

      <div
        className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center lg:grid-cols-2 lg:items-center"
        style={{ gap: '64px' }}
      >
        {/* LEFT — Text content */}
        <div className="flex flex-col items-start justify-center">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: 'clamp(2.4rem, 5vw, 4rem)',
              fontWeight: 700,
              color: ACCENT,
              letterSpacing: '-0.02em',
              lineHeight: 1.02,
              marginBottom: '20px',
            }}
          >
            Rate. Review. Reform.
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontWeight: 700,
              color: CREAM,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            Committed to giving athletes a voice,{' '}
            <span style={{ color: CREAM, opacity: 0.38 }}>anonymously</span>
          </motion.h2>

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
                backgroundColor: ACCENT,
                color: BG,
                boxShadow: `0 0 32px 0 ${ACCENT_GLOW}`,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = ACCENT_HOVER
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 40px 0 rgba(20,184,166,0.40)`
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = ACCENT
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 32px 0 ${ACCENT_GLOW}`
              }}
            >
              Get Started
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </motion.div>
        </div>

        {/* RIGHT — Radar chart card */}
        <motion.div
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
          className="flex items-center justify-center"
        >
          <HeroRadarCard />
        </motion.div>
      </div>

      {/* Sanctioning bodies ticker — full width, below CTA + radar */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <SanctioningBodiesSection />
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
      style={{ borderTop: `1px solid ${BORDER}`, backgroundColor: BG }}
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
            style={{ color: i % 6 === 0 ? ACCENT : BORDER }}
          >
            {name}
          </span>
        ))}
      </motion.div>
    </section>
  )
}

// ─── Feature card UI fragments ───────────────────────────────────────────────

/** Fragment 1 — ATHLETE SCORECARD: mini radar + score + breakdown */
const ScorecardFragment = () => {
  const cx = 120, cy = 96, r = 58, labelR = 86
  const scores = [82, 77, 88, 74, 91, 79]
  const n = 6
  const axisAngle = (i: number) => -90 + (360 / n) * i
  const polar = (angleDeg: number, value: number, radius: number) => {
    const rad = (angleDeg * Math.PI) / 180
    const d = (value / 100) * radius
    return { x: cx + d * Math.cos(rad), y: cy + d * Math.sin(rad) }
  }
  const points = scores
    .map((s, i) => { const p = polar(axisAngle(i), s, r); return `${p.x},${p.y}` })
    .join(' ')
  const gridLevels = [25, 50, 75, 100]
  const categories = ['FACILITIES', 'COACHING', 'BALANCE', 'SUPPORT', 'CULTURE', 'EQUITY']
  const breakdown = [
    { label: 'Coaching',   val: '4.6' },
    { label: 'Culture',    val: '4.4' },
    { label: 'Facilities', val: '4.1' },
  ]
  return (
    <div
      className="flex flex-col gap-3 rounded-xl p-4"
      style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-start gap-4">
        <svg
          viewBox="0 0 240 200"
          width="150"
          height="125"
          overflow="visible"
          aria-hidden="true"
          style={{ flexShrink: 0 }}
        >
          {gridLevels.map((level) => {
            const pts = Array.from({ length: n }, (_, i) => {
              const p = polar(axisAngle(i), level, r)
              return `${p.x},${p.y}`
            }).join(' ')
            return <polygon key={level} points={pts} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          })}
          {Array.from({ length: n }, (_, i) => {
            const p = polar(axisAngle(i), 100, r)
            return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          })}
          <polygon points={points} fill="rgba(155,151,181,0.15)" stroke="#9B97B5" strokeWidth="1.5" strokeLinejoin="round" strokeOpacity="1" />
          {scores.map((s, i) => {
            const p = polar(axisAngle(i), s, r)
            return <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#9B97B5" />
          })}
          {categories.map((label, i) => {
            const p = polar(axisAngle(i), 100, labelR)
            const isLeft = p.x < cx - 10, isRight = p.x > cx + 10
            const anchor = isLeft ? 'end' : isRight ? 'start' : 'middle'
            const dy = p.y < cy - 10 ? -5 : p.y > cy + 10 ? 12 : 5
            return (
              <text
                key={label}
                x={p.x}
                y={p.y + dy}
                textAnchor={anchor}
                fill="#555570"
                fontSize="8"
                fontFamily="Satoshi, Inter, sans-serif"
                fontWeight="600"
                letterSpacing="0.08em"
              >
                {label}
              </text>
            )
          })}
        </svg>
        <div className="flex flex-col justify-center gap-1 pt-1">
          <p style={{ fontSize: '32px', fontFamily: "'Instrument Serif', Georgia, serif", color: '#F5EFE0', lineHeight: 1, letterSpacing: '-0.02em' }}>
            82<span style={{ fontSize: '14px', color: '#555570', fontFamily: 'Satoshi, Inter, sans-serif', fontWeight: 600 }}>/100</span>
          </p>
          <p style={{ fontSize: '9px', color: '#555570', fontFamily: 'Satoshi, Inter, sans-serif', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            Overall
          </p>
          <div className="mt-2 flex flex-col gap-1.5">
            {breakdown.map(({ label, val }) => (
              <div key={label} className="flex items-center gap-2">
                <span style={{ width: '52px', fontSize: '9px', color: '#555570', fontFamily: 'Satoshi, Inter, sans-serif', fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase' }}>
                  {label}
                </span>
                <div style={{ flex: 1, height: '4px', borderRadius: '2px', backgroundColor: 'rgba(255,255,255,0.07)' }}>
                  <div style={{ width: `${(parseFloat(val) / 5) * 100}%`, height: '100%', borderRadius: '2px', backgroundColor: '#14B8A6' }} />
                </div>
                <span style={{ fontSize: '10px', color: '#14B8A6', fontFamily: 'Satoshi, Inter, sans-serif', fontWeight: 800, minWidth: '24px', textAlign: 'right' }}>
                  {val}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Fragment 2 — VERIFIED REVIEWS */
const VerifiedReviewFragment = () => (
  <div
    className="flex flex-col gap-3 rounded-xl p-3"
    style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
  >
    <div className="flex items-center gap-1.5">
      <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
        <path d="M6 0L7.5 4.5H12L8.25 7.5 9.75 12 6 9 2.25 12 3.75 7.5 0 4.5H4.5Z" fill="#14B8A6" />
      </svg>
      <span style={{ fontSize: '9px', color: '#14B8A6', fontFamily: 'Satoshi, Inter, sans-serif', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
        Verified Athlete
      </span>
    </div>
    <div className="flex flex-col gap-1.5">
      {[100, 88, 72].map((w, i) => (
        <div key={i} style={{ height: '7px', width: `${w}%`, borderRadius: '3px', backgroundColor: 'rgba(255,255,255,0.08)' }} />
      ))}
    </div>
    <div className="flex items-center gap-1 mt-1">
      {[1,2,3,4,5].map((s) => (
        <svg key={s} viewBox="0 0 10 10" width="11" height="11" aria-hidden="true">
          <polygon points="5,0.5 6.5,3.8 10,4.2 7.5,6.5 8.2,10 5,8.2 1.8,10 2.5,6.5 0,4.2 3.5,3.8" fill={s <= 4 ? '#14B8A6' : 'rgba(255,255,255,0.12)'} />
        </svg>
      ))}
      <span style={{ marginLeft: '4px', fontSize: '9px', color: '#555570', fontFamily: 'Satoshi, Inter, sans-serif', fontWeight: 600 }}>4.0</span>
    </div>
  </div>
)

/** Fragment 3 — COLLEGE COMPARISON */
const ComparisonFragment = () => {
  const cx = 80, cy = 72, r = 44, n = 6
  const axisAngle = (i: number) => -90 + (360 / n) * i
  const polar = (angleDeg: number, value: number, radius: number) => {
    const rad = (angleDeg * Math.PI) / 180
    const d = (value / 100) * radius
    return { x: cx + d * Math.cos(rad), y: cy + d * Math.sin(rad) }
  }
  const makePoints = (scores: number[]) =>
    scores.map((s, i) => { const p = polar(axisAngle(i), s, r); return `${p.x},${p.y}` }).join(' ')
  const scoresA = [78, 82, 75, 80, 85, 77]
  const scoresB = [95, 88, 45, 60, 55, 30]
  const gridLevels = [33, 66, 100]

  return (
    <div
      className="flex flex-col items-center gap-2 rounded-xl p-3"
      style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <svg viewBox="0 0 160 144" width="130" height="117" overflow="visible" aria-hidden="true">
        {gridLevels.map((lvl) => {
          const pts = Array.from({ length: n }, (_, i) => {
            const p = polar(axisAngle(i), lvl, r)
            return `${p.x},${p.y}`
          }).join(' ')
          return <polygon key={lvl} points={pts} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
        })}
        {Array.from({ length: n }, (_, i) => {
          const p = polar(axisAngle(i), 100, r)
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
        })}
        <polygon points={makePoints(scoresA)} fill="rgba(155,151,181,0.35)" stroke="#9B97B5" strokeWidth="1.5" strokeLinejoin="round" strokeOpacity="1" />
        <polygon points={makePoints(scoresB)} fill="rgba(245,239,224,0.25)" stroke="#F5EFE0" strokeWidth="1.5" strokeLinejoin="round" strokeOpacity="0.70" />
      </svg>
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#9B97B5', flexShrink: 0, display: 'inline-block' }} />
          <span style={{ fontSize: '8px', color: '#555570', fontFamily: 'Satoshi, Inter, sans-serif', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Program A</span>
        </span>
        <span className="flex items-center gap-1">
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F5EFE0', flexShrink: 0, display: 'inline-block' }} />
          <span style={{ fontSize: '8px', color: '#555570', fontFamily: 'Satoshi, Inter, sans-serif', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Program B</span>
        </span>
      </div>
    </div>
  )
}

/** Fragment 4 — GENDER EQUITY */
const GenderEquityFragment = () => {
  const bars = [
    { label: 'M', pct: 58, color: '#14B8A6' },
    { label: 'W', pct: 82, color: '#F5EFE0' },
  ]
  return (
    <div
      className="flex flex-col gap-3 rounded-xl px-4 py-3"
      style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {bars.map(({ label, pct, color }) => (
        <div key={label} className="flex items-center gap-3">
          <span style={{ width: '14px', fontSize: '10px', fontFamily: 'Satoshi, Inter, sans-serif', fontWeight: 800, color: '#555570', letterSpacing: '0.12em' }}>
            {label}
          </span>
          <div style={{ flex: 1, height: '8px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.07)' }}>
            <div style={{ width: `${pct}%`, height: '100%', borderRadius: '4px', backgroundColor: color }} />
          </div>
          <span style={{ fontSize: '10px', fontFamily: 'Satoshi, Inter, sans-serif', fontWeight: 700, color, minWidth: '28px', textAlign: 'right' }}>
            {pct}%
          </span>
        </div>
      ))}
      <p style={{ fontSize: '9px', color: '#555570', fontFamily: 'Satoshi, Inter, sans-serif', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '2px' }}>
        Equity index
      </p>
    </div>
  )
}

/** Fragment 5 — TEAM CULTURE */
const CultureFragment = () => {
  const lines = [
    { text: 'INCLUSIVE · INTENSE',       color: '#F5EFE0', size: '14px', weight: 600 },
    { text: 'SUPPORTIVE · COMPETITIVE',  color: '#8888a8', size: '13px', weight: 500 },
    { text: 'DRIVEN · TIGHT-KNIT',       color: '#555570', size: '12px', weight: 500 },
  ]
  return (
    <div
      className="rounded-xl px-4 py-3"
      style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.7 }}>
        {lines.map(({ text, color, size, weight }) => (
          <span
            key={text}
            style={{
              fontFamily: 'Satoshi, Inter, sans-serif',
              fontSize: size,
              fontWeight: weight,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color,
            }}
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  )
}

/** Fragment 6 — ANONYMOUS BY DEFAULT */
const AnonymousFragment = () => (
  <div
    className="flex flex-col items-center gap-2.5 rounded-xl py-3 px-4"
    style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
  >
    <svg viewBox="0 0 60 52" width="60" height="52" aria-hidden="true">
      <circle cx="30" cy="14" r="12" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
      <rect x="22" y="7" width="16" height="14" rx="2" fill="#14B8A6" opacity="0.85" />
      {[0,1,2,3].map(i => (
        <line key={`v${i}`} x1={22 + i * 4} y1="7" x2={22 + i * 4} y2="21" stroke="rgba(10,14,26,0.6)" strokeWidth="0.8" />
      ))}
      {[0,1,2,3].map(i => (
        <line key={`h${i}`} x1="22" y1={7 + i * 3.5} x2="38" y2={7 + i * 3.5} stroke="rgba(10,14,26,0.6)" strokeWidth="0.8" />
      ))}
      <path d="M10 52 Q10 32 30 30 Q50 32 50 52" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
    </svg>
    <div className="flex flex-col gap-1.5 w-full">
      {[100, 80, 62].map((w, i) => (
        <div key={i} className="relative" style={{ height: '7px', width: `${w}%`, borderRadius: '3px', backgroundColor: 'rgba(255,255,255,0.08)' }}>
          {i < 2 && (
            <div style={{ position: 'absolute', inset: 0, borderRadius: '3px', backgroundColor: 'rgba(10,14,26,0.7)' }} />
          )}
        </div>
      ))}
    </div>
  </div>
)

// ─── Feature data ─────────────────────────────────────────────────────────────
const FEATURE_DATA = [
  {
    id: 'scorecard',
    title: 'Athlete Scorecard',
    description: 'Every program gets a six-dimension score. Recruits compare at a glance.',
    fragment: <ScorecardFragment />,
    featured: true,
  },
  {
    id: 'reviews',
    title: 'Verified Reviews',
    description: 'Only verified .edu athletes can post. Every submission is checked against roster evidence.',
    fragment: <VerifiedReviewFragment />,
  },
  {
    id: 'comparison',
    title: 'College Comparison',
    description: 'Side-by-side radar charts across up to four programs. Find the right fit before committing.',
    fragment: <ComparisonFragment />,
  },
  {
    id: 'equity',
    title: 'Gender Equity Ratings',
    description: "A dedicated equity dimension surfaces how programs treat men's and women's teams differently.",
    fragment: <GenderEquityFragment />,
  },
  {
    id: 'culture',
    title: 'Team Culture',
    description: 'Athletes describe the room — inclusive, intense, supportive, competitive. The words that don\'t show up in the brochure.',
    fragment: <CultureFragment />,
  },
  {
    id: 'anonymous',
    title: 'Anonymous by Default',
    description: 'All reviews are anonymous. Athletes can speak freely without fear of staff retaliation.',
    fragment: <AnonymousFragment />,
  },
]

const cardBase: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,0.07)',
  backgroundColor: 'rgba(255,255,255,0.03)',
  borderRadius: '16px',
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
}

// ─── FeaturesSection ──────────────────────────────────────────────────────────
const FeaturesSection = () => {
  const [featured, ...rest] = FEATURE_DATA

  return (
    <section id="features" className="w-full px-6 py-28" style={{ backgroundColor: BG }}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-14">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: ACCENT }}>
            Platform
          </p>
          <h2
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              color: CREAM,
              lineHeight: 1.05,
              letterSpacing: '-0.01em',
            }}
          >
            What you actually get.
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0 }}
          viewport={{ once: true }}
          style={{ ...cardBase, marginBottom: '24px' }}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
            <div className="lg:w-[55%] flex-shrink-0">
              {featured.fragment}
            </div>
            <div className="flex flex-col justify-center gap-3 lg:pt-2">
              <p
                style={{
                  fontSize: '11px',
                  fontFamily: 'Satoshi, Inter, sans-serif',
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: CREAM,
                }}
              >
                {featured.title}
              </p>
              <p
                style={{
                  fontSize: '13px',
                  fontFamily: 'Satoshi, Inter, sans-serif',
                  color: MUTED,
                  lineHeight: 1.6,
                  maxWidth: '320px',
                }}
              >
                {featured.description}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5" style={{ gap: '24px' }}>
          {rest.map((feature, i) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              viewport={{ once: true }}
              style={cardBase}
            >
              <div>{feature.fragment}</div>
              <p
                style={{
                  fontSize: '11px',
                  fontFamily: 'Satoshi, Inter, sans-serif',
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: CREAM,
                }}
              >
                {feature.title}
              </p>
              <p
                style={{
                  fontSize: '12px',
                  fontFamily: 'Satoshi, Inter, sans-serif',
                  color: MUTED,
                  lineHeight: 1.55,
                }}
              >
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Proof ────────────────────────────────────────────────────────────────────
const ProofSection = () => (
  <section id="proof" className="w-full px-6 py-28" style={{ backgroundColor: BG }}>
    <div className="mx-auto max-w-6xl">
      <div className="mb-12">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: ACCENT }}>
          By the numbers
        </p>
        <h2
          className="leading-tight"
          style={{ ...serifStyle, fontSize: "clamp(2rem, 5vw, 3.5rem)", color: CREAM }}
        >
          The numbers{' '}
          <span
            style={{ fontStyle: 'normal', fontWeight: 900, letterSpacing: '-0.02em', fontFamily: 'Satoshi, Inter, sans-serif', color: ACCENT }}
          >
            don't lie
          </span>
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed" style={{ color: DIM }}>
          Every number below is real data from our database — 1,086 schools, 19,081 sports programs across 6 sanctioning bodies.
        </p>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {proofStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-6"
            style={{ border: `1px solid ${BORDER}`, backgroundColor: SURFACE2 }}
          >
            <p
              className="leading-none"
              style={{ ...serifStyle, fontSize: "clamp(2rem, 4vw, 2.75rem)", color: CREAM }}
            >
              {stat.value}
            </p>
            <p className="mt-2 text-2xs font-semibold uppercase tracking-widest" style={{ color: DIM }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div
        className="rounded-2xl p-6 md:p-8"
        style={{ border: `1px solid ${BORDER}`, backgroundColor: SURFACE }}
      >
        <p className="mb-6 text-xs font-semibold uppercase tracking-widest" style={{ color: DIM }}>
          Programs indexed · by sanctioning body
        </p>
        <div className="flex flex-col gap-3">
          {proofData.map((row) => {
            const pct = (row.programs / proofData[0].programs) * 100
            return (
              <div key={row.name} className="flex items-center gap-3">
                <span
                  style={{
                    fontFamily: 'Satoshi, Inter, sans-serif',
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: DIM,
                    width: '72px',
                    flexShrink: 0,
                    textAlign: 'right',
                  }}
                >
                  {row.name}
                </span>
                <div className="flex-1 rounded-full overflow-hidden" style={{ height: '8px', backgroundColor: SURFACE2 }}>
                  <div
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      backgroundColor: LAV,
                      borderRadius: '9999px',
                    }}
                  />
                </div>
                <span
                  style={{
                    fontFamily: 'Satoshi, Inter, sans-serif',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: CREAM,
                    width: '48px',
                    flexShrink: 0,
                  }}
                >
                  {row.programs.toLocaleString()}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  </section>
)

// ─── Founder Manifesto ────────────────────────────────────────────────────────
const FounderManifestoSection = () => {
  const bodyStyle: React.CSSProperties = {
    fontFamily: "'Instrument Serif', Georgia, serif",
    color: CREAM,
    lineHeight: 1.5,
    maxWidth: '720px',
  }

  return (
    <section id="founder-manifesto" style={{ scrollMarginTop: '80px', backgroundColor: BG }}>
      <style>{`
        @media (min-width: 1024px) {
          .manifesto-section-inner { padding: 96px 24px; }
          .manifesto-body { font-size: 25px; }
          .manifesto-question-wrap { padding-left: 44px; }
          .manifesto-question-bar { left: 0; }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .manifesto-section-inner { padding: 80px 24px; max-width: 90%; }
          .manifesto-body { font-size: 21px; }
          .manifesto-question-wrap { padding-left: 36px; }
          .manifesto-question-bar { left: 0; }
        }
        @media (max-width: 767px) {
          .manifesto-section-inner { padding: 64px 20px; max-width: 92%; }
          .manifesto-body { font-size: 18px; }
          .manifesto-question-wrap { padding-left: 28px; }
          .manifesto-question-bar { left: 0; }
        }
      `}</style>

      <div className="manifesto-section-inner mx-auto" style={{ maxWidth: '720px' }}>
        <p
          style={{
            color: ACCENT,
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontFamily: 'Satoshi, Inter, sans-serif',
            marginBottom: '24px',
          }}
        >
          From the Founder
        </p>

        <h2
          style={{
            ...serifStyle,
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            color: CREAM,
            lineHeight: 1.02,
            letterSpacing: '-0.02em',
            marginBottom: '48px',
          }}
        >
          Why this exists.
        </h2>

        <p className="manifesto-body" style={bodyStyle}>
          Every recruit asks different questions on their visits, yet most of them get recycled uninformative answers. When they show up ready to take on the world, the reality wasn't all it was chalked up to be. The information that athletes need is usually nothing like what they are told.
        </p>

        <div className="manifesto-question-wrap" style={{ marginTop: '24px', position: 'relative' }}>
          <div
            className="manifesto-question-bar"
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: '3px',
              backgroundColor: ACCENT,
              borderRadius: '2px',
            }}
          />
          <p className="manifesto-body" style={{ ...bodyStyle, fontStyle: 'italic' }}>
            What happens when you get injured?
          </p>
          <p className="manifesto-body" style={{ ...bodyStyle, fontStyle: 'italic', marginTop: '16px' }}>
            Are men and women treated the same?
          </p>
        </div>

        <p className="manifesto-body" style={{ ...bodyStyle, marginTop: '24px' }}>
          The Locker Room is where those answers live.
        </p>

        <p
          style={{
            marginTop: '32px',
            fontFamily: 'Satoshi, Inter, sans-serif',
            fontSize: '12px',
            fontWeight: 500,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: DIM,
          }}
        >
          — The Founder · The Locker Room
        </p>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
const FooterSection = () => (
  <footer className="w-full" style={{ borderTop: `1px solid ${BORDER}`, backgroundColor: BG }}>
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5" style={{ color: ACCENT }} />
          <span className="text-2xl" style={{ ...serifStyle, color: CREAM }}>
            The Locker Room
          </span>
        </div>

        <p className="max-w-sm text-center text-xs leading-relaxed" style={{ color: DIM }}>
          Empowering student athletes with transparency, data, and community.
          Your career, your choice.
        </p>

        <div className="flex items-center gap-3">
          {socialLinks.map(({ label, href, d }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="flex h-9 w-9 items-center justify-center rounded-full transition-colors"
              style={{ border: `1px solid ${BORDER}`, backgroundColor: SURFACE, color: DIM }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = `rgba(20,184,166,0.40)`
                ;(e.currentTarget as HTMLAnchorElement).style.color = ACCENT
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = BORDER
                ;(e.currentTarget as HTMLAnchorElement).style.color = DIM
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d={d} />
              </svg>
            </a>
          ))}
        </div>

        <div className="w-full pt-8 flex flex-col items-center gap-3" style={{ borderTop: `1px solid ${SURFACE}` }}>
          <div className="flex items-center gap-6">
            <a href="/privacy" className="text-2xs font-semibold uppercase tracking-widest transition-colors" style={{ color: DIM }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = MUTED}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = DIM}
            >Privacy Policy</a>
            <span style={{ color: BORDER }}>·</span>
            <a href="/terms" className="text-2xs font-semibold uppercase tracking-widest transition-colors" style={{ color: DIM }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = MUTED}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = DIM}
            >Terms of Service</a>
            <span style={{ color: BORDER }}>·</span>
            <a href="mailto:contact@thelockerroom.app" className="text-2xs font-semibold uppercase tracking-widest transition-colors" style={{ color: DIM }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = MUTED}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = DIM}
            >Contact</a>
          </div>
          <p className="text-2xs font-semibold uppercase tracking-widest" style={{ color: BORDER }}>
            © 2026 The Locker Room. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  </footer>
)

// ─── Export ───────────────────────────────────────────────────────────────────
export const LandingPage = ({ onGetStarted }: LandingPageProps) => (
  <div className="w-full" style={{ backgroundColor: BG, color: TEXT }}>
    <HeroSection onGetStarted={onGetStarted} />
    <FeaturesSection />
    <ProofSection />
    <FounderManifestoSection />
    <FooterSection />
  </div>
)

export default LandingPage
