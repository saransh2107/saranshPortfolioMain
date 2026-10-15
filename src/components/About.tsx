import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { useExperience, experienceLabel } from '../hooks/useExperience'

const pad = (n: number) => String(n).padStart(2, '0')

const stats = [
  { value: '', label: 'Years of Experience', live: true },
  { value: '6',    label: 'Certifications' },
  { value: '20+',  label: 'Projects Delivered' },
  { value: '100%', label: 'Client Satisfaction' },
]

const tags = [
  { name: 'Apex',           color: '#6366f1', desc: 'Server-side logic' },
  { name: 'LWC',            color: '#0ea5e9', desc: 'Lightning Web Components' },
  { name: 'Flow',           color: '#22c55e', desc: 'Declarative automation' },
  { name: 'Data Cloud',     color: '#8b5cf6', desc: 'Unified customer data' },
  { name: 'Agentforce',     color: '#f59e0b', desc: 'Autonomous AI agents' },
  { name: 'SOQL',           color: '#ec4899', desc: 'Salesforce queries' },
  { name: 'REST APIs',      color: '#14b8a6', desc: 'Integrations' },
  { name: 'Salesforce CLI', color: '#f97316', desc: 'Dev & deploy tooling' },
]

export default function About() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const exp = useExperience()
  const v = (d = 0) => ({ initial: { opacity: 0, y: 20 }, animate: inView ? { opacity: 1, y: 0 } : {}, transition: { duration: 0.5, delay: d } })

  return (
    <section id="about" className="section" ref={ref}>
      <div className="container">
        <motion.p {...v(0)} className="section-label">01 — About</motion.p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '64px', alignItems: 'start' }} className="about-grid">
          <div>
            <motion.h2 {...v(0.05)} style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--fg)', lineHeight: 1.2, marginBottom: 24 }}>
              Building enterprise<br />Salesforce solutions
            </motion.h2>
            <motion.div {...v(0.1)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ color: 'var(--fg-2)', fontSize: 15, lineHeight: 1.75 }}>
                I'm a <strong style={{ color: 'var(--fg)', fontWeight: 600 }}>Salesforce Developer</strong> with {experienceLabel(exp)}+ years of experience designing and delivering enterprise-grade platform solutions, specialising in Apex, Lightning Web Components, and declarative automation.
              </p>
              <p style={{ color: 'var(--fg-2)', fontSize: 15, lineHeight: 1.75 }}>
                Recent work spans <strong style={{ color: 'var(--fg)', fontWeight: 600 }}>Data Cloud</strong> implementations, <strong style={{ color: 'var(--fg)', fontWeight: 600 }}>Agentforce</strong> agent configuration, and Marketing Cloud journeys — bridging Salesforce AI with real-world business outcomes.
              </p>
            </motion.div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 28 }}>
              {tags.map((t, i) => (
                <motion.span key={t.name} className="tech-tag" title={t.desc}
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
                  transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.2 + i * 0.06 }}
                  whileHover={{ y: -3, scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    '--tag': t.color,
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-mono)',
                    color: 'var(--fg-2)', background: t.color + '14', border: `1px solid ${t.color}40`,
                    borderRadius: 8, padding: '5px 11px', cursor: 'default',
                  } as React.CSSProperties}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.color, boxShadow: `0 0 6px ${t.color}`, flexShrink: 0 }} />
                  {t.name}
                </motion.span>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            {stats.map((s, i) => (
              <motion.div key={s.label} {...v(0.1 + i * 0.06)} className={s.live ? 'stat-live' : undefined}
                style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 14, padding: '28px 24px' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-2)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}
              >
                <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--accent)', lineHeight: 1, marginBottom: 8, fontVariantNumeric: 'tabular-nums' }}>
                  {s.live ? exp.decimal.toFixed(2) : s.value}
                </div>
                <div style={{ fontSize: 12, color: 'var(--fg-3)', lineHeight: 1.4 }}>{s.label}</div>
                {s.live && (
                  <div style={{ marginTop: 12, display: 'flex', gap: 6, fontVariantNumeric: 'tabular-nums' }}>
                    {[
                      { v: exp.totalDays.toLocaleString(), l: 'days' },
                      { v: pad(exp.remHours), l: 'hrs' },
                      { v: pad(exp.remMinutes), l: 'min' },
                      { v: pad(exp.remSeconds), l: 'sec' },
                    ].map(u => (
                      <div key={u.l} style={{ flex: u.l === 'days' ? '1.6 1 0' : '1 1 0', minWidth: 0, textAlign: 'center', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 2px' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--fg)', lineHeight: 1.2 }}>{u.v}</div>
                        <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-3)' }}>{u.l}</div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <style>{`.tech-tag { transition: color .2s, border-color .2s, box-shadow .2s, background .2s; }
.tech-tag:hover { color: var(--fg) !important; border-color: var(--tag) !important; background: color-mix(in srgb, var(--tag) 22%, transparent) !important; box-shadow: 0 6px 20px color-mix(in srgb, var(--tag) 35%, transparent); }
.about-grid { @media (max-width:640px) { grid-template-columns: minmax(0, 1fr) !important; gap: 40px !important; } }
@media (max-width:400px) { .stat-live { grid-column: 1 / -1; } }`}</style>
    </section>
  )
}
