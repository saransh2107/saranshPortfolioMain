import { useEffect, useRef } from 'react'

/* Canvas starfield for the hero: twinkling stars plus the occasional shooting star.
   Pauses while off-screen; draws a still sky for reduced-motion visitors. */

type Star = { x: number; y: number; r: number; a: number; speed: number; phase: number; tint: string }
type Meteor = { x: number; y: number; vx: number; vy: number; len: number; life: number; age: number }

const TINTS = ['255,255,255', '255,255,255', '255,255,255', '186,214,255', '255,228,196']

export default function NightSky({ dark }: { dark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const starColor = (tint: string) => (dark ? tint : '109,40,217')

    let w = 0, h = 0, stars: Star[] = [], meteors: Meteor[] = []
    let raf = 0, last = 0, nextMeteor = 1200, visible = true

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth; h = canvas.clientHeight
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.min(420, Math.round((w * h) / 2600))
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h * 0.92,
        r: Math.random() < 0.08 ? 1.2 + Math.random() * 0.9 : 0.3 + Math.random() * 0.8,
        a: 0.35 + Math.random() * 0.65,
        speed: 0.6 + Math.random() * 2.2,
        phase: Math.random() * Math.PI * 2,
        tint: TINTS[Math.floor(Math.random() * TINTS.length)],
      }))
      if (still) draw(0)
    }

    const spawnMeteor = () => {
      const fromLeft = Math.random() < 0.5
      const angle = (18 + Math.random() * 22) * (Math.PI / 180)
      const speed = 900 + Math.random() * 600
      meteors.push({
        x: fromLeft ? Math.random() * w * 0.5 : w * 0.5 + Math.random() * w * 0.5,
        y: Math.random() * h * 0.35,
        vx: Math.cos(angle) * speed * (fromLeft ? 1 : -1),
        vy: Math.sin(angle) * speed,
        len: 120 + Math.random() * 140,
        life: 0.9 + Math.random() * 0.6,
        age: 0,
      })
    }

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h)
      const time = t / 1000
      for (const s of stars) {
        const twinkle = still ? 1 : 0.55 + 0.45 * Math.sin(time * s.speed + s.phase)
        const alpha = s.a * twinkle * (dark ? 1 : 0.35)
        ctx.fillStyle = `rgba(${starColor(s.tint)},${alpha})`
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill()
        if (s.r > 1.2 && dark) {
          // Bright stars get a soft halo
          ctx.fillStyle = `rgba(${s.tint},${alpha * 0.18})`
          ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 3.2, 0, Math.PI * 2); ctx.fill()
        }
      }
      for (const m of meteors) {
        const fade = Math.sin(Math.min(1, m.age / m.life) * Math.PI) // ease in, ease out
        const speed = Math.hypot(m.vx, m.vy)
        const tx = m.x - (m.vx / speed) * m.len, ty = m.y - (m.vy / speed) * m.len
        const color = dark ? '255,255,255' : '109,40,217'
        const grad = ctx.createLinearGradient(m.x, m.y, tx, ty)
        grad.addColorStop(0, `rgba(${color},${0.95 * fade})`)
        grad.addColorStop(0.25, `rgba(${dark ? '186,214,255' : color},${0.45 * fade})`)
        grad.addColorStop(1, `rgba(${color},0)`)
        ctx.strokeStyle = grad; ctx.lineWidth = 1.8; ctx.lineCap = 'round'
        ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(tx, ty); ctx.stroke()
        ctx.fillStyle = `rgba(${color},${fade})`
        ctx.beginPath(); ctx.arc(m.x, m.y, 1.8, 0, Math.PI * 2); ctx.fill()
      }
    }

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick)
      if (!visible) { last = t; return }
      const dt = Math.min(0.05, (t - last) / 1000 || 0)
      last = t
      nextMeteor -= dt * 1000
      if (nextMeteor <= 0) {
        spawnMeteor()
        if (Math.random() < 0.2) setTimeout(spawnMeteor, 250) // the odd pair
        nextMeteor = 2500 + Math.random() * 4000
      }
      for (const m of meteors) { m.x += m.vx * dt; m.y += m.vy * dt; m.age += dt }
      meteors = meteors.filter(m => m.age < m.life)
      draw(t)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting })
    io.observe(canvas)
    if (!still) raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect() }
  }, [dark])

  return <canvas ref={canvasRef} aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />
}
