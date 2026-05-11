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

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

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
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-colors backdrop-blur-xl"
            style={{
              border: `1px solid ${open ? 'rgba(124,126,184,0.40)' : '#3a3a5c'}`,
              backgroundColor: 'rgba(26,26,46,0.90)',
              color: open ? '#9496cc' : '#8888a8',
            }}
            onMouseEnter={e => {
              if (!open) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#4a4a70'
                ;(e.currentTarget as HTMLButtonElement).style.color = '#f0f0f8'
              }
            }}
            onMouseLeave={e => {
              if (!open) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#3a3a5c'
                ;(e.currentTarget as HTMLButtonElement).style.color = '#8888a8'
              }
            }}
            aria-haspopup="true"
            aria-expanded={open}
          >
            <User size={12} strokeWidth={2.5} />
            My Account
            <ChevronDown
              size={11}
              strokeWidth={2.5}
              className={`transition-transform ${open ? 'rotate-180' : ''}`}
            />
          </button>
          {open && (
            <div
              className="absolute right-0 top-full mt-2 min-w-[160px] rounded-xl py-1.5 shadow-2xl"
              style={{
                border: '1px solid #3a3a5c',
                backgroundColor: '#1a1a2e',
                boxShadow: '0 16px 48px 0 rgba(0,0,0,0.60)',
              }}
            >
              <NavLink
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors"
                style={{ color: '#8888a8' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#252540'
                  ;(e.currentTarget as HTMLAnchorElement).style.color = '#f0f0f8'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent'
                  ;(e.currentTarget as HTMLAnchorElement).style.color = '#8888a8'
                }}
              >
                <LayoutDashboard size={12} />
                Dashboard
              </NavLink>
              <div className="my-1 h-px" style={{ backgroundColor: '#3a3a5c' }} />
              <button
                onClick={() => { setOpen(false); onSignOut() }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors"
                style={{ color: '#555570' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#252540'
                  ;(e.currentTarget as HTMLButtonElement).style.color = '#f87171'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                  ;(e.currentTarget as HTMLButtonElement).style.color = '#555570'
                }}
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
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-colors backdrop-blur-xl',
            )
          }
          style={({ isActive }) => ({
            border: `1px solid ${isActive ? 'rgba(124,126,184,0.40)' : '#3a3a5c'}`,
            backgroundColor: 'rgba(15,15,26,0.70)',
            color: isActive ? '#9496cc' : '#555570',
          })}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(124,126,184,0.35)'
            ;(e.currentTarget as HTMLAnchorElement).style.color = '#9496cc'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = '#3a3a5c'
            ;(e.currentTarget as HTMLAnchorElement).style.color = '#555570'
          }}
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
      <div className="fixed left-1/2 z-50 -translate-x-1/2 bottom-6 sm:bottom-auto sm:top-6">
        <NavBar items={navItems} />
      </div>
      <AuthPill user={user} onSignOut={handleSignOut} location={location} />
    </>
  )
}

export default GlobalNav
