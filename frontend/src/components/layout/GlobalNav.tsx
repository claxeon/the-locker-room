import React, { useMemo } from 'react'
import { Briefcase, FileText, Home, Flame, LayoutDashboard, LogIn } from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

import { NavBar, TubelightNavItem } from '../ui/tubelight-navbar'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { cn } from '../../lib/utils'

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
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="fixed top-5 right-5 z-50 sm:top-6 sm:right-6"
      >
        {user ? (
          <button
            onClick={handleSignOut}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-colors',
              'border border-zinc-800 bg-zinc-900/90 backdrop-blur-xl',
              'text-zinc-500 hover:text-red-400 hover:border-red-500/40',
            )}
          >
            Sign Out
          </button>
        ) : (
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
    </>
  )
}

export default GlobalNav
