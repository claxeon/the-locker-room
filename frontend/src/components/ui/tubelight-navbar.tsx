import React, { useMemo } from "react"
import { motion } from "framer-motion"
import { NavLink, useLocation } from "react-router-dom"
import { LucideIcon } from "lucide-react"

import { cn } from "../../lib/utils"

export type TubelightNavItem = {
  name: string
  to: string
  icon: LucideIcon
  isActiveMatch?: (path: string, hash: string) => boolean
}

export type TubelightNavBarProps = {
  items: TubelightNavItem[]
  className?: string
}

export function NavBar({ items, className }: TubelightNavBarProps) {
  const location = useLocation()
  const activeItem = useMemo(() => {
    const { pathname, hash } = location
    return (
      items.find((item) => item.isActiveMatch?.(pathname, hash)) ??
      items.find((item) => {
        const [itemPath, itemHash] = item.to.split("#")
        const matchesPath = pathname === itemPath
        if (!itemHash) {
          return matchesPath
        }
        return matchesPath && hash === `#${itemHash}`
      }) ??
      items[0]
    )
  }, [items, location])

  return (
    <div
      className={cn(
        "fixed left-1/2 z-50 -translate-x-1/2",
        "bottom-6 sm:bottom-auto sm:top-6",
        className,
      )}
    >
      {/* Nav pill — navy surface, periwinkle border/glow */}
      <div
        className="flex items-center gap-1 rounded-full px-2 py-2 backdrop-blur-xl"
        style={{
          border: '1px solid rgba(124,126,184,0.28)',
          backgroundColor: 'rgba(26,26,46,0.85)',
          boxShadow: '0 20px 60px -15px rgba(124,126,184,0.30)',
        }}
      >
        {items.map((item) => {
          const Icon = item.icon
          const isActive = item.name === activeItem.name

          return (
            <NavLink
              key={item.name}
              to={item.to}
              className={() =>
                cn(
                  "relative flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold uppercase tracking-[0.25em] transition-colors",
                  isActive ? "text-[#f0f0f8]" : "text-[#555570] hover:text-[#a8a8c0]",
                )
              }
              aria-label={item.name}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="inline md:hidden" aria-hidden>
                <Icon size={18} strokeWidth={2.5} />
              </span>

              {isActive && (
                <motion.div
                  layoutId="tubelight"
                  className="absolute inset-0 -z-10 rounded-full"
                  style={{
                    border: '1px solid rgba(124,126,184,0.30)',
                    backgroundColor: 'rgba(124,126,184,0.14)',
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                >
                  {/* Periwinkle tube-light top accent */}
                  <div
                    className="absolute -top-3 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full"
                    style={{ backgroundColor: '#9496cc' }}
                  >
                    <div
                      className="absolute -top-2 left-1/2 h-5 w-12 -translate-x-1/2 rounded-full blur"
                      style={{ backgroundColor: 'rgba(148,150,204,0.28)' }}
                    />
                  </div>
                </motion.div>
              )}
            </NavLink>
          )
        })}
      </div>
    </div>
  )
}

export default NavBar
