/**
 * SubmitReviewPage — The Locker Room
 *
 * Wrapper for ReviewForm. School and sport are locked to the athlete's
 * verified profile affiliation — no URL params needed or honored.
 *
 * Multiple verified affiliations (e.g. transferred athletes) show a picker
 * inside the form itself.
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ReviewForm } from '../components/reviews/ReviewForm'
import GlobalNav from '../components/layout/GlobalNav'
import { motion } from 'framer-motion'

const serifItalic: React.CSSProperties = {
  fontFamily: "'Instrument Serif', Georgia, serif",
  fontStyle: 'italic',
}

export const SubmitReviewPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen w-full bg-[#0A0E1A] text-white">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 60% 35% at 50% -5%, rgba(124,126,184,0.12) 0%, transparent 70%)',
        }}
      />

      <GlobalNav />

      <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 pb-32 pt-28">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-2"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-[#14B8A6]">
            Verified Athletes Only
          </p>
          <h1
            className="leading-tight text-white"
            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', ...serifItalic }}
          >
            Write a{' '}
            <span className="not-italic font-black uppercase tracking-tight">
              Review
            </span>
          </h1>
          <p className="text-sm text-[#555570] leading-relaxed max-w-lg">
            Your review is scoped to your verified program and posted anonymously by default.
            It goes live after a brief moderation review — usually under 24 hours.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <ReviewForm
            onSuccess={() => navigate('/dashboard')}
            onCancel={() => navigate(-1)}
          />
        </motion.div>
      </main>
    </div>
  )
}

export default SubmitReviewPage
