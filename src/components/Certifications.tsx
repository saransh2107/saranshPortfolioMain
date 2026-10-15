import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const certs = [
  { name: 'Salesforce Certified Administrator',           short: 'Admin',             color: '#0ea5e9', icon: '🛡️', desc: 'Core platform administration, security, and automation.' },
  { name: 'Salesforce Certified Marketing Associate',     short: 'Marketing',         color: '#f97316', icon: '📣', desc: 'Marketing Cloud foundations, journeys, and email campaigns.' },
  { name: 'Data Cloud Consultant',                        short: 'Data Cloud',        color: '#8b5cf6', icon: '☁️', desc: 'Unified data profiles, segmentation, and real-time activation.' },
  { name: 'AI Associate',                                 short: 'AI',                color: '#22c55e', icon: '🤖', desc: 'AI fundamentals, ethical AI, and Einstein platform capabilities.' },
  { name: 'Platform Developer I',                         short: 'PD1',               color: '#6366f1', icon: '⚡', desc: 'Apex, Visualforce, SOQL, and core Salesforce development patterns.' },
  { name: 'Agentforce Specialist',                        short: 'Agentforce',        color: '#f59e0b', icon: '🤝', desc: 'Building and configuring autonomous Agentforce AI agents.' },
]

export default function Certifications() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const v = (d = 0) => ({ initial: { opacity: 0, y: 20 }, animate: inView ? { opacity: 1, y: 0 } : {}, transition: { duration: 0.5, delay: d } })

  return (
    <section id="certifications" className="section" ref={ref}>
      <div className="container">
        <motion.p {...v(0)} className="section-label">02 — Certifications</motion.p>
        <motion.h2 {...v(0.05)} style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--fg)', marginBottom: 8 }}>
          6 Salesforce Certifications
        </motion.h2>
        <motion.p {...v(0.08)} style={{ fontSize: 14, color: 'var(--fg-3)', marginBottom: 40 }}>
          Certified expertise across the Salesforce platform.
        </motion.p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }} className="cert-grid">
          {certs.map((cert, i) => (
            <motion.div key={cert.name} {...v(0.08 + i * 0.06)}
              style={{
                background: 'var(--bg-2)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '20px',
                transition: 'border-color .2s, transform .2s, box-shadow .2s',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = cert.color + '55'
                el.style.transform = 'translateY(-3px)'
                el.style.boxShadow = `0 12px 40px rgba(0,0,0,0.35)`
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'var(--border)'
                el.style.transform = 'none'
                el.style.boxShadow = 'none'
              }}
            >
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: cert.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                  {cert.icon}
                </div>
                <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600, color: cert.color, background: cert.color + '15', borderRadius: 6, padding: '3px 8px', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                  {cert.short}
                </span>
              </div>

              {/* Colored top line */}
              <div style={{ width: 28, height: 2, borderRadius: 99, background: cert.color, marginBottom: 12 }} />

              <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', lineHeight: 1.35, marginBottom: 8 }}>
                {cert.name}
              </h3>
              <p style={{ fontSize: 12, color: 'var(--fg-3)', lineHeight: 1.55 }}>
                {cert.desc}
              </p>

              {/* Verified */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 16 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={cert.color} strokeWidth={2.5}>
                  <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                </svg>
                <span style={{ fontSize: 11, color: cert.color }}>Salesforce Certified</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) { .cert-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 480px) { .cert-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}
