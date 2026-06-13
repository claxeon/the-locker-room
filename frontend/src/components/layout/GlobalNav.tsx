import React, { useMemo, useState, useRef, useEffect } from 'react'
import {
  Home,
  Flame,
  LayoutGrid,
  LayoutDashboard,
  ChevronDown,
  LogOut,
  User,
  Menu,
} from 'lucide-react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

import { NavBar, TubelightNavItem } from '../ui/tubelight-navbar'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface GlobalNavProps {}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const baseNavItems: TubelightNavItem[] = [
  {
    name: 'Home',
    to: '/',
    icon: Home,
  },
  {
    name: 'Programs',
    to: '/directory',
    icon: LayoutGrid,
    isActiveMatch: (path) => path === '/directory' || path.startsWith('/school/'),
  },
  {
    name: 'Explore',
    to: '/explore',
    icon: Flame,
    isActiveMatch: (path) => path === '/explore',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// AccountMenu — logged-in state: "My Account" dropdown
// ─────────────────────────────────────────────────────────────────────────────

function AccountMenu({ onSignOut }: { onSignOut: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest transition-colors duration-150"
        style={{ color: open ? 'var(--foreground, #f0f0f8)' : 'rgba(255,255,255,0.45)' }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.80)')
        }
        onMouseLeave={(e) => {
          if (!open)
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.45)'
        }}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <User size={13} strokeWidth={2} />
        My Account
        <ChevronDown
          size={11}
          strokeWidth={2}
          style={{
            transition: 'transform 150ms ease',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-3 min-w-[160px] rounded-xl py-1.5"
            style={{
              border: '1px solid rgba(255,255,255,0.08)',
              backgroundColor: '#14151F',
              boxShadow: '0 16px 48px 0 rgba(0,0,0,0.60)',
            }}
          >
            <NavLink
              to="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors duration-150"
              style={{ color: 'rgba(255,255,255,0.45)' }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.backgroundColor = 'rgba(255,255,255,0.05)'
                el.style.color = 'var(--foreground, #f0f0f8)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.backgroundColor = 'transparent'
                el.style.color = 'rgba(255,255,255,0.45)'
              }}
            >
              <LayoutDashboard size={12} />
              Dashboard
            </NavLink>

            <div className="my-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />

            <button
              onClick={() => { setOpen(false); onSignOut() }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors duration-150"
              style={{ color: 'rgba(255,255,255,0.30)' }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.backgroundColor = 'rgba(255,255,255,0.05)'
                el.style.color = '#f87171'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.backgroundColor = 'transparent'
                el.style.color = 'rgba(255,255,255,0.30)'
              }}
            >
              <LogOut size={12} />
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// GlobalNav — full-width fixed header, single row: wordmark | nav | sign-in
// ─────────────────────────────────────────────────────────────────────────────

export const GlobalNav: React.FC<GlobalNavProps> = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Scroll-based backdrop
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 50) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navItems: TubelightNavItem[] = useMemo(() => {
    if (user) {
      return [
        ...baseNavItems,
        {
          name: 'Dashboard',
          to: '/dashboard',
          icon: LayoutDashboard,
          isActiveMatch: (path) => path === '/dashboard',
        },
      ]
    }
    return baseNavItems
  }, [user])

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/')
  }

  const isAuthPage =
    location.pathname === '/login' || location.pathname === '/signup'

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
      style={{
        paddingLeft: 'clamp(16px, 4vw, 32px)',
        paddingRight: 'clamp(16px, 4vw, 32px)',
        paddingTop: '20px',
        paddingBottom: '20px',
        // Backdrop fades in on scroll
        backgroundColor: scrolled ? 'rgba(10,14,26,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
      }}
    >
      {/* Three-column grid: wordmark | nav | auth */}
      <div className="flex items-center justify-between gap-4">

        {/* LEFT — Logomark */}
        <Link
          to="/"
          className="flex-shrink-0 select-none transition-opacity duration-150 hover:opacity-75"
          style={{ textDecoration: 'none', lineHeight: 0 }}
          aria-label="The Locker Room — home"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 232 48"
            fill="none"
            aria-hidden="true"
            style={{ height: '36px', width: 'auto', display: 'block' }}
          >
            {/* Shackle */}
            <path
              d="M 9 25.5 L 9 17 A 9 9 0 0 1 27 17 L 27 25.5"
              stroke="#14B8A6"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />
            {/* Lock body */}
            <rect x="4" y="24" width="28" height="20" rx="3"
              stroke="#F5EFE0" strokeWidth="1.5" fill="none"
            />
            {/* Seamless shackle–body junction — erases top-edge stroke between shackle legs */}
            <line x1="9.5" y1="24" x2="26.5" y2="24" stroke="#0A0E1A" strokeWidth="2.2" />
            {/* Keyhole circle */}
            <circle cx="18" cy="31" r="2.2" fill="#14B8A6" />
            {/* Keyhole drop */}
            <rect x="16.9" y="32.8" width="2.2" height="4.4" rx="1.1" fill="#14B8A6" />
            {/* THE */}
            <text
              x="44" y="19"
              fontFamily="'Instrument Serif', Georgia, serif"
              fontSize="9"
              fontWeight="400"
              letterSpacing="0.28em"
              fill="#9B97B5"
              dominantBaseline="middle"
            >THE</text>
            {/* LOCKER ROOM */}
            <text
              x="44" y="35.5"
              fontFamily="'Instrument Serif', Georgia, serif"
              fontSize="17.5"
              fontWeight="700"
              letterSpacing="0.045em"
              fill="#F5EFE0"
              dominantBaseline="middle"
            >LOCKER ROOM</text>
          </svg>
        </Link>

        {/* CENTER — Nav pill (hidden below md) */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
          <NavBar items={navItems} />
        </div>

        {/* RIGHT — Auth controls */}
        <div className="flex flex-shrink-0 items-center gap-4">
          {/* Mobile: hamburger (placeholder — opens no drawer, just shows icon) */}
          <button
            className="flex items-center justify-center md:hidden transition-colors duration-150"
            style={{ color: 'rgba(255,255,255,0.45)' }}
            aria-label="Open menu"
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.color = 'var(--foreground, #f0f0f8)')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.45)')
            }
          >
            <Menu size={20} strokeWidth={1.75} />
          </button>

          {/* Auth — logged in: account menu / logged out: plain "Sign In →" text link */}
          {user ? (
            <AccountMenu onSignOut={handleSignOut} />
          ) : isAuthPage ? null : (
            <NavLink
              to="/login"
              className="flex items-center gap-1 text-xs font-semibold uppercase tracking-widest transition-colors duration-150"
              style={{ color: 'rgba(255,255,255,0.40)', textDecoration: 'none' }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--foreground, #f0f0f8)')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.40)')
              }
            >
              Sign In
              <span aria-hidden style={{ fontSize: '13px', lineHeight: 1 }}>→</span>
            </NavLink>
          )}
        </div>
      </div>
    </header>
  )
}

export default GlobalNav
