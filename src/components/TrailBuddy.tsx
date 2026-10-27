import { motion, AnimatePresence, useAnimate } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

/* Mascot sidekick that tours the hero, using the artwork in /public/mascot.
   Targets are elements inside the stage marked with data-buddy="<id>".
   The flat artwork is given depth with stacked layers, so it reads as a solid
   figure when it tilts toward the cursor or spins. */

// The artwork is split into the body and the pointing hand (same 273×440 canvas) so the hand can gesture
const BODY_SRC = '/mascot/einstein-body.webp'
const HAND_SRC = '/mascot/einstein-hand.webp'
const MASCOT_RATIO = 273 / 440 // width / height of the artwork
const H = window.matchMedia('(max-width: 640px)').matches ? 96 : 120
const W = Math.round(H * MASCOT_RATIO)
const DEPTH_LAYERS = [7, 6, 5, 4, 3, 2, 1] // back to front, 1.4px apart
const IDLE_MS = 15_000 // no input for this long → nap time (only a click wakes it)
const STEP_X = 34 // walking: max px per step sideways
const STEP_Y = 26 // …and up/down, like climbing stairs
const STEP_S = 0.13 // seconds per step

type Pose = 'wave' | 'point' | 'idle' | 'sleep' | 'getup'
type Stop = { target: string; mode: 'beside' | 'on' | 'top' | 'lie'; say: string; pose: Pose }

const TOUR: Stop[] = [
  { target: 'name',   mode: 'beside', pose: 'wave',  say: "Hi! I'm Einstein, Saransh's sidekick 👋" },
  { target: 'work',   mode: 'on',     pose: 'point', say: 'Psst… the cool stuff is in here 👇' },
  { target: 'blog',   mode: 'on',     pose: 'point', say: 'He writes about Salesforce. I mostly read the titles 🤓' },
  { target: 'resume', mode: 'on',     pose: 'point', say: 'Recruiters! Grab this before he gets booked 📄' },
  { target: 'social', mode: 'beside', pose: 'wave',  say: 'His Trailhead badges live here. Go say hi! 🏔️' },
  { target: 'name',   mode: 'beside', pose: 'wave',  say: 'Tour done! Click me for a joke 😄' },
]

// Lines for when the mascot wanders around after the tour
const WANDER: Stop[] = [
  { target: 'name',   mode: 'beside', pose: 'wave',  say: 'Best seat in the house: right next to his name 🎟️' },
  { target: 'work',   mode: 'on',     pose: 'point', say: 'Still here. Still cool. Click it! 😎' },
  { target: 'blog',   mode: 'on',     pose: 'point', say: 'New post? Maybe! Only one way to find out 👀' },
  { target: 'resume', mode: 'on',     pose: 'point', say: 'Six certifications in one PDF. Six! 🏅' },
  { target: 'social', mode: 'beside', pose: 'wave',  say: 'LinkedIn connections welcome 🤝' },
]

const NAP_STAND: Stop = { target: 'name', mode: 'top', pose: 'idle', say: '' }
const NAP_SPOT: Stop = { target: 'name', mode: 'lie', pose: 'sleep', say: '' }

const DANCE_LINES = ['💃 Deploy succeeded dance!', '🕺 All tests passed!', '🎶 Feeling the Ohana vibes', '✨ 0 errors, 0 warnings!']

const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)]

const JOKES = [
  'I tried a SOQL query in a for loop once. The governor still has my number. 🚓',
  'My code coverage is 100%. Of snacks. 🍪',
  'Never deploy on a Friday. I learned that on a Friday. 😬',
  'Why did the trigger go to therapy? Too many recursive thoughts. 🔁',
  "I'm not lazy, I'm in an asynchronous queue. ⏳",
  'Admins say "click, not code". I say "hop, not walk". 🐾',
  'Error: Too many jokes: 101. Just kidding, keep clicking. 😄',
]

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

/** Where the mascot should stand for a stop, in stage coordinates. */
function spotFor(stage: HTMLElement, stop: Stop) {
  const el = stage.querySelector<HTMLElement>(`[data-buddy="${stop.target}"]`)
  if (!el) return null
  const s = stage.getBoundingClientRect()
  const clampX = (x: number) => clamp(x, 0, s.width - W)

  if (stop.mode === 'top' || stop.mode === 'lie') {
    // Stand (or lie down) on top of the first line of text, sinking slightly into the letters
    const r = el.getClientRects()[0] ?? el.getBoundingClientRect()
    const x = clampX(r.left - s.left + r.width * 0.5 - W / 2) // centred on the name
    const surface = r.top - s.top + r.height * 0.16
    // Lying down rotates the W×H box 90° around its centre, so its visual bottom sits at y + H/2 + W/2
    return { x, y: stop.mode === 'lie' ? surface + r.height * 0.12 - H / 2 - W / 2 : surface - H }
  }
  if (stop.mode === 'beside') {
    // Stand on the baseline right after the last line of text; if there's no room, stand on top of it
    const rects = el.getClientRects()
    const r = rects[rects.length - 1] ?? el.getBoundingClientRect()
    if (r.right - s.left + 14 + W <= s.width) return { x: r.right - s.left + 14, y: r.bottom - s.top - H }
    return { x: clampX(r.right - s.left - W), y: r.top - s.top - H + 10 }
  }
  const r = el.getBoundingClientRect()
  return { x: clampX(r.left - s.left + r.width * 0.62 - W / 2), y: r.top - s.top - H + 8 }
}

export default function TrailBuddy({ stageRef }: { stageRef: React.RefObject<HTMLElement | null> }) {
  const [scope, animate] = useAnimate<HTMLDivElement>()
  const bodyRef = useRef<HTMLDivElement>(null)
  const figureRef = useRef<HTMLDivElement>(null)
  const tiltRef = useRef<HTMLDivElement>(null)
  const pos = useRef<{ x: number; y: number } | null>(null)
  const current = useRef<Stop>(TOUR[0])
  const busy = useRef(true)
  const sleeping = useRef(false)
  const jokeIdx = useRef(-1)
  const wakeRef = useRef<() => void>(() => {})
  const [visible, setVisible] = useState(false)
  const [asleep, setAsleep] = useState(false)
  const [say, setSay] = useState<string | null>(null)
  const [pose, setPose] = useState<Pose>('idle')
  const [facing, setFacing] = useState<1 | -1>(1)
  // Bubble goes beside the mascot when there's room on the right, otherwise above (leaning toward the open side)
  const [bubbleAt, setBubbleAt] = useState<'side' | 'top-left' | 'top-right'>('top-right')

  useEffect(() => {
    let cancelled = false
    let tourDone = false
    let playing = false
    let lastActive = Date.now()
    const stage = stageRef.current
    if (!stage) return

    const place = (p: { x: number; y: number }, stop: Stop = current.current) => {
      pos.current = p
      const s = stage.getBoundingClientRect()
      if (stop.mode === 'beside' && s.left + p.x + W + 250 < document.documentElement.clientWidth) setBubbleAt('side')
      else setBubbleAt(p.x + W / 2 > s.width / 2 ? 'top-left' : 'top-right')
    }
    const squash = () => bodyRef.current && animate(bodyRef.current, { scaleY: [1, 0.8, 1.08, 1], scaleX: [1, 1.14, 0.95, 1] }, { duration: 0.38 })
    const setTilt = (rx: number, ry: number) => {
      const t = tiltRef.current
      if (!t) return
      t.style.setProperty('--rx', `${rx}deg`)
      t.style.setProperty('--ry', `${ry}deg`)
      t.style.setProperty('--sheen', `${50 + ry * 1.6}%`)
    }

    // Walk in small steps (a lift and a waddle each step); height changes become stair-steps
    const walkTo = async (stop: Stop) => {
      const to = spotFor(stage, stop)
      const from = pos.current
      if (!to || !from || cancelled) return
      setSay(null)
      const dx = to.x - from.x, dy = to.y - from.y
      if (reducedMotion()) {
        await animate(scope.current, { x: to.x, y: to.y }, { duration: 0 })
        place(to, stop)
        return
      }
      const n = Math.max(1, Math.ceil(Math.abs(dx) / STEP_X), Math.ceil(Math.abs(dy) / STEP_Y))
      setFacing(dx > 4 ? -1 : 1) // the artwork points left: face the way it walks
      const xs = [from.x], ys = [from.y], tilt = [0]
      for (let i = 1; i <= n; i++) {
        xs.push(from.x + (dx * (i - 0.5)) / n, from.x + (dx * i) / n)
        ys.push(from.y + (dy * (i - 0.5)) / n - 7, from.y + (dy * i) / n)
        tilt.push(i % 2 ? -6 : 6, 0)
      }
      await Promise.all([
        animate(scope.current, { x: xs, y: ys }, { duration: n * STEP_S, ease: 'linear' }),
        figureRef.current && animate(figureRef.current, { rotate: tilt }, { duration: n * STEP_S, ease: 'linear' }),
      ])
      place(to, stop)
      setFacing(1)
    }

    // Load in asleep on top of the name; the tour only starts once someone clicks
    const run = async () => {
      // Wait for the intro preloader to leave and the name to finish typing
      while (!cancelled && document.querySelector('.pl-hello')) await sleep(200)
      await sleep(1200)
      if (cancelled) return
      const nap = spotFor(stage, NAP_SPOT)
      if (!nap) return
      setVisible(true)
      current.current = NAP_SPOT
      place(nap, NAP_SPOT)
      setPose('sleep')
      sleeping.current = true
      setAsleep(true)
      await animate(scope.current, { x: nap.x, y: nap.y, opacity: [0, 1] }, { duration: reducedMotion() ? 0 : 0.6 })
      busy.current = false
    }

    const tour = async () => {
      for (let i = 0; i < TOUR.length && !cancelled; i++) {
        await walkTo(TOUR[i])
        if (cancelled) return
        current.current = TOUR[i]
        setPose(TOUR[i].pose)
        setSay(TOUR[i].say)
        await sleep(i === TOUR.length - 1 ? 0 : 3200)
      }
      tourDone = true
      await sleep(5000)
      if (!cancelled && !sleeping.current) { setSay(null); setPose('idle') }
    }

    const dance = async () => {
      const fig = figureRef.current
      if (!fig || !pos.current) return
      setPose('wave')
      setSay(pick(DANCE_LINES))
      await animate(fig, { rotate: [0, -14, 14, -14, 14, 0] }, { duration: 1.2, ease: 'easeInOut' })
      const { x, y } = pos.current
      await Promise.all([
        animate(scope.current, { x, y: [y, y - 80, y] }, { duration: 0.75, ease: 'easeOut' }),
        animate(fig, { rotateY: [0, 360] }, { duration: 0.75, ease: 'easeInOut' }),
      ])
      squash()
      await sleep(900)
      setSay(null); setPose('idle')
    }

    const twirl = async () => {
      if (!figureRef.current) return
      await animate(figureRef.current, { rotateY: [0, 720] }, { duration: 1.1, ease: 'easeInOut' })
      squash()
    }

    const wander = async () => {
      const options = WANDER.filter(w => w.target !== current.current.target)
      const stop = pick(options)
      await walkTo(stop)
      if (cancelled) return
      current.current = stop
      setPose(stop.pose); setSay(stop.say)
      await sleep(2800)
      setSay(null); setPose('idle')
    }

    // Nobody around: climb onto the name and nap
    const goSleep = async () => {
      busy.current = true
      setPose('idle'); setSay('Yawn… nap time 😴')
      await sleep(1400)
      await walkTo(NAP_STAND)
      if (cancelled) return
      current.current = NAP_SPOT
      setSay(null); setPose('sleep'); setTilt(0, 0)
      const lie = spotFor(stage, NAP_SPOT)
      if (lie) { await animate(scope.current, { x: lie.x, y: lie.y }, { duration: 0.6, ease: 'easeOut' }); place(lie, NAP_SPOT) }
      sleeping.current = true
      setAsleep(true)
      busy.current = false
    }

    const wake = async () => {
      if (!sleeping.current || !pos.current || busy.current) return
      sleeping.current = false
      setAsleep(false)
      busy.current = true
      lastActive = Date.now()
      // Get up off the name, then a little startled jump
      setPose('getup')
      const stand = spotFor(stage, NAP_STAND)
      if (stand) { await animate(scope.current, { x: stand.x, y: stand.y }, { duration: reducedMotion() ? 0 : 0.5, ease: 'easeOut' }); place(stand, NAP_STAND) }
      setPose('wave'); setSay(tourDone ? "Huh?! Oh, you're back 👋" : 'Huh?! Oh, hi! 👋')
      if (!reducedMotion() && pos.current) {
        const { x, y } = pos.current
        await animate(scope.current, { x, y: [y, y - 22, y] }, { duration: 0.35, ease: 'easeOut' })
      }
      await sleep(1600)
      if (cancelled) return
      if (!tourDone) {
        await tour()
        if (!playing) { playing = true; play() }
      } else {
        await walkTo(TOUR[0])
        current.current = TOUR[0]
        setSay(null); setPose('idle')
      }
      busy.current = false
    }
    wakeRef.current = wake

    // After the tour, keep playing: dances, twirls and wanders between links
    const play = async () => {
      while (!cancelled) {
        await sleep(6000 + Math.random() * 3000)
        if (cancelled || busy.current || sleeping.current || document.hidden) continue
        busy.current = true
        const roll = Math.random()
        await (roll < 0.4 ? dance() : roll < 0.8 ? wander() : twirl())
        busy.current = false
      }
    }
    run()

    const idleCheck = setInterval(() => {
      if (tourDone && !busy.current && !sleeping.current && !document.hidden && Date.now() - lastActive > IDLE_MS) goSleep()
    }, 1000)

    // Activity keeps the mascot awake (a nap only ends with a click); the pointer also tilts it in 3D
    const onActivity = () => { lastActive = Date.now() }
    const onPointerMove = (e: PointerEvent) => {
      onActivity()
      if (sleeping.current || e.pointerType === 'touch' || !scope.current) return
      const r = scope.current.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      setTilt(clamp(-dy / 22, -14, 14), clamp(dx / 14, -32, 32))
    }
    const activityEvents = ['pointerdown', 'keydown', 'scroll', 'wheel', 'touchstart'] as const
    activityEvents.forEach(ev => window.addEventListener(ev, onActivity, { passive: true }))
    window.addEventListener('pointermove', onPointerMove, { passive: true })

    // Keep the mascot glued to the current target when the layout changes
    const onResize = () => {
      const p = spotFor(stage, current.current)
      if (!p || !pos.current) return
      animate(scope.current, { x: p.x, y: p.y }, { duration: 0 })
      place(p)
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelled = true
      clearInterval(idleCheck)
      activityEvents.forEach(ev => window.removeEventListener(ev, onActivity))
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('resize', onResize)
    }
  }, [animate, scope, stageRef])

  const onClick = () => (sleeping.current ? wakeRef.current() : tellJoke())

  // Hovering a sleeping mascot explains how to wake it
  const onHover = (entering: boolean) => {
    if (sleeping.current) setSay(entering ? 'Shh… click to wake me up 😴' : null)
  }

  const tellJoke = async () => {
    if (busy.current || sleeping.current || !pos.current) return
    busy.current = true
    // Start at a random joke, then go in order so clicks never repeat back-to-back
    jokeIdx.current = jokeIdx.current < 0 ? Math.floor(Math.random() * JOKES.length) : (jokeIdx.current + 1) % JOKES.length
    setSay(JOKES[jokeIdx.current])
    setPose('wave')
    if (!reducedMotion()) {
      const { x, y } = pos.current
      await Promise.all([
        animate(scope.current, { x, y: [y, y - 72, y] }, { duration: 0.6, ease: 'easeOut' }),
        bodyRef.current && animate(bodyRef.current, { rotate: [0, 360] }, { duration: 0.6, ease: 'easeInOut' }),
      ])
    }
    busy.current = false
  }

  return (
    <motion.div ref={scope} initial={{ opacity: 0 }} className={`buddy${asleep ? ' is-asleep' : ''}`} style={{ visibility: visible ? 'visible' : 'hidden' }}>
      <AnimatePresence>
        {say && (
          <motion.div key={say} role="status" className={`buddy-bubble is-${bubbleAt}`}
            initial={{ opacity: 0, y: 6, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 420, damping: 26 }}
          >
            {say}
          </motion.div>
        )}
      </AnimatePresence>

      {asleep && <div className="buddy-zzz" aria-hidden><span>z</span><span>z</span><span>Z</span></div>}

      <button className="buddy-btn" onClick={onClick} onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)} aria-label={asleep ? 'Sleeping mascot — click to wake it up' : 'Mascot — click for a joke'} title={asleep ? 'Click to wake me up' : 'Click me!'}>
        <span className="buddy-shadow" aria-hidden />
        <div ref={figureRef} className="buddy-figure">
          <div className="buddy-3d" style={{ transform: `scaleX(${facing})` }}>
            <div ref={tiltRef} className="buddy-tilt">
              <div className={`buddy-pose is-${pose}`}>
                <div ref={bodyRef} className={`buddy-solid${say && !asleep ? ' is-talking' : ''}`}>
                  {/* Darker copies stacked behind the artwork give it a visible edge when it turns */}
                  {DEPTH_LAYERS.map(i => (
                    <img key={i} src={BODY_SRC} alt="" aria-hidden draggable={false} className="buddy-layer"
                      style={{ transform: `translateZ(${-i * 1.4}px)`, filter: `brightness(${0.38 + (7 - i) * 0.03})` }} />
                  ))}
                  <img src={BODY_SRC} alt="" width={W} height={H} draggable={false} className="buddy-front" />
                  <span className="buddy-sheen" aria-hidden />
                  <img src={HAND_SRC} alt="" aria-hidden draggable={false} className="buddy-hand" />
                  {asleep && (
                    <svg className="buddy-lids" viewBox="0 0 273 440" aria-hidden>
                      <ellipse cx="103" cy="200" rx="10" ry="12" fill="#f8c6a0" />
                      <ellipse cx="161" cy="200" rx="10" ry="12" fill="#f8c6a0" />
                      <path d="M94 201 Q103 210 112 201" stroke="#3b2a20" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                      <path d="M152 201 Q161 210 170 201" stroke="#3b2a20" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </button>

      <style>{`
        .buddy { position: absolute; left: 0; top: 0; z-index: 5; width: ${W}px; height: ${H}px; pointer-events: none; }
        .buddy-btn { position: relative; perspective: 520px; pointer-events: auto; display: block; padding: 0; border: none; background: none; cursor: pointer; }
        .buddy-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; border-radius: 12px; }
        .buddy-figure, .buddy-3d, .buddy-tilt, .buddy-pose, .buddy-solid { transform-style: preserve-3d; transform-origin: 50% 100%; }
        .buddy-tilt { transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)); transition: transform .3s ease-out; }
        .buddy-solid { position: relative; width: ${W}px; height: ${H}px; }
        .buddy-layer { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
        .buddy-front { position: relative; display: block; width: 100%; height: 100%; }
        .buddy-sheen { position: absolute; inset: 0; transform: translateZ(.6px); pointer-events: none; mix-blend-mode: soft-light;
          background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,.75) 48%, transparent 64%); background-size: 260% 100%; background-position: var(--sheen, 50%) 0;
          -webkit-mask: url(${BODY_SRC}) center / 100% 100% no-repeat; mask: url(${BODY_SRC}) center / 100% 100% no-repeat; transition: background-position .3s ease-out; }
        .buddy-pose { transition: transform .35s cubic-bezier(.3,1.4,.5,1); }
        .buddy-pose.is-wave { animation: buddy-rock 1.1s ease-in-out infinite; }
        .buddy-pose.is-point { transform: rotate(-6deg) translateX(-4px); }
        .buddy-pose.is-sleep { transform-origin: 50% 50%; animation: buddy-liedown .6s ease-out both, buddy-breathe 3.2s ease-in-out .6s infinite; }
        .buddy-pose.is-getup { transform-origin: 50% 50%; animation: buddy-getup .5s ease-out both; }
        .buddy.is-asleep .buddy-shadow { display: none; }
        .buddy.is-asleep .buddy-front { filter: saturate(.8) brightness(.95); }
        .buddy-shadow { position: absolute; left: 12%; right: 12%; bottom: -5px; height: 12px; border-radius: 50%; background: radial-gradient(closest-side, rgba(0,0,0,.38), transparent); }
        /* Hand pivots at the cuff (33% / 65% of the artwork); it gestures while talking and turns down to point */
        .buddy-hand { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; transform-origin: 33% 65%; transform: translateZ(1px) rotate(0deg); transition: transform .3s ease-out; }
        .buddy-pose.is-point .buddy-hand { transform: translateZ(1px) rotate(-62deg); }
        .buddy-solid.is-talking .buddy-hand { animation: buddy-gesture .95s ease-in-out infinite; }
        .buddy-pose.is-point .buddy-solid.is-talking .buddy-hand { animation: buddy-point 0.8s ease-in-out infinite; }
        .buddy-lids { position: absolute; inset: 0; width: 100%; height: 100%; transform: translateZ(.8px); pointer-events: none; }
        .buddy-zzz { position: absolute; top: ${H / 2 - W / 2 - 58}px; left: ${W / 2 - H / 2 - 6}px; width: 50px; height: 70px; pointer-events: none; font-weight: 900; font-family: var(--font-mono); color: #fff; text-shadow: 0 0 2px var(--accent), 0 0 10px var(--accent), 2px 2px 0 var(--accent); }
        .buddy-zzz span { position: absolute; left: 0; bottom: 0; opacity: 0; animation: buddy-z 2.7s ease-out infinite; font-size: 20px; }
        .buddy-zzz span:nth-child(2) { animation-delay: .9s; font-size: 27px; }
        .buddy-zzz span:nth-child(3) { animation-delay: 1.8s; font-size: 36px; }
        .buddy-bubble { position: absolute; bottom: calc(100% + 4px); left: -6px; width: max-content; max-width: min(230px, 70vw); font-size: 13px; font-weight: 600; line-height: 1.4; text-align: left; color: #0f172a; background: #fff; border: 2px solid #0f172a; border-radius: 14px; padding: 8px 12px; box-shadow: 3px 3px 0 #0f172a; pointer-events: none; }
        .buddy-bubble::after { content: ''; position: absolute; top: 100%; left: 22px; border: 8px solid transparent; border-top-color: #0f172a; }
        .buddy-bubble.is-top-left { left: auto; right: -6px; }
        .buddy-bubble.is-top-left::after { left: auto; right: 22px; }
        .buddy-bubble.is-side { bottom: 46px; left: calc(100% + 8px); }
        .buddy-bubble.is-side::after { top: auto; bottom: 10px; left: -16px; border-top-color: transparent; border-right-color: #0f172a; }
        @keyframes buddy-rock { 0%, 100% { transform: rotate(-4deg); } 50% { transform: rotate(4deg); } }
        @keyframes buddy-gesture { 0%, 100% { transform: translateZ(1px) rotate(0deg); } 25% { transform: translateZ(1px) rotate(-22deg); } 55% { transform: translateZ(1px) rotate(10deg); } 80% { transform: translateZ(1px) rotate(-12deg); } }
        @keyframes buddy-point { 0%, 100% { transform: translateZ(1px) rotate(-62deg); } 50% { transform: translateZ(1px) rotate(-50deg); } }
        @keyframes buddy-liedown { from { transform: rotate(0deg); } to { transform: rotate(-90deg); } }
        @keyframes buddy-getup { from { transform: rotate(-90deg); } to { transform: rotate(0deg); } }
        @keyframes buddy-breathe { 0%, 100% { transform: rotate(-90deg) scaleX(1); } 50% { transform: rotate(-90deg) scaleX(1.05); } }
        @keyframes buddy-z { 0% { opacity: 0; transform: translate(0, 0) rotate(-10deg); } 20% { opacity: 1; } 100% { opacity: 0; transform: translate(28px, -48px) rotate(14deg); } }
        @media (prefers-reduced-motion: reduce) { .buddy-pose.is-wave, .buddy-zzz span, .buddy-solid.is-talking .buddy-hand { animation: none; } .buddy-pose.is-sleep { animation: none; transform: rotate(-90deg); } .buddy-zzz span { opacity: 1; position: static; } }
      `}</style>
    </motion.div>
  )
}
