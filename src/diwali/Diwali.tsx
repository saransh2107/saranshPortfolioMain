import { useEffect, useRef, useState } from 'react'
import { Fireworks, type Kind } from './fireworks'
import { Sound } from './sound'

const params = new URLSearchParams(window.location.search)
const clean = (v: string | null) => (v ?? '').replace(/\s+/g, ' ').trim().slice(0, 30)
const TO = clean(params.get('to'))
const FROM = clean(params.get('from')) || 'Saransh'

const FUSE_MS = 1600
// Opening show after the first rocket: [delay ms, kind]. The wish appears once the finale has burst.
const SHOW: [number, Kind?][] = [
  [1400], [1900], [2300, 'willow'], [2800], [3100, 'ring'], [3500], [3900, 'strobe'],
  [4300], [4500, 'palm'], [5000], [5080], [5160, 'heart'], [5240], [5320, 'willow'],
]
const WISH_AT = 6900

type Stage = 'intro' | 'fuse' | 'show' | 'wish'

function drawStars(canvas: HTMLCanvasElement) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const w = window.innerWidth, h = window.innerHeight
  canvas.width = w * dpr
  canvas.height = h * dpr
  const ctx = canvas.getContext('2d')!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  const count = Math.round((w * h) / 4500)
  for (let i = 0; i < count; i++) {
    const y = Math.random() ** 1.6 * h * 0.8
    ctx.fillStyle = `rgba(255,246,230,${0.25 + Math.random() * 0.65})`
    ctx.beginPath()
    ctx.arc(Math.random() * w, y, 0.3 + Math.random() * 1.1, 0, Math.PI * 2)
    ctx.fill()
  }
}

function Diya({ i }: { i: number }) {
  return (
    <div className="dw-diya" style={{ '--d': `${(i * 0.37) % 1.3}s` } as React.CSSProperties}>
      <span className="dw-flame" />
      <span className="dw-bowl" />
    </div>
  )
}

function SoundIcon({ muted }: { muted: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5 6 9H3v6h3l5 4V5z" />
      {muted
        ? <><line x1="22" y1="9" x2="16" y2="15" /><line x1="16" y1="9" x2="22" y2="15" /></>
        : <><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" /></>}
    </svg>
  )
}

function SharePanel({ onClose }: { onClose: () => void }) {
  const [to, setTo] = useState('')
  const [from, setFrom] = useState('')
  const [copied, setCopied] = useState(false)

  const link = () => {
    const q = new URLSearchParams()
    if (to.trim()) q.set('to', to.trim())
    if (from.trim()) q.set('from', from.trim())
    const qs = q.toString()
    return `${window.location.origin}/diwali${qs ? `?${qs}` : ''}`
  }

  const message = () =>
    `🪔 ${to.trim() ? `${to.trim()}, ` : ''}I have a little Diwali surprise for you! Tap the link and light the cracker ✨\n\n${link()}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message())
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.prompt('Copy this link', link())
    }
  }

  return (
    <div className="dw-sheet-backdrop" onClick={onClose}>
      <form
        className="dw-sheet"
        onClick={e => e.stopPropagation()}
        onSubmit={e => {
          e.preventDefault()
          window.open(`https://wa.me/?text=${encodeURIComponent(message())}`, '_blank', 'noopener')
        }}
      >
        <p className="dw-sheet-title">Send a Diwali surprise</p>
        <label>
          <span>Their name</span>
          <input value={to} onChange={e => setTo(e.target.value)} maxLength={30} placeholder="e.g. Priya" autoFocus />
        </label>
        <label>
          <span>Your name</span>
          <input value={from} onChange={e => setFrom(e.target.value)} maxLength={30} placeholder="So they know it's from you" />
        </label>
        <button type="submit" className="dw-btn dw-btn-primary">Send on WhatsApp</button>
        <button type="button" className="dw-btn dw-btn-ghost" onClick={copy}>{copied ? 'Copied!' : 'Copy message'}</button>
      </form>
    </div>
  )
}

export default function Diwali() {
  const fxRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<HTMLCanvasElement>(null)
  const fuseRef = useRef<SVGPathElement>(null)
  const rocketRef = useRef<SVGSVGElement>(null)
  const engine = useRef<Fireworks | null>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const [sound] = useState(() => new Sound())
  const [stage, setStage] = useState<Stage>('intro')
  const [muted, setMuted] = useState(false)
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    const fw = new Fireworks(fxRef.current!, sound)
    engine.current = fw
    const stars = () => drawStars(starsRef.current!)
    stars()
    window.addEventListener('resize', stars)
    const pending = timers.current
    return () => {
      fw.destroy()
      window.removeEventListener('resize', stars)
      pending.forEach(clearTimeout)
    }
  }, [sound])

  // After the wish, keep the sky alive with the odd rocket
  useEffect(() => {
    if (stage !== 'wish') return
    let id: ReturnType<typeof setTimeout>
    const tick = () => {
      if (!document.hidden) engine.current?.launch()
      id = setTimeout(tick, 1100 + Math.random() * 1800)
    }
    id = setTimeout(tick, 1500)
    return () => clearTimeout(id)
  }, [stage])

  const later = (ms: number, fn: () => void) => { timers.current.push(setTimeout(fn, ms)) }

  const launchMain = () => {
    const rect = rocketRef.current!.getBoundingClientRect()
    engine.current?.launch({
      x: rect.left + rect.width / 2, y: rect.top,
      targetY: window.innerHeight * 0.26, kind: 'peony', hue: 42, big: true, whistle: true,
    })
    setStage('show')
    SHOW.forEach(([ms, kind]) => later(ms, () => engine.current?.launch({ kind })))
    later(WISH_AT, () => setStage('wish'))
  }

  const light = () => {
    if (stage !== 'intro') return
    sound.unlock()
    sound.fuse(FUSE_MS / 1000)
    setStage('fuse')

    const path = fuseRef.current!
    const len = path.getTotalLength()
    const start = performance.now()
    const burn = (now: number) => {
      const p = Math.min((now - start) / FUSE_MS, 1)
      const burned = p * len
      path.style.strokeDasharray = `0 ${burned} ${len}`
      const pt = path.getPointAtLength(burned)
      const m = path.getScreenCTM()
      if (m) {
        const s = new DOMPoint(pt.x, pt.y).matrixTransform(m)
        engine.current?.sparkle(s.x, s.y)
      }
      if (p < 1) requestAnimationFrame(burn)
      else launchMain()
    }
    requestAnimationFrame(burn)
  }

  const onSkyTap = (e: React.PointerEvent) => {
    if (stage !== 'show' && stage !== 'wish') return
    if ((e.target as HTMLElement).closest('button, a, input, form')) return
    const h = window.innerHeight
    engine.current?.launch({ x: e.clientX, targetY: Math.max(h * 0.1, Math.min(e.clientY, h * 0.6)) })
  }

  const salvo = () => {
    for (let i = 0; i < 5; i++) later(i * 160, () => engine.current?.launch({ whistle: i === 0 }))
  }

  const toggleMute = () => {
    sound.unlock()
    sound.setMuted(!muted)
    setMuted(!muted)
  }

  return (
    <div className={`dw is-${stage}`} onPointerDown={onSkyTap}>
      <canvas ref={starsRef} className="dw-layer" aria-hidden />

      <div className="dw-ground" aria-hidden>
        <div className="dw-diyas">
          {[0, 1, 2, 3].map(i => <Diya key={i} i={i} />)}
          <div className="dw-rocket-slot" />
          {[4, 5, 6, 7].map(i => <Diya key={i} i={i} />)}
        </div>
      </div>

      <svg ref={rocketRef} className="dw-rocket" viewBox="0 0 60 200" onClick={light} aria-hidden>
        <defs>
          <linearGradient id="dw-body" x1="0" x2="1">
            <stop offset="0" stopColor="#8f1a1a" /><stop offset=".45" stopColor="#e23b2e" /><stop offset="1" stopColor="#7a1414" />
          </linearGradient>
          <linearGradient id="dw-cone" x1="0" x2="1">
            <stop offset="0" stopColor="#b8862b" /><stop offset=".5" stopColor="#ffd77a" /><stop offset="1" stopColor="#a8761f" />
          </linearGradient>
        </defs>
        <rect x="28.5" y="118" width="3" height="82" rx="1.5" fill="#7a4a24" />
        <rect x="19" y="44" width="22" height="76" rx="3" fill="url(#dw-body)" />
        <rect x="19" y="58" width="22" height="5" fill="url(#dw-cone)" />
        <rect x="19" y="100" width="22" height="5" fill="url(#dw-cone)" />
        <path d="M19 45 L30 12 L41 45 Z" fill="url(#dw-cone)" />
        <path ref={fuseRef} className="dw-fuse" d="M50 158 C 56 146, 48 128, 33 121" fill="none" stroke="#e8c27a" strokeWidth="2" strokeLinecap="round" />
      </svg>

      <canvas ref={fxRef} className="dw-layer dw-fx" aria-hidden />

      <section className="dw-intro">
        <p className="dw-eyebrow">✨ A Diwali surprise {TO ? <>for <strong>{TO}</strong></> : 'for you'}</p>
        <h1 className="dw-intro-title">Light the cracker</h1>
        <p className="dw-intro-sub">Turn your sound on 🔊</p>
      </section>

      <button className="dw-light" onClick={light} disabled={stage !== 'intro'}>
        <span className="dw-light-flame" /> Tap to light
      </button>

      {stage === 'wish' && (
        <section className="dw-wish">
          <p className="dw-hindi dw-rise" style={{ '--d': '0s' } as React.CSSProperties}>शुभ दीपावली</p>
          <h1 className="dw-title dw-rise" style={{ '--d': '.25s' } as React.CSSProperties}>Happy Diwali</h1>
          <p className="dw-msg dw-rise" style={{ '--d': '.7s' } as React.CSSProperties}>
            {TO && <>Dear {TO},<br /></>}
            May the glow of the diyas fill your home with joy, your year with light, and your heart with peace.
          </p>
          <p className="dw-sign dw-rise" style={{ '--d': '1s' } as React.CSSProperties}>— {FROM}</p>
          <div className="dw-actions dw-rise" style={{ '--d': '1.4s' } as React.CSSProperties}>
            <button className="dw-btn dw-btn-primary" onClick={salvo}>Burst more 🎆</button>
            <button className="dw-btn dw-btn-ghost" onClick={() => setSharing(true)}>Surprise someone</button>
          </div>
          <p className="dw-hint dw-rise" style={{ '--d': '2.2s' } as React.CSSProperties}>Tap anywhere in the sky to launch your own</p>
        </section>
      )}

      {stage !== 'intro' && (
        <button className="dw-mute" onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
          <SoundIcon muted={muted} />
        </button>
      )}

      <a className="dw-credit" href="/">saranshbatham.com</a>

      {sharing && <SharePanel onClose={() => setSharing(false)} />}
    </div>
  )
}
