import { useEffect, useRef, useState } from 'react'
import { technologies } from '../data/resume'
import { useExperience } from '../hooks/useExperience'
import { sunDirection } from '../lib/sky'
import { createGlobe } from './earthGlobe'
import TrailheadIcon from './TrailheadIcon'

/* Hero visual: an Earth with drifting clouds, and core technologies circling it like satellites
   on three tilted orbits. The camera hangs above India and the Sun is in its true position, so India is
   sunlit by day and in darkness at night, as the day-night line sweeps across it. Visitors can grab the
   Earth and flick it to see the other side: it keeps spinning with momentum, repeated flicks rev it up,
   and it then glides back to India. */

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
const SAT_LAP_MS = ((Math.PI * 2) / SPEED) * 1000
// Animations start far along their timeline, so spinning backwards never runs out of room
const TIMELINE_START = 1e8
// Rev/s at rest. Negative because weather and the Earth's surface travel left to right when seen with north up
const CLOUD_DRIFT = -1 / 900  // clouds drift slowly but visibly over the ground, which keeps the scene alive
const IDLE_DRAW_MS = 250      // four redraws a second is plenty for a resting Earth; clouds move under a pixel between them
const SLOW_DRAW_MS = 3000     // without a real graphics chip, each redraw is expensive
const FLICK_GAIN = 3     // a flick carries on faster than the hand that threw it
const HOME_SPEED = 1.5        // below this spin (rev/s), the Earth starts easing back to its true position
const METER_HINT = 'Drag to spin · dot = India'
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


const pad = (n: number) => String(n).padStart(2, '0')

/** One lap of an orbit: position and size, nearest the viewer at the bottom of the ellipse. */
function orbitKeyframes(orbit: number, width: number): Keyframe[] {
  const o = ORBITS[orbit], a = (o.tilt * Math.PI) / 180, steps = 48
  return Array.from({ length: steps + 1 }, (_, k) => {
    const t = (k / steps) * Math.PI * 2
    const ex = Math.cos(t) * o.rx * width, ey = Math.sin(t) * o.ry * width
    const x = ex * Math.cos(a) - ey * Math.sin(a), y = ex * Math.sin(a) + ey * Math.cos(a)
    const near = (Math.sin(t) + 1) / 2
    return { transform: `translate(-50%, -50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${(0.8 + 0.28 * near).toFixed(3)})` }
  })
}

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
  const globeRef = useRef<HTMLCanvasElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const meterRef = useRef<HTMLSpanElement>(null)
  const satRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const paused = useRef(false)
  const applyRatesRef = useRef<() => void>(() => {})
  const hold = (on: boolean) => { paused.current = on; applyRatesRef.current() }
  const [w, setW] = useState(400)
  const [hovered, setHovered] = useState<string | null>(null)

  // At rest everything runs as Web Animations on the compositor, so an idle Earth costs the main thread
  // nothing. A short frame loop only runs while the spin is changing: during a drag or while a flick coasts.
  useEffect(() => {
    const scene = sceneRef.current, planet = planetRef.current
    if (!scene || !planet) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let spin = 0, last = 0, raf = 0, visible = true, meterAt = 0, touched = false, lastBoost = -1
    let planetW = planet.clientWidth, satRate = NaN
    const drag = { on: false, x: 0, t: 0, v: 0, carry: 0 }
    const zIndexes: string[] = [], fades: string[] = []

    // Earth: a textured sphere. Phase 0 is the camera above India, where it rests.
    let phase = 0, cloudPhase = 0
    /** Shortest way round from where the camera is back to India, in revolutions. */
    const homeError = () => {
      const e = ((-phase) % 1 + 1) % 1
      return e > 0.5 ? e - 1 : e
    }
    const globeCanvas = globeRef.current
    const drawGlobe = () => globe?.draw(phase, cloudPhase, Math.min(1, Math.abs(spin) / 6))
    const globe = globeCanvas ? createGlobe(globeCanvas, () => { drawGlobe(); globeCanvas.classList.add('ready') }) : null
    globe?.setSun(sunDirection())
    globe?.resize(planetW)

    // Satellites: one full lap per animation, with the orbit sampled into keyframes
    const satAnims = SATELLITES.flatMap((s, i) => {
      const el = satRefs.current[i]
      if (!el) return []
      const a = el.animate(orbitKeyframes(s.orbit, scene.clientWidth), { duration: SAT_LAP_MS, iterations: Infinity })
      a.currentTime = TIMELINE_START + (s.offset / (Math.PI * 2)) * SAT_LAP_MS
      return [a]
    })

    // Depth (stacking and fade) stays out of the animation so the orbit can run on the compositor. It barely needs to update
    const stack = () => satAnims.forEach((a, i) => {
      const depth = Math.sin((((a.currentTime as number) / SAT_LAP_MS) % 1) * Math.PI * 2)
      const z = depth > 0 ? String(10 + Math.round(depth * 10)) : '1'
      const el = satRefs.current[i] as HTMLElement
      if (zIndexes[i] !== z) { el.style.zIndex = z; zIndexes[i] = z }
      const fade = (0.5 + 0.5 * ((depth + 1) / 2)).toFixed(1)
      if (fades[i] !== fade) { el.style.opacity = fade; fades[i] = fade }
    })

    const applyRates = () => {
      // Satellites get dragged along by the spin, and stop while one is hovered
      const r = paused.current ? 0 : ((still ? 0 : 1) + Math.abs(spin) * 2.2) * (spin < 0 ? -1 : 1)
      if (Math.abs(r - satRate) > 0.03 * Math.max(Math.abs(satRate), 0.02) || Number.isNaN(satRate) || r === 0) {
        satRate = r
        satAnims.forEach(a => { a.playbackRate = r })
      }
    }
    applyRatesRef.current = applyRates

    const effects = (now: number) => {
      const boost = Math.round(Math.min(1, Math.abs(spin) / 4) * 100) / 100
      if (boost !== lastBoost) {
        lastBoost = boost
        if (glowRef.current) {
          glowRef.current.style.opacity = String(0.45 + boost * 0.55)
          glowRef.current.style.transform = `translate(-50%, -50%) scale(${1 + boost * 0.45})`
        }
      }
      // Speed readout, ~10 updates a second
      if (touched && meterRef.current && now - meterAt > 100) {
        meterAt = now
        const s = Math.abs(spin)
        meterRef.current.textContent = s < 0.02 ? METER_HINT
          : s >= MAX_SPIN * 0.98 ? `MAX REV · ${s.toFixed(1)} rev/s`
          : `${s.toFixed(1)} rev/s · ${Math.round(s * 86400).toLocaleString()}× real speed`
      }
    }

    const run = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000 || 0)
      last = now
      if (!drag.on) {
        spin *= Math.exp(-dt * FRICTION)
        phase += spin * dt
        cloudPhase += (spin + (still ? 0 : CLOUD_DRIFT)) * dt
        // As a flick fades, ease the Earth back round to India
        const pull = 1 - Math.abs(spin) / HOME_SPEED
        if (pull > 0) phase += homeError() * Math.min(1, dt * 3 * pull)
      }
      const settled = !drag.on && Math.abs(spin) < 0.02 && Math.abs(homeError()) < 0.001
      if (settled) { spin = 0; phase = 0 }
      applyRates()
      effects(settled ? Infinity : now)
      drawGlobe()
      stack()
      raf = settled || !visible ? 0 : requestAnimationFrame(run)
    }
    const wake = () => { if (!raf) { last = 0; raf = requestAnimationFrame(run) } }

    // Grab-and-flick: while held, the surface follows the pointer; on release it keeps the flick's speed
    const onDown = (e: PointerEvent) => {
      planet.setPointerCapture(e.pointerId)
      drag.on = true; drag.x = e.clientX; drag.t = e.timeStamp; drag.v = 0
      drag.carry = spin
      touched = true
      scene.classList.add('is-spinning')
      wake()
    }
    const onMove = (e: PointerEvent) => {
      if (!drag.on) return
      const dt = Math.max(1, e.timeStamp - drag.t) / 1000
      // At the middle of a sphere, one radius of movement is one radian of turn, so the surface follows the pointer
      const dPhase = -(e.clientX - drag.x) / (Math.PI * planetW)
      phase += dPhase
      cloudPhase += dPhase
      drag.v = drag.v * 0.5 + (dPhase / dt) * 0.5
      drag.x = e.clientX; drag.t = e.timeStamp
    }
    const onUp = (e: PointerEvent) => {
      if (!drag.on) return
      drag.on = false
      // A pause before letting go means no flick; flicking the same way again adds to the spin (rev it up)
      const flick = e.timeStamp - drag.t > 140 ? 0 : drag.v
      const sameWay = Math.sign(flick) === Math.sign(drag.carry)
      spin = Math.max(-MAX_SPIN, Math.min(MAX_SPIN, flick * FLICK_GAIN + (sameWay ? drag.carry * 0.8 : 0)))
      if (Math.abs(flick) < 0.05) spin = drag.carry
      scene.classList.remove('is-spinning')
      // Shockwave on a hard flick
      const ring = ringRef.current
      if (ring && Math.abs(flick) > 1) { ring.classList.remove('go'); void ring.offsetWidth; ring.classList.add('go') }
      wake()
    }
    planet.addEventListener('pointerdown', onDown)
    planet.addEventListener('pointermove', onMove)
    planet.addEventListener('pointerup', onUp)
    planet.addEventListener('pointercancel', onUp)

    const ro = new ResizeObserver(() => {
      planetW = planet.clientWidth
      globe?.setSun(sunDirection())
    globe?.resize(planetW)
      drawGlobe()
      setW(scene.clientWidth)
      SATELLITES.forEach((s, i) => (satAnims[i]?.effect as KeyframeEffect | null)?.setKeyframes(orbitKeyframes(s.orbit, scene.clientWidth)))
    })
    ro.observe(scene)
    const all = satAnims
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      all.forEach(a => { if (visible) a.play(); else a.pause() })
      if (visible && spin !== 0) wake()
    })
    io.observe(scene)
    const stacking = setInterval(() => { if (visible && !raf) stack() }, 140)
    // At rest the light comes straight from the clock, so it stays right after any time asleep
    let idleAt = performance.now()
    const idle = setInterval(() => {
      const now = performance.now(), dt = Math.min(1, (now - idleAt) / 1000)
      idleAt = now
      if (!visible || raf || document.hidden) return
      globe?.setSun(sunDirection())
      if (!still) cloudPhase += CLOUD_DRIFT * dt
      drawGlobe()
    }, still ? 30_000 : globe?.softwareRendered ? SLOW_DRAW_MS : IDLE_DRAW_MS)
    applyRates()
    stack()
    return () => {
      cancelAnimationFrame(raf); clearInterval(stacking); clearInterval(idle); ro.disconnect(); io.disconnect()
      globe?.dispose()
      all.forEach(a => a.cancel())
      planet.removeEventListener('pointerdown', onDown)
      planet.removeEventListener('pointermove', onMove)
      planet.removeEventListener('pointerup', onUp)
      planet.removeEventListener('pointercancel', onUp)
    }
  }, [])

  // The whole system tilts a little toward the pointer
  const tiltFrame = useRef(0)
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch' || tiltFrame.current) return
    const { clientX, clientY } = e
    tiltFrame.current = requestAnimationFrame(() => {
      tiltFrame.current = 0
      const el = tiltRef.current, scene = sceneRef.current
      if (!el || !scene) return
      const r = scene.getBoundingClientRect()
      el.style.transform = `rotateX(${(((r.top + r.height / 2 - clientY) / r.height) * 10).toFixed(2)}deg) rotateY(${(((clientX - r.left - r.width / 2) / r.width) * 12).toFixed(2)}deg)`
    })
  }
  const onLeave = () => {
    cancelAnimationFrame(tiltFrame.current)
    tiltFrame.current = 0
    if (tiltRef.current) tiltRef.current.style.transform = 'none'
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

        <div ref={planetRef} className="pl-planet" title="Drag to spin the Earth. The dot marks India, and day and night fall where they really are right now." aria-hidden>
          <canvas ref={globeRef} className="pl-globe" />
        </div>

        {/* Front halves cross in front of it */}
        <svg className="pl-orbits pl-orbits-front" viewBox={`${-w / 2} ${-w / 2} ${w} ${w}`} aria-hidden>
          {ORBITS.map((o, i) => <OrbitArc key={i} o={o} w={w} half="front" />)}
        </svg>

        <div className="pl-sats" onPointerEnter={() => hold(true)} onPointerLeave={() => { hold(false); setHovered(null) }}>
          {SATELLITES.map((s, i) => (
            <a key={s.name} href="/#skills" ref={el => { satRefs.current[i] = el }} className="pl-sat"
              style={{ '--c': s.color } as React.CSSProperties}
              onPointerEnter={() => setHovered(s.name)}
              onFocus={() => { hold(true); setHovered(s.name) }} onBlur={() => { hold(false); setHovered(null) }}
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
        <span ref={meterRef}>{METER_HINT}</span>
      </div>

      <style>{`
        .pl-scene { position: relative; width: 100%; max-width: 460px; aspect-ratio: 1; margin: 0 auto; perspective: 1100px; }
        .pl-tilt { position: absolute; inset: 0; transition: transform .4s cubic-bezier(.2,.8,.2,1); will-change: transform; }
        .pl-orbits { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; color: var(--fg-3); z-index: 1; }
        .pl-orbits-front { z-index: 3; pointer-events: none; color: var(--fg-2); }

        .pl-glow { position: absolute; left: 50%; top: 50%; width: 66%; aspect-ratio: 1; border-radius: 50%; z-index: 1; pointer-events: none; opacity: .45; transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(70,150,255,.3) 0%, rgba(40,110,230,.12) 48%, transparent 68%); will-change: transform, opacity; }
        .pl-ring { position: absolute; left: 50%; top: 50%; width: 46%; aspect-ratio: 1; border-radius: 50%; z-index: 1; pointer-events: none; opacity: 0;
          border: 2px solid rgba(125,211,252,.9); box-shadow: 0 0 24px rgba(56,189,248,.7); transform: translate(-50%, -50%); }
        .pl-ring.go { animation: pl-shock .9s cubic-bezier(.15,.7,.3,1); }

        .pl-planet { position: absolute; left: 50%; top: 50%; width: 46%; aspect-ratio: 1; transform: translate(-50%, -50%); border-radius: 50%; z-index: 2; cursor: grab; touch-action: pan-y; user-select: none; -webkit-user-select: none;
          /* Shown until the globe's images load, or instead of it without WebGL */
          background: radial-gradient(circle at 34% 30%, #6fa8dc 0%, #2a6ab0 30%, #123f7c 58%, #06172f 88%); transition: scale .25s cubic-bezier(.2,.8,.2,1); }
        .pl-planet:hover { scale: 1.03; }
        .is-spinning .pl-planet { cursor: grabbing; scale: .97; }
        .pl-globe { position: absolute; left: -5%; top: -5%; width: 110%; height: 110%; pointer-events: none; opacity: 0; transition: opacity .6s; }
        .pl-globe.ready { opacity: 1; }

        .pl-sats { position: absolute; left: 50%; top: 50%; width: 0; height: 0; }
        .pl-sat { position: absolute; left: 0; top: 0; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; font-size: 12px; font-weight: 600; color: var(--fg); text-decoration: none; padding: 6px 11px; border-radius: 99px; background: color-mix(in srgb, var(--bg) 92%, transparent); border: 1px solid color-mix(in srgb, var(--c) 45%, var(--border-2)); box-shadow: 0 6px 18px -6px color-mix(in srgb, var(--c) 50%, transparent); will-change: transform; transition: opacity .3s linear; }
        .pl-sat:hover, .pl-sat:focus-visible { border-color: var(--c); outline: none; }
        .pl-sat-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--c); box-shadow: 0 0 8px var(--c); }
        .pl-tip { position: absolute; left: 50%; bottom: calc(100% + 8px); transform: translateX(-50%); font-size: 11px; font-weight: 500; color: var(--bg); background: var(--fg); padding: 5px 9px; border-radius: 8px; white-space: nowrap; pointer-events: none; }

        .pl-tag { position: absolute; z-index: 6; contain: layout; display: flex; align-items: center; gap: 9px; padding: 9px 13px; font-size: 12px; color: var(--fg-2); border-radius: 14px; background: color-mix(in srgb, var(--bg) 88%, transparent); border: 1px solid var(--border-2); box-shadow: 0 12px 30px -10px rgba(0,0,0,.35); animation: pl-float 6s ease-in-out infinite; }
        .pl-tag strong { color: var(--fg); font-weight: 700; }
        .pl-tag-certs { top: 4%; left: 0; }
        .pl-tag-xp { bottom: 5%; right: 0; animation-delay: -3s; font-variant-numeric: tabular-nums; }
        .pl-tag-icon { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 8px; color: #fff; background: #0ea5e9; }
        .pl-tag-icon svg { width: 14px; height: 14px; }
        .pl-live { position: relative; width: 7px; height: 7px; border-radius: 50%; background: #22c55e; flex-shrink: 0; }
        .pl-live::after { content: ''; position: absolute; inset: -3px; border-radius: 50%; background: rgba(34,197,94,.35); animation: pl-pulse 1.8s ease-in-out infinite; }
        .pl-xp { display: flex; flex-direction: column; line-height: 1.3; }
        .pl-xp small { font-family: var(--font-mono); font-size: 10px; color: var(--fg-3); }
        .pl-meter { position: absolute; z-index: 6; left: 2%; bottom: 7%; display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 10.5px; font-variant-numeric: tabular-nums; color: var(--fg-3); padding: 5px 10px; border-radius: 99px; border: 1px dashed var(--border-2); pointer-events: none; }
        .pl-meter svg { color: #38bdf8; animation: pl-turn 4s linear infinite; will-change: transform; }

        @keyframes pl-float { 0%, 100% { translate: 0 0; } 50% { translate: 0 -8px; } }
        @keyframes pl-pulse { 50% { transform: scale(1.8); opacity: 0; } }
        @keyframes pl-turn { to { transform: rotate(360deg); } }
        @keyframes pl-shock { from { opacity: 1; transform: translate(-50%, -50%) scale(1); } to { opacity: 0; transform: translate(-50%, -50%) scale(2.1); } }
        @media (max-width: 860px) { .pl-scene { max-width: 340px; } .pl-sat { font-size: 11px; padding: 5px 9px; } }
        @media (max-width: 420px) { .pl-scene { max-width: 300px; } .pl-tag { font-size: 11px; padding: 7px 10px; } .pl-meter { bottom: -7%; left: 0; } }
        @media (prefers-reduced-motion: reduce) { .pl-tag, .pl-live::after, .pl-meter svg { animation: none; } .pl-tilt, .pl-planet { transition: none; } }
      `}</style>
    </div>
  )
}
