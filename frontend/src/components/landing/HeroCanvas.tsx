/**
 * HeroCanvas.tsx
 * Canvas 2D particle network — athlete-program connection graph.
 * Pure 2D canvas avoids WebGL alpha/transparency issues on all browsers.
 */
import { useEffect, useRef } from 'react'

const ACCENT     = '#14B8A6'
const TEAL_RGB   = '20,184,166'
const CREAM_RGB  = '245,239,224'
const LAV_RGB    = '155,151,181'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  isHub: boolean
  colorRGB: string
  phase: number   // for pulse animation
}

export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // ─── Size canvas to its CSS size (device-pixel-ratio aware) ────────────
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width  = canvas!.offsetWidth  * dpr
      canvas!.height = canvas!.offsetHeight * dpr
      ctx!.scale(dpr, dpr)
    }
    resize()

    const W = () => canvas!.offsetWidth
    const H = () => canvas!.offsetHeight

    // ─── Build particles ───────────────────────────────────────────────────
    const TOTAL  = 130
    const HUBS   = 14
    const particles: Particle[] = []

    for (let i = 0; i < TOTAL; i++) {
      const isHub = i < HUBS
      const colors = [TEAL_RGB, TEAL_RGB, TEAL_RGB, CREAM_RGB, LAV_RGB]
      particles.push({
        x: Math.random() * W(),
        y: Math.random() * H(),
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.18,
        radius: isHub ? 3.5 + Math.random() * 2 : 1.2 + Math.random() * 1.4,
        isHub,
        colorRGB: colors[Math.floor(Math.random() * colors.length)],
        phase: Math.random() * Math.PI * 2,
      })
    }

    // ─── Mouse parallax ────────────────────────────────────────────────────
    let mouseX = 0.5, mouseY = 0.5   // normalized 0-1
    let offsetX = 0, offsetY = 0     // smooth offset applied to camera view

    function onMouseMove(e: MouseEvent) {
      mouseX = e.clientX / window.innerWidth
      mouseY = e.clientY / window.innerHeight
    }
    window.addEventListener('mousemove', onMouseMove)

    // ─── Resize observer ───────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      resize()
      // Re-scatter any particles outside new bounds
      const w = W(), h = H()
      particles.forEach(p => {
        if (p.x > w) p.x = Math.random() * w
        if (p.y > h) p.y = Math.random() * h
      })
    })
    ro.observe(canvas)

    // ─── Animation ─────────────────────────────────────────────────────────
    const CONNECT_DIST     = 140  // px
    const HUB_CONNECT_DIST = 210  // px
    let animId = 0

    function draw(timestamp: number) {
      animId = requestAnimationFrame(draw)
      const t  = timestamp * 0.001
      const w  = W()
      const h  = H()

      // Smooth parallax offset (±18px)
      offsetX += ((mouseX - 0.5) * 36 - offsetX) * 0.04
      offsetY += ((mouseY - 0.5) * 24 - offsetY) * 0.04

      ctx!.clearRect(0, 0, w, h)

      // Update positions
      particles.forEach(p => {
        p.x += p.vx + Math.sin(t * 0.4 + p.phase) * 0.08
        p.y += p.vy + Math.cos(t * 0.3 + p.phase) * 0.06
        if (p.x < -20)  p.x = w + 20
        if (p.x > w + 20) p.x = -20
        if (p.y < -20)  p.y = h + 20
        if (p.y > h + 20) p.y = -20
      })

      // Draw connections first (below dots)
      for (let i = 0; i < TOTAL; i++) {
        for (let j = i + 1; j < TOTAL; j++) {
          const a = particles[i]
          const b = particles[j]
          const dx = (a.x + offsetX) - (b.x + offsetX)
          const dy = (a.y + offsetY) - (b.y + offsetY)
          const dist = Math.sqrt(dx * dx + dy * dy)
          const maxD = (a.isHub || b.isHub) ? HUB_CONNECT_DIST : CONNECT_DIST

          if (dist < maxD) {
            const alpha = (1 - dist / maxD) * 0.35
            ctx!.beginPath()
            ctx!.moveTo(a.x + offsetX, a.y + offsetY)
            ctx!.lineTo(b.x + offsetX, b.y + offsetY)
            ctx!.strokeStyle = `rgba(${TEAL_RGB},${alpha})`
            ctx!.lineWidth = a.isHub || b.isHub ? 0.8 : 0.5
            ctx!.stroke()
          }
        }
      }

      // Draw particles (dots with glow)
      particles.forEach(p => {
        const px = p.x + offsetX
        const py = p.y + offsetY
        const pulse = 1 + 0.2 * Math.sin(t * 1.8 + p.phase)
        const r = p.radius * pulse

        // Outer glow
        const glow = ctx!.createRadialGradient(px, py, 0, px, py, r * (p.isHub ? 5 : 3))
        glow.addColorStop(0, `rgba(${p.colorRGB},${p.isHub ? 0.5 : 0.3})`)
        glow.addColorStop(1, `rgba(${p.colorRGB},0)`)
        ctx!.beginPath()
        ctx!.arc(px, py, r * (p.isHub ? 5 : 3), 0, Math.PI * 2)
        ctx!.fillStyle = glow
        ctx!.fill()

        // Core dot
        ctx!.beginPath()
        ctx!.arc(px, py, r, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${p.colorRGB},${p.isHub ? 0.9 : 0.7})`
        ctx!.fill()
      })
    }

    requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouseMove)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        display: 'block',
      }}
    />
  )
}
