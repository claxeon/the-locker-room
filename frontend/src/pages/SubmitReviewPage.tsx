/**
 * SubmitReviewPage
 *
 * Wrapper page for ReviewForm. Accepts ?school_id=123&school_name=... as URL
 * search params (passed by SchoolProfile's "Write a Review" button) so the
 * form arrives pre-populated with the school context.
 *
 * If neither param is provided, the form falls back to its built-in school
 * search picker — so navigating to /submit-review directly still works.
 */

import React from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ReviewForm } from '../components/reviews/ReviewForm'
import GlobalNav from '../components/layout/GlobalNav'
import { motion } from 'framer-motion'

const serifItalic: React.CSSProperties = {
  fontFamily: "'Instrument Serif', Georgia, serif",
  fontStyle: 'italic',
}

export const SubmitReviewPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const schoolIdParam = searchParams.get('school_id')
  const schoolNameParam = searchParams.get('school_name')

  const schoolId = schoolIdParam ? parseInt(schoolIdParam, 10) : 0
  const schoolName = schoolNameParam ? decodeURIComponent(schoolNameParam) : ''

  return (
    <div className="relative min-h-screen w-full bg-black text-white">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 60% 35% at 50% -5%, rgba(234,179,8,0.06) 0%, transparent 70%)',
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
          <p className="text-xs font-semibold uppercase tracking-widest text-yellow-500">
            Verified Athletes Only
          </p>
          <h1
            className="leading-tight text-white"
            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', ...serifItalic }}
          >
            {schoolName ? (
              <>
                Rate{' '}
                <span className="not-italic font-black uppercase tracking-tight">
                  {schoolName}
                </span>
              </>
            ) : (
              <>
                Write a{' '}
                <span className="not-italic font-black uppercase tracking-tight">Review</span>
              </>
            )}
          </h1>
          <p className="text-sm text-zinc-500 leading-relaxed max-w-lg">
            Your review is anonymous and helps future athletes make better decisions.
            It will be visible after a brief moderation review (usually under 24 hours).
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <ReviewForm
            schoolId={schoolId}
            schoolName={schoolName}
            onSuccess={() => navigate('/dashboard')}
            onCancel={() => navigate(-1)}
          />
        </motion.div>
      </main>
    </div>
  )
}

export default SubmitReviewPage
