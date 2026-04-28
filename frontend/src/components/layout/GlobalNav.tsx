import React, { useMemo, useState, useRef, useEffect } from 'react'
import { Briefcase, FileText, Home, Flame, LayoutDashboard, LogIn, ChevronDown, LogOut, User } from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

import { NavBar, TubelightNavItem } from '../ui/tubelight-navbar'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { cn } from '../../lib/utils'

// ── AuthPill — top-right corner auth control
// Shows "Sign In" button when logged out.
// When logged in: shows a user menu dropdown with Dashboard + Sign Out.
// Sign Out is NEVER a primary nav action — it lives inside the dropdown.
function AuthPill({
  user,
  onSignOut,
  location,
}: {
  user: ReturnType<typeof import('../../hooks/useAuth').useAuth>['user']
  onSignOut: () => void
  location: ReturnType<typeof useLocation>
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  // Hide Sign In pill on login/signup pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.3 }}
      className="fixed top-5 right-5 z-50 sm:top-6 sm:right-6"
    >
      {user ? (
        <div className="relative">
          <button
            onClick={() => setOpen((p) => !p)}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-colors',
              'border border-zinc-800 bg-zinc-900/90 backdrop-blur-xl',
              open ? 'border-yellow-500/40 text-yellow-400' : 'text-zinc-400 hover:text-white hover:border-zinc-600',
            )}
            aria-haspopup="true"
            aria-expanded={open}
          >
            <User size={12} strokeWidth={2.5} />
            My Account
            <ChevronDown size={11} strokeWidth={2.5} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
          {open && (
            <div className="absolute right-0 top-full mt-2 min-w-[160px] rounded-xl border border-zinc-800 bg-zinc-950 py-1.5 shadow-2xl shadow-black/60">
              <NavLink
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
              >
                <LayoutDashboard size={12} />
                Dashboard
              </NavLink>
              <div className="my-1 h-px bg-zinc-800" />
              <button
                onClick={() => { setOpen(false); onSignOut() }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-zinc-500 hover:bg-zinc-900 hover:text-red-400 transition-colors"
              >
                <LogOut size={12} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      ) : isAuthPage ? null : (
        <NavLink
          to="/login"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-colors',
              'border bg-black/50 backdrop-blur-xl',
              isActive
                ? 'border-yellow-500/40 text-yellow-400'
                : 'border-zinc-800 text-zinc-500 hover:text-yellow-400 hover:border-yellow-500/30',
            )
          }
        >
          <LogIn size={13} strokeWidth={2.5} />
          Sign In
        </NavLink>
      )}
    </motion.div>
  )
}

const baseNavItems: TubelightNavItem[] = [
  {
    name: 'Home',
    to: '/',
    icon: Home,
  },
  {
    name: 'Comparison',
    to: '/college-comparison',
    icon: FileText,
    isActiveMatch: (path) => path === '/college-comparison',
  },
  {
    name: 'Programs',
    to: '/directory',
    icon: Briefcase,
    isActiveMatch: (path, hash) =>
      (path === '/directory' && hash !== '#filters') || path.startsWith('/school/'),
  },
  {
    name: 'Explore',
    to: '/explore',
    icon: Flame,
    isActiveMatch: (path) => path === '/explore',
  },
]

export const GlobalNav: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

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

  return (
    <>
      {/* ── Centered tab nav — bottom on mobile, top center on desktop ── */}
      <div className="fixed left-1/2 z-50 -translate-x-1/2 bottom-6 sm:bottom-auto sm:top-6">
        <NavBar items={navItems} />
      </div>

      {/* ── Auth pill — independent fixed position, top-right corner ── */}
      <AuthPill user={user} onSignOut={handleSignOut} location={location} />
    </>
  )
}

export default GlobalNav
