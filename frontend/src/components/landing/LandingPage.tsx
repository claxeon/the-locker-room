import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Facebook,
  Instagram,
  Linkedin,
  Target,
  TrendingUp,
  Trophy,
  Twitter,
  Users,
  BicepsFlexed,
  BadgeCheck,
  CircleDollarSign,
} from "lucide-react"

import { Button } from "../ui/button"

type LandingPageProps = {
  onGetStarted?: () => void
}

const testimonials = [
  {
    quote:
      "This platform completely changed how I manage my athletic career. The transparency in NIL deals and team culture is unmatched.",
    name: "slimetron3782",
    designation: "D1 Basketball Player, Abilene Christian",
    src: "",
  },
  {
    quote:
      "Finally, a place where student athletes can make informed decisions about their future. The reviews from current players are invaluable.",
    name: "flamingtoaster2719",
    designation: "Soccer Player, Stanford",
    src: "",
  },
  {
    quote:
      "The coaching staff ratings and facility reviews helped me choose the perfect program. This is a game-changer for recruiting.",
    name: "germinatedsponger6272",
    designation: "Football Player, Ohio State",
    src: "",
  },
]

const features = [
  {
    icon: BadgeCheck,
    title: "Verified Reviews",
    description:
      "Only real student athletes can review programs, ensuring authentic insights and feedback",
  },
  {
    icon: CircleDollarSign,
    title: "NIL Transparency",
    description:
      "Track NIL opportunities and earnings across different programs and sports.",
  },
  {
    icon: Users,
    title: "Team Culture",
    description:
      "Get the inside scoop on coaching staff, facilities, and team dynamics.",
  },
  {
    icon: Target,
    title: "Career Tracking",
    description:
      "Monitor your athletic and academic progress with data-driven insights.",
  },
  {
    icon: Award,
    title: "Scholarship Intel",
    description:
      "Compare scholarship offers and understand your market value.",
  },
  {
    icon: Trophy,
    title: "Performance Metrics",
    description:
      "Showcase your stats and achievements to recruiters and brands.",
  },
]

const proofData = [
  { name: "Jan", athletes: 1030 },
  { name: "Feb", athletes: 1250 },
  { name: "Mar", athletes: 1435 },
  { name: "Apr", athletes: 1654 },
  { name: "May", athletes: 2564 },
  { name: "Jun", athletes: 3245 },
  { name: "July", athletes: 4798},
  { name: "August", athletes: 5732},
  { name: "September", athletes: 6738},
  { name: "October", athletes: 7912},
  { name: "November", athletes: 8821},
  { name: "December", athletes: 19092},
]

const proofStats = [
  { label: "Active Athletes", value: "10,000+" },
  { label: "Satisfaction Rate", value: "98%" },
  { label: "Partner Schools", value: "500+" },
  { label: "NIL Tracked", value: "$2M+" },
]

const socialLinks = [
  { icon: Instagram, label: "Instagram", href: "https://instagram.com" },
  { icon: Twitter, label: "Twitter", href: "https://twitter.com" },
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com" },
  { icon: Facebook, label: "Facebook", href: "https://facebook.com" },
]

const HeroSection = ({ onGetStarted }: { onGetStarted?: () => void }) => {
  const heroRef = useRef<HTMLElement | null>(null)
  const [{ x, y }, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const node = heroRef.current

    if (!node) return

    const handleMouseMove = (event: MouseEvent) => {
      const rect = node.getBoundingClientRect()
      setMousePosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      })
    }

    node.addEventListener("mousemove", handleMouseMove)

    return () => {
      node.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return (
    <section
      ref={heroRef}
      id="hero-section"
      className="relative mx-auto flex min-h-screen w-full flex-col items-center overflow-hidden bg-black px-4 py-0 text-center"
    >
      <div className="absolute inset-0 z-0 h-full w-full bg-gradient-to-br from-yellow-500/10 via-black to-purple-900/20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(234, 179, 8, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(234, 179, 8, 0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <motion.div
          className="absolute h-96 w-96 rounded-full bg-yellow-500/20 blur-3xl"
          animate={{
            x: x - 192,
            y: y - 192,
          }}
          transition={{ type: "spring", damping: 30, stiffness: 200 }}
        />
      </div>

      <div className="relative z-10 flex h-full max-w-6xl flex-col items-center justify-center space-y-8 px-4 pb-16 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center border-2 border-yellow-500 bg-yellow-500/20 px-4 py-2 text-sm font-bold uppercase tracking-wider text-yellow-500"
        >
          <BicepsFlexed className="mr-2 h-4 w-4" />
          For Student Athletes
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl font-black uppercase leading-tight text-white md:text-7xl lg:text-8xl"
        >
          The Locker
          <br />
          <span className="text-yellow-500">Room</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-2xl text-lg font-medium text-gray-300 md:text-xl"
        >
          Rate. Review. Reform.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="pt-4"
        >
          <Button
            size="lg"
            className="border-4 border-black bg-yellow-500 px-12 py-6 text-lg font-black uppercase tracking-wider text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-yellow-400 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            onClick={onGetStarted}
          >
            Get Started
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex items-center space-x-12 pt-8 text-sm font-bold uppercase text-gray-400"
        >
          <div className="text-center">
            <div className="text-2xl font-black text-yellow-500">10K+</div>
            <div>Athletes</div>
          </div>
          <div className="h-12 w-px bg-yellow-500/30" />
          <div className="text-center">
            <div className="text-2xl font-black text-yellow-500">500+</div>
            <div>Schools</div>
          </div>
          <div className="h-12 w-px bg-yellow-500/30" />
          <div className="text-center">
            <div className="text-2xl font-black text-yellow-500">$2M+</div>
            <div>NIL Tracked</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

const SanctioningBodiesSection = () => {
  const bodies = [
    { name: "NCAA", color: "#eab308" },
    { name: "NAIA", color: "#f59e0b" },
    { name: "NJCAA", color: "#facc15" },
    { name: "CCCAA", color: "#fbbf24" },
    { name: "USCAA", color: "#fcd34d" },
    { name: "NWAC", color: "#fde047" },
  ]

  const repeatedBodies = [...bodies, ...bodies]

  return (
    <section className="relative w-full overflow-hidden bg-black py-12 border-t-8 border-yellow-500">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          ease: "linear",
          duration: 20,
          repeat: Infinity,
        }}
      >
        {repeatedBodies.map((body, index) => (
          <div
            key={index}
            className="mx-12 text-5xl font-black uppercase"
            style={{ color: body.color }}
          >
            {body.name}
          </div>
        ))}
      </motion.div>
    </section>
  )
}

const FeaturesSection = () => (
  <section id="features" className="w-full bg-black px-4 py-32">
    <div className="mx-auto max-w-7xl">
      <div className="mb-20 text-center">
        <h2 className="mb-6 text-5xl font-black uppercase text-white md:text-6xl">
          Built For <span className="text-yellow-500">Champions</span>
        </h2>
        <div className="mx-auto h-2 w-32 bg-yellow-500" />
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, description }, index) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="group border-4 border-yellow-500/30 bg-white/5 p-8 transition-all hover:border-yellow-500"
          >
            <Icon className="mb-4 h-12 w-12 text-yellow-500 transition-transform group-hover:scale-110" />
            <h3 className="mb-3 text-2xl font-black uppercase text-white">{title}</h3>
            <p className="font-medium text-gray-400">{description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
)

const ProofSection = () => {
  return (
    <section id="proof" className="w-full bg-gradient-to-b from-black to-purple-900/20 px-4 py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16">
          <h2 className="mb-8 text-4xl font-black uppercase text-white md:text-5xl">
            The Numbers <span className="text-yellow-500">Don't Lie</span>
          </h2>
          <p className="max-w-3xl text-lg font-medium text-gray-300">
            Student athletes are taking control of their journey. Join thousands
            who are making informed decisions about their future.
          </p>
        </div>

        <div className="mb-16 grid grid-cols-2 gap-8 md:grid-cols-4">
          {proofStats.map((stat) => (
            <div
              key={stat.label}
              className="border-4 border-yellow-500 bg-black/50 p-6"
            >
              <p className="mb-2 text-5xl font-black text-yellow-500">
                {stat.value}
              </p>
              <p className="text-sm font-bold uppercase text-gray-300">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="h-64 w-full border-4 border-yellow-500/30 bg-black/50 p-8">
          <ResponsiveContainer width="100%" height="110%">
            <AreaChart data={proofData}>
              <defs>
                <linearGradient id="colorYellow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(17, 17, 17, 0.9)",
                  borderColor: "rgba(234, 179, 8, 0.5)",
                  borderRadius: "0.75rem",
                  color: "#facc15",
                }}
              />
              <Area
                type="monotone"
                dataKey="athletes"
                stroke="#eab308"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorYellow)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  )
}

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0)

  const activeTestimonial = useMemo(
    () => testimonials[activeIndex],
    [activeIndex]
  )

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % testimonials.length)
    }, 5000)

    return () => window.clearInterval(timer)
  }, [])

  const handlePrev = () => {
    setActiveIndex((index) => (index - 1 + testimonials.length) % testimonials.length)
  }

  const handleNext = () => {
    setActiveIndex((index) => (index + 1) % testimonials.length)
  }

  return (
    <section id="athlete-voices" className="w-full bg-black px-4 py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-20 text-center">
          <h2 className="mb-6 text-5xl font-black uppercase text-white md:text-6xl">
            Athlete <span className="text-yellow-500">Voices</span>
          </h2>
          <div className="mx-auto h-2 w-32 bg-yellow-500" />
        </div>

        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div className="relative h-96">
            <AnimatePresence>
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.src}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: index === activeIndex ? 1 : 0,
                    scale: index === activeIndex ? 1 : 0.8,
                    zIndex: index === activeIndex ? 10 : 0,
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <img
                    src={testimonial.src}
                    alt={testimonial.name}
                    className="h-full w-full object-cover border-8 border-yellow-500"
                    onError={(event) => {
                      const target = event.currentTarget
                      target.src = `https://placehold.co/500x500/eab308/000000?text=${testimonial.name.charAt(0)}`
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h3 className="mb-2 text-3xl font-black uppercase text-white">
                    {activeTestimonial.name}
                  </h3>
                  <p className="text-sm font-bold uppercase text-yellow-500">
                    {activeTestimonial.designation}
                  </p>
                </div>
                <p className="mb-8 border-l-4 border-yellow-500 pl-6 text-xl font-medium text-gray-300">
                  "{activeTestimonial.quote}"
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handlePrev}
                className="h-14 w-14 border-4 border-black bg-yellow-500 font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-yellow-400 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                aria-label="Previous testimonial"
              >
                <ArrowLeft className="mx-auto h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="h-14 w-14 border-4 border-black bg-yellow-500 font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-yellow-400 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                aria-label="Next testimonial"
              >
                <ArrowRight className="mx-auto h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const FooterSection = () => (
  <footer className="w-full border-t-8 border-yellow-500 bg-black">
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-12 flex flex-col items-center">
        <div className="mb-6 flex items-center space-x-3">
          <Trophy className="h-12 w-12 text-yellow-500" />
          <span className="text-3xl font-black uppercase text-white">
            The Locker Room
          </span>
        </div>
        <p className="max-w-xl text-center font-medium text-gray-400">
          Empowering student athletes with transparency, data, and community.
          Your career, your choice.
        </p>
      </div>

      <div className="mb-12 flex justify-center space-x-6">
        {socialLinks.map(({ icon: Icon, label, href }) => (
          <a
            key={label}
            href={href}
            className="flex h-12 w-12 items-center justify-center bg-yellow-500 transition-colors hover:bg-yellow-400"
            aria-label={label}
            target="_blank"
            rel="noreferrer"
          >
            <Icon className="h-6 w-6 text-black" />
          </a>
        ))}
      </div>

      <div className="border-t-2 border-yellow-500/30 pt-8 text-center">
        <p className="text-sm font-bold uppercase text-gray-500">
          © 2025 The Locker Room. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
)

export const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  return (
    <div className="w-full bg-black text-white">
      <HeroSection onGetStarted={onGetStarted} />
      <SanctioningBodiesSection />
      <FeaturesSection />
      <ProofSection />
      <TestimonialsSection />
      <FooterSection />
    </div>
  )
}

export default LandingPage
