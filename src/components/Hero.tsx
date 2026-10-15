import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useExperience, experienceLabel } from '../hooks/useExperience'
import { useBlogPosts } from '../hooks/useBlogPosts'
import TrailheadIcon from './TrailheadIcon'

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

const BUILDS = [
  { text: 'Apex that scales',          color: '#6366f1' },
  { text: 'Lightning Web Components',  color: '#0ea5e9' },
  { text: 'Agentforce AI agents',      color: '#f59e0b' },
  { text: 'Data Cloud pipelines',      color: '#8b5cf6' },
  { text: 'Flows that automate',       color: '#22c55e' },
  { text: 'Chrome extensions for devs', color: '#ec4899' },
]

function BuildRotator() {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setI(n => (n + 1) % BUILDS.length), 2400)
    return () => clearInterval(t)
  }, [])
  const b = BUILDS[i]

  return (
    <div className="build-rotator" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px 10px', fontSize: 'clamp(17px, 4.6vw, 20px)', fontWeight: 600, letterSpacing: '-0.01em', minHeight: 30 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--fg-2)' }}>
        <span aria-hidden="true" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 500 }}>&gt;</span>
        I build
      </span>
      <span style={{ position: 'relative', display: 'inline-flex', overflow: 'hidden', height: 30, alignItems: 'center' }} aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={b.text}
            initial={{ y: 22, opacity: 0, filter: 'blur(6px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            exit={{ y: -22, opacity: 0, filter: 'blur(6px)' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', color: b.color }}
          >
            {b.text}
            <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', background: b.color, boxShadow: `0 0 10px ${b.color}` }} />
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  )
}

const FULL_NAME = 'Saransh Batham'
const NEW_POST_DAYS = 4

export default function Hero() {
  const exp = useExperience()
  const { posts } = useBlogPosts(1)
  const [now] = useState(Date.now)
  const latest = posts[0]
  const ageDays = latest?.Published_Date__c ? (now - Date.parse(latest.Published_Date__c)) / 86_400_000 : Infinity
  const newPost = ageDays >= -1 && ageDays <= NEW_POST_DAYS ? latest : null
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
            {/* Badges */}
            <motion.div {...fade(0.1)} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 24 }} className="hero-badges">
              {/* Project nudge */}
              <a href="/#projects" className="project-nudge"
                style={{ position: 'relative', overflow: 'hidden', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 500, color: 'var(--fg)', background: 'linear-gradient(135deg, rgba(59,130,246,0.16), rgba(29,78,216,0.08))', border: '1px solid rgba(59,130,246,0.45)', borderRadius: 99, padding: '4px 12px 4px 4px', textDecoration: 'none', boxShadow: '0 0 18px rgba(59,130,246,0.2)', transition: 'transform .15s, box-shadow .15s' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-1px)'; el.style.boxShadow = '0 0 26px rgba(59,130,246,0.4)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'none'; el.style.boxShadow = '0 0 18px rgba(59,130,246,0.2)' }}
              >
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#fff', background: '#3b82f6', borderRadius: 99, padding: '2px 8px' }}>New</span>
                <img src="/sf-impact-analyzer.png" alt="" width={16} height={16} style={{ borderRadius: 4 }} />
                <span className="nudge-long">Try my Chrome extension: <strong style={{ fontWeight: 600 }}>SF Impact Analyzer</strong></span>
                <strong className="nudge-short" style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>SF Impact Analyzer</strong>
                <svg className="nudge-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </a>
            </motion.div>

            {/* Name */}
            <motion.h1 {...fade(0.18)} style={{ fontSize: 'clamp(44px, 7vw, 72px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05, color: 'var(--fg)', marginBottom: 6 }}>
              <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>{FULL_NAME} — Salesforce Developer</span>
              <span aria-hidden="true">{displayedName}</span>
              <span aria-hidden="true" style={{
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
              Salesforce Developer · {experienceLabel(exp)}+ Years Experience
            </motion.p>

            {/* Live experience ticker */}
            <motion.div {...fade(0.3)} style={{ display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: 22, padding: '8px 14px', borderRadius: 12, background: 'linear-gradient(135deg, rgba(139,92,246,0.16), rgba(99,102,241,0.08))', border: '1px solid rgba(139,92,246,0.45)', boxShadow: '0 0 22px rgba(139,92,246,0.22)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e', animation: 'tw-blink 1.6s ease-in-out infinite' }} />
                Live XP
              </span>
              <span style={{ display: 'inline-flex', gap: 8, fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', color: 'var(--fg)', fontSize: 14, fontWeight: 700 }}>
                {[
                  { v: exp.totalDays.toLocaleString(), l: 'd' },
                  { v: String(exp.remHours).padStart(2, '0'), l: 'h' },
                  { v: String(exp.remMinutes).padStart(2, '0'), l: 'm' },
                  { v: String(exp.remSeconds).padStart(2, '0'), l: 's' },
                ].map(u => (
                  <span key={u.l}>{u.v}<span style={{ color: 'var(--accent)', fontSize: 11, marginLeft: 2 }}>{u.l}</span></span>
                ))}
              </span>
            </motion.div>

            {/* Bio */}
            <motion.p {...fade(0.33)} style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--fg-2)', marginBottom: 32, maxWidth: 460 }}>
              Building enterprise Salesforce solutions — from Apex backends and Lightning Web Components to Data Cloud pipelines and Agentforce agents.
            </motion.p>

            {/* Rotating "I build …" line */}
            <motion.div {...fade(0.38)} style={{ marginBottom: 36 }}>
              <BuildRotator />
            </motion.div>

            {/* CTAs */}
            <motion.div {...fade(0.44)} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginBottom: 40 }}>
              <a href="/#projects"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', textDecoration: 'none', transition: 'opacity .15s' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                View my work
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M12 5v14M5 12l7 7 7-7"/></svg>
              </a>
              <Link to={newPost ? `/blog/${newPost.Slug__c}` : '/blog'}
                className={newPost ? 'blog-btn-new' : undefined}
                title={newPost ? `New post: ${newPost.Title__c}` : undefined}
                style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500, color: newPost ? 'var(--fg)' : 'var(--fg-2)', border: `1px solid ${newPost ? 'rgba(139,92,246,0.6)' : 'var(--border-2)'}`, textDecoration: 'none', transition: 'color .15s, background .15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--fg)'; (e.currentTarget as HTMLElement).style.background = 'var(--bg-2)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = newPost ? 'var(--fg)' : 'var(--fg-2)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                Read blog
                {newPost && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 14 }}
                    className="blog-new-badge"
                    style={{ position: 'absolute', zIndex: 1, top: -9, right: -10, fontSize: 9, fontWeight: 800, letterSpacing: '.06em', color: '#fff', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', borderRadius: 99, padding: '2px 7px', boxShadow: '0 2px 10px rgba(236,72,153,0.45)' }}
                  >
                    NEW
                  </motion.span>
                )}
              </Link>
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
                { label: 'LinkedIn', href: 'https://www.linkedin.com/in/batham/', icon: <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
                { label: 'GitHub', href: 'https://github.com/saransh2107', icon: <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg> },
                { label: 'Trailhead', href: 'https://www.salesforce.com/trailblazer/saranshbatham21', icon: <TrailheadIcon /> },
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
        .blog-btn-new { animation: blog-glow 2.2s ease-in-out infinite; }
        @keyframes blog-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(139,92,246,0); }
          50% { box-shadow: 0 0 18px 2px rgba(139,92,246,0.4); }
        }
        .blog-new-badge::after {
          content: ''; position: absolute; inset: 0; border-radius: 99px;
          background: inherit; z-index: -1; animation: blog-ping 1.8s ease-out infinite;
        }
        @keyframes blog-ping {
          from { transform: scale(1); opacity: .7; }
          to   { transform: scale(1.8); opacity: 0; }
        }
        @keyframes nudge-shine {
          0%, 60% { transform: translateX(-120%) }
          100% { transform: translateX(220%) }
        }
        @keyframes nudge-arrow {
          0%, 100% { transform: translateX(0) }
          50% { transform: translateX(3px) }
        }
        .project-nudge::after {
          content: ''; position: absolute; top: 0; bottom: 0; left: 0; width: 40%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          animation: nudge-shine 3.5s ease-in-out infinite; pointer-events: none;
        }
        .nudge-arrow { animation: nudge-arrow 1.2s ease-in-out infinite; flex-shrink: 0; }
        .nudge-short { display: none; }
        @media (max-width: 480px) {
          .nudge-long { display: none; }
          .nudge-short { display: inline; }
          .project-nudge { gap: 6px !important; padding: 3px 10px 3px 3px !important; max-width: 100%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .project-nudge::after, .nudge-arrow, .blog-btn-new, .blog-new-badge::after { animation: none; }
        }
        @media (max-width: 640px) {
          .hero-badges { justify-content: center; }
          .build-rotator { flex-direction: column; justify-content: center; }
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
