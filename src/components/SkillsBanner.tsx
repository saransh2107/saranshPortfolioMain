import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { technologies } from '../data/resume'
import SectionHead from './SectionHead'

/* Skills as a night sky: every tool starts dim and a scanner beam lights up whatever it passes over.
   The beam follows the cursor (or a tap) and wanders on its own when left alone. Anything the visitor
   finds stays faintly lit, and a counter tracks how many they've found. */

const CATEGORY_META: Record<string, { color: string; blurb: string }> = {
  Development: { color: '#818cf8', blurb: 'Code on and around the platform' },
  Integration: { color: '#2dd4bf', blurb: 'Connecting Salesforce to everything else' },
  Clouds:      { color: '#38bdf8', blurb: 'Products I build on' },
  Automation:  { color: '#a78bfa', blurb: 'Declarative & guided processes' },
  AI:          { color: '#fbbf24', blurb: 'Agents and predictions' },
  Tooling:     { color: '#fb923c', blurb: 'Ship, version, deploy' },
}

// Biggest groups first, so related tools sit next to each other in the sky
const CATEGORIES = Object.keys(CATEGORY_META).sort((a, b) => count(b) - count(a))
function count(c: string) { return technologies.filter(t => t.category === c).length }
const CHIPS = CATEGORIES.flatMap(c => technologies.filter(t => t.category === c))

const FOUND_GLOW = 0.3 // how lit a found tool stays once the beam moves on

export default function SkillsBanner() {
  const still = useReducedMotion()
  const [mode, setMode] = useState<string>(() => (window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'all' : 'scan'))
  const panelRef = useRef<HTMLDivElement>(null)
  const beamRef = useRef<HTMLDivElement>(null)
  const statusRef = useRef<HTMLSpanElement>(null)
  const scoreRef = useRef<HTMLSpanElement>(null)
  const chipRefs = useRef<(HTMLLIElement | null)[]>([])
  const found = useRef(new Set<number>())

  const updateScore = () => {
    if (scoreRef.current) scoreRef.current.textContent = `${found.current.size}/${CHIPS.length} found`
  }

  useEffect(() => {
    const panel = panelRef.current, beam = beamRef.current
    if (!panel || !beam) return
    const chips = chipRefs.current
    updateScore()

    // Lights on, or one category: no beam, just set each tool's brightness once
    if (mode !== 'scan') {
      chips.forEach((el, i) => el?.style.setProperty('--lit', mode === 'all' || CHIPS[i].category === mode ? '1' : '0'))
      if (statusRef.current) statusRef.current.textContent = mode === 'all'
        ? `all ${CHIPS.length} tools lit`
        : `${mode.toLowerCase()}: ${CATEGORY_META[mode].blurb}`
      return
    }

    let raf = 0, visible = false, x = 0, y = 0, tx = 0, ty = 0, lastInput = -1e4, t = Math.random() * 10, last = 0, nearest = -1
    let centers: { x: number; y: number }[] = [], width = 0, height = 0, radius = 140, frame = 0
    const lastLit: string[] = []
    const measure = () => {
      width = panel.clientWidth; height = panel.clientHeight
      radius = Math.max(95, Math.min(170, width * 0.17))
      centers = chips.map(el => el ? { x: el.offsetLeft + el.offsetWidth / 2, y: el.offsetTop + el.offsetHeight / 2 } : { x: 0, y: 0 })
    }
    measure()
    x = tx = width / 2; y = ty = height / 2

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      if (!visible) return
      const dt = Math.min(0.05, (now - last) / 1000 || 0)
      last = now
      const userDriving = now - lastInput < 2500
      if (!userDriving && !still) {
        // Nobody steering: wander in a slow loop across the sky
        t += dt
        tx = width * (0.5 + 0.44 * Math.sin(t * 0.5))
        ty = height * (0.48 + 0.4 * Math.sin(t * 0.83 + 1))
      }
      const ease = userDriving ? 0.25 : 0.06
      x += (tx - x) * ease; y += (ty - y) * ease
      beam.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`

      // While the beam wanders on its own, the tools only need updating every third frame
      if (!userDriving && frame++ % 3) return

      let best = -1, bestD = Infinity
      centers.forEach((c, i) => {
        const d = Math.hypot(c.x - x, (c.y - y) * 1.15)
        if (d < bestD) { bestD = d; best = i }
        const beamLit = Math.max(0, 1 - d / radius)
        // Only a visitor's own scanning counts as finding something
        if (userDriving && beamLit > 0.55 && !found.current.has(i)) { found.current.add(i); updateScore() }
        const lit = Math.max(Math.min(1, beamLit * 1.5), found.current.has(i) ? FOUND_GLOW : 0)
        const value = lit.toFixed(2)
        if (lastLit[i] !== value) { chips[i]?.style.setProperty('--lit', value); lastLit[i] = value }
      })
      const next = bestD < radius * 0.7 ? best : -1
      if (next !== nearest && statusRef.current) {
        nearest = next
        statusRef.current.textContent = next < 0 ? 'scanning…' : `${CHIPS[next].name} · ${CHIPS[next].category.toLowerCase()}`
      }
    }

    const onPointer = (e: PointerEvent) => {
      const r = panel.getBoundingClientRect()
      tx = e.clientX - r.left; ty = e.clientY - r.top
      lastInput = performance.now()
    }
    panel.addEventListener('pointermove', onPointer, { passive: true })
    panel.addEventListener('pointerdown', onPointer, { passive: true })
    const ro = new ResizeObserver(measure)
    ro.observe(panel)
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; last = 0 })
    io.observe(panel)
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect()
      panel.removeEventListener('pointermove', onPointer)
      panel.removeEventListener('pointerdown', onPointer)
    }
  }, [mode, still])

  const pill = (key: string, label: string, color?: string) => (
    <button key={key} type="button" aria-pressed={mode === key} className={mode === key ? 'on' : undefined} onClick={() => setMode(key)}>
      {color && <span style={{ background: color }} />}{label}
    </button>
  )

  return (
    <section id="skills" className="section">
      <div className="container">
        <SectionHead label="05 — Skills & Technologies" title="Scan my *stack*"
          aside={`${technologies.length} tools I work with. Sweep your cursor or tap across the sky to light them up. Everything you find stays lit.`} />

        <div className="sk-filters">
          {pill('scan', 'Scanner')}
          {pill('all', 'Lights on')}
          {CATEGORIES.map(c => pill(c, c, CATEGORY_META[c].color))}
        </div>

        <div ref={panelRef} className={`sk-panel${mode === 'scan' ? ' is-scan' : ''}`}>
          <div ref={beamRef} className="sk-beam" aria-hidden />
          <ul className="sk-chips">
            {CHIPS.map((t, i) => (
              <li key={t.name} ref={el => { chipRefs.current[i] = el }} className="sk-chip" style={{ '--c': CATEGORY_META[t.category].color } as React.CSSProperties}>
                <span className="sk-dot" />{t.name}
              </li>
            ))}
          </ul>
          <div className="sk-status">
            <span ref={statusRef}>scanning…</span>
            {mode === 'scan' && <span ref={scoreRef} className="sk-score" />}
          </div>
        </div>
      </div>

      <style>{`
        .sk-filters { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
        .sk-filters button { display: inline-flex; align-items: center; gap: 7px; font-family: var(--font-mono); font-size: 12px; font-weight: 500; color: var(--fg-2); background: var(--bg-2); border: 1px solid var(--border); border-radius: 99px; padding: 6px 13px; cursor: pointer; transition: color .15s, background .15s, border-color .15s; }
        .sk-filters button:hover { color: var(--fg); border-color: var(--border-2); }
        .sk-filters button.on { color: var(--bg); background: var(--fg); border-color: var(--fg); }
        .sk-filters button span { width: 7px; height: 7px; border-radius: 50%; }

        /* The sky stays dark in light mode too: it's a window into the same night as the hero */
        .sk-panel { position: relative; overflow: hidden; border-radius: 20px; padding: clamp(22px, 3.4vw, 40px) clamp(14px, 3vw, 40px) 50px; border: 1px solid rgba(148,163,255,.18); touch-action: pan-y;
          background: radial-gradient(1.2px 1.2px at 20px 30px, rgba(255,255,255,.55), transparent), radial-gradient(1px 1px at 90px 80px, rgba(255,255,255,.4), transparent), radial-gradient(1.4px 1.4px at 150px 20px, rgba(255,255,255,.3), transparent), linear-gradient(160deg, #0a0f24, #060814 70%);
          background-size: 190px 120px, 190px 120px, 190px 120px, auto; }
        .sk-beam { position: absolute; left: 0; top: 0; width: 0; height: 0; pointer-events: none; opacity: 0; transition: opacity .3s; will-change: transform; }
        .is-scan .sk-beam { opacity: 1; }
        .sk-beam::before { content: ''; position: absolute; left: -210px; top: -210px; width: 420px; height: 420px; border-radius: 50%; background: radial-gradient(circle, rgba(125,211,252,.26) 0%, rgba(99,102,241,.1) 42%, transparent 68%); }
        .sk-beam::after { content: ''; position: absolute; left: -5px; top: -5px; width: 10px; height: 10px; border-radius: 50%; background: #e0f2fe; box-shadow: 0 0 14px 4px rgba(125,211,252,.8); }

        .sk-chips { position: static; list-style: none; display: flex; flex-wrap: wrap; justify-content: center; gap: clamp(8px, 1.2vw, 12px); }
        .sk-chip { --lit: 0; position: relative; display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: clamp(12px, 1.25vw, 14.5px); font-weight: 500; color: #eef2ff; padding: 8px 14px; border-radius: 99px; background: #0e1430; border: 1px solid color-mix(in srgb, var(--c) 55%, #27304f); opacity: calc(.3 + var(--lit) * .7); transform: scale(calc(1 + var(--lit) * .06)); transition: opacity .35s, transform .35s; }
        .is-scan .sk-chip { transition: opacity .12s linear, transform .12s linear; will-change: opacity, transform; }
        .sk-chip::after { content: ''; position: absolute; inset: 0; border-radius: inherit; box-shadow: 0 0 22px 1px var(--c); opacity: var(--lit); pointer-events: none; }
        .sk-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--c); flex-shrink: 0; }

        .sk-status { position: absolute; left: clamp(14px, 3vw, 24px); right: clamp(14px, 3vw, 24px); bottom: 14px; display: flex; justify-content: space-between; gap: 12px; font-family: var(--font-mono); font-size: 11.5px; color: rgba(226,232,255,.6); pointer-events: none; }
        .sk-status span:first-child { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .sk-score { flex-shrink: 0; color: #7dd3fc; font-variant-numeric: tabular-nums; }
      `}</style>
    </section>
  )
}
