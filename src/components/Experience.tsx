import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { jobs, education, fmtMonth, tenure } from '../data/resume'
import Rich from './Rich'

export default function Experience() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const v = (d = 0) => ({ initial: { opacity: 0, y: 20 }, animate: inView ? { opacity: 1, y: 0 } : {}, transition: { duration: 0.5, delay: d } })

  return (
    <section id="experience" className="section" ref={ref}>
      <div className="container">
        <motion.p {...v(0)} className="section-label">02 — Experience</motion.p>

        <motion.h2 {...v(0.05)} style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--fg)', marginBottom: 40 }}>
          Where I've worked
        </motion.h2>

        <StandardView inView={inView} />
      </div>
    </section>
  )
}

/* ── Standard view: timeline ─────────────────────────────────────── */

function StandardView({ inView }: { inView: boolean }) {
  const strong = { color: 'var(--fg)', fontWeight: 600 }
  return (
    <div className="xp-timeline">
      {jobs.map((job, i) => (
        <motion.article key={job.company + job.title} className="xp-item"
          initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.12 + i * 0.08 }}
        >
          <span className="xp-dot" style={{ background: 'var(--accent)', boxShadow: '0 0 0 4px var(--accent-fg)' }} />
          <div className="xp-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 650, color: 'var(--fg)', lineHeight: 1.3 }}>{job.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 500 }}>{job.company}</p>
                <p style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>{job.location}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--fg-2)', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 9px' }}>
                  {!job.end && <span className="xp-live" />}
                  {fmtMonth(job.start)} — {fmtMonth(job.end)}
                </span>
                <p style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 4 }}>{tenure(job.start, job.end)}</p>
              </div>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {job.achievements.map(a => (
                <li key={a} style={{ position: 'relative', paddingLeft: 18, fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.65 }}>
                  <span style={{ position: 'absolute', left: 0, top: 10, width: 6, height: 6, borderRadius: 2, background: 'var(--accent-2)', opacity: .7 }} />
                  <Rich text={a} strong={strong} />
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 18 }}>
              {job.stack.map(s => (
                <span key={s} style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-2)', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 9px' }}>{s}</span>
              ))}
            </div>
          </div>
        </motion.article>
      ))}

      <motion.article className="xp-item" initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.12 + jobs.length * 0.08 }}>
        <span className="xp-dot" style={{ background: 'var(--bg-3)', border: '2px solid var(--border-2)' }} />
        <div className="xp-card" style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--fg-3)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>Education</p>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg)' }}>{education.degree}</h3>
            <p style={{ fontSize: 13, color: 'var(--fg-2)' }}>{education.school} · {education.university}</p>
          </div>
          <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>
            <div>{education.years}</div>
            <div>{education.grade}</div>
          </div>
        </div>
      </motion.article>

      <style>{`
        .xp-timeline { position: relative; display: flex; flex-direction: column; gap: 16px; padding-left: 28px; }
        .xp-timeline::before { content: ''; position: absolute; left: 6px; top: 8px; bottom: 8px; width: 1px; background: linear-gradient(var(--accent), var(--border-2) 60%, transparent); }
        .xp-item { position: relative; }
        .xp-dot { position: absolute; left: -28px; top: 26px; width: 13px; height: 13px; border-radius: 50%; }
        .xp-card { background: var(--bg-2); border: 1px solid var(--border); border-radius: 14px; padding: 22px 24px; transition: border-color .2s; }
        .xp-card:hover { border-color: var(--border-2); }
        .xp-live { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 6px #22c55e; animation: xp-blink 2s ease-in-out infinite; }
        @keyframes xp-blink { 50% { opacity: .35; } }
        @media (max-width: 480px) { .xp-timeline { padding-left: 20px; } .xp-dot { left: -20px; } .xp-timeline::before { left: 2px; } .xp-card { padding: 18px; } }
      `}</style>
    </div>
  )
}
