import { useEffect, useRef, useState } from 'react'
import { technologies } from '../data/resume'
import { useExperience } from '../hooks/useExperience'
import TrailheadIcon from './TrailheadIcon'

/* Hero visual: an Earth with drifting clouds, and core technologies circling it like satellites
   on three tilted orbits. Visitors can grab the Earth and flick it: it keeps spinning with momentum,
   repeated flicks rev it up, and the satellites, glow and speed readout all react to the spin. */

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

const SPEED = 0.24      // rad/s satellite speed at rest, shared so satellites keep their spacing
const BASE_SPIN = 1 / 40 // Earth revolutions per second when nobody is touching it
const MAX_SPIN = 24      // rev/s cap for flicks
const FRICTION = 0.45    // how quickly a flick decays back to the resting spin (per second)

// Interleave the orbits (A0, B0, C0, A1, …) and space every satellite evenly around the planet
const SATELLITES = Array.from({ length: Math.max(...ORBITS.map(o => o.names.length)) }, (_, k) =>
  ORBITS.flatMap((o, oi) => (o.names[k] ? [{ name: o.names[k], orbit: oi }] : [])),
).flat().map((s, i, all) => ({
  ...s,
  offset: (i / all.length) * Math.PI * 2,
  color: technologies.find(t => t.name === s.name)?.color ?? '#0ea5e9',
}))

// Continents for one half of a strip twice the planet's width; repeated in the second half so it wraps seamlessly
const LAND: [x: number, y: number, w: number, h: number, c: string][] = [
  [6, 34, 7, 10, '#4f9d4a'], [9, 52, 4, 14, '#5aa84f'], [11, 70, 3, 9, '#7a9a3f'],
  [20, 26, 5, 6, '#6fae4a'], [23, 44, 6, 16, '#c9a55a'], [26, 62, 4, 10, '#4f9d4a'],
  [34, 30, 9, 9, '#5aa84f'], [39, 40, 6, 8, '#3f8f45'], [43, 72, 4, 6, '#c9a55a'], [31, 82, 8, 4, '#e8f1f6'],
]
const LAND_BG = [0, 50].flatMap(dx => LAND.map(([x, y, w, h, c]) =>
  `radial-gradient(ellipse ${w}% ${h}% at ${x + dx}% ${y}%, ${c} 0 50%, transparent 72%)`)).join(',')

const pad = (n: number) => String(n).padStart(2, '0')

/** SVG ellipse arc for one orbit: the back half (behind the planet) or the front half. */
function OrbitArc({ o, w, half }: { o: Orbit; w: number; half: 'back' | 'front' }) {
  const rx = o.rx * w, ry = o.ry * w
  // y grows downward, so the front (nearest) half is the lower arc
  const d = half === 'front' ? `M ${-rx} 0 A ${rx} ${ry} 0 0 0 ${rx} 0` : `M ${-rx} 0 A ${rx} ${ry} 0 0 1 ${rx} 0`
  return <path d={d} transform={`rotate(${o.tilt})`} fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 6" opacity={half === 'front' ? 0.55 : 0.3} />
}

/** Live experience counter; kept in its own component so only this tag re-renders every second. */
function XpTag() {
  const exp = useExperience()
  return (
    <div className="pl-tag pl-tag-xp" title="Time since my first day as a Salesforce developer">
      <span className="pl-live" />
      <span className="pl-xp">
        <strong>{exp.decimal.toFixed(2)}</strong> yrs XP
        <small>{exp.totalDays.toLocaleString()}d {pad(exp.remHours)}:{pad(exp.remMinutes)}:{pad(exp.remSeconds)}</small>
      </span>
    </div>
  )
}

export default function PlanetScene() {
  const sceneRef = useRef<HTMLDivElement>(null)
  const tiltRef = useRef<HTMLDivElement>(null)
  const planetRef = useRef<HTMLDivElement>(null)
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]) // land, clouds, high clouds
  const glowRef = useRef<HTMLDivElement>(null)
  const streakRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const meterRef = useRef<HTMLSpanElement>(null)
  const satRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const paused = useRef(false)
  const [w, setW] = useState(400)
  const [hovered, setHovered] = useState<string | null>(null)

  // Everything moves by writing transforms directly in one loop, so React never re-renders at 60fps
  useEffect(() => {
    const scene = sceneRef.current, planet = planetRef.current
    if (!scene || !planet) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const base = still ? 0 : BASE_SPIN
    let phase = 0, spin = base, satTime = 0, last = 0, raf = 0, visible = true, meterAt = 0, touched = false
    const drag = { on: false, x: 0, t: 0, v: 0, carry: 0 }

    const layoutSats = () => {
      const width = scene.clientWidth
      SATELLITES.forEach((s, i) => {
        const el = satRefs.current[i]
        if (!el) return
        const o = ORBITS[s.orbit]
        const t = s.offset + satTime
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

    const paint = (now: number) => {
      // Each surface layer is a strip twice the planet's width; shifting it by half a strip is one revolution
      const rates = [1, 1.18, 1.4]
      layerRefs.current.forEach((el, i) => {
        if (el) el.style.transform = `translate3d(${-(((phase * rates[i]) % 1 + 1) % 1) * 50}%, 0, 0)`
      })
      const boost = Math.min(1, Math.abs(spin - base) / 6)
      if (glowRef.current) {
        glowRef.current.style.opacity = String(0.45 + boost * 0.55)
        glowRef.current.style.transform = `translate(-50%, -50%) scale(${1 + boost * 0.45})`
      }
      if (streakRef.current) streakRef.current.style.opacity = String(Math.max(0, boost - 0.15) * 0.9)
      // Speed readout, ~10 updates a second
      if (touched && meterRef.current && now - meterAt > 100) {
        meterAt = now
        const s = Math.abs(spin)
        meterRef.current.textContent = s >= MAX_SPIN * 0.98 ? `MAX REV · ${s.toFixed(1)} rev/s`
          : `${s.toFixed(1)} rev/s · ${Math.max(1, Math.round(s / BASE_SPIN))}× speed`
      }
      scene.style.setProperty('--boost', boost.toFixed(2))
    }

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(0.05, (now - last) / 1000 || 0)
      last = now
      if (!visible) return
      if (!drag.on) {
        spin = base + (spin - base) * Math.exp(-dt * FRICTION)
        phase += spin * dt
      }
      // Satellites get dragged along by the spin
      if (!paused.current) satTime += dt * (still ? 0 : SPEED) * (1 + Math.abs(spin - base) * 2.2) * (spin < 0 ? -1 : 1)
      paint(now)
      layoutSats()
    }

    // Grab-and-flick: while held, the surface follows the pointer; on release it keeps the flick's speed
    const onDown = (e: PointerEvent) => {
      planet.setPointerCapture(e.pointerId)
      drag.on = true; drag.x = e.clientX; drag.t = e.timeStamp; drag.v = 0
      drag.carry = spin
      touched = true
      scene.classList.add('is-spinning')
    }
    const onMove = (e: PointerEvent) => {
      if (!drag.on) return
      const dt = Math.max(1, e.timeStamp - drag.t) / 1000
      const dPhase = -(e.clientX - drag.x) / planet.clientWidth
      phase += dPhase
      drag.v = drag.v * 0.5 + (dPhase / dt) * 0.5
      drag.x = e.clientX; drag.t = e.timeStamp
    }
    const onUp = (e: PointerEvent) => {
      if (!drag.on) return
      drag.on = false
      // A pause before letting go means no flick; flicking the same way again adds to the spin (rev it up)
      const flick = e.timeStamp - drag.t > 90 ? 0 : drag.v
      const sameWay = Math.sign(flick) === Math.sign(drag.carry)
      spin = Math.max(-MAX_SPIN, Math.min(MAX_SPIN, flick + (sameWay ? drag.carry * 0.8 : 0)))
      if (Math.abs(flick) < 0.05) spin = drag.carry
      scene.classList.remove('is-spinning')
      // Shockwave on a hard flick
      const ring = ringRef.current
      if (ring && Math.abs(flick) > 2) { ring.classList.remove('go'); void ring.offsetWidth; ring.classList.add('go') }
    }
    planet.addEventListener('pointerdown', onDown)
    planet.addEventListener('pointermove', onMove)
    planet.addEventListener('pointerup', onUp)
    planet.addEventListener('pointercancel', onUp)

    const ro = new ResizeObserver(() => { setW(scene.clientWidth); layoutSats() })
    ro.observe(scene)
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting })
    io.observe(scene)
    paint(0)
    layoutSats()
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect()
      planet.removeEventListener('pointerdown', onDown)
      planet.removeEventListener('pointermove', onMove)
      planet.removeEventListener('pointerup', onUp)
      planet.removeEventListener('pointercancel', onUp)
    }
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

        <div ref={glowRef} className="pl-glow" aria-hidden />
        <div ref={ringRef} className="pl-ring" aria-hidden />

        <div ref={planetRef} className="pl-planet" title="Drag to spin the Earth" aria-hidden>
          <div className="pl-surface">
            <div ref={el => { layerRefs.current[0] = el }} className="pl-land" style={{ background: LAND_BG }} />
            <div ref={el => { layerRefs.current[1] = el }} className="pl-clouds" />
            <div ref={el => { layerRefs.current[2] = el }} className="pl-clouds pl-clouds-2" />
            <div ref={streakRef} className="pl-streak" />
          </div>
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
      <XpTag />
      <div className="pl-meter" aria-hidden>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/></svg>
        <span ref={meterRef}>Drag the Earth to spin it</span>
      </div>

      <style>{`
        .pl-scene { position: relative; width: 100%; max-width: 460px; aspect-ratio: 1; margin: 0 auto; perspective: 1100px; --boost: 0; }
        .pl-tilt { position: absolute; inset: 0; transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)); transition: transform .4s cubic-bezier(.2,.8,.2,1); }
        .pl-orbits { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; color: var(--fg-3); z-index: 1; }
        .pl-orbits-front { z-index: 3; pointer-events: none; color: var(--fg-2); }

        .pl-glow { position: absolute; left: 50%; top: 50%; width: 70%; aspect-ratio: 1; border-radius: 50%; z-index: 1; pointer-events: none; opacity: .45; transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(56,189,248,.55) 0%, rgba(14,165,233,.22) 38%, transparent 68%); will-change: transform, opacity; }
        .pl-ring { position: absolute; left: 50%; top: 50%; width: 46%; aspect-ratio: 1; border-radius: 50%; z-index: 1; pointer-events: none; opacity: 0;
          border: 2px solid rgba(125,211,252,.9); box-shadow: 0 0 24px rgba(56,189,248,.7); transform: translate(-50%, -50%); }
        .pl-ring.go { animation: pl-shock .9s cubic-bezier(.15,.7,.3,1); }

        .pl-planet { position: absolute; left: 50%; top: 50%; width: 46%; aspect-ratio: 1; transform: translate(-50%, -50%); border-radius: 50%; z-index: 2; cursor: grab; touch-action: pan-y; user-select: none; -webkit-user-select: none;
          background: radial-gradient(circle at 34% 30%, #9fdcff 0%, #2fa6ea 20%, #0a74c9 46%, #034a9e 70%, #021f4d 100%);
          box-shadow: 0 0 0 1px rgba(125,211,252,.25), 0 0 60px 6px rgba(14,165,233,.3); transition: scale .25s cubic-bezier(.2,.8,.2,1); }
        .pl-planet:hover { scale: 1.03; }
        .is-spinning .pl-planet { cursor: grabbing; scale: .97; }
        .pl-surface { position: absolute; inset: 0; border-radius: 50%; overflow: hidden; }
        .pl-land, .pl-clouds { position: absolute; top: 0; bottom: 0; left: 0; width: 200%; will-change: transform; }
        .pl-land { opacity: .92; }
        /* Clouds: a wide strip of soft blobs; it turns a little faster than the land */
        .pl-clouds { opacity: .75;
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
        .pl-clouds-2 { opacity: .4; top: 18%; bottom: -18%; }
        /* Motion streaks fade in as the Earth spins faster */
        .pl-streak { position: absolute; inset: 0; opacity: 0; pointer-events: none;
          background: repeating-linear-gradient(180deg, rgba(255,255,255,.22) 0 2px, transparent 2px 9px), linear-gradient(90deg, rgba(186,230,253,.25), transparent 30%, transparent 70%, rgba(186,230,253,.25)); }
        /* Shading on top gives the ball its curvature */
        .pl-shade { position: absolute; inset: 0; border-radius: 50%; pointer-events: none;
          background: radial-gradient(circle at 34% 28%, rgba(255,255,255,.35), transparent 32%), radial-gradient(circle at 70% 75%, rgba(1,12,40,.6), transparent 62%);
          box-shadow: inset -14px -18px 36px rgba(0,10,40,.55), inset 6px 8px 22px rgba(255,255,255,.18); }

        .pl-sats { position: absolute; left: 50%; top: 50%; width: 0; height: 0; }
        .pl-sat { position: absolute; left: 0; top: 0; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; font-size: 12px; font-weight: 600; color: var(--fg); text-decoration: none; padding: 6px 11px; border-radius: 99px; background: color-mix(in srgb, var(--bg) 92%, transparent); border: 1px solid color-mix(in srgb, var(--c) 45%, var(--border-2)); box-shadow: 0 6px 18px -6px color-mix(in srgb, var(--c) 50%, transparent); will-change: transform, opacity; }
        .pl-sat:hover, .pl-sat:focus-visible { border-color: var(--c); outline: none; }
        .pl-sat-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--c); box-shadow: 0 0 8px var(--c); }
        .pl-tip { position: absolute; left: 50%; bottom: calc(100% + 8px); transform: translateX(-50%); font-size: 11px; font-weight: 500; color: var(--bg); background: var(--fg); padding: 5px 9px; border-radius: 8px; white-space: nowrap; pointer-events: none; }

        .pl-tag { position: absolute; z-index: 6; display: flex; align-items: center; gap: 9px; padding: 9px 13px; font-size: 12px; color: var(--fg-2); border-radius: 14px; background: color-mix(in srgb, var(--bg) 88%, transparent); border: 1px solid var(--border-2); box-shadow: 0 12px 30px -10px rgba(0,0,0,.35); animation: pl-float 6s ease-in-out infinite; }
        .pl-tag strong { color: var(--fg); font-weight: 700; }
        .pl-tag-certs { top: 4%; left: 0; }
        .pl-tag-xp { bottom: 5%; right: 0; animation-delay: -3s; font-variant-numeric: tabular-nums; }
        .pl-tag-icon { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 8px; color: #fff; background: #0ea5e9; }
        .pl-tag-icon svg { width: 14px; height: 14px; }
        .pl-live { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 0 3px rgba(34,197,94,.25); flex-shrink: 0; animation: pl-pulse 1.8s ease-in-out infinite; }
        .pl-xp { display: flex; flex-direction: column; line-height: 1.3; }
        .pl-xp small { font-family: var(--font-mono); font-size: 10px; color: var(--fg-3); }
        .pl-meter { position: absolute; z-index: 6; left: 2%; bottom: 7%; display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 10.5px; font-variant-numeric: tabular-nums; color: var(--fg-3); padding: 5px 10px; border-radius: 99px; border: 1px dashed var(--border-2); pointer-events: none; }
        .pl-meter svg { color: #38bdf8; animation: pl-turn 4s linear infinite; }

        @keyframes pl-float { 0%, 100% { translate: 0 0; } 50% { translate: 0 -8px; } }
        @keyframes pl-pulse { 50% { box-shadow: 0 0 0 6px rgba(34,197,94,0); } }
        @keyframes pl-turn { to { rotate: 360deg; } }
        @keyframes pl-shock { from { opacity: 1; transform: translate(-50%, -50%) scale(1); } to { opacity: 0; transform: translate(-50%, -50%) scale(2.1); } }
        @media (max-width: 860px) { .pl-scene { max-width: 340px; } .pl-sat { font-size: 11px; padding: 5px 9px; } }
        @media (max-width: 420px) { .pl-scene { max-width: 300px; } .pl-tag { font-size: 11px; padding: 7px 10px; } .pl-meter { bottom: -2%; } }
        @media (prefers-reduced-motion: reduce) { .pl-tag, .pl-live, .pl-meter svg { animation: none; } .pl-tilt, .pl-planet { transition: none; } }
      `}</style>
    </div>
  )
}
