import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: 'easeOut' as const },
})

const PHOTOS = [
  { src: '/profile.webp',  pos: 'center 12%', scale: 1.6 },
  { src: '/profile2.webp', pos: '52% 15%', scale: 1.3 },
]

function Avatar() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % PHOTOS.length), 10000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ position: 'relative', width: 220, height: 220, flexShrink: 0 }}>
      {/* Gradient ring */}
      <div style={{
        position: 'absolute', inset: -3,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 50%, #4c1d95 100%)',
        padding: 3,
      }}>
        <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--bg)' }} />
      </div>
      {/* Photo with crossfade */}
      <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden' }}>
        <AnimatePresence mode="sync">
          <motion.img
            key={idx}
            src={PHOTOS[idx].src}
            alt="Saransh Batham"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              objectPosition: PHOTOS[idx].pos,
              transform: `scale(${PHOTOS[idx].scale})`,
              transformOrigin: 'center top',
            }}
          />
        </AnimatePresence>
      </div>
      {/* Online dot */}
      <div style={{
        position: 'absolute', bottom: 12, right: 12,
        width: 16, height: 16, borderRadius: '50%',
        background: '#22c55e',
        border: '2.5px solid var(--bg)',
        boxShadow: '0 0 0 2px rgba(34,197,94,0.3)',
      }} />
    </div>
  )
}

const FULL_NAME = 'Saransh Batham'

export default function Hero() {
  const [displayedName, setDisplayedName] = useState('')
  const [nameDone, setNameDone] = useState(false)

  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      i++
      setDisplayedName(FULL_NAME.slice(0, i))
      if (i >= FULL_NAME.length) {
        clearInterval(timer)
        setNameDone(true)
      }
    }, 70)
    return () => clearInterval(timer)
  }, [])

  return (
    <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 56 }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: '64px',
          alignItems: 'center',
        }}
          className="hero-grid"
        >
          {/* ── Avatar ── */}
          <motion.div {...fade(0)}>
            <Avatar />
          </motion.div>

          {/* ── Text ── */}
          <div style={{ minWidth: 0 }}>
            {/* Badge */}
            <motion.div {...fade(0.1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 500, color: 'var(--fg-2)', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 99, padding: '5px 12px', marginBottom: 24 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e', flexShrink: 0 }} />
              Open to work
            </motion.div>

            {/* Name */}
            <motion.h1 {...fade(0.18)} style={{ fontSize: 'clamp(44px, 7vw, 72px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05, color: 'var(--fg)', marginBottom: 6 }}>
              {displayedName}
              <span style={{
                display: 'inline-block',
                width: '3px',
                height: '0.78em',
                background: 'var(--accent, #8b5cf6)',
                marginLeft: '3px',
                verticalAlign: 'middle',
                borderRadius: '1px',
                animation: nameDone ? 'tw-blink 0.8s step-end infinite' : 'none',
              }} />
            </motion.h1>

            {/* Role */}
            <motion.p {...fade(0.26)} style={{ fontSize: 16, fontWeight: 500, color: 'var(--accent)', marginBottom: 20, letterSpacing: '-0.01em' }}>
              Salesforce Developer · 4.5 Years Experience
            </motion.p>

            {/* Bio */}
            <motion.p {...fade(0.33)} style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--fg-2)', marginBottom: 32, maxWidth: 460 }}>
              Building enterprise Salesforce solutions — from Apex backends and Lightning Web Components to Data Cloud pipelines and Agentforce agents.
            </motion.p>

            {/* Tags */}
            <motion.div {...fade(0.38)} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 36 }}>
              {['Apex', 'LWC', 'Flow', 'Data Cloud', 'Agentforce', 'SOQL'].map(t => (
                <span key={t} style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--fg-3)', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 10px' }}>{t}</span>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div {...fade(0.44)} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginBottom: 40 }}>
              <a href="/#about"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', textDecoration: 'none', transition: 'opacity .15s' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                View my work
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M12 5v14M5 12l7 7 7-7"/></svg>
              </a>
              <a href="/blog"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500, color: 'var(--fg-2)', border: '1px solid var(--border-2)', textDecoration: 'none', transition: 'color .15s, background .15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--fg)'; (e.currentTarget as HTMLElement).style.background = 'var(--bg-2)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--fg-2)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                Read blog
              </a>
              <a href="/resume.pdf" download
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500, color: 'var(--fg-2)', border: '1px solid var(--border-2)', textDecoration: 'none', transition: 'color .15s, background .15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--fg)'; (e.currentTarget as HTMLElement).style.background = 'var(--bg-2)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--fg-2)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download Resume
              </a>
            </motion.div>

            {/* Socials */}
            <motion.div {...fade(0.5)} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>Find me on</span>
              {[
                { label: 'LinkedIn', href: 'https://linkedin.com', icon: <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
                { label: 'GitHub', href: 'https://github.com', icon: <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg> },
                { label: 'Trailhead', href: 'https://trailhead.salesforce.com', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.5 2C6.81 2 3 5.81 3 10.5S6.81 19 11.5 19h.5v3c4.86-2.34 8-7 8-11.5C20 5.81 16.19 2 11.5 2zm1 14.5h-2v-2h2v2zm0-4h-2c0-3.25 3-3 3-5 0-1.1-.9-2-2-2s-2 .9-2 2h-2c0-2.21 1.79-4 4-4s4 1.79 4 4c0 2.5-3 2.75-3 5z"/></svg> },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  style={{ color: 'var(--fg-3)', transition: 'color .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg-2)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-3)')}
                >{s.icon}</a>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes tw-blink {
          0%, 100% { opacity: 1 }
          50% { opacity: 0 }
        }
        @media (max-width: 640px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            justify-items: center;
            text-align: center;
            gap: 36px !important;
          }
          .hero-grid > div:last-child {
            display: flex; flex-direction: column; align-items: center;
          }
        }
      `}</style>
    </section>
  )
}
