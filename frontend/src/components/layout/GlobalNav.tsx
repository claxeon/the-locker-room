import React, { useMemo } from 'react'
import { Briefcase, FileText, Home, Search, LayoutDashboard, LogIn } from 'lucide-react'
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
    name: 'Search',
    to: '/directory#filters',
    icon: Search,
    isActiveMatch: (path, hash) => path === '/directory' && hash === '#filters',
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

  // Check if Dashboard tab is active (for the auth pill)
  const isDashboardActive = location.pathname === '/dashboard'

  return (
    <div className="fixed left-1/2 z-50 -translate-x-1/2 bottom-6 sm:bottom-auto sm:top-6 flex flex-col items-center gap-2">
      {/* Auth action pill — Sign In or Sign Out, sits above/below the main nav */}
      {user ? (
        <motion.button
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleSignOut}
          className={cn(
            'hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-colors',
            'border border-zinc-700/60 bg-black/50 backdrop-blur-xl',
            'text-zinc-400 hover:text-red-400 hover:border-red-500/40',
          )}
        >
          Sign Out
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden sm:block"
        >
          <NavLink
            to="/login"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-colors',
                'border bg-black/50 backdrop-blur-xl',
                isActive
                  ? 'border-yellow-500/40 text-yellow-300'
                  : 'border-zinc-700/60 text-zinc-400 hover:text-yellow-400 hover:border-yellow-500/30',
              )
            }
          >
            <LogIn size={13} strokeWidth={2.5} />
            Sign In
          </NavLink>
        </motion.div>
      )}

      {/* Main tab nav */}
      <NavBar items={navItems} />

      {/* Mobile sign in / sign out — visible below nav on small screens */}
      {user ? (
        <button
          onClick={handleSignOut}
          className="flex sm:hidden items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest border border-zinc-700/60 bg-black/50 backdrop-blur-xl text-zinc-400 hover:text-red-400 hover:border-red-500/40 transition-colors"
        >
          Sign Out
        </button>
      ) : (
        <NavLink
          to="/login"
          className="flex sm:hidden items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest border border-zinc-700/60 bg-black/50 backdrop-blur-xl text-zinc-400 hover:text-yellow-400 hover:border-yellow-500/30 transition-colors"
        >
          <LogIn size={13} strokeWidth={2.5} />
          Sign In
        </NavLink>
      )}
    </div>
  )
}

export default GlobalNav
