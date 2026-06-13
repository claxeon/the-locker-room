/**
 * LandingPage.tsx — The Locker Room
 *
 * Award-level experience:
 *  - Three.js particle network hero (HeroCanvas)
 *  - GSAP ScrollTrigger on every section
 *  - Interactive feature tabs with live mini-demos
 *  - Animated stat counters
 *  - Pinned "How It Works" sequence
 *  - Framer Motion micro-interactions
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { HeroCanvas } from './HeroCanvas'

gsap.registerPlugin(ScrollTrigger)

// ─── Palette ─────────────────────────────────────────────────────────────────
const BG      = '#0A0E1A'
const SURFACE = '#14151F'
const BORDER  = '#2a2a3c'
const ACCENT  = '#14B8A6'
const CREAM   = '#F5EFE0'
const LAV     = '#9B97B5'
const TEXT    = '#f0f0f8'
const MUTED   = '#8888a8'
const DIM     = '#555570'

// ─── Typography helpers ───────────────────────────────────────────────────────
const serif = (extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: "'Instrument Serif', Georgia, serif",
  ...extra,
})
const mono = (extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: "'Satoshi', 'Inter', sans-serif",
  ...extra,
})

// ─── Social icon paths ────────────────────────────────────────────────────────
const socialLinks = [
  { label: 'Instagram', href: 'https://instagram.com/thelockerroom.tlr', d: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
  { label: 'Twitter/X', href: 'https://twitter.com/lockerroomtlr', d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.738-8.835L1.254 2.25H8.08l4.259 5.635L18.243 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
  { label: 'LinkedIn',  href: 'https://linkedin.com', d: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
]

// ─── Radar helpers ────────────────────────────────────────────────────────────
const RADAR_AXES = ['FACILITIES', 'COACHING', 'LIFE BALANCE', 'ACADEMIC SUPPORT', 'TEAM CULTURE', 'GENDER EQUITY']
const n = RADAR_AXES.length
const cx = 120, cy = 110, r = 70, labelR = 95

function axisAngle(i: number) { return (i / n) * 360 - 90 }
function polar(deg: number, pct: number, radius: number, ox: number, oy: number) {
  const rad = (deg * Math.PI) / 180
  return { x: ox + (pct / 100) * radius * Math.cos(rad), y: oy + (pct / 100) * radius * Math.sin(rad) }
}
function radarPoints(scores: number[]) {
  return scores.map((s, i) => {
    const p = polar(axisAngle(i), s, r, cx, cy)
    return `${p.x},${p.y}`
  }).join(' ')
}

// ─── Radar profiles ───────────────────────────────────────────────────────────
const PROGRAMS = [
  { label: 'BALANCED PROGRAM',      scores: [78, 82, 75, 80, 85, 77], color: ACCENT },
  { label: 'ELITE FACILITIES',      scores: [95, 88, 45, 58, 55, 30], color: '#f59e0b' },
  { label: 'CULTURE-FIRST PROGRAM', scores: [58, 91, 88, 76, 97, 86], color: LAV },
]

// ─── Proof stats ──────────────────────────────────────────────────────────────
const STATS = [
  { value: 1086,  suffix: '',  label: 'Schools Indexed' },
  { value: 19000, suffix: '+', label: 'Programs Tracked' },
  { value: 6,     suffix: '',  label: 'Sanctioning Bodies' },
  { value: 90,    suffix: '+', label: 'Sports Covered' },
]

// ─── Feature tabs ─────────────────────────────────────────────────────────────
const FEATURES = [
  {
    id: 'scorecard',
    label: 'Athlete Scorecard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    headline: 'Six dimensions. One score.',
    body: 'Every program is rated across Facilities, Coaching, Life Balance, Academic Support, Team Culture, and Gender Equity — giving recruits a complete picture no brochure will give them.',
  },
  {
    id: 'verified',
    label: 'Verified Reviews',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      </svg>
    ),
    headline: 'Real athletes. Real experiences.',
    body: 'Every reviewer authenticates with a .edu email and team verification. No coaches. No recruits. No institutions. Just honest first-person accounts from current and former student athletes.',
  },
  {
    id: 'compare',
    label: 'Side-by-Side Compare',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1"/>
      </svg>
    ),
    headline: 'Compare up to 4 programs.',
    body: 'Put Division I powerhouses next to DIII hidden gems. Our comparison engine overlays scorecards, review sentiment, and equity metrics so you can make an informed decision.',
  },
  {
    id: 'equity',
    label: 'Gender Equity Lens',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="8" r="5"/><path d="M12 13v8M9 18h6"/>
      </svg>
    ),
    headline: 'Transparency on equity.',
    body: 'Title IX should be more than a checkbox. Our gender equity score blends athlete-reported access to facilities, support staff, travel budgets, and medical care — for every single program.',
  },
]

// ─── Magnetic button hook ──────────────────────────────────────────────────────
function useMagnetic(strength = 0.35) {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 200, damping: 20 })
  const springY = useSpring(y, { stiffness: 200, damping: 20 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    function onMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect()
      const dx = e.clientX - (rect.left + rect.width / 2)
      const dy = e.clientY - (rect.top  + rect.height / 2)
      x.set(dx * strength)
      y.set(dy * strength)
    }
    function onLeave() { x.set(0); y.set(0) }
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave) }
  }, [x, y, strength])

  return { ref, style: { x: springX, y: springY } }
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const duration = 1800
          const start = performance.now()
          function step(now: number) {
            const progress = Math.min((now - start) / duration, 1)
            const ease = 1 - Math.pow(1 - progress, 3)
            setDisplay(Math.round(ease * target))
            if (progress < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
        }
      },
      { threshold: 0.5 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  return <span ref={ref}>{display.toLocaleString()}{suffix}</span>
}

// ─── Interactive Radar Demo ────────────────────────────────────────────────────
function RadarDemo() {
  const [active, setActive] = useState(0)
  const [hovered, setHovered] = useState<number | null>(null)
  const prog = PROGRAMS[active]
  const gridLevels = [25, 50, 75, 100]

  return (
    <div className="flex flex-col gap-4">
      {/* Program selector pills */}
      <div className="flex flex-wrap gap-2">
        {PROGRAMS.map((p, i) => (
          <button
            key={p.label}
            onClick={() => setActive(i)}
            className="rounded-full px-3 py-1 text-2xs font-bold uppercase tracking-wider transition-all duration-200"
            style={{
              border: `1px solid ${active === i ? p.color : BORDER}`,
              backgroundColor: active === i ? `${p.color}18` : 'transparent',
              color: active === i ? p.color : MUTED,
              fontSize: '9px',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Radar SVG */}
      <AnimatePresence mode="wait">
        <motion.svg
          key={active}
          viewBox="0 0 240 220"
          width="100%"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          aria-label={`Radar chart for ${prog.label}`}
        >
          {gridLevels.map(level => (
            <polygon
              key={level}
              points={radarPoints(Array(n).fill(level))}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
          ))}
          {Array.from({ length: n }, (_, i) => {
            const p = polar(axisAngle(i), 100, r, cx, cy)
            return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          })}
          <motion.polygon
            points={radarPoints(prog.scores)}
            fill={`${prog.color}22`}
            stroke={prog.color}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {RADAR_AXES.map((label, i) => {
            const p  = polar(axisAngle(i), 100, r, cx, cy)
            const lp = polar(axisAngle(i), 100, labelR, cx, cy)
            const isLeft  = lp.x < cx - 8
            const isRight = lp.x > cx + 8
            const score = prog.scores[i]
            return (
              <g key={label}>
                <motion.circle
                  cx={p.x} cy={p.y} r={hovered === i ? 5 : 3}
                  fill={prog.color}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: 'pointer' }}
                  animate={{ r: hovered === i ? 5 : 3 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                />
                {hovered === i && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <rect x={p.x - 14} y={p.y - 22} width={28} height={16} rx={4} fill={SURFACE} stroke={prog.color} strokeWidth={0.8}/>
                    <text x={p.x} y={p.y - 11} textAnchor="middle" fontSize="8" fill={prog.color} fontWeight="700">{score}</text>
                  </motion.g>
                )}
                <text
                  x={lp.x} y={lp.y + 4}
                  textAnchor={isLeft ? 'end' : isRight ? 'start' : 'middle'}
                  fontSize="6.5" fontWeight="600" letterSpacing="0.08em"
                  fill={MUTED} fontFamily="Satoshi, Inter, sans-serif"
                >
                  {label}
                </text>
              </g>
            )
          })}
        </motion.svg>
      </AnimatePresence>
    </div>
  )
}

// ─── Verified Review Demo ─────────────────────────────────────────────────────
const EXAMPLE_REVIEWS = [
  { school: 'University of Vermont', sport: "Women's Soccer", stars: 4, text: "Coaching staff genuinely cares about life after athletics. The balance between training and academics is real, not just something they say on tours. Facilities could use a renovation but the culture more than makes up for it.", tag: 'Team Culture 9.2/10' },
  { school: 'Marquette University', sport: "Men's Basketball", stars: 3, text: "Elite facilities, legitimately D1 caliber. Academic support was inconsistent — depends heavily on which counselor you get. Travel budget was solid. Would have liked better transparency around scholarship processes.", tag: 'Facilities 8.8/10' },
  { school: 'UC San Diego', sport: "Women's Volleyball", stars: 5, text: "Genuinely athlete-first. Medical staff was phenomenal, they caught an injury my previous school's staff would have ignored. Gender equity felt real here — same locker rooms, same travel budgets, same meal stipends.", tag: 'Gender Equity 9.6/10' },
]

function VerifiedReviewDemo() {
  const [idx, setIdx] = useState(0)
  const review = EXAMPLE_REVIEWS[idx]

  useEffect(() => {
    const t = setTimeout(() => setIdx(i => (i + 1) % EXAMPLE_REVIEWS.length), 4200)
    return () => clearTimeout(t)
  }, [idx])

  return (
    <div style={{ minHeight: '240px' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col gap-4 rounded-2xl p-5"
          style={{ border: `1px solid ${BORDER}`, backgroundColor: BG }}
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{ backgroundColor: 'rgba(20,184,166,0.12)', border: `1px solid rgba(20,184,166,0.25)` }}>
              <svg viewBox="0 0 12 12" width="10" height="10"><path d="M6 0L7.5 4.5H12L8.25 7.5 9.75 12 6 9 2.25 12 3.75 7.5 0 4.5H4.5Z" fill={ACCENT}/></svg>
              <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', color: ACCENT, textTransform: 'uppercase' }}>Verified Athlete</span>
            </div>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <svg key={i} width="10" height="10" viewBox="0 0 12 12">
                  <path d="M6 0L7.5 4.5H12L8.25 7.5 9.75 12 6 9 2.25 12 3.75 7.5 0 4.5H4.5Z" fill={i < review.stars ? '#f59e0b' : 'rgba(255,255,255,0.12)'}/>
                </svg>
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontSize: '12px', fontWeight: 700, color: CREAM, ...serif(), margin: 0 }}>{review.school}</p>
            <p style={{ fontSize: '10px', color: DIM, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', margin: '2px 0 0' }}>{review.sport}</p>
          </div>
          <p style={{ fontSize: '11px', lineHeight: 1.7, color: MUTED, margin: 0 }}>{review.text}</p>
          <div className="self-start rounded-full px-2.5 py-1" style={{ backgroundColor: 'rgba(155,151,181,0.12)', border: `1px solid rgba(155,151,181,0.20)` }}>
            <span style={{ fontSize: '9px', fontWeight: 700, color: LAV, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{review.tag}</span>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="mt-4 flex items-center justify-center gap-1.5">
        {EXAMPLE_REVIEWS.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? '20px' : '6px', height: '6px', borderRadius: '9999px', backgroundColor: i === idx ? ACCENT : BORDER, transition: 'all 0.3s ease', cursor: 'pointer' }}/>
        ))}
      </div>
    </div>
  )
}

// ─── Compare Demo ─────────────────────────────────────────────────────────────
const COMPARE_DATA = [
  { label: 'Facilities',       a: 92, b: 58 },
  { label: 'Coaching',         a: 74, b: 89 },
  { label: 'Life Balance',     a: 48, b: 91 },
  { label: 'Academic Support', a: 65, b: 82 },
  { label: 'Team Culture',     a: 55, b: 95 },
  { label: 'Gender Equity',    a: 31, b: 88 },
]

function CompareDemo() {
  const [revealed, setRevealed] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setRevealed(true) }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <span style={{ fontSize: '9px', fontWeight: 700, color: '#f59e0b', letterSpacing: '0.1em', textTransform: 'uppercase' }}>State Flagship</span>
        <span style={{ fontSize: '9px', fontWeight: 700, color: ACCENT, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Culture-First Program</span>
      </div>
      {COMPARE_DATA.map(({ label, a, b }) => (
        <div key={label} className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="flex flex-1 justify-end">
              <motion.div style={{ height: '6px', borderRadius: '9999px', backgroundColor: '#f59e0b' }}
                initial={{ width: 0 }} animate={{ width: revealed ? `${a}%` : '0%' }}
                transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}/>
            </div>
            <span style={{ fontSize: '8px', fontWeight: 700, color: DIM, minWidth: '32px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label.slice(0, 3)}</span>
            <div className="flex flex-1">
              <motion.div style={{ height: '6px', borderRadius: '9999px', backgroundColor: ACCENT }}
                initial={{ width: 0 }} animate={{ width: revealed ? `${b}%` : '0%' }}
                transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}/>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ fontSize: '8px', color: '#f59e0b', fontWeight: 700 }}>{a}</span>
            <span style={{ fontSize: '8px', color: DIM, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
            <span style={{ fontSize: '8px', color: ACCENT, fontWeight: 700 }}>{b}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Equity Demo ──────────────────────────────────────────────────────────────
const EQUITY_ITEMS = [
  { label: 'Facility Access',  score: 88, note: 'Shared weight room + dedicated fields' },
  { label: 'Travel Budgets',   score: 72, note: 'Charter travel for home games' },
  { label: 'Medical Staff',    score: 95, note: 'Dedicated ATCs for all programs' },
  { label: 'Academic Support', score: 91, note: 'Equal tutoring + advising hours' },
  { label: 'Stipend Parity',   score: 64, note: 'Meal stipends vary by classification' },
]

function EquityDemo() {
  const [revealed, setRevealed] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setRevealed(true) }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const avg = Math.round(EQUITY_ITEMS.reduce((s, i) => s + i.score, 0) / EQUITY_ITEMS.length)
  const circumference = 2 * Math.PI * 28

  return (
    <div ref={ref} className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r="28" fill="none" stroke={BORDER} strokeWidth="6"/>
          <motion.circle
            cx="36" cy="36" r="28" fill="none" stroke={ACCENT} strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: circumference * (1 - (revealed ? avg / 100 : 0)) }}
            initial={{ strokeDashoffset: circumference }}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '36px 36px' }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          />
          <text x="36" y="40" textAnchor="middle" fontSize="14" fontWeight="700" fill={CREAM} fontFamily="Instrument Serif, Georgia, serif">{avg}</text>
        </svg>
        <div>
          <p style={{ fontSize: '10px', fontWeight: 700, color: ACCENT, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>Gender Equity Score</p>
          <p style={{ fontSize: '11px', color: MUTED, marginTop: '4px' }}>Athlete-reported, across 5 dimensions</p>
        </div>
      </div>
      {EQUITY_ITEMS.map(({ label, score, note }) => (
        <div key={label} className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span style={{ fontSize: '9px', fontWeight: 700, color: DIM, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
            <span style={{ fontSize: '9px', fontWeight: 700, color: MUTED }}>{score}</span>
          </div>
          <div style={{ height: '5px', borderRadius: '9999px', backgroundColor: BORDER, overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', borderRadius: '9999px', backgroundColor: score >= 85 ? ACCENT : score >= 70 ? '#f59e0b' : '#f87171' }}
              initial={{ width: '0%' }}
              animate={{ width: revealed ? `${score}%` : '0%' }}
              transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>
          <p style={{ fontSize: '9px', color: DIM, fontStyle: 'italic', margin: 0 }}>{note}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Feature demo router ──────────────────────────────────────────────────────
function FeatureDemo({ id }: { id: string }) {
  if (id === 'scorecard') return <RadarDemo />
  if (id === 'verified')  return <VerifiedReviewDemo />
  if (id === 'compare')   return <CompareDemo />
  if (id === 'equity')    return <EquityDemo />
  return null
}

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────
const HOW_STEPS = [
  {
    number: '01',
    title: 'Verify Your Identity',
    body: 'Authenticate with your .edu email and confirm your roster status. No coaches. No recruiters. Athletes only.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.5">
        <rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>
        <circle cx="12" cy="16" r="1" fill={ACCENT}/>
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Rate Your Program',
    body: 'Score your experience across six dimensions — Facilities, Coaching, Life Balance, Academic Support, Team Culture, and Gender Equity.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Help the Next Generation',
    body: 'Your review becomes part of the permanent record. Anonymous by default. Honest by design. Every rating shapes the decisions of the athletes who come after you.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
]

// ─── Shared reveal hook ───────────────────────────────────────────────────────
function useReveal(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ctx = gsap.context(() => {
      gsap.fromTo(el,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true } },
      )
    })
    return () => ctx.revert()
  }, [ref])
}

// ═════════════════════════════════════════════════════════════════════════════
// SECTIONS
// ═════════════════════════════════════════════════════════════════════════════

function HeroSection({ onGetStarted }: { onGetStarted?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const line1Ref     = useRef<HTMLSpanElement>(null)
  const line2Ref     = useRef<HTMLSpanElement>(null)
  const line3Ref     = useRef<HTMLSpanElement>(null)
  const subRef       = useRef<HTMLParagraphElement>(null)
  const ctaRef       = useRef<HTMLDivElement>(null)
  const badgesRef    = useRef<HTMLDivElement>(null)
  const mag1 = useMagnetic(0.3)
  const mag2 = useMagnetic(0.3)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo(line1Ref.current, { opacity: 0, y: 60, skewY: 3 }, { opacity: 1, y: 0, skewY: 0, duration: 0.9 })
        .fromTo(line2Ref.current, { opacity: 0, y: 60, skewY: 3 }, { opacity: 1, y: 0, skewY: 0, duration: 0.9 }, '-=0.65')
        .fromTo(line3Ref.current, { opacity: 0, y: 60, skewY: 3 }, { opacity: 1, y: 0, skewY: 0, duration: 0.9 }, '-=0.65')
        .fromTo(subRef.current,   { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.5')
        .fromTo(ctaRef.current,   { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
        .fromTo(badgesRef.current,{ opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.3')
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={containerRef}
      style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', backgroundColor: BG }}
    >
      <HeroCanvas />

      {/* Vignette */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse at 50% 60%, rgba(10,14,26,0) 0%, rgba(10,14,26,0.85) 70%)` }}/>
      <div aria-hidden style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '200px', pointerEvents: 'none',
        background: `linear-gradient(to bottom, transparent, ${BG})` }}/>

      <div style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto',
        padding: '120px clamp(24px, 5vw, 80px) 80px', width: '100%' }}>

        {/* Eyebrow */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2"
          style={{ border: `1px solid rgba(20,184,166,0.25)`, backgroundColor: 'rgba(20,184,166,0.08)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: ACCENT, display: 'inline-block', boxShadow: `0 0 8px ${ACCENT}` }}/>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', color: ACCENT, textTransform: 'uppercase' }}>
            Athlete-verified · 1,086 schools indexed
          </span>
        </div>

        {/* Headline */}
        <h1 style={{ margin: 0, lineHeight: 1.0 }}>
          <span ref={line1Ref} style={{ display: 'block', opacity: 0, ...serif({ fontSize: 'clamp(3.5rem, 9vw, 8rem)', color: CREAM }) }}>
            Rate.
          </span>
          <span ref={line2Ref} style={{ display: 'block', opacity: 0, ...serif({ fontSize: 'clamp(3.5rem, 9vw, 8rem)', color: CREAM, fontStyle: 'italic' }) }}>
            Review.
          </span>
          <span ref={line3Ref} style={{ display: 'block', opacity: 0, ...serif({ fontSize: 'clamp(3.5rem, 9vw, 8rem)', color: ACCENT }) }}>
            Reform.
          </span>
        </h1>

        {/* Sub */}
        <p ref={subRef} style={{ opacity: 0, maxWidth: '540px', marginTop: '28px',
          fontSize: 'clamp(15px, 2vw, 18px)', lineHeight: 1.7, color: MUTED, ...mono() }}>
          The first anonymous, athlete-verified review platform for collegiate sports programs.
          Find the program that's actually right for you — not the one that recruits best.
        </p>

        {/* CTAs */}
        <div ref={ctaRef} style={{ opacity: 0, display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '40px' }}>
          <motion.a href="/directory"
            ref={mag1.ref as React.RefObject<HTMLAnchorElement>}
            style={{ ...mag1.style, display: 'inline-flex', alignItems: 'center', gap: '10px',
              padding: '14px 32px', borderRadius: '9999px', backgroundColor: ACCENT, color: BG,
              fontSize: '13px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase',
              textDecoration: 'none', cursor: 'pointer', boxShadow: `0 0 40px rgba(20,184,166,0.35)` }}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            Explore Programs
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </motion.a>
          <motion.a href="/submit-review"
            ref={mag2.ref as React.RefObject<HTMLAnchorElement>}
            style={{ ...mag2.style, display: 'inline-flex', alignItems: 'center', gap: '10px',
              padding: '14px 32px', borderRadius: '9999px', backgroundColor: 'transparent', color: TEXT,
              fontSize: '13px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
              textDecoration: 'none', cursor: 'pointer', border: `1px solid rgba(255,255,255,0.15)`,
              backdropFilter: 'blur(8px)' }}
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.30)' }}
            whileTap={{ scale: 0.97 }}>
            Submit a Review
          </motion.a>
        </div>

        {/* Trust badges */}
        <div ref={badgesRef} style={{ opacity: 0, display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '32px' }}>
          {['NCAA D1 · D2 · D3', 'NAIA', 'NJCAA', 'NCCAA', 'CCCAA', 'Anonymous by default'].map(badge => (
            <span key={badge} style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: DIM, padding: '4px 10px', borderRadius: '9999px',
              border: `1px solid ${BORDER}` }}>
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 10 }}>
        <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', color: DIM, textTransform: 'uppercase' }}>Scroll</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          style={{ width: '1px', height: '40px', backgroundColor: BORDER }}/>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const [activeStep, setActiveStep] = useState(0)

  useReveal(headingRef)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: `+=${window.innerHeight * 2}`,
        pin: true,
        pinSpacing: true,
        onUpdate: self => {
          const step = Math.min(HOW_STEPS.length - 1, Math.floor(self.progress * (HOW_STEPS.length + 0.5)))
          setActiveStep(step)
        },
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} style={{ minHeight: '100vh', backgroundColor: BG, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '80px clamp(24px, 5vw, 80px)' }}>
        <div ref={headingRef} style={{ opacity: 0, marginBottom: '64px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: ACCENT, textTransform: 'uppercase', marginBottom: '12px' }}>
            How it works
          </p>
          <h2 style={{ ...serif({ fontSize: 'clamp(2.2rem, 5vw, 4rem)', color: CREAM }), margin: 0 }}>
            Three steps to <span style={{ fontStyle: 'italic' }}>transparency</span>.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
          {HOW_STEPS.map((step, i) => (
            <motion.div key={step.number}
              animate={{ opacity: i <= activeStep ? 1 : 0.3, y: i <= activeStep ? 0 : 16, scale: i === activeStep ? 1.02 : 1 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              style={{ padding: '32px', borderRadius: '20px',
                border: `1px solid ${i === activeStep ? 'rgba(20,184,166,0.35)' : BORDER}`,
                backgroundColor: i === activeStep ? 'rgba(20,184,166,0.05)' : SURFACE }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <span style={{ ...serif({ fontSize: '48px', color: i <= activeStep ? ACCENT : BORDER }), lineHeight: 1 }}>{step.number}</span>
                {step.icon}
              </div>
              <h3 style={{ ...serif({ fontSize: '1.4rem', color: CREAM }), margin: '0 0 12px' }}>{step.title}</h3>
              <p style={{ fontSize: '14px', lineHeight: 1.7, color: MUTED, margin: 0 }}>{step.body}</p>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '48px' }}>
          {HOW_STEPS.map((_, i) => (
            <motion.div key={i}
              animate={{ width: i <= activeStep ? '48px' : '20px', backgroundColor: i <= activeStep ? ACCENT : BORDER }}
              transition={{ duration: 0.3 }}
              style={{ height: '3px', borderRadius: '9999px' }}/>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [activeTab, setActiveTab] = useState('scorecard')
  const feature = FEATURES.find(f => f.id === activeTab)!

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const ctx = gsap.context(() => {
      gsap.fromTo(el.querySelectorAll('.feature-reveal'),
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 80%', once: true } })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} style={{ backgroundColor: BG, padding: '120px 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(24px, 5vw, 80px)' }}>
        <div className="feature-reveal" style={{ opacity: 0, marginBottom: '64px', maxWidth: '600px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: ACCENT, textTransform: 'uppercase', marginBottom: '12px' }}>The Platform</p>
          <h2 style={{ ...serif({ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', color: CREAM }), margin: 0 }}>
            Tools built for <span style={{ fontStyle: 'italic' }}>athletes</span>, not for programs.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '64px', alignItems: 'start' }}>
          {/* Tabs */}
          <div className="feature-reveal" style={{ opacity: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {FEATURES.map(f => (
              <button key={f.id} onClick={() => setActiveTab(f.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px', borderRadius: '16px',
                  textAlign: 'left', border: `1px solid ${activeTab === f.id ? 'rgba(20,184,166,0.30)' : 'transparent'}`,
                  backgroundColor: activeTab === f.id ? 'rgba(20,184,166,0.06)' : 'transparent',
                  cursor: 'pointer', transition: 'all 0.25s ease', width: '100%' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: activeTab === f.id ? 'rgba(20,184,166,0.15)' : 'rgba(255,255,255,0.04)',
                  color: activeTab === f.id ? ACCENT : MUTED,
                  border: `1px solid ${activeTab === f.id ? 'rgba(20,184,166,0.25)' : BORDER}`, transition: 'all 0.25s ease' }}>
                  {f.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: activeTab === f.id ? TEXT : MUTED }}>
                    {f.label}
                  </p>
                  <AnimatePresence>
                    {activeTab === f.id && (
                      <motion.p initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: '6px' }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        style={{ margin: 0, fontSize: '12px', lineHeight: 1.6, color: DIM, overflow: 'hidden' }}>
                        {f.body}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                <motion.div animate={{ opacity: activeTab === f.id ? 1 : 0, x: activeTab === f.id ? 0 : -4 }}
                  style={{ width: '3px', height: '28px', borderRadius: '9999px', backgroundColor: ACCENT, flexShrink: 0 }}/>
              </button>
            ))}
            <div style={{ marginTop: '16px', paddingTop: '24px', borderTop: `1px solid ${BORDER}` }}>
              <Link to={activeTab === 'verified' ? '/submit-review' : '/directory'}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase', color: ACCENT, textDecoration: 'none' }}>
                {activeTab === 'verified' ? 'Submit your review' : 'Explore the directory'}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* Demo pane */}
          <div className="feature-reveal" style={{ opacity: 0 }}>
            <div style={{ borderRadius: '24px', padding: '32px', border: `1px solid ${BORDER}`,
              backgroundColor: SURFACE, boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px',
                paddingBottom: '16px', borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['#f87171', '#f59e0b', ACCENT].map(c => (
                    <div key={c} style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: c }}/>
                  ))}
                </div>
                <span style={{ fontSize: '10px', fontWeight: 600, color: DIM, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {feature.label}
                </span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={activeTab}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}>
                  <FeatureDemo id={activeTab}/>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

function ProofSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const ctx = gsap.context(() => {
      gsap.fromTo(el.querySelectorAll('.stat-card'),
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 80%', once: true } })
    })
    return () => ctx.revert()
  }, [])

  const bodies = [
    { name: 'NCAA D3', pct: 100 }, { name: 'NCAA D1', pct: 92 }, { name: 'NCAA D2', pct: 88 },
    { name: 'NAIA', pct: 78 }, { name: 'NJCAA', pct: 65 }, { name: 'NCCAA', pct: 48 },
  ]

  return (
    <section ref={sectionRef} style={{ backgroundColor: SURFACE, padding: '120px 0', borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(24px, 5vw, 80px)' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: ACCENT, textTransform: 'uppercase', marginBottom: '12px' }}>The coverage</p>
        <h2 style={{ ...serif({ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', color: CREAM }), margin: '0 0 64px' }}>
          Built at <span style={{ fontStyle: 'italic' }}>scale</span>.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '64px' }}>
          {STATS.map(({ value, suffix, label }) => (
            <div key={label} className="stat-card" style={{ opacity: 0, padding: '32px', borderRadius: '20px', border: `1px solid ${BORDER}`, backgroundColor: BG }}>
              <p style={{ margin: '0 0 8px', ...serif({ fontSize: 'clamp(2.4rem, 5vw, 3.5rem)', color: ACCENT }) }}>
                <AnimatedCounter target={value} suffix={suffix}/>
              </p>
              <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: DIM }}>{label}</p>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {bodies.map(({ name, pct }) => (
            <div key={name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED }}>{name}</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: DIM }}>{pct}%</span>
              </div>
              <div style={{ height: '4px', borderRadius: '9999px', backgroundColor: BORDER, overflow: 'hidden' }}>
                <motion.div style={{ height: '100%', borderRadius: '9999px', backgroundColor: LAV }}
                  initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }}
                  transition={{ duration: 1.0, ease: [0.4, 0, 0.2, 1] }}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

function ManifestoSection() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ctx = gsap.context(() => {
      gsap.fromTo(el.querySelectorAll('.manifesto-line'),
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.7, stagger: 0.18, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 75%', once: true } })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} style={{ backgroundColor: BG, padding: '140px 0', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
        width: '4px', height: '60%', backgroundColor: ACCENT, borderRadius: '0 4px 4px 0' }}/>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(24px, 5vw, 80px)' }}>
        <div style={{ maxWidth: '780px' }}>
          {[
            { text: 'No coaches. No institutions.', italic: false, color: CREAM },
            { text: 'No sponsored content.',         italic: false, color: MUTED },
            { text: 'Just athletes —',               italic: true,  color: CREAM },
            { text: 'telling the truth',             italic: true,  color: CREAM },
            { text: "about what it's actually like", italic: true,  color: CREAM },
            { text: 'to play for a program.',        italic: true,  color: CREAM },
          ].map(({ text, italic, color }, i) => (
            <p key={i} className="manifesto-line"
              style={{ opacity: 0, margin: '0 0 8px',
                ...serif({ fontSize: 'clamp(1.8rem, 4vw, 3.2rem)', color, fontStyle: italic ? 'italic' : 'normal' }) }}>
              {text}
            </p>
          ))}
          <p className="manifesto-line"
            style={{ opacity: 0, marginTop: '40px', fontSize: '14px', lineHeight: 1.8, color: DIM,
              maxWidth: '520px', borderLeft: `2px solid ${BORDER}`, paddingLeft: '20px' }}>
            The recruiting process is broken. Athletes deserve better information than a campus tour
            and a coach's pitch. TLR gives them the inside story — from the people who lived it.
          </p>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

function CTASection({ onGetStarted }: { onGetStarted?: () => void }) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ctx = gsap.context(() => {
      gsap.fromTo(el.querySelectorAll('.cta-card'),
        { opacity: 0, y: 40, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 80%', once: true } })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} style={{ backgroundColor: BG, padding: '120px 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(24px, 5vw, 80px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>

          <motion.div className="cta-card"
            style={{ opacity: 0, padding: '48px', borderRadius: '24px',
              background: `linear-gradient(135deg, rgba(20,184,166,0.12) 0%, rgba(20,184,166,0.04) 100%)`,
              border: `1px solid rgba(20,184,166,0.25)` }}
            whileHover={{ borderColor: 'rgba(20,184,166,0.50)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', marginBottom: '24px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: 'rgba(20,184,166,0.15)', border: `1px solid rgba(20,184,166,0.25)` }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.7">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
            </div>
            <h3 style={{ ...serif({ fontSize: '1.8rem', color: CREAM }), margin: '0 0 12px' }}>Find your program.</h3>
            <p style={{ fontSize: '14px', lineHeight: 1.7, color: MUTED, margin: '0 0 32px' }}>
              Browse 19,000+ programs across 1,086 schools. Filter by sport, gender, state, and division. Compare side-by-side.
            </p>
            <Link to="/directory" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px',
              padding: '12px 28px', borderRadius: '9999px', backgroundColor: ACCENT, color: BG,
              fontSize: '12px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}>
              Explore Programs
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </motion.div>

          <motion.div className="cta-card"
            style={{ opacity: 0, padding: '48px', borderRadius: '24px',
              background: `linear-gradient(135deg, rgba(245,239,224,0.06) 0%, rgba(245,239,224,0.02) 100%)`,
              border: `1px solid rgba(245,239,224,0.12)` }}
            whileHover={{ borderColor: 'rgba(245,239,224,0.25)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', marginBottom: '24px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: 'rgba(245,239,224,0.08)', border: `1px solid rgba(245,239,224,0.15)` }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={CREAM} strokeWidth="1.7">
                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </div>
            <h3 style={{ ...serif({ fontSize: '1.8rem', color: CREAM }), margin: '0 0 12px' }}>Share your experience.</h3>
            <p style={{ fontSize: '14px', lineHeight: 1.7, color: MUTED, margin: '0 0 32px' }}>
              If you've played collegiate sports, your experience matters. Verify your .edu email and rate your program — anonymous by default.
            </p>
            <Link to="/submit-review" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px',
              padding: '12px 28px', borderRadius: '9999px', backgroundColor: 'transparent', color: CREAM,
              fontSize: '12px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
              textDecoration: 'none', border: `1px solid rgba(245,239,224,0.30)` }}>
              Submit a Review
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

function FooterSection() {
  const navLinks = [
    { to: '/directory', label: 'Explore Programs' },
    { to: '/college-comparison', label: 'Compare' },
    { to: '/submit-review', label: 'Submit Review' },
    { to: '/login', label: 'Sign In' },
    { to: '/privacy', label: 'Privacy' },
    { to: '/terms', label: 'Terms' },
  ]

  return (
    <footer style={{ backgroundColor: SURFACE, borderTop: `1px solid ${BORDER}`, padding: '64px 0 40px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(24px, 5vw, 80px)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '48px', justifyContent: 'space-between', marginBottom: '48px' }}>

          <div style={{ maxWidth: '280px' }}>
            <Link to="/" style={{ display: 'inline-block', marginBottom: '16px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 232 48" fill="none" aria-hidden="true" style={{ height: '36px', width: 'auto', display: 'block' }}>
                <path d="M 9 25.5 L 9 17 A 9 9 0 0 1 27 17 L 27 25.5" stroke="#14B8A6" strokeWidth="2.4" strokeLinecap="round" fill="none"/>
                <rect x="4" y="24" width="28" height="20" rx="3" stroke="#F5EFE0" strokeWidth="1.5" fill="none"/>
                <line x1="9.5" y1="24" x2="26.5" y2="24" stroke="#14151F" strokeWidth="2.2"/>
                <circle cx="18" cy="31" r="2.2" fill="#14B8A6"/>
                <rect x="16.9" y="32.8" width="2.2" height="4.4" rx="1.1" fill="#14B8A6"/>
                <text x="44" y="19" fontFamily="'Instrument Serif', Georgia, serif" fontSize="9" fontWeight="400" letterSpacing="0.28em" fill="#9B97B5" dominantBaseline="middle">THE</text>
                <text x="44" y="35.5" fontFamily="'Instrument Serif', Georgia, serif" fontSize="17.5" fontWeight="700" letterSpacing="0.045em" fill="#F5EFE0" dominantBaseline="middle">LOCKER ROOM</text>
              </svg>
            </Link>
            <p style={{ fontSize: '12px', lineHeight: 1.7, color: DIM, margin: 0 }}>
              Athlete-verified reviews for collegiate sports programs. Rate. Review. Reform.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: DIM }}>Platform</p>
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to} style={{ fontSize: '13px', color: MUTED, textDecoration: 'none', transition: 'color 0.2s ease' }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = TEXT}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = MUTED}>
                {label}
              </Link>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: DIM }}>Follow</p>
            {socialLinks.map(({ label, href, d }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: MUTED, textDecoration: 'none', transition: 'color 0.2s ease' }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = TEXT}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = MUTED}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden><path d={d}/></svg>
                {label}
              </a>
            ))}
          </div>
        </div>

        <div style={{ paddingTop: '24px', borderTop: `1px solid ${BORDER}`, display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ margin: 0, fontSize: '11px', color: DIM }}>© {new Date().getFullYear()} The Locker Room. All rights reserved.</p>
          <p style={{ margin: 0, fontSize: '11px', color: DIM }}>Built by athletes, for athletes.</p>
        </div>
      </div>
    </footer>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// ROOT
// ═════════════════════════════════════════════════════════════════════════════

type LandingPageProps = { onGetStarted?: () => void }

export function LandingPage({ onGetStarted }: LandingPageProps) {
  useEffect(() => {
    return () => { ScrollTrigger.getAll().forEach(t => t.kill()) }
  }, [])

  return (
    <main style={{ backgroundColor: BG, color: TEXT, overflowX: 'hidden' }}>
      <HeroSection onGetStarted={onGetStarted} />
      <HowItWorksSection />
      <FeaturesSection />
      <ProofSection />
      <ManifestoSection />
      <CTASection onGetStarted={onGetStarted} />
      <FooterSection />
    </main>
  )
}
