import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const stats = [
  { value: '4.5+', label: 'Years of Experience' },
  { value: '6',    label: 'Certifications' },
  { value: '20+',  label: 'Projects Delivered' },
  { value: '100%', label: 'Client Satisfaction' },
]

const tags = ['Apex', 'LWC', 'Flow', 'Data Cloud', 'Agentforce', 'SOQL', 'REST APIs', 'Salesforce CLI']

export default function About() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const v = (d = 0) => ({ initial: { opacity: 0, y: 20 }, animate: inView ? { opacity: 1, y: 0 } : {}, transition: { duration: 0.5, delay: d } })

  return (
    <section id="about" className="section" ref={ref} style={{ borderTop: '1px solid var(--border)' }}>
      <div className="container">
        <motion.p {...v(0)} className="section-label">01 — About</motion.p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'start' }} className="about-grid">
          <div>
            <motion.h2 {...v(0.05)} style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--fg)', lineHeight: 1.2, marginBottom: 24 }}>
              Building enterprise<br />Salesforce solutions
            </motion.h2>
            <motion.div {...v(0.1)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ color: 'var(--fg-2)', fontSize: 15, lineHeight: 1.75 }}>
                I'm a <strong style={{ color: 'var(--fg)', fontWeight: 600 }}>Salesforce Developer</strong> with 4.5 years of experience designing and delivering enterprise-grade platform solutions, specialising in Apex, Lightning Web Components, and declarative automation.
              </p>
              <p style={{ color: 'var(--fg-2)', fontSize: 15, lineHeight: 1.75 }}>
                Recent work spans <strong style={{ color: 'var(--fg)', fontWeight: 600 }}>Data Cloud</strong> implementations, <strong style={{ color: 'var(--fg)', fontWeight: 600 }}>Agentforce</strong> agent configuration, and Marketing Cloud journeys — bridging Salesforce AI with real-world business outcomes.
              </p>
            </motion.div>
            <motion.div {...v(0.15)} style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 28 }}>
              {tags.map(t => (
                <span key={t} style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--fg-3)', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 10px' }}>{t}</span>
              ))}
            </motion.div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {stats.map((s, i) => (
              <motion.div key={s.label} {...v(0.1 + i * 0.06)}
                style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 14, padding: '28px 24px' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-2)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}
              >
                <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--accent)', lineHeight: 1, marginBottom: 8 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--fg-3)', lineHeight: 1.4 }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <style>{`.about-grid { @media (max-width:640px) { grid-template-columns: 1fr !important; gap: 40px !important; } }`}</style>
    </section>
  )
}
