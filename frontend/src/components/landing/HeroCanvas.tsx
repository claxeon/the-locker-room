/**
 * HeroCanvas.tsx
 * Three.js particle network — represents athletes + programs connected across the country.
 * ~150 glowing nodes, teal connection lines, slow drift, mouse parallax.
 */
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface Particle {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  size: number
  isHub: boolean // larger "school" nodes
}

export function HeroCanvas() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // ─── Renderer ──────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // ─── Scene + Camera ────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 1000)
    camera.position.set(0, 0, 28)

    // ─── Particles ─────────────────────────────────────────────────────────
    const PARTICLE_COUNT = 140
    const HUB_COUNT = 12
    const SPREAD = 18
    const particles: Particle[] = []

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const isHub = i < HUB_COUNT
      particles.push({
        x: (Math.random() - 0.5) * SPREAD * 2,
        y: (Math.random() - 0.5) * SPREAD,
        z: (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 0.004,
        vy: (Math.random() - 0.5) * 0.003,
        vz: (Math.random() - 0.5) * 0.002,
        size: isHub ? 0.22 + Math.random() * 0.12 : 0.06 + Math.random() * 0.08,
        isHub,
      })
    }

    // ─── Point geometry (dots) ─────────────────────────────────────────────
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const colors = new Float32Array(PARTICLE_COUNT * 3)
    const sizes = new Float32Array(PARTICLE_COUNT)

    const tealColor = new THREE.Color('#14B8A6')
    const creamColor = new THREE.Color('#F5EFE0')
    const lavColor = new THREE.Color('#9B97B5')

    particles.forEach((p, i) => {
      positions[i * 3]     = p.x
      positions[i * 3 + 1] = p.y
      positions[i * 3 + 2] = p.z
      sizes[i] = p.size

      const c = p.isHub ? creamColor : (Math.random() > 0.3 ? tealColor : lavColor)
      colors[i * 3]     = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    })

    const pointGeo = new THREE.BufferGeometry()
    pointGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    pointGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    pointGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    // Custom shader material for soft glowing dots
    const pointMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vSize;
        uniform float uTime;
        void main() {
          vColor = color;
          vSize = size;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          float pulse = 1.0 + 0.15 * sin(uTime * 1.2 + position.x * 0.5 + position.y * 0.7);
          gl_PointSize = size * 220.0 * pulse * (1.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vSize;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float dist = length(uv);
          if (dist > 0.5) discard;
          float alpha = smoothstep(0.5, 0.0, dist);
          float glow = smoothstep(0.5, 0.05, dist) * 0.6;
          gl_FragColor = vec4(vColor, (alpha + glow) * 0.85);
        }
      `,
      transparent: true,
      vertexColors: true,
      depthWrite: false,
    })

    const points = new THREE.Points(pointGeo, pointMat)
    scene.add(points)

    // ─── Line geometry (connections) ───────────────────────────────────────
    const MAX_LINES = 300
    const linePositions = new Float32Array(MAX_LINES * 6)
    const lineColors    = new Float32Array(MAX_LINES * 6)

    const lineGeo = new THREE.BufferGeometry()
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))
    lineGeo.setAttribute('color',    new THREE.BufferAttribute(lineColors, 3))

    const lineMat = new THREE.LineSegments(
      lineGeo,
      new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.25, depthWrite: false }),
    )
    scene.add(lineMat)

    // ─── Mouse parallax ────────────────────────────────────────────────────
    let mouseX = 0, mouseY = 0
    let targetX = 0, targetY = 0

    function onMouseMove(e: MouseEvent) {
      mouseX = (e.clientX / window.innerWidth  - 0.5) * 2
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove)

    // ─── Resize ────────────────────────────────────────────────────────────
    function onResize() {
      if (!mount) return
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }
    window.addEventListener('resize', onResize)

    // ─── Animation loop ────────────────────────────────────────────────────
    let animId = 0
    const CONNECT_DIST  = 5.0
    const HUB_CONNECT_DIST = 8.0

    function animate(time: number) {
      animId = requestAnimationFrame(animate)
      const t = time * 0.001

      // Update shader time
      pointMat.uniforms.uTime.value = t

      // Smooth camera parallax
      targetX += (mouseX * 1.5 - targetX) * 0.04
      targetY += (-mouseY * 1.0 - targetY) * 0.04
      camera.position.x = targetX
      camera.position.y = targetY
      camera.lookAt(scene.position)

      // Drift particles
      const pos = pointGeo.attributes.position.array as Float32Array
      particles.forEach((p, i) => {
        p.x += p.vx + Math.sin(t * 0.3 + i * 0.5) * 0.001
        p.y += p.vy + Math.cos(t * 0.2 + i * 0.7) * 0.001
        p.z += p.vz

        // Wrap
        if (p.x >  SPREAD) p.x = -SPREAD
        if (p.x < -SPREAD) p.x =  SPREAD
        if (p.y >  SPREAD * 0.5) p.y = -SPREAD * 0.5
        if (p.y < -SPREAD * 0.5) p.y =  SPREAD * 0.5
        if (p.z >  5) p.z = -5
        if (p.z < -5) p.z =  5

        pos[i * 3]     = p.x
        pos[i * 3 + 1] = p.y
        pos[i * 3 + 2] = p.z
      })
      pointGeo.attributes.position.needsUpdate = true

      // Build connection lines
      let lineIdx = 0
      const lp = lineGeo.attributes.position.array as Float32Array
      const lc = lineGeo.attributes.color.array as Float32Array

      for (let i = 0; i < PARTICLE_COUNT && lineIdx < MAX_LINES; i++) {
        for (let j = i + 1; j < PARTICLE_COUNT && lineIdx < MAX_LINES; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dz = particles[i].z - particles[j].z
          const dist = Math.sqrt(dx*dx + dy*dy + dz*dz)
          const threshold = (particles[i].isHub || particles[j].isHub) ? HUB_CONNECT_DIST : CONNECT_DIST

          if (dist < threshold) {
            const alpha = (1 - dist / threshold)
            const ri = lineIdx * 6

            lp[ri]     = particles[i].x; lp[ri + 1] = particles[i].y; lp[ri + 2] = particles[i].z
            lp[ri + 3] = particles[j].x; lp[ri + 4] = particles[j].y; lp[ri + 5] = particles[j].z

            // Teal lines, fade by distance
            lc[ri]     = tealColor.r * alpha; lc[ri + 1] = tealColor.g * alpha; lc[ri + 2] = tealColor.b * alpha
            lc[ri + 3] = tealColor.r * alpha; lc[ri + 4] = tealColor.g * alpha; lc[ri + 5] = tealColor.b * alpha

            lineIdx++
          }
        }
      }

      // Zero out remaining line slots
      for (let i = lineIdx; i < MAX_LINES; i++) {
        const ri = i * 6
        lp[ri] = lp[ri+1] = lp[ri+2] = lp[ri+3] = lp[ri+4] = lp[ri+5] = 0
      }

      lineGeo.attributes.position.needsUpdate = true
      lineGeo.attributes.color.needsUpdate    = true
      lineGeo.setDrawRange(0, lineIdx * 2)

      renderer.render(scene, camera)
    }

    animate(0)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      pointGeo.dispose()
      lineGeo.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      aria-hidden="true"
    />
  )
}
