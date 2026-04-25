import React from 'react'
import { Briefcase, FileText, Home, Search } from 'lucide-react'

import { NavBar, TubelightNavItem } from '../ui/tubelight-navbar'

const navItems: TubelightNavItem[] = [
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
  return <NavBar items={navItems} />
}

export default GlobalNav
