import { useEffect, useRef, useState } from 'react'
import { technologies } from '../data/resume'
import { useExperience } from '../hooks/useExperience'
import TrailheadIcon from './TrailheadIcon'

/* Hero visual: a cloud-blue planet with drifting clouds, and core technologies circling it like
   satellites on three tilted orbits. Satellites pass behind the planet and come round in front. */

type Orbit = { rx: number; ry: number; tilt: number; names: string[] }

// Radii are fractions of the scene width; tilt in degrees
const ORBITS: Orbit[] = [
  { rx: 0.48, ry: 0.10, tilt: -18, names: ['Apex', 'Agentforce', 'REST & SOAP APIs'] },
  { rx: 0.40, ry: 0.22, tilt: 30, names: ['Lightning Web Components', 'Data Cloud', 'OmniStudio'] },
  { rx: 0.33, ry: 0.06, tilt: -2, names: ['Salesforce Flow', 'SOQL / SOSL'] },
]

const SHORT: Record<string, string> = { 'Lightning Web Components': 'LWC', 'Salesforce Flow': 'Flow', 'SOQL / SOSL': 'SOQL', 'REST & SOAP APIs': 'APIs' }

const DESC: Record<string, string> = {
  Apex: 'Server-side logic, triggers & batch jobs',
  'Lightning Web Components': 'Modern, fast Salesforce UIs',
  'Salesforce Flow': 'Declarative automation',
  'Data Cloud': 'Unified customer profiles',
  Agentforce: 'Autonomous AI agents',
  'SOQL / SOSL': 'Efficient, bulk-safe queries',
  OmniStudio: 'Guided OmniScripts & FlexCards',
  'REST & SOAP APIs': 'Integrations with any system',
}

const SPEED = 0.24 // rad/s, shared so satellites keep their spacing and never bunch up

// Interleave the orbits (A0, B0, C0, A1, …) and space every satellite evenly around the planet
const SATELLITES = Array.from({ length: Math.max(...ORBITS.map(o => o.names.length)) }, (_, k) =>
  ORBITS.flatMap((o, oi) => (o.names[k] ? [{ name: o.names[k], orbit: oi }] : [])),
).flat().map((s, i, all) => ({
  ...s,
  offset: (i / all.length) * Math.PI * 2,
  color: technologies.find(t => t.name === s.name)?.color ?? '#0ea5e9',
}))

const pad = (n: number) => String(n).padStart(2, '0')

/** SVG ellipse arc for one orbit: the back half (behind the planet) or the front half. */
function OrbitArc({ o, w, half }: { o: Orbit; w: number; half: 'back' | 'front' }) {
  const rx = o.rx * w, ry = o.ry * w
  // y grows downward, so the front (nearest) half is the lower arc
  const d = half === 'front' ? `M ${-rx} 0 A ${rx} ${ry} 0 0 0 ${rx} 0` : `M ${-rx} 0 A ${rx} ${ry} 0 0 1 ${rx} 0`
  return <path d={d} transform={`rotate(${o.tilt})`} fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 6" opacity={half === 'front' ? 0.55 : 0.3} />
}

export default function PlanetScene() {
  const sceneRef = useRef<HTMLDivElement>(null)
  const tiltRef = useRef<HTMLDivElement>(null)
  const satRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const paused = useRef(false)
  const [w, setW] = useState(400)
  const [hovered, setHovered] = useState<string | null>(null)
  const exp = useExperience()

  // Satellites move every frame by writing transforms directly, so React doesn't re-render at 60fps
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let time = 0, last = 0, raf = 0, visible = true

    const layout = () => {
      const width = scene.clientWidth
      SATELLITES.forEach((s, i) => {
        const el = satRefs.current[i]
        if (!el) return
        const o = ORBITS[s.orbit]
        const t = s.offset + time * SPEED
        const ex = Math.cos(t) * o.rx * width, ey = Math.sin(t) * o.ry * width
        const a = (o.tilt * Math.PI) / 180
        const x = ex * Math.cos(a) - ey * Math.sin(a), y = ex * Math.sin(a) + ey * Math.cos(a)
        const depth = Math.sin(t) // 1 = nearest the viewer
        el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${0.8 + 0.28 * ((depth + 1) / 2)})`
        el.style.opacity = String(0.5 + 0.5 * ((depth + 1) / 2))
        // Behind the planet (z 2) when on the far side; nearer satellites stack above farther ones
        el.style.zIndex = depth > 0 ? String(10 + Math.round(depth * 10)) : '1'
      })
    }
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(0.05, (now - last) / 1000 || 0)
      last = now
      if (!visible || paused.current) return
      time += dt
      layout()
    }

    const ro = new ResizeObserver(() => { setW(scene.clientWidth); layout() })
    ro.observe(scene)
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting })
    io.observe(scene)
    layout()
    if (!still) raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect() }
  }, [])

  // The whole system tilts a little toward the pointer
  const onMove = (e: React.PointerEvent) => {
    const el = tiltRef.current
    if (!el || e.pointerType === 'touch') return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--rx', `${((r.top + r.height / 2 - e.clientY) / r.height) * 10}deg`)
    el.style.setProperty('--ry', `${((e.clientX - r.left - r.width / 2) / r.width) * 12}deg`)
  }
  const onLeave = () => {
    tiltRef.current?.style.setProperty('--rx', '0deg')
    tiltRef.current?.style.setProperty('--ry', '0deg')
  }

  return (
    <div ref={sceneRef} className="pl-scene" onPointerMove={onMove} onPointerLeave={onLeave}>
      <div ref={tiltRef} className="pl-tilt">
        {/* Back halves of the orbits sit behind the planet */}
        <svg className="pl-orbits" viewBox={`${-w / 2} ${-w / 2} ${w} ${w}`} aria-hidden>
          {ORBITS.map((o, i) => <OrbitArc key={i} o={o} w={w} half="back" />)}
        </svg>

        <div className="pl-planet" aria-hidden>
          <div className="pl-surface"><div className="pl-clouds" /><div className="pl-clouds pl-clouds-2" /></div>
          <div className="pl-shade" />
        </div>

        {/* Front halves cross in front of it */}
        <svg className="pl-orbits pl-orbits-front" viewBox={`${-w / 2} ${-w / 2} ${w} ${w}`} aria-hidden>
          {ORBITS.map((o, i) => <OrbitArc key={i} o={o} w={w} half="front" />)}
        </svg>

        <div className="pl-sats" onPointerEnter={() => { paused.current = true }} onPointerLeave={() => { paused.current = false; setHovered(null) }}>
          {SATELLITES.map((s, i) => (
            <a key={s.name} href="/#skills" ref={el => { satRefs.current[i] = el }} className="pl-sat"
              style={{ '--c': s.color } as React.CSSProperties}
              onPointerEnter={() => setHovered(s.name)}
              onFocus={() => { paused.current = true; setHovered(s.name) }} onBlur={() => { paused.current = false; setHovered(null) }}
              aria-label={`${s.name}: ${DESC[s.name]}`}
            >
              <span className="pl-sat-dot" />{SHORT[s.name] ?? s.name}
              {hovered === s.name && <span className="pl-tip" role="tooltip">{DESC[s.name]}</span>}
            </a>
          ))}
        </div>
      </div>

      {/* Floating stat tags */}
      <div className="pl-tag pl-tag-certs">
        <span className="pl-tag-icon"><TrailheadIcon /></span>
        <span><strong>6×</strong> Salesforce Certified</span>
      </div>
      <div className="pl-tag pl-tag-xp" title="Time since my first day as a Salesforce developer">
        <span className="pl-live" />
        <span className="pl-xp">
          <strong>{exp.decimal.toFixed(2)}</strong> yrs XP
          <small>{exp.totalDays.toLocaleString()}d {pad(exp.remHours)}:{pad(exp.remMinutes)}:{pad(exp.remSeconds)}</small>
        </span>
      </div>

      <style>{`
        .pl-scene { position: relative; width: 100%; max-width: 460px; aspect-ratio: 1; margin: 0 auto; perspective: 1100px; }
        .pl-tilt { position: absolute; inset: 0; transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)); transition: transform .4s cubic-bezier(.2,.8,.2,1); }
        .pl-orbits { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; color: var(--fg-3); z-index: 1; }
        .pl-orbits-front { z-index: 3; pointer-events: none; color: var(--fg-2); }

        .pl-planet { position: absolute; left: 50%; top: 50%; width: 46%; aspect-ratio: 1; transform: translate(-50%, -50%); border-radius: 50%; z-index: 2;
          background: radial-gradient(circle at 34% 30%, #c6ecff 0%, #4cc3f7 18%, #0b8be0 42%, #0257b8 68%, #022a63 100%);
          box-shadow: 0 0 0 1px rgba(125,211,252,.25), 0 0 60px 6px rgba(14,165,233,.35), 0 0 140px 20px rgba(1,118,211,.18); }
        .pl-surface { position: absolute; inset: 0; border-radius: 50%; overflow: hidden; }
        /* Clouds: a wide strip of soft blobs scrolling sideways reads as the planet turning */
        .pl-clouds { position: absolute; top: 0; bottom: 0; left: 0; width: 200%; opacity: .75; animation: pl-spin 38s linear infinite;
          background:
            radial-gradient(ellipse 13% 7% at 8% 30%, rgba(255,255,255,.95), transparent 70%),
            radial-gradient(ellipse 9% 6% at 14% 33%, rgba(255,255,255,.9), transparent 70%),
            radial-gradient(ellipse 16% 6% at 30% 62%, rgba(255,255,255,.85), transparent 70%),
            radial-gradient(ellipse 8% 5% at 37% 58%, rgba(255,255,255,.9), transparent 70%),
            radial-gradient(ellipse 12% 6% at 44% 22%, rgba(255,255,255,.8), transparent 70%),
            radial-gradient(ellipse 13% 7% at 58% 30%, rgba(255,255,255,.95), transparent 70%),
            radial-gradient(ellipse 9% 6% at 64% 33%, rgba(255,255,255,.9), transparent 70%),
            radial-gradient(ellipse 16% 6% at 80% 62%, rgba(255,255,255,.85), transparent 70%),
            radial-gradient(ellipse 8% 5% at 87% 58%, rgba(255,255,255,.9), transparent 70%),
            radial-gradient(ellipse 12% 6% at 94% 22%, rgba(255,255,255,.8), transparent 70%); }
        .pl-clouds-2 { opacity: .4; animation-duration: 64s; top: 18%; bottom: -18%; filter: blur(1px); }
        /* Shading on top of the clouds gives the ball its curvature */
        .pl-shade { position: absolute; inset: 0; border-radius: 50%; pointer-events: none;
          background: radial-gradient(circle at 34% 28%, rgba(255,255,255,.35), transparent 32%), radial-gradient(circle at 70% 75%, rgba(1,12,40,.6), transparent 62%);
          box-shadow: inset -14px -18px 36px rgba(0,10,40,.55), inset 6px 8px 22px rgba(255,255,255,.18); }

        .pl-sats { position: absolute; left: 50%; top: 50%; width: 0; height: 0; }
        .pl-sat { position: absolute; left: 0; top: 0; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; font-size: 12px; font-weight: 600; color: var(--fg); text-decoration: none; padding: 6px 11px; border-radius: 99px; background: color-mix(in srgb, var(--bg) 82%, transparent); border: 1px solid color-mix(in srgb, var(--c) 45%, var(--border-2)); box-shadow: 0 6px 18px -6px color-mix(in srgb, var(--c) 50%, transparent); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); will-change: transform, opacity; }
        .pl-sat:hover, .pl-sat:focus-visible { border-color: var(--c); outline: none; }
        .pl-sat-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--c); box-shadow: 0 0 8px var(--c); }
        .pl-tip { position: absolute; left: 50%; bottom: calc(100% + 8px); transform: translateX(-50%); font-size: 11px; font-weight: 500; color: var(--bg); background: var(--fg); padding: 5px 9px; border-radius: 8px; white-space: nowrap; pointer-events: none; }

        .pl-tag { position: absolute; z-index: 6; display: flex; align-items: center; gap: 9px; padding: 9px 13px; font-size: 12px; color: var(--fg-2); border-radius: 14px; background: color-mix(in srgb, var(--bg) 78%, transparent); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid var(--border-2); box-shadow: 0 12px 30px -10px rgba(0,0,0,.35); animation: pl-float 6s ease-in-out infinite; }
        .pl-tag strong { color: var(--fg); font-weight: 700; }
        .pl-tag-certs { top: 4%; left: 0; }
        .pl-tag-xp { bottom: 5%; right: 0; animation-delay: -3s; font-variant-numeric: tabular-nums; }
        .pl-tag-icon { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 8px; color: #fff; background: #0ea5e9; }
        .pl-tag-icon svg { width: 14px; height: 14px; }
        .pl-live { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 0 3px rgba(34,197,94,.25); flex-shrink: 0; animation: pl-pulse 1.8s ease-in-out infinite; }
        .pl-xp { display: flex; flex-direction: column; line-height: 1.3; }
        .pl-xp small { font-family: var(--font-mono); font-size: 10px; color: var(--fg-3); }

        @keyframes pl-spin { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes pl-float { 0%, 100% { translate: 0 0; } 50% { translate: 0 -8px; } }
        @keyframes pl-pulse { 50% { box-shadow: 0 0 0 6px rgba(34,197,94,0); } }
        @media (max-width: 860px) { .pl-scene { max-width: 340px; } .pl-sat { font-size: 11px; padding: 5px 9px; } }
        @media (max-width: 420px) { .pl-scene { max-width: 300px; } .pl-tag { font-size: 11px; padding: 7px 10px; } }
        @media (prefers-reduced-motion: reduce) { .pl-clouds, .pl-tag, .pl-live { animation: none; } .pl-tilt { transition: none; } }
      `}</style>
    </div>
  )
}
