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

/**
 * NavBar — flat pill nav, no glow, no floating dot, no box-shadow.
 * Positioning is handled by the parent (GlobalNav). This component
 * renders only the pill container + items.
 *
 * Active state: one subtle lighter fill on the segment only.
 * Removed: outer glow/halo, floating dot indicator, border emphasis on active item.
 */
export function NavBar({ items, className }: TubelightNavBarProps) {
  const location = useLocation()

  const activeItem = useMemo(() => {
    const { pathname, hash } = location
    return (
      items.find((item) => item.isActiveMatch?.(pathname, hash)) ??
      items.find((item) => {
        const [itemPath, itemHash] = item.to.split("#")
        if (!itemHash) return pathname === itemPath
        return pathname === itemPath && hash === `#${itemHash}`
      }) ??
      items[0]
    )
  }, [items, location])

  return (
    // Flat pill container — no box-shadow, no glow, no filter
    <div
      className={cn("flex items-center gap-0.5 rounded-full px-1.5 py-1.5", className)}
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        backgroundColor: "rgba(255,255,255,0.04)",
        // No box-shadow — outer glow removed
      }}
    >
      {items.map((item) => {
        const Icon = item.icon
        const isActive = item.name === activeItem.name

        return (
          <NavLink
            key={item.name}
            to={item.to}
            aria-label={item.name}
            aria-current={isActive ? "page" : undefined}
            className="relative flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors duration-150 ease-out"
            style={({ isActive: linkActive }) => {
              // Use the computed isActive (which respects isActiveMatch) not linkActive
              void linkActive
              return {
                color: isActive ? "var(--foreground, #f0f0f8)" : "rgba(255,255,255,0.35)",
              }
            }}
            onMouseEnter={(e) => {
              if (!isActive)
                (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.75)"
            }}
            onMouseLeave={(e) => {
              if (!isActive)
                (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.35)"
            }}
          >
            {/* Desktop: text label */}
            <span className="hidden md:inline">{item.name}</span>
            {/* Mobile: icon only */}
            <span className="inline md:hidden" aria-hidden>
              <Icon size={16} strokeWidth={2} />
            </span>

            {/* Active segment highlight — ONE subtle fill, no border, no glow, no dot */}
            {isActive && (
              <motion.span
                layoutId="nav-active"
                className="absolute inset-0 -z-10 rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </NavLink>
        )
      })}
    </div>
  )
}

export default NavBar
