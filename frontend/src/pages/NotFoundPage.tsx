import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const serifItalic: React.CSSProperties = {
  fontFamily: "'Instrument Serif', Georgia, serif",
  fontStyle: 'italic',
}

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen bg-[#0f0f1a] text-white flex items-center justify-center px-6">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% -5%, rgba(124,126,184,) 0%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center gap-6 max-w-md"
      >
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7c7eb8]">
          404
        </p>
        <h1
          className="text-white leading-[1.05]"
          style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', ...serifItalic }}
        >
          Out of bounds.
        </h1>
        <p className="text-sm text-[#8888a8] max-w-xs leading-relaxed">
          This page doesn't exist or was moved. Head back to the locker room.
        </p>
        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={() => navigate('/')}
            className="rounded-lg bg-[#7c7eb8] px-6 py-3 text-xs font-bold uppercase tracking-widest text-black hover:bg-[#9496cc] transition-colors"
          >
            Back to Home
          </button>
          <button
            onClick={() => navigate('/directory')}
            className="rounded-lg border border-[#3a3a5c] bg-[#1a1a2e] px-6 py-3 text-xs font-semibold uppercase tracking-widest text-[#a8a8c0] hover:border-[#4a4a70] hover:text-white transition-colors"
          >
            Browse Programs
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default NotFoundPage
