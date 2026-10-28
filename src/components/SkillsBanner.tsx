import { motion, AnimatePresence, LayoutGroup, useInView, type Variants } from 'framer-motion'
import { useRef, useState } from 'react'
import { technologies } from '../data/resume'

const CATEGORY_META: Record<string, { icon: string; color: string; blurb: string }> = {
  Development: { icon: '⌨️', color: '#6366f1', blurb: 'Code on and around the platform' },
  Integration: { icon: '🔌', color: '#14b8a6', blurb: 'Connecting Salesforce to everything else' },
  Clouds:      { icon: '☁️', color: '#0ea5e9', blurb: 'Products I build on' },
  Automation:  { icon: '⚙️', color: '#8b5cf6', blurb: 'Declarative & guided processes' },
  AI:          { icon: '✨', color: '#f59e0b', blurb: 'Agents and predictions' },
  Tooling:     { icon: '🧰', color: '#f97316', blurb: 'Ship, version, deploy' },
}

// Biggest groups first so the grid reads from the core skills outward
const groups = Object.entries(
  technologies.reduce<Record<string, typeof technologies>>((acc, t) => ((acc[t.category] ??= []).push(t), acc), {}),
).sort((a, b) => b[1].length - a[1].length)

const FILTERS = ['All', ...groups.map(([c]) => c)]

// Chips inside a card spring in one after another
const chipList: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.15 } } }
const chip: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.9 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 420, damping: 24 } },
}

export default function SkillsBanner() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [filter, setFilter] = useState('All')
  const v = (d = 0) => ({ initial: { opacity: 0, y: 20 }, animate: inView ? { opacity: 1, y: 0 } : {}, transition: { duration: 0.5, delay: d } })
  const shown = filter === 'All' ? groups : groups.filter(([c]) => c === filter)

  return (
    <section id="skills" className="section" ref={ref}>
      <div className="container">
        <motion.p {...v(0)} className="section-label">05 — Skills & Technologies</motion.p>
        <motion.h2 {...v(0.05)} style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--fg)', marginBottom: 8 }}>
          {technologies.length} Technologies
        </motion.h2>
        <motion.p {...v(0.08)} style={{ fontSize: 14, color: 'var(--fg-3)', marginBottom: 24 }}>
          Grouped by what they help me do.
        </motion.p>

        {/* Filter tabs with a sliding highlight */}
        <motion.div {...v(0.1)} className="skill-filters" role="tablist" aria-label="Filter skills by category">
          {FILTERS.map(f => (
            <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={filter === f ? 'active' : undefined}>
              {filter === f && <motion.span layoutId="skill-filter-pill" className="skill-filter-pill" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
              <span style={{ position: 'relative' }}>{f}</span>
            </button>
          ))}
        </motion.div>

        <LayoutGroup>
          <motion.div layout className="skill-grid">
            <AnimatePresence mode="popLayout">
              {shown.map(([category, items], i) => {
                const meta = CATEGORY_META[category] ?? { icon: '•', color: '#94a3b8', blurb: '' }
                return (
                  <motion.div key={category} layout className="skill-card" style={{ '--c': meta.color } as React.CSSProperties}
                    initial={{ opacity: 0, y: 16, scale: 0.96 }}
                    animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30, delay: inView && filter === 'All' ? 0.08 + i * 0.05 : 0 }}
                    whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                      <motion.span className="skill-icon" aria-hidden whileHover={{ rotate: [0, -12, 10, 0], transition: { duration: 0.5 } }}>{meta.icon}</motion.span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 650, color: 'var(--fg)', lineHeight: 1.3 }}>{category}</h3>
                        <p style={{ fontSize: 11.5, color: 'var(--fg-3)', lineHeight: 1.4 }}>{meta.blurb}</p>
                      </div>
                      <span className="skill-count">{items.length}</span>
                    </div>
                    <motion.ul variants={chipList} initial="hidden" animate={inView ? 'show' : 'hidden'} style={{ listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {items.map(t => (
                        <motion.li key={t.name} variants={chip} className="skill-chip" whileHover={{ scale: 1.06 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
                          {t.name}
                        </motion.li>
                      ))}
                    </motion.ul>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>
      </div>

      <style>{`
        .skill-filters { display: flex; flex-wrap: wrap; gap: 4px; padding: 4px; margin-bottom: 20px; width: fit-content; max-width: 100%; border-radius: 12px; background: var(--bg-2); border: 1px solid var(--border); }
        .skill-filters button { position: relative; font: inherit; font-size: 12.5px; font-weight: 500; color: var(--fg-3); background: none; border: none; border-radius: 9px; padding: 6px 12px; cursor: pointer; transition: color .15s; }
        .skill-filters button:hover { color: var(--fg-2); }
        .skill-filters button.active { color: var(--fg); }
        .skill-filter-pill { position: absolute; inset: 0; border-radius: 9px; background: var(--bg); border: 1px solid var(--border-2); box-shadow: 0 1px 4px rgba(0,0,0,.12); }
        .skill-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
        .skill-card { position: relative; overflow: hidden; background: var(--bg-2); border: 1px solid var(--border); border-radius: 14px; padding: 18px; transition: border-color .2s, box-shadow .2s; }
        .skill-card::before { content: ''; position: absolute; inset: 0 0 auto; height: 2px; background: linear-gradient(90deg, var(--c), transparent); opacity: .8; }
        .skill-card:hover { border-color: color-mix(in srgb, var(--c) 45%, transparent); box-shadow: 0 12px 32px color-mix(in srgb, var(--c) 18%, transparent); }
        .skill-icon { width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center; font-size: 17px; flex-shrink: 0; background: color-mix(in srgb, var(--c) 14%, transparent); }
        .skill-count { font-size: 11px; font-family: var(--font-mono); font-weight: 600; color: var(--c); background: color-mix(in srgb, var(--c) 12%, transparent); border-radius: 99px; padding: 2px 8px; flex-shrink: 0; }
        .skill-chip { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; color: var(--fg-2); background: var(--bg); border: 1px solid var(--border); border-radius: 99px; padding: 4px 10px; cursor: default; transition: color .15s, border-color .15s; }
        .skill-chip:hover { color: var(--fg); border-color: var(--c); }
        @media (max-width: 820px) { .skill-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 540px) { .skill-grid { grid-template-columns: minmax(0, 1fr); gap: 10px; } .skill-card { padding: 16px; } }
      `}</style>
    </section>
  )
}
