import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const skills = [
  { name: 'Apex',                    color: '#0ea5e9' },
  { name: 'Lightning Web Components',color: '#6366f1' },
  { name: 'Salesforce Flow',         color: '#8b5cf6' },
  { name: 'SOQL / SOSL',             color: '#22c55e' },
  { name: 'Data Cloud',              color: '#8b5cf6' },
  { name: 'Agentforce',              color: '#f59e0b' },
  { name: 'Marketing Cloud',         color: '#f97316' },
  { name: 'Einstein AI',             color: '#0ea5e9' },
  { name: 'Experience Cloud',        color: '#6366f1' },
  { name: 'REST & SOAP APIs',        color: '#22c55e' },
  { name: 'Salesforce CLI',          color: '#8b5cf6' },
  { name: 'Platform Events',         color: '#f59e0b' },
  { name: 'Integration Patterns',    color: '#6366f1' },
  { name: 'CPQ',                     color: '#0ea5e9' },
  { name: 'JavaScript / ES6+',       color: '#f59e0b' },
  { name: 'Git',                     color: '#f97316' },
  { name: 'Trigger Framework',       color: '#8b5cf6' },
  { name: 'OmniStudio',              color: '#22c55e' },
  { name: 'Visualforce',             color: '#94a3b8' },
  { name: 'Salesforce Connect',      color: '#6366f1' },
]

const track = [...skills, ...skills]

function Chip({ name, color }: { name: string; color: string }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '8px 16px', borderRadius: 99, whiteSpace: 'nowrap',
      background: 'var(--bg-2)', border: '1px solid var(--border)',
      fontSize: 13, fontWeight: 500, color: 'var(--fg-2)',
      margin: '0 5px', flexShrink: 0,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
      {name}
    </div>
  )
}

export default function SkillsBanner() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="skills" className="section" ref={ref} style={{ overflow: 'hidden', paddingLeft: 0, paddingRight: 0 }}>
      <div className="container" style={{ marginBottom: 40 }}>
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}
          className="section-label"
        >04 — Skills & Technologies</motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.05 }}
          style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--fg)' }}
        >20 Technologies</motion.h2>
      </div>

      <motion.div
        initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.2 }}
        style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        {[false, true].map((reverse, ri) => (
          <div key={ri} style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 100, zIndex: 1, pointerEvents: 'none', background: 'linear-gradient(90deg, var(--bg), transparent)' }} />
            <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 100, zIndex: 1, pointerEvents: 'none', background: 'linear-gradient(-90deg, var(--bg), transparent)' }} />
            <div style={{ display: 'flex', animation: `marquee ${reverse ? '28s' : '35s'} linear infinite${reverse ? ' reverse' : ''}` }}>
              {track.map((s, i) => <Chip key={`${ri}-${i}`} name={s.name} color={s.color} />)}
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  )
}
