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
  CircleDollarSign,
  Target,
  Trophy,
  TrendingUp,
  Users,
} from "lucide-react"

// ─── Social icon paths (inline SVG, no react-icons dep needed) ────────────────
const socialLinks = [
  { label: "Instagram", href: "https://instagram.com",  d: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" },
  { label: "Twitter/X",  href: "https://twitter.com",   d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.738-8.835L1.254 2.25H8.08l4.259 5.635L18.243 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  { label: "LinkedIn",   href: "https://linkedin.com",  d: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
]

const features = [
  {
    icon: BadgeCheck,
    title: "Verified Reviews",
    description: "Only real student athletes can review programs, ensuring authentic insights and feedback.",
  },
  {
    icon: CircleDollarSign,
    title: "NIL Transparency",
    description: "Track NIL opportunities and earnings across different programs and sports.",
  },
  {
    icon: Users,
    title: "Team Culture",
    description: "Get the inside scoop on coaching staff, facilities, and team dynamics.",
  },
  {
    icon: Target,
    title: "Career Tracking",
    description: "Monitor your athletic and academic progress with data-driven insights.",
  },
  {
    icon: Award,
    title: "Scholarship Intel",
    description: "Compare scholarship offers and understand your market value.",
  },
  {
    icon: TrendingUp,
    title: "Performance Metrics",
    description: "Showcase your stats and achievements to recruiters and brands.",
  },
]

const proofData = [
  { name: "Jan", athletes: 1030 },
  { name: "Feb", athletes: 1250 },
  { name: "Mar", athletes: 1435 },
  { name: "Apr", athletes: 1654 },
  { name: "May", athletes: 2564 },
  { name: "Jun", athletes: 3245 },
  { name: "Jul", athletes: 4798 },
  { name: "Aug", athletes: 5732 },
  { name: "Sep", athletes: 6738 },
  { name: "Oct", athletes: 7912 },
  { name: "Nov", athletes: 8821 },
  { name: "Dec", athletes: 19092 },
]

const proofStats = [
  { label: "Active Athletes", value: "10,000+" },
  { label: "Satisfaction Rate", value: "98%" },
  { label: "Partner Schools", value: "500+" },
  { label: "NIL Tracked", value: "$2M+" },
]

const testimonials = [
  {
    quote: "This platform completely changed how I manage my athletic career. The transparency in NIL deals and team culture is unmatched.",
    name: "Verified D1 Athlete",
    designation: "Basketball · Abilene Christian University",
  },
  {
    quote: "Finally, a place where student athletes can make informed decisions about their future. The reviews from current players are invaluable.",
    name: "Anonymous Athlete",
    designation: "Soccer · Stanford University",
  },
  {
    quote: "The coaching staff ratings and facility reviews helped me choose the perfect program. This is a game-changer for recruiting.",
    name: "Verified D1 Athlete",
    designation: "Football · Ohio State University",
  },
]

type LandingPageProps = {
  onGetStarted?: () => void
}

// ─── SERIF helper ─────────────────────────────────────────────────────────────
const serifStyle: React.CSSProperties = {
  fontFamily: "'Instrument Serif', Georgia, serif",
  fontStyle: "italic",
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
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-black px-6 text-center"
    >
      {/* Subtle radial glow — top center */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% -5%, rgba(234,179,8,0.11) 0%, transparent 70%)",
        }}
      />
      {/* Mouse-follow glow — reduced, subtle */}
      <motion.div
        className="pointer-events-none absolute h-72 w-72 rounded-full bg-yellow-500/10 blur-3xl"
        animate={{ x: x - 144, y: y - 144 }}
        transition={{ type: "spring", damping: 35, stiffness: 180 }}
      />

      <div className="relative z-10 flex max-w-4xl flex-col items-center gap-8">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 border border-yellow-500/40 bg-yellow-500/10 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest text-yellow-500"
        >
          <BicepsFlexed className="h-3.5 w-3.5" />
          For Student Athletes
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <h1
            className="leading-[1.05] text-white"
            style={{
              fontSize: "clamp(4rem, 10vw, 8rem)",
              fontFamily: "'Instrument Serif', Georgia, serif",
            }}
          >
            The Locker
            <br />
            <span className="text-yellow-500">Room.</span>
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-base font-medium uppercase tracking-[0.2em] text-zinc-400"
        >
          Rate.&nbsp;&nbsp;Review.&nbsp;&nbsp;Reform.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          <button
            onClick={onGetStarted}
            className="group inline-flex items-center gap-3 rounded-xl bg-yellow-500 px-8 py-4 text-sm font-bold uppercase tracking-widest text-black transition-all hover:bg-yellow-400 hover:gap-4"
          >
            Get Started
            <ChevronRight className="h-4 w-4 transition-all" />
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="flex items-center gap-12 pt-4"
        >
          {[
            { n: "10K+", label: "Athletes" },
            { n: "500+", label: "Schools" },
            { n: "$2M+", label: "NIL Tracked" },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span
                className="text-yellow-500 leading-none"
                style={{ ...serifStyle, fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
              >
                {stat.n}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                {stat.label}
              </span>
            </div>
          )).reduce<React.ReactNode[]>((acc, el, i) => {
            if (i > 0) acc.push(<div key={`div-${i}`} className="h-8 w-px bg-zinc-800" />)
            acc.push(el)
            return acc
          }, [])}
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
    <section className="relative w-full overflow-hidden border-t border-zinc-800 bg-black py-8">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ["0%", "-33.333%"] }}
        transition={{ ease: "linear", duration: 18, repeat: Infinity }}
      >
        {repeated.map((name, i) => (
          <span
            key={i}
            className={`mx-10 text-sm font-semibold uppercase tracking-[0.25em] ${
              i % 6 === 0 ? "text-yellow-500" : "text-zinc-600"
            }`}
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
  <section id="features" className="w-full bg-black px-6 py-28">
    <div className="mx-auto max-w-6xl">
      <div className="mb-16">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-yellow-500">
          Platform
        </p>
        <h2 className="text-white" style={{ ...serifStyle, fontSize: "clamp(2.5rem, 6vw, 4rem)" }}>
          Built for <span className="not-italic font-black uppercase tracking-tight">Champions</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-px bg-zinc-800 md:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, description }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
            viewport={{ once: true }}
            className="group flex flex-col gap-4 bg-black p-8 transition-colors hover:bg-zinc-900/80"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-2.5">
                <Icon className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-white">
              {title}
            </h3>
            <p className="text-sm leading-relaxed text-zinc-500">{description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
)

// ─── Proof ────────────────────────────────────────────────────────────────────
const ProofSection = () => (
  <section id="proof" className="w-full bg-zinc-950 px-6 py-28">
    <div className="mx-auto max-w-6xl">
      <div className="mb-12">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-yellow-500">
          By the numbers
        </p>
        <h2 className="text-white" style={{ ...serifStyle, fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
          The numbers <span className="not-italic font-black uppercase tracking-tight text-yellow-500">don't lie</span>
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-500">
          Student athletes are taking control of their journey. Join thousands making informed decisions.
        </p>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {proofStats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <p
              className="text-yellow-500 leading-none"
              style={{ ...serifStyle, fontSize: "clamp(2rem, 4vw, 2.75rem)" }}
            >
              {stat.value}
            </p>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 md:p-8">
        <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Athlete growth · 2025
        </p>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={proofData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="colorYellow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                stroke="transparent"
                tick={{ fill: "#52525b", fontSize: 10, fontFamily: "Satoshi, sans-serif" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="transparent"
                tick={{ fill: "#52525b", fontSize: 10, fontFamily: "Satoshi, sans-serif" }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  borderColor: "#3f3f46",
                  borderRadius: "0.75rem",
                  color: "#eab308",
                  fontSize: 12,
                  fontFamily: "Satoshi, sans-serif",
                }}
                cursor={{ stroke: "#3f3f46", strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="athletes"
                stroke="#eab308"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#colorYellow)"
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
    <section id="athlete-voices" className="w-full bg-black px-6 py-28">
      <div className="mx-auto max-w-4xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-yellow-500">
            Athlete Voices
          </p>
          <h2 className="text-white" style={{ ...serifStyle, fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
            What athletes are <span className="text-yellow-500">saying</span>
          </h2>
        </div>

        <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900 px-8 py-12 text-center md:px-16">
          {/* Opening quote mark */}
          <div
            className="mb-6 text-6xl leading-none text-yellow-500/40"
            style={serifStyle}
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
                className="mx-auto max-w-2xl text-xl leading-relaxed text-white md:text-2xl"
                style={serifStyle}
              >
                {active.quote}
              </p>
              <div className="mt-8">
                <p className="text-sm font-bold uppercase tracking-wide text-zinc-200">
                  {active.name}
                </p>
                <p className="mt-1 text-xs uppercase tracking-widest text-zinc-500">
                  {active.designation}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots + arrows */}
          <div className="mt-10 flex items-center justify-center gap-6">
            <button
              onClick={() => setActiveIndex((i) => (i - 1 + testimonials.length) % testimonials.length)}
              className="rounded-full border border-zinc-700 bg-zinc-800 p-2.5 text-zinc-400 transition-colors hover:border-yellow-500/50 hover:text-yellow-400"
              aria-label="Previous"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === activeIndex ? "w-6 bg-yellow-500" : "w-1.5 bg-zinc-700"
                  }`}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={() => setActiveIndex((i) => (i + 1) % testimonials.length)}
              className="rounded-full border border-zinc-700 bg-zinc-800 p-2.5 text-zinc-400 transition-colors hover:border-yellow-500/50 hover:text-yellow-400"
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
  <footer className="w-full border-t border-zinc-800 bg-black">
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-col items-center gap-6">
        {/* Wordmark */}
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span
            className="text-2xl text-white"
            style={serifStyle}
          >
            The Locker Room
          </span>
        </div>

        <p className="max-w-sm text-center text-xs leading-relaxed text-zinc-600">
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
              className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-500 transition-colors hover:border-zinc-600 hover:text-yellow-400"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d={d} />
              </svg>
            </a>
          ))}
        </div>

        <div className="w-full border-t border-zinc-900 pt-8 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-700">
            © 2025 The Locker Room. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  </footer>
)

// ─── Export ───────────────────────────────────────────────────────────────────
export const LandingPage = ({ onGetStarted }: LandingPageProps) => (
  <div className="w-full bg-black text-white">
    <HeroSection onGetStarted={onGetStarted} />
    <SanctioningBodiesSection />
    <FeaturesSection />
    <ProofSection />
    <TestimonialsSection />
    <FooterSection />
  </div>
)

export default LandingPage
