import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { impactAnalyzer, tradeNotes, type Project } from '../data/resume'
import Rich from './Rich'
import SectionHead from './SectionHead'

const BLUE = '#3b82f6'
const TEAL = '#14b8a6'

const mockRefs = [
  { type: 'Apex',     name: 'AccountTriggerHandler.cls', match: 'confirmed', color: '#6366f1' },
  { type: 'Flow',     name: 'Lead_Conversion_Flow',      match: 'confirmed', color: '#0ea5e9' },
  { type: 'LWC',      name: 'accountSummaryCard',        match: 'likely',    color: '#22c55e' },
  { type: 'Report',   name: 'Pipeline by Industry',      match: 'confirmed', color: '#f59e0b' },
  { type: 'Formula',  name: 'Segment_Score__c',          match: 'possible',  color: '#ec4899' },
]

const matchColor: Record<string, string> = { confirmed: '#22c55e', likely: '#f59e0b', possible: '#94a3b8' }

const graphNodes = [
  { x: 40,  y: 30,  c: '#6366f1' },
  { x: 200, y: 26,  c: '#0ea5e9' },
  { x: 24,  y: 104, c: '#22c55e' },
  { x: 216, y: 108, c: '#f59e0b' },
  { x: 120, y: 128, c: '#ec4899' },
]

const FIELD = 'Account.Industry'
// The demo plays as numbered steps: type (0), then one reference per step, the risk rating, the deploy line, and a hold
const FIRST_REF = 2
const RISK_STEP = FIRST_REF + mockRefs.length
const DEPLOY_STEP = RISK_STEP + 1
const LAST_STEP = DEPLOY_STEP + 4

/** Scripted walkthrough of the extension; only ticks while on screen. */
export function MockWindow() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '40px' })
  const still = useReducedMotion()
  const [tick, setTick] = useState(0)
  const step = still ? DEPLOY_STEP : tick

  useEffect(() => {
    if (!inView || still) return
    const t = setInterval(() => setTick(s => (s + 1) % (LAST_STEP + 1)), 720)
    return () => clearInterval(t)
  }, [inView, still])

  const foundCount = Math.max(0, Math.min(mockRefs.length, step - FIRST_REF + 1))

  return (
    <div ref={ref} className="dm-window">
      {/* Window chrome */}
      <div className="dm-bar">
        {['#ef4444', '#f59e0b', '#22c55e'].map(c => <span key={c} className="dm-light" style={{ background: c }} />)}
        <img src="/sf-impact-analyzer.png" alt="SF Impact Analyzer logo" width={14} height={14} style={{ borderRadius: 3, marginLeft: 8 }} />
        <span className="dm-title">SF Impact Analyzer</span>
      </div>

      <div style={{ padding: 16 }}>
        <div className="dm-head">
          <div style={{ minWidth: 0 }}>
            <div className="dm-eyebrow">Analyzing field</div>
            <div className="dm-field">
              <span key={step === 0 ? 'typing' : 'typed'} className={step === 0 ? 'dm-typing' : undefined}>{FIELD}</span>
              {step === 0 && <i className="dm-caret" />}
            </div>
          </div>
          <span className={`dm-risk${step >= RISK_STEP ? ' on' : ''}`}>HIGH RISK</span>
        </div>

        {/* Progress of the scan */}
        <div className="dm-progress"><i style={{ width: `${(foundCount / mockRefs.length) * 100}%` }} /></div>
        <div className="dm-count">
          {step < FIRST_REF ? 'Starting scan…' : step < RISK_STEP ? `Scanning org… ${foundCount} found` : `${mockRefs.length} references found`}
        </div>

        {/* Dependency graph grows as references turn up */}
        <div className="dm-graph">
          <svg viewBox="0 0 240 150" style={{ display: 'block', width: '100%', height: 110 }} aria-hidden>
            {graphNodes.map((n, i) => {
              const on = step >= FIRST_REF + i
              return (
                <g key={i}>
                  <line x1={120} y1={70} x2={n.x} y2={n.y} stroke={n.c} strokeOpacity={0.6} strokeWidth={1.5} pathLength={1} strokeDasharray={1} strokeDashoffset={on ? 0 : 1} style={{ transition: 'stroke-dashoffset .45s ease' }} />
                  <circle cx={n.x} cy={n.y} r={7} fill={n.c} style={{ transformBox: 'fill-box', transformOrigin: 'center', transform: on ? 'scale(1)' : 'scale(0)', transition: 'transform .35s cubic-bezier(.3,1.6,.5,1) .25s' }} />
                </g>
              )
            })}
            <circle cx={120} cy={70} r={20} fill={BLUE} fillOpacity={0.15} />
            <circle cx={120} cy={70} r={12} fill={BLUE} />
            <circle cx={120} cy={70} r={4} fill="#fff" />
          </svg>
        </div>

        {/* References; every row keeps its space so nothing jumps while they appear */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {mockRefs.map((r, i) => (
            <div key={r.name} className={`dm-ref${step >= FIRST_REF + i ? ' on' : ''}`}>
              <span className="dm-type" style={{ color: r.color, background: r.color + '18' }}>{r.type}</span>
              <span className="dm-name">{r.name}</span>
              <span className="dm-match" style={{ background: matchColor[r.match] }} title={r.match} />
            </div>
          ))}
        </div>

        <div className={`dm-deploy${step >= DEPLOY_STEP ? ' on' : ''}`}>$ sf project deploy start --test-level RunSpecifiedTests</div>
      </div>

      <style>{`
        .dm-window { background: var(--bg); border: 1px solid var(--border-2); border-radius: 14px; overflow: hidden; box-shadow: 0 24px 60px rgba(0,0,0,.25); }
        .dm-bar { display: flex; align-items: center; gap: 6px; padding: 10px 14px; border-bottom: 1px solid var(--border); background: var(--bg-2); }
        .dm-light { width: 9px; height: 9px; border-radius: 99px; opacity: .8; }
        .dm-title { font-size: 11px; font-weight: 600; color: var(--fg-2); }
        .dm-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
        .dm-eyebrow { font-size: 10px; text-transform: uppercase; letter-spacing: .08em; color: var(--fg-3); }
        .dm-field { display: flex; align-items: center; height: 20px; font-size: 13px; font-weight: 600; font-family: var(--font-mono); color: var(--fg); white-space: nowrap; }
        .dm-typing { display: inline-block; overflow: hidden; animation: dm-type .68s steps(${FIELD.length}) both; }
        .dm-caret { width: 2px; height: 14px; margin-left: 2px; background: ${BLUE}; }
        @keyframes dm-type { from { width: 0; } to { width: ${FIELD.length}ch; } }
        .dm-risk { flex-shrink: 0; font-size: 10px; font-weight: 700; font-family: var(--font-mono); letter-spacing: .06em; color: #ef4444; background: rgba(239,68,68,.12); border: 1px solid rgba(239,68,68,.3); border-radius: 6px; padding: 4px 8px; opacity: 0; transform: scale(.6); transition: opacity .2s, transform .35s cubic-bezier(.3,1.8,.5,1); }
        .dm-risk.on { opacity: 1; transform: none; }
        .dm-progress { height: 3px; border-radius: 99px; background: var(--bg-3); overflow: hidden; }
        .dm-progress i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, ${BLUE}, #38bdf8); transition: width .4s ease; }
        .dm-count { font-size: 10.5px; font-family: var(--font-mono); color: var(--fg-3); margin: 6px 0 10px; }
        .dm-graph { background: var(--bg-2); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; }
        .dm-ref { display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: var(--bg-2); border: 1px solid var(--border); border-radius: 8px; opacity: 0; transform: translateX(10px); transition: opacity .3s, transform .35s cubic-bezier(.2,.8,.2,1); }
        .dm-ref.on { opacity: 1; transform: none; }
        .dm-type { width: 52px; flex-shrink: 0; font-size: 9px; font-weight: 700; font-family: var(--font-mono); text-align: center; border-radius: 4px; padding: 2px 6px; }
        .dm-name { flex: 1; min-width: 0; font-size: 11px; font-family: var(--font-mono); color: var(--fg-2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .dm-match { width: 6px; height: 6px; border-radius: 99px; flex-shrink: 0; }
        .dm-deploy { margin-top: 10px; font-size: 10px; font-family: var(--font-mono); color: #22c55e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; opacity: 0; transition: opacity .35s; }
        .dm-deploy.on { opacity: 1; }
        @media (prefers-reduced-motion: reduce) { .dm-typing { animation: none; } }
      `}</style>
    </div>
  )
}

const CANDLES = [
  { y: 46, h: 22, up: true }, { y: 38, h: 18, up: true }, { y: 44, h: 16, up: false }, { y: 30, h: 26, up: true },
  { y: 22, h: 20, up: true }, { y: 28, h: 14, up: false }, { y: 12, h: 24, up: true },
]

/** TradeNotes screenshots playing as a slow tour, with a chart sketching itself over the top. */
function TradeDemo() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '40px' })
  const still = useReducedMotion()
  const [shot, setShot] = useState(0)
  const shots = tradeNotes.screenshots

  useEffect(() => {
    if (!inView || still) return
    const t = setInterval(() => setShot(s => (s + 1) % shots.length), 4200)
    return () => clearInterval(t)
  }, [inView, still, shot, shots.length])

  return (
    <div ref={ref} className={`td${inView ? ' is-live' : ''}`}>
      <div className="td-frame">
        {shots.map((s, i) => (
          <img key={s.src} src={s.src} alt={`TradeNotes: ${s.label}`} width={1348} height={758} loading="lazy" className={i === shot ? 'on' : undefined} />
        ))}
      </div>

      <div className="td-sketch" aria-hidden>
        <svg viewBox="0 0 100 80" width="100%" height="100%">
          {CANDLES.map((c, i) => (
            <g key={i} className="td-candle" style={{ animationDelay: `${i * 0.28}s` }}>
              <line x1={8 + i * 14} x2={8 + i * 14} y1={c.y - 6} y2={c.y + c.h + 6} stroke={c.up ? '#22c55e' : '#ef4444'} strokeWidth={1.2} />
              <rect x={3.5 + i * 14} y={c.y} width={9} height={c.h} rx={1} fill={c.up ? '#22c55e' : '#ef4444'} />
            </g>
          ))}
        </svg>
      </div>

      <div role="tablist" aria-label="TradeNotes screenshots" className="td-tabs">
        {shots.map((s, i) => (
          <button key={s.src} role="tab" aria-selected={shot === i} className={shot === i ? 'on' : undefined} onClick={() => setShot(i)}>{s.label}</button>
        ))}
      </div>

      <style>{`
        .td { position: relative; }
        .td-frame { position: relative; aspect-ratio: 1348 / 758; border-radius: 14px; overflow: hidden; border: 1px solid var(--border-2); background: #0f1218; box-shadow: 0 24px 60px rgba(0,0,0,.25); }
        .td-frame img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity .7s ease; }
        .td-frame img.on { opacity: 1; animation: td-pan 8s ease-in-out infinite alternate; animation-play-state: paused; }
        .is-live .td-frame img.on { animation-play-state: running; }
        @keyframes td-pan { from { transform: scale(1.02); } to { transform: scale(1.12) translate(-2%, -2%); } }
        .td-sketch { position: absolute; right: -10px; top: -14px; width: clamp(92px, 24%, 136px); aspect-ratio: 5 / 4; padding: 8px; border-radius: 12px; background: color-mix(in srgb, var(--bg) 94%, transparent); border: 1px solid var(--border-2); box-shadow: 0 14px 34px -10px rgba(0,0,0,.45); }
        .td-candle { transform-box: fill-box; transform-origin: center bottom; animation: td-candle 6s ease-out infinite both; animation-play-state: paused; }
        .is-live .td-candle { animation-play-state: running; }
        @keyframes td-candle { 0% { opacity: 0; transform: scaleY(0); } 8%, 86% { opacity: 1; transform: scaleY(1); } 100% { opacity: 0; transform: scaleY(1); } }
        .td-tabs { display: flex; justify-content: center; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
        .td-tabs button { font: inherit; font-size: 11px; font-weight: 600; color: var(--fg-2); background: transparent; border: 1px solid var(--border-2); border-radius: 99px; padding: 4px 12px; cursor: pointer; transition: color .15s, background .15s, border-color .15s; }
        .td-tabs button.on { color: #fff; background: ${TEAL}; border-color: ${TEAL}; }
        @media (max-width: 520px) { .td-sketch { right: -4px; top: -10px; } }
        @media (prefers-reduced-motion: reduce) { .td-frame img.on, .td-candle { animation: none; } }
      `}</style>
    </div>
  )
}

/** Tilts up and settles as it scrolls into view. */
function Stage({ children }: { children: React.ReactNode }) {
  return <div className="pj-stage"><div className="pj-tilt">{children}</div></div>
}

interface RowProps {
  index: string
  project: Project
  meta: string
  color: string
  demo: React.ReactNode
  flip?: boolean
  note?: React.ReactNode
}

function ProjectRow({ index, project: p, meta, color, demo, flip, note }: RowProps) {
  const strong = { color: 'var(--fg)', fontWeight: 600 }
  return (
    <article className={`pj-row${flip ? ' pj-flip' : ''}`} style={{ '--p': color } as React.CSSProperties}>
      <motion.div className="pj-copy" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
        <div className="pj-top">
          <span className="pj-index" aria-hidden>{index}</span>
          <img src={p.icon} alt={`${p.name} icon`} width={46} height={46} />
          <span className="pj-live">Live</span>
        </div>
        <h3 className="pj-name">{p.name}</h3>
        <p className="pj-meta">{meta}</p>
        <p className="pj-pitch"><Rich text={p.pitch} strong={strong} /></p>

        <ul className="pj-features">
          {p.features.map(f => (
            <li key={f.title}>
              <span aria-hidden>{f.icon}</span>
              <div><strong>{f.title}</strong><small>{f.desc}</small></div>
            </li>
          ))}
        </ul>

        <div className="pj-actions">
          <a href={p.url} target="_blank" rel="noopener noreferrer" className="pj-cta">{p.cta} <span aria-hidden>→</span></a>
          {note}
        </div>
      </motion.div>
      <Stage>{demo}</Stage>
    </article>
  )
}

export default function Projects() {
  return (
    <section id="projects" className="section">
      <div className="container">
        <SectionHead label="04 — Projects" title="Things I've *built*"
          aside="Tools for Salesforce developers and traders, free to try. These are running on their own, so watch them work." />

        <div className="pj-list">
          <ProjectRow index="01" project={impactAnalyzer} color={BLUE} meta={`${impactAnalyzer.type} · ${impactAnalyzer.version}`} demo={<MockWindow />}
            note={<span className="pj-note">Works on {impactAnalyzer.compatibility}</span>} />
          <ProjectRow index="02" project={tradeNotes} color={TEAL} meta={tradeNotes.type} demo={<TradeDemo />} flip
            note={<a href={`${tradeNotes.url}app.html`} target="_blank" rel="noopener noreferrer" className="pj-ghost">Try in browser →</a>} />
        </div>
      </div>

      <style>{`
        .pj-list { display: flex; flex-direction: column; gap: clamp(36px, 5vw, 64px); }
        .pj-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr); gap: clamp(24px, 4.5vw, 60px); align-items: center; }
        .pj-flip .pj-copy { order: 2; }
        .pj-top { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
        .pj-index { font-family: var(--font-accent); font-size: clamp(44px, 5vw, 64px); line-height: 1; color: var(--p); margin-right: 2px; }
        .pj-top img { border-radius: 12px; box-shadow: 0 8px 24px color-mix(in srgb, var(--p) 30%, transparent); }
        .pj-live { font-size: 10px; font-family: var(--font-mono); font-weight: 600; letter-spacing: .04em; text-transform: uppercase; color: #22c55e; background: rgba(34,197,94,.12); border-radius: 6px; padding: 2px 7px; }
        .pj-name { font-family: var(--font-display); font-size: clamp(28px, 3.6vw, 44px); font-weight: 800; letter-spacing: -0.04em; line-height: 1.08; color: var(--fg); }
        .pj-meta { font-size: 12px; font-family: var(--font-mono); color: var(--fg-3); margin: 4px 0 12px; }
        .pj-pitch { font-size: 15.5px; line-height: 1.65; color: var(--fg-2); margin-bottom: 16px; }
        .pj-features { list-style: none; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 18px; margin-bottom: 20px; }
        .pj-features li { display: flex; gap: 9px; font-size: 13px; line-height: 1.45; }
        .pj-features strong { display: block; font-weight: 600; color: var(--fg); }
        .pj-features small { display: block; font-size: 12px; color: var(--fg-3); }
        .pj-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 12px; }
        .pj-cta { display: inline-flex; gap: 8px; font-size: 14px; font-weight: 600; color: #fff; background: var(--p); border-radius: 10px; padding: 11px 20px; text-decoration: none; box-shadow: 0 8px 24px color-mix(in srgb, var(--p) 35%, transparent); transition: transform .15s, box-shadow .15s; }
        .pj-cta:hover { transform: translateY(-2px); box-shadow: 0 12px 32px color-mix(in srgb, var(--p) 50%, transparent); }
        .pj-ghost { font-size: 13px; font-weight: 600; color: var(--fg-2); border: 1px solid var(--border-2); border-radius: 10px; padding: 10px 16px; text-decoration: none; }
        .pj-ghost:hover { color: var(--fg); }
        .pj-note { font-size: 12px; color: var(--fg-3); }
        .pj-stage { min-width: 0; }
        @supports (animation-timeline: view()) {
          @media (prefers-reduced-motion: no-preference) {
            .pj-tilt { animation: pj-rise linear both; animation-timeline: view(); animation-range: entry 0% entry 75%; will-change: transform, opacity; }
          }
        }
        @keyframes pj-rise {
          from { opacity: .25; transform: perspective(1100px) translate3d(0, 46px, 0) rotateX(18deg) scale(.92); }
          50% { opacity: 1; }
          to { opacity: 1; transform: perspective(1100px) translate3d(0, 0, 0) rotateX(0) scale(1); }
        }
        @media (max-width: 860px) {
          .pj-row { grid-template-columns: minmax(0, 1fr); gap: 20px; }
          .pj-flip .pj-copy { order: 0; }
        }
        @media (max-width: 480px) { .pj-features { grid-template-columns: minmax(0, 1fr); } }
      `}</style>
    </section>
  )
}
