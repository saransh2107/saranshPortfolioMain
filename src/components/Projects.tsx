import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { impactAnalyzer, tradeNotes } from '../data/resume'
import Rich from './Rich'

const { storeUrl: STORE_URL, features, highlights } = impactAnalyzer

const BLUE = '#3b82f6'

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

function ChromeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/>
      <path d="M21.17 8H12M3.95 6.06L8.54 14M10.88 21.94L15.46 14"/>
    </svg>
  )
}

export function MockWindow() {
  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border-2)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }}>
      {/* Window chrome */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg-2)' }}>
        {['#ef4444', '#f59e0b', '#22c55e'].map(c => <span key={c} style={{ width: 9, height: 9, borderRadius: 99, background: c, opacity: .8 }} />)}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 10 }}>
          <img src="/sf-impact-analyzer.png" alt="SF Impact Analyzer logo" width={14} height={14} style={{ borderRadius: 3 }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-2)' }}>SF Impact Analyzer</span>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {/* Search target */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--fg-3)' }}>Analyzing field</div>
            <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Account.Industry</div>
          </div>
          <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#ef4444', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '4px 8px', letterSpacing: '.06em' }}>
            HIGH RISK
          </span>
        </div>

        {/* Mini dependency graph */}
        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 12 }}>
          <svg viewBox="0 0 240 150" style={{ display: 'block', width: '100%', height: 120 }}>
            {graphNodes.map((n, i) => (
              <motion.line key={i} x1={120} y1={70} x2={n.x} y2={n.y} stroke={n.c} strokeOpacity={0.5} strokeWidth={1.5} strokeDasharray="4 4"
                animate={{ strokeDashoffset: [0, -16] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }} />
            ))}
            {graphNodes.map((n, i) => (
              <motion.circle key={i} cx={n.x} cy={n.y} r={7} fill={n.c}
                animate={{ r: [6, 8, 6] }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.3 }} />
            ))}
            <circle cx={120} cy={70} r={20} fill={BLUE} fillOpacity={0.15} />
            <circle cx={120} cy={70} r={12} fill={BLUE} />
            <circle cx={120} cy={70} r={4} fill="#fff" />
          </svg>
        </div>

        {/* References */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {mockRefs.map((r, i) => (
            <motion.div key={r.name}
              initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.08 }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8 }}
            >
              <span style={{ fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-mono)', color: r.color, background: r.color + '18', borderRadius: 4, padding: '2px 6px', width: 52, textAlign: 'center', flexShrink: 0 }}>{r.type}</span>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-2)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</span>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: matchColor[r.match], flexShrink: 0 }} title={r.match} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Projects() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const v = (d = 0) => ({ initial: { opacity: 0, y: 20 }, animate: inView ? { opacity: 1, y: 0 } : {}, transition: { duration: 0.5, delay: d } })

  return (
    <section id="projects" className="section" ref={ref}>
      <div className="container">
        <motion.p {...v(0)} className="section-label">04 — Projects</motion.p>
        <motion.h2 {...v(0.05)} style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--fg)', marginBottom: 8 }}>
          Things I've built
        </motion.h2>
        <motion.p {...v(0.08)} style={{ fontSize: 14, color: 'var(--fg-3)', marginBottom: 40 }}>
          Tools for Salesforce developers and traders — free to try.
        </motion.p>

        <motion.div {...v(0.12)}
          style={{
            position: 'relative', overflow: 'hidden',
            background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 20,
            padding: 32,
          }}
        >
          {/* Glow */}
          <div aria-hidden style={{ position: 'absolute', top: -120, right: -120, width: 340, height: 340, borderRadius: '50%', background: `radial-gradient(circle, ${BLUE}33, transparent 70%)`, pointerEvents: 'none' }} />

          <div className="project-grid" style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 40, alignItems: 'center' }}>
            {/* Info */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                <img src="/sf-impact-analyzer.png" alt="SF Impact Analyzer icon" width={52} height={52} style={{ borderRadius: 12, boxShadow: `0 8px 24px ${BLUE}40` }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg)', letterSpacing: '-0.015em' }}>SF Impact Analyzer</h3>
                    <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#22c55e', background: 'rgba(34,197,94,0.12)', borderRadius: 6, padding: '2px 7px', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                      Live
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>Chrome Extension · v1.0</div>
                </div>
              </div>

              <p style={{ fontSize: 15, color: 'var(--fg-2)', lineHeight: 1.7, marginBottom: 22 }}>
                See <strong style={{ color: 'var(--fg)', fontWeight: 600 }}>everywhere a Salesforce field, object or Apex class is used</strong> before you rename, change or delete it — straight from the org you're already logged into.
              </p>

              <div className="feature-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
                {features.map(f => (
                  <div key={f.title} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 4 }}>
                      <span style={{ marginRight: 6 }}>{f.icon}</span>{f.title}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--fg-3)', lineHeight: 1.5 }}>{f.desc}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 26 }}>
                {highlights.map(h => (
                  <span key={h} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--fg-2)', border: '1px solid var(--border)', borderRadius: 99, padding: '3px 10px' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth={3}><path d="M20 6L9 17l-5-5"/></svg>
                    {h}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
                <a href={STORE_URL} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: '#fff', background: `linear-gradient(135deg, ${BLUE}, #1d4ed8)`, borderRadius: 10, padding: '11px 20px', textDecoration: 'none', boxShadow: `0 8px 24px ${BLUE}40`, transition: 'transform .15s, box-shadow .15s' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = `0 12px 32px ${BLUE}66` }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'none'; el.style.boxShadow = `0 8px 24px ${BLUE}40` }}
                >
                  <ChromeIcon /> Add to Chrome — it's free
                </a>
                <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>Works on Chrome & Edge 116+</span>
              </div>
            </div>

            {/* Preview */}
            <motion.div
              initial={{ opacity: 0, y: 30, rotate: 1.5 }}
              animate={inView ? { opacity: 1, y: 0, rotate: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.25 }}
            >
              <MockWindow />
            </motion.div>
          </div>
        </motion.div>

        <TradeNotesCard inView={inView} />
      </div>
      <style>{`
        @media (max-width: 820px) { .project-grid { grid-template-columns: 1fr !important; } .tn-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 480px) { .feature-grid { grid-template-columns: 1fr !important; } #projects .project-grid { gap: 28px !important; } }
      `}</style>
    </section>
  )
}

const TEAL = '#14b8a6'

function TradeNotesCard({ inView }: { inView: boolean }) {
  const [shot, setShot] = useState(0)
  const p = tradeNotes

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.2 }}
      style={{ position: 'relative', overflow: 'hidden', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 20, padding: 32, marginTop: 16 }}
    >
      <div aria-hidden style={{ position: 'absolute', bottom: -140, left: -120, width: 340, height: 340, borderRadius: '50%', background: `radial-gradient(circle, ${TEAL}2e, transparent 70%)`, pointerEvents: 'none' }} />

      <div className="tn-grid" style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 40, alignItems: 'start' }}>
        {/* Screenshots */}
        <div style={{ order: -1, minWidth: 0 }}>
          <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border-2)', boxShadow: '0 24px 60px rgba(0,0,0,0.25)', background: '#0f1218', aspectRatio: '1348 / 758' }}>
            <img key={shot} src={p.screenshots[shot].src} alt={`TradeNotes — ${p.screenshots[shot].label}`} width={1348} height={758} loading="lazy"
              style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', animation: 'tn-fade .35s ease' }} />
          </div>
          <div role="tablist" aria-label="TradeNotes screenshots" style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
            {p.screenshots.map((s, i) => (
              <button key={s.src} role="tab" aria-selected={shot === i} onClick={() => setShot(i)}
                style={{ fontSize: 11, fontWeight: 600, borderRadius: 99, padding: '4px 12px', cursor: 'pointer', transition: 'all .15s',
                  color: shot === i ? '#fff' : 'var(--fg-2)', background: shot === i ? TEAL : 'transparent', border: `1px solid ${shot === i ? TEAL : 'var(--border-2)'}` }}
              >{s.label}</button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
            <img src={p.icon} alt="TradeNotes icon" width={52} height={52} style={{ borderRadius: 12, boxShadow: `0 8px 24px ${TEAL}40` }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg)', letterSpacing: '-0.015em' }}>{p.name}</h3>
                <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#22c55e', background: 'rgba(34,197,94,0.12)', borderRadius: 6, padding: '2px 7px', letterSpacing: '.04em', textTransform: 'uppercase' }}>Live</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>Installable web app · PWA</div>
            </div>
          </div>

          <p style={{ fontSize: 15, color: 'var(--fg-2)', lineHeight: 1.7, marginBottom: 22 }}>
            <Rich text={p.pitch} strong={{ color: 'var(--fg)', fontWeight: 600 }} />
          </p>

          <div className="feature-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
            {p.features.map(f => (
              <div key={f.title} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 4 }}>
                  <span style={{ marginRight: 6 }}>{f.icon}</span>{f.title}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--fg-3)', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 26 }}>
            {p.highlights.map(h => (
              <span key={h} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--fg-2)', border: '1px solid var(--border)', borderRadius: 99, padding: '3px 10px' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth={3}><path d="M20 6L9 17l-5-5"/></svg>
                {h}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
            <a href={p.url} target="_blank" rel="noopener noreferrer" className="tn-cta"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: '#fff', background: `linear-gradient(135deg, ${TEAL}, #0d9488)`, borderRadius: 10, padding: '11px 20px', textDecoration: 'none', boxShadow: `0 8px 24px ${TEAL}40` }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>
              Install free
            </a>
            <a href={`${p.url}app.html`} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-2)', border: '1px solid var(--border-2)', borderRadius: 10, padding: '10px 16px', textDecoration: 'none' }}
            >Try in browser →</a>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes tn-fade { from { opacity: 0; } }
        .tn-cta { transition: transform .15s, box-shadow .15s; }
        .tn-cta:hover { transform: translateY(-2px); box-shadow: 0 12px 32px ${TEAL}66 !important; }
        @media (max-width: 480px) { .tn-grid { gap: 28px !important; } }
      `}</style>
    </motion.div>
  )
}
