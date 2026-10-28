import { motion, AnimatePresence, useMotionValue, useSpring, type Variants } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useExperience, experienceLabel } from '../hooks/useExperience'
import { useBlogPosts } from '../hooks/useBlogPosts'
import TrailheadIcon from './TrailheadIcon'
import PlanetScene from './PlanetScene'
import { isDiwaliOver } from '../diwali/expiry'

const BUILDS = [
  { text: 'Apex that scales',           color: '#6366f1' },
  { text: 'Lightning Web Components',   color: '#0ea5e9' },
  { text: 'Agentforce AI agents',       color: '#f59e0b' },
  { text: 'Data Cloud pipelines',       color: '#8b5cf6' },
  { text: 'Flows that automate',        color: '#22c55e' },
  { text: 'Chrome extensions for devs', color: '#ec4899' },
]

const NEW_POST_DAYS = 4

// Text column enters as a gentle stagger
const column: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }
const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}

function BuildRotator() {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setI(n => (n + 1) % BUILDS.length), 2600)
    return () => clearInterval(t)
  }, [])
  const b = BUILDS[i]

  return (
    <p className="hero-build">
      <span>I build</span>
      <span className="hero-build-slot" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={b.text}
            initial={{ y: '70%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '-70%', opacity: 0 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'inline-block', color: b.color, whiteSpace: 'nowrap' }}
          >
            {b.text}
          </motion.span>
        </AnimatePresence>
      </span>
    </p>
  )
}

/** Primary button that leans toward the pointer. */
function MagneticLink({ href, children }: { href: string; children: React.ReactNode }) {
  const mx = useMotionValue(0), my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 260, damping: 18 }), y = useSpring(my, { stiffness: 260, damping: 18 })
  return (
    <motion.a href={href} className="hero-btn hero-btn-primary" style={{ x, y }}
      onPointerMove={e => {
        const r = e.currentTarget.getBoundingClientRect()
        mx.set((e.clientX - r.left - r.width / 2) * 0.25)
        my.set((e.clientY - r.top - r.height / 2) * 0.35)
      }}
      onPointerLeave={() => { mx.set(0); my.set(0) }}
      whileTap={{ scale: 0.96 }}
    >
      {children}
    </motion.a>
  )
}

const SOCIALS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/batham/', icon: <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
  { label: 'GitHub', href: 'https://github.com/saransh2107', icon: <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg> },
  { label: 'Trailhead', href: 'https://www.salesforce.com/trailblazer/saranshbatham21', icon: <TrailheadIcon /> },
]

export default function Hero() {
  const exp = useExperience()
  const { posts } = useBlogPosts(1)
  const [now] = useState(Date.now)
  const latest = posts[0]
  const ageDays = latest?.Published_Date__c ? (now - Date.parse(latest.Published_Date__c)) / 86_400_000 : Infinity
  const newPost = ageDays >= -1 && ageDays <= NEW_POST_DAYS ? latest : null

  // Soft spotlight on the background grid follows the pointer
  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  return (
    <section className="hero" onPointerMove={onPointerMove}>
      {/* Aurora: slow-drifting blurred glows, plus a soft light that follows the pointer */}
      <div className="hero-aurora" aria-hidden><i /><i /><i /></div>
      <div className="hero-spot" aria-hidden />

      <div className="container" style={{ position: 'relative' }}>
        <div className="hero-grid">
          {/* ── Text ── */}
          <motion.div className="hero-copy" variants={column} initial="hidden" animate="show">
            <motion.div variants={item} className="hero-badges">
              {/* Diwali greeting, hidden once the festival is over */}
              {!isDiwaliOver() && (
                <a href="/diwali" className="hero-pill hero-pill-diwali">
                  <span className="hero-pill-tag" style={{ color: '#2a1203', background: 'linear-gradient(135deg, #ffd77a, #ff8a1f)' }}>🪔 Diwali</span>
                  <span>Happy Diwali! <strong>Tap to light a cracker</strong></span>
                </a>
              )}
              {/* Project nudge */}
              <a href="/#projects" className="hero-pill hero-pill-new project-nudge">
                <span className="hero-pill-tag" style={{ color: '#fff', background: '#3b82f6' }}>New</span>
                <img src="/sf-impact-analyzer.png" alt="" width={16} height={16} style={{ borderRadius: 4 }} />
                <span className="nudge-long">Try my Chrome extension: <strong>SF Impact Analyzer</strong></span>
                <strong className="nudge-short">SF Impact Analyzer</strong>
                <svg className="nudge-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </a>
            </motion.div>

            <motion.h1 variants={item} className="hero-name">
              Saransh Batham
              <span className="sr-only"> — Salesforce Developer</span>
            </motion.h1>

            <motion.p variants={item} className="hero-role">
              Salesforce Developer · <span>{experienceLabel(exp)}+ years</span> · 6× certified
            </motion.p>

            <motion.div variants={item}>
              <BuildRotator />
            </motion.div>

            <motion.p variants={item} className="hero-bio">
              Building enterprise Salesforce solutions — from Apex backends and Lightning Web Components to Data Cloud pipelines and Agentforce agents.
            </motion.p>

            <motion.div variants={item} className="hero-ctas">
              <MagneticLink href="/#projects">
                View my work
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M12 5v14M5 12l7 7 7-7"/></svg>
              </MagneticLink>
              <Link to={newPost ? `/blog/${newPost.Slug__c}` : '/blog'}
                className={`hero-btn hero-btn-ghost${newPost ? ' blog-btn-new' : ''}`}
                title={newPost ? `New post: ${newPost.Title__c}` : undefined}
              >
                Read blog
                {newPost && (
                  <motion.span className="blog-new-badge" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 14 }}>
                    NEW
                  </motion.span>
                )}
              </Link>
              <a href="/resume.pdf" download className="hero-btn hero-btn-ghost">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Résumé
              </a>
            </motion.div>

            <motion.div variants={item} className="hero-socials">
              <span>Find me on</span>
              {SOCIALS.map(s => (
                <motion.a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  whileHover={{ y: -3 }} whileTap={{ scale: 0.92 }}
                >{s.icon}</motion.a>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Visual ── */}
          <motion.div className="hero-visual"
            initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <PlanetScene />
          </motion.div>
        </div>
      </div>

      <style>{`
        .hero { position: relative; min-height: 100vh; display: flex; align-items: center; padding: 88px 0 56px; overflow: hidden; }
        .hero-aurora { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
        .hero-aurora i { position: absolute; border-radius: 50%; filter: blur(90px); opacity: .32; animation: hero-drift 26s ease-in-out infinite alternate; }
        .hero-aurora i:nth-child(1) { width: 46vw; height: 46vw; max-width: 640px; max-height: 640px; left: 52%; top: -12%; background: #6d28d9; }
        .hero-aurora i:nth-child(2) { width: 38vw; height: 38vw; max-width: 520px; max-height: 520px; left: 66%; top: 38%; background: #0ea5e9; animation-duration: 32s; animation-delay: -8s; }
        .hero-aurora i:nth-child(3) { width: 34vw; height: 34vw; max-width: 460px; max-height: 460px; left: -8%; top: 52%; background: #4f46e5; opacity: .18; animation-duration: 38s; animation-delay: -16s; }
        :root:not(.dark) .hero-aurora i { opacity: .16; }
        :root:not(.dark) .hero-aurora i:nth-child(3) { opacity: .1; }
        @keyframes hero-drift { 0% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-6%, 8%) scale(1.12); } 100% { transform: translate(5%, -4%) scale(.94); } }
        .hero-spot { position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(380px circle at var(--mx, 70%) var(--my, 40%), color-mix(in srgb, var(--accent) 9%, transparent), transparent 70%); }
        .hero-grid { display: grid; grid-template-columns: minmax(0, 1.08fr) minmax(0, .92fr); gap: 48px; align-items: center; }
        .hero-copy { min-width: 0; }

        .hero-badges { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 28px; }
        .hero-pill { position: relative; overflow: hidden; display: inline-flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 500; color: var(--fg); border-radius: 99px; padding: 4px 12px 4px 4px; text-decoration: none; transition: transform .15s, box-shadow .15s; }
        .hero-pill strong { font-weight: 600; }
        .hero-pill:hover { transform: translateY(-1px); }
        .hero-pill-diwali { background: linear-gradient(135deg, rgba(255,170,60,0.18), rgba(255,138,31,0.06)); border: 1px solid rgba(255,170,60,0.5); }
        .hero-pill-new { background: linear-gradient(135deg, rgba(59,130,246,0.14), rgba(29,78,216,0.06)); border: 1px solid rgba(59,130,246,0.42); }
        .hero-pill-tag { font-size: 10px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; border-radius: 99px; padding: 2px 8px; }

        .hero-name { font-family: var(--font-display); font-size: clamp(38px, 5.8vw, 68px); font-weight: 700; letter-spacing: -0.035em; line-height: 1.04; margin-bottom: 18px;
          background: linear-gradient(115deg, var(--fg) 45%, var(--accent-2)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
        .hero-role { font-size: 15px; font-weight: 500; color: var(--fg-2); margin-bottom: 22px; }
        .hero-role span { color: var(--accent); font-weight: 600; }
        .hero-build { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0 10px; font-family: var(--font-display); font-size: clamp(17px, 2.2vw, 22px); font-weight: 600; letter-spacing: -0.02em; color: var(--fg); margin-bottom: 16px; }
        .hero-build-slot { display: inline-flex; overflow: hidden; height: 1.35em; align-items: center; }
        .hero-bio { font-size: 15.5px; line-height: 1.75; color: var(--fg-2); max-width: 500px; margin-bottom: 30px; }

        .hero-ctas { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-bottom: 30px; }
        .hero-btn { position: relative; display: inline-flex; align-items: center; gap: 7px; padding: 11px 20px; border-radius: 12px; font-size: 14px; font-weight: 600; text-decoration: none; transition: background .15s, color .15s, border-color .15s, box-shadow .15s; }
        .hero-btn-primary { color: #fff; background: linear-gradient(135deg, #8b5cf6, #6d28d9); box-shadow: 0 10px 28px -8px rgba(109,40,217,.6); }
        .hero-btn-primary:hover { box-shadow: 0 14px 34px -8px rgba(109,40,217,.75); }
        .hero-btn-ghost { color: var(--fg-2); border: 1px solid var(--border-2); background: color-mix(in srgb, var(--bg) 70%, transparent); }
        .hero-btn-ghost:hover { color: var(--fg); background: var(--bg-2); }

        .hero-socials { display: flex; align-items: center; gap: 16px; font-size: 12px; color: var(--fg-3); }
        .hero-socials a { color: var(--fg-3); transition: color .15s; display: inline-flex; }
        .hero-socials a:hover { color: var(--fg); }

        .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

        .blog-btn-new { border-color: rgba(139,92,246,0.6); color: var(--fg); animation: blog-glow 2.2s ease-in-out infinite; }
        @keyframes blog-glow { 0%, 100% { box-shadow: 0 0 0 0 rgba(139,92,246,0); } 50% { box-shadow: 0 0 18px 2px rgba(139,92,246,0.4); } }
        .blog-new-badge { position: absolute; z-index: 1; top: -9px; right: -10px; font-size: 9px; font-weight: 800; letter-spacing: .06em; color: #fff; background: linear-gradient(135deg, #8b5cf6, #ec4899); border-radius: 99px; padding: 2px 7px; box-shadow: 0 2px 10px rgba(236,72,153,0.45); }
        .blog-new-badge::after { content: ''; position: absolute; inset: 0; border-radius: 99px; background: inherit; z-index: -1; animation: blog-ping 1.8s ease-out infinite; }
        @keyframes blog-ping { from { transform: scale(1); opacity: .7; } to { transform: scale(1.8); opacity: 0; } }
        @keyframes nudge-shine { 0%, 60% { transform: translateX(-120%) } 100% { transform: translateX(220%) } }
        @keyframes nudge-arrow { 0%, 100% { transform: translateX(0) } 50% { transform: translateX(3px) } }
        .project-nudge::after { content: ''; position: absolute; top: 0; bottom: 0; left: 0; width: 40%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent); animation: nudge-shine 3.5s ease-in-out infinite; pointer-events: none; }
        .nudge-arrow { animation: nudge-arrow 1.2s ease-in-out infinite; flex-shrink: 0; }
        .nudge-short { display: none; white-space: nowrap; }

        @media (max-width: 860px) {
          .hero { padding-top: 80px; }
          .hero-grid { grid-template-columns: minmax(0, 1fr); gap: 28px; }
          .hero-visual { order: -1; }
          .hero-copy { display: flex; flex-direction: column; align-items: center; text-align: center; }
          .hero-badges, .hero-ctas, .hero-build { justify-content: center; }
          .hero-bio { margin-left: auto; margin-right: auto; }
        }
        @media (max-width: 480px) {
          .nudge-long { display: none; }
          .nudge-short { display: inline; }
          .hero-pill { max-width: 100%; }
          .hero-build { flex-direction: column; align-items: center; }
        }
        @media (prefers-reduced-motion: reduce) {
          .project-nudge::after, .nudge-arrow, .blog-btn-new, .blog-new-badge::after, .hero-aurora i { animation: none; }
        }
      `}</style>
    </section>
  )
}
