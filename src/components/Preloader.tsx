import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const FIRST = 'Saransh'.split('')
const LAST = 'Batham'.split('')

// Timeline (seconds, measured from the visitor's tap)
const T_STRIKE = 0.35   // bolt starts drawing
const T_IMPACT = 0.6    // bolt hits the ground
const T_EXIT   = 2.8    // overlay starts leaving
const T_DONE   = 3.45

// Impact point, as % of the viewport
const IMPACT_Y = 58

// Bolt + branches + ground cracks, in a 100×100 box stretched to the viewport
const BOLT     = 'M53 -2 L47 9 L54 17 L44 29 L52 37 L45 47 L51 53 L50 58'
const BRANCHES = ['M44 29 L37 36 L39 42', 'M52 37 L59 43 L57 48']
const CRACKS   = ['M50 58 L44 59 L40 58.4 L33 59.6', 'M50 58 L56 58.8 L61 58.2 L68 59.4', 'M50 58 L47 61 L48 63']

const RAIN = Array.from({ length: 28 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: ((i * 13) % 20) / 20,
  dur: 0.55 + ((i * 7) % 5) / 10,
}))

const SPARKS = Array.from({ length: 16 }, (_, i) => {
  const angle = Math.PI + (Math.PI * (i + 0.5)) / 16   // fan upward
  const dist = 70 + ((i * 29) % 60)
  return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, color: i % 3 === 0 ? '#fde68a' : i % 2 ? '#a78bfa' : '#60a5fa' }
})

const CLOUD = 'M26 56 C12 56 4 46 6 36 C8 27 16 22 24 23 C27 12 38 6 49 8 C57 3 70 4 76 13 C88 12 97 21 95 33 C99 42 93 54 81 56 Z'

type Phase = 'gate' | 'play' | 'exit' | 'done'

// Synthesised thunder: a sharp crack followed by a rolling low rumble
function noiseBuffer(ctx: AudioContext, secs: number, brown: boolean) {
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * secs), ctx.sampleRate)
  const data = buf.getChannelData(0)
  let last = 0
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1
    if (brown) { last = (last + 0.02 * white) / 1.02; data[i] = last * 3.5 }
    else data[i] = white
  }
  return buf
}

function playThunder(ctx: AudioContext, delay: number) {
  const now = ctx.currentTime + delay
  const out = ctx.createGain()
  out.gain.value = 0.9
  out.connect(ctx.destination)

  // Crack
  const crack = ctx.createBufferSource()
  crack.buffer = noiseBuffer(ctx, 0.4, false)
  const hp = ctx.createBiquadFilter()
  hp.type = 'highpass'; hp.frequency.value = 1200
  const crackGain = ctx.createGain()
  crackGain.gain.setValueAtTime(0.8, now)
  crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
  crack.connect(hp).connect(crackGain).connect(out)
  crack.start(now)

  // Rumble
  const rumble = ctx.createBufferSource()
  rumble.buffer = noiseBuffer(ctx, 3.5, true)
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.setValueAtTime(400, now)
  lp.frequency.exponentialRampToValueAtTime(60, now + 3)
  const rumbleGain = ctx.createGain()
  rumbleGain.gain.setValueAtTime(0.001, now)
  rumbleGain.gain.exponentialRampToValueAtTime(1, now + 0.06)
  rumbleGain.gain.setValueAtTime(1, now + 0.4)
  rumbleGain.gain.exponentialRampToValueAtTime(0.5, now + 0.9)
  rumbleGain.gain.linearRampToValueAtTime(0.7, now + 1.3)   // second roll
  rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + 3.4)
  rumble.connect(lp).connect(rumbleGain).connect(out)
  rumble.start(now)

  setTimeout(() => ctx.close().catch(() => {}), (delay + 4) * 1000)
}

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('gate')
  const done = useRef(onComplete)
  useEffect(() => { done.current = onComplete }, [onComplete])
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const finish = (exitIn: number, doneIn: number) => {
    timers.current.forEach(clearTimeout)
    timers.current = [
      setTimeout(() => setPhase('exit'), exitIn),
      setTimeout(() => { setPhase('done'); done.current() }, doneIn),
    ]
  }

  const start = () => {
    // Audio must be created/resumed inside the tap handler for browsers (esp. iOS) to allow it
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (AC) {
      try {
        const ctx = new AC()
        ctx.resume().catch(() => {})
        playThunder(ctx, T_IMPACT)
      } catch { /* no audio, animation still plays */ }
    }
    const scale = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.6 : 1
    setPhase('play')
    finish(T_EXIT * 1000 * scale, T_DONE * 1000 * scale)
  }

  const onTap = () => {
    if (phase === 'gate') start()
    else if (phase === 'play') finish(0, 600)
  }

  if (phase === 'done') return null

  const at = (t: number) => ({ delay: t })
  const started = phase !== 'gate'

  return (
    <motion.div
      onClick={onTap}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTap() } }}
      role="button"
      tabIndex={0}
      aria-label={started ? 'Skip intro' : 'Enter site'}
      style={{
        position: 'fixed', inset: 0, height: '100dvh', minHeight: '100vh',
        zIndex: 9999, overflow: 'hidden', cursor: 'pointer', outline: 'none',
        background: 'radial-gradient(ellipse at 50% 0%, #15122b 0%, #080810 60%)',
        userSelect: 'none', WebkitTapHighlightColor: 'transparent',
      }}
      animate={phase === 'exit' ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
    >
      {/* Rain */}
      {RAIN.map((r, i) => (
        <span key={i} className="pl-rain" style={{ left: `${r.left}%`, animationDelay: `${r.delay}s`, animationDuration: `${r.dur}s` }} />
      ))}

      {/* Gate: tap to enter */}
      <AnimatePresence>
        {!started && (
          <motion.div
            key="gate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.25 } }}
            style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, padding: '0 16px', textAlign: 'center' }}
          >
            {/* Storm flicker */}
            <motion.div
              style={{ position: 'absolute', top: '-30%', left: '50%', width: '120vmax', height: '60vmax', translateX: '-50%', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(139,92,246,0.3), transparent 65%)', pointerEvents: 'none' }}
              animate={{ opacity: [0.25, 0.25, 0.6, 0.2, 0.45, 0.25] }}
              transition={{ duration: 4, repeat: Infinity, times: [0, 0.5, 0.53, 0.58, 0.62, 1] }}
            />

            <motion.div
              className="pl-gate-btn"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.15 }}
              style={{
                position: 'relative', width: 'clamp(96px, 26vw, 120px)', aspectRatio: '1 / 1', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'radial-gradient(circle at 35% 30%, rgba(167,139,250,0.35), rgba(79,70,229,0.15))',
                border: '1px solid rgba(167,139,250,0.5)',
              }}
            >
              <svg width="42%" viewBox="0 0 24 24" fill="#f5f3ff" style={{ filter: 'drop-shadow(0 0 10px #a78bfa)' }}>
                <path d="M13 2L4.5 13.5H11L10 22l8.5-11.5H12L13 2z" />
              </svg>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <div style={{ fontSize: 'clamp(13px, 3.6vw, 15px)', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#ede9fe', fontFamily: 'monospace' }}>
                Tap to enter
              </div>
              <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(148,163,184,0.55)', fontFamily: 'monospace' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 010 7.07"/>
                </svg>
                Sound on for the full experience
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {started && (
        <>
          {/* Shake wrapper */}
          <motion.div
            style={{ position: 'absolute', inset: 0 }}
            initial={{ x: 0, y: 0 }}
            animate={{ x: [0, -7, 6, -4, 3, 0], y: [0, 4, -3, 2, -1, 0] }}
            transition={{ duration: 0.4, ...at(T_IMPACT) }}
          >
            {/* Storm glow at the top */}
            <motion.div
              style={{ position: 'absolute', top: '-30%', left: '50%', width: '120vmax', height: '60vmax', translateX: '-50%', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(139,92,246,0.35), transparent 65%)', pointerEvents: 'none' }}
              initial={{ opacity: 0.25 }}
              animate={{ opacity: [0.25, 0.9, 0.35] }}
              transition={{ duration: 1, times: [0, 0.6, 1] }}
            />

            {/* Bolt, branches, cracks */}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', filter: 'drop-shadow(0 0 6px #a78bfa) drop-shadow(0 0 18px #7c3aed)' }}>
              <motion.path d={BOLT} fill="none" stroke="#f5f3ff" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0, opacity: 1 }}
                animate={{ pathLength: 1, opacity: [1, 1, 0.3, 1, 0] }}
                transition={{ pathLength: { duration: T_IMPACT - T_STRIKE, ease: 'easeIn', ...at(T_STRIKE) }, opacity: { duration: 0.9, times: [0, 0.3, 0.45, 0.6, 1], ...at(T_IMPACT) } }}
              />
              {BRANCHES.map((d, i) => (
                <motion.path key={i} d={d} fill="none" stroke="#c4b5fd" strokeWidth={1.5} strokeLinecap="round" vectorEffect="non-scaling-stroke"
                  initial={{ pathLength: 0, opacity: 1 }}
                  animate={{ pathLength: 1, opacity: 0 }}
                  transition={{ pathLength: { duration: 0.12, ...at(T_STRIKE + 0.1 + i * 0.05) }, opacity: { duration: 0.6, ...at(T_IMPACT + 0.1) } }}
                />
              ))}
              {CRACKS.map((d, i) => (
                <motion.path key={i} d={d} fill="none" stroke="#a78bfa" strokeWidth={2} strokeLinecap="round" vectorEffect="non-scaling-stroke"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: [0, 1, 0.5] }}
                  transition={{ duration: 0.35, ...at(T_IMPACT) }}
                />
              ))}
            </svg>

            {/* Ground line */}
            <motion.div
              style={{ position: 'absolute', top: `${IMPACT_Y}%`, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.6), transparent)' }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.5, ...at(T_IMPACT) }}
            />

            {/* Impact: shockwaves + sparks */}
            <div style={{ position: 'absolute', top: `${IMPACT_Y}%`, left: '50%', width: 0, height: 0 }}>
              {[0, 0.12].map((d, i) => (
                <motion.span key={i}
                  style={{ position: 'absolute', left: -20, top: -20, width: 40, height: 40, borderRadius: '50%', border: `2px solid ${i ? '#60a5fa' : '#c4b5fd'}` }}
                  initial={{ scaleX: 0, scaleY: 0, opacity: 0 }}
                  animate={{ scaleX: [0, 9], scaleY: [0, i ? 9 : 2.6], opacity: [1, 0] }}
                  transition={{ duration: 0.9, ease: 'easeOut', ...at(T_IMPACT + d) }}
                />
              ))}
              {SPARKS.map((s, i) => (
                <motion.span key={i}
                  style={{ position: 'absolute', left: -2, top: -2, width: 4, height: 4, borderRadius: 99, background: s.color, boxShadow: `0 0 8px ${s.color}` }}
                  initial={{ x: 0, y: 0, opacity: 0 }}
                  animate={{ x: [0, s.x * 0.7, s.x], y: [0, s.y * 0.8, s.y * 0.6 + 40], opacity: [1, 1, 0] }}
                  transition={{ duration: 0.85, ease: 'easeOut', ...at(T_IMPACT) }}
                />
              ))}

              {/* Cloud bursting out of the ground */}
              <motion.div
                style={{ position: 'absolute', left: 0, bottom: 6, width: 'min(190px, 48vw)', translateX: '-50%', transformOrigin: '50% 100%' }}
                initial={{ scale: 0, opacity: 0, y: 20 }}
                animate={phase === 'exit' ? { scale: 1.4, opacity: 0, y: -30 } : { scale: 1, opacity: 1, y: 0 }}
                transition={phase === 'exit' ? { duration: 0.5 } : { type: 'spring', stiffness: 180, damping: 11, ...at(T_IMPACT + 0.15) }}
              >
                <svg viewBox="0 0 100 64" style={{ display: 'block', width: '100%', overflow: 'visible', filter: 'drop-shadow(0 0 24px rgba(59,130,246,0.6))' }}>
                  <defs>
                    <linearGradient id="pl-cloud" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                  </defs>
                  <path d={CLOUD} fill="url(#pl-cloud)" />
                  <path d="M54 14 L44 34 L51 34 L46 50 L59 29 L52 29 Z" fill="#fff" opacity={0.95} />
                </svg>
              </motion.div>
            </div>

            {/* Name + subtitle */}
            <div style={{ position: 'absolute', top: `calc(${IMPACT_Y}% + clamp(20px, 4vh, 36px))`, left: 0, right: 0, padding: '0 16px', textAlign: 'center' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 'clamp(8px, 3vw, 14px)', marginBottom: 8 }}>
                {[FIRST, LAST].map((word, w) => (
                  <div key={w} style={{ display: 'flex' }}>
                    {word.map((l, i) => (
                      <motion.span key={i}
                        initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], ...at(T_IMPACT + 0.35 + (w * FIRST.length + i) * 0.04) }}
                        style={{
                          fontSize: 'clamp(28px, 8.5vw, 40px)', fontWeight: 900, letterSpacing: '-0.02em', fontFamily: 'Inter, sans-serif',
                          ...(w ? { background: 'linear-gradient(135deg, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } : { color: '#f1f5f9' }),
                        }}
                      >{l}</motion.span>
                    ))}
                  </div>
                ))}
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, ...at(T_IMPACT + 0.9) }}
                style={{ fontSize: 'clamp(9px, 2.8vw, 11px)', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(148,163,184,0.6)', fontFamily: 'monospace' }}
              >
                Salesforce Developer
              </motion.p>
            </div>
          </motion.div>

          {/* Flash */}
          <motion.div
            style={{ position: 'absolute', inset: 0, background: '#ede9fe', pointerEvents: 'none' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.85, 0, 0.45, 0] }}
            transition={{ duration: 0.45, times: [0, 0.15, 0.4, 0.55, 1], ...at(T_IMPACT - 0.03) }}
          />

          {/* Skip hint */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={at(1.4)}
            style={{ position: 'absolute', bottom: 'max(20px, env(safe-area-inset-bottom, 0px))', left: 0, right: 0, textAlign: 'center', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(148,163,184,0.35)', fontFamily: 'monospace' }}
          >
            Tap to skip
          </motion.span>
        </>
      )}

      <style>{`
        .pl-rain {
          position: absolute; top: -12%; width: 1px; height: 12%;
          background: linear-gradient(transparent, rgba(167,139,250,0.35));
          animation: pl-rain linear infinite;
          pointer-events: none;
        }
        @keyframes pl-rain {
          to { transform: translate(-6vh, 125vh); }
        }
        .pl-gate-btn::before, .pl-gate-btn::after {
          content: ''; position: absolute; inset: -1px; border-radius: 50%;
          border: 1px solid rgba(167,139,250,0.55);
          animation: pl-pulse 2s ease-out infinite;
        }
        .pl-gate-btn::after { animation-delay: 1s; }
        @keyframes pl-pulse {
          from { transform: scale(1); opacity: 1; }
          to   { transform: scale(1.9); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pl-rain, .pl-gate-btn::before, .pl-gate-btn::after { display: none; }
        }
      `}</style>
    </motion.div>
  )
}
