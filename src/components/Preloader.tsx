import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const FIRST = 'Saransh'.split('')
const LAST = 'Batham'.split('')

type Phase = 'loading' | 'exit' | 'done'

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(0)
  const [phase, setPhase] = useState<Phase>('loading')

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => {
        const next = Math.min(prev + Math.floor(Math.random() * 5) + 2, 100)
        if (next >= 100) {
          clearInterval(interval)
          setTimeout(() => setPhase('exit'), 400)
          setTimeout(() => setPhase('done'), 1100)
          setTimeout(onComplete, 1200)
        }
        return next
      })
    }, 38)
    return () => clearInterval(interval)
  }, [onComplete])

  if (phase === 'done') return null

  return (
    <motion.div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#080810',
        overflow: 'hidden',
      }}
      initial={{ opacity: 1, scale: 1 }}
      animate={phase === 'exit' ? { opacity: 0, scale: 1.05 } : { opacity: 1, scale: 1 }}
      transition={phase === 'exit' ? { duration: 0.65, ease: [0.76, 0, 0.24, 1] } : {}}
    >
      {/* Center piece: lightning bolt + orbit rings */}
      <div style={{ position: 'relative', width: 200, height: 200, marginBottom: 32 }}>
        {/* Radial glow behind bolt */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 150, height: 150,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.32) 0%, transparent 68%)',
          filter: 'blur(22px)',
          pointerEvents: 'none',
        }} />

        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="pl-bolt-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
            <filter id="pl-bolt-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer orbit ring — rotates clockwise */}
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '100px 100px' }}
          >
            <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(139,92,246,0.18)" strokeWidth="1" strokeDasharray="3 9" />
            <circle cx="100" cy="12" r="4" fill="#8b5cf6" opacity="0.85" />
            <circle cx="188" cy="100" r="3" fill="#a78bfa" opacity="0.65" />
          </motion.g>

          {/* Inner orbit ring — rotates counter-clockwise */}
          <motion.g
            animate={{ rotate: -360 }}
            transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '100px 100px' }}
          >
            <circle cx="100" cy="100" r="63" fill="none" stroke="rgba(167,139,250,0.14)" strokeWidth="1" strokeDasharray="2 7" />
            <circle cx="100" cy="37" r="3" fill="#7c3aed" opacity="0.9" />
            <circle cx="163" cy="100" r="2.5" fill="#8b5cf6" opacity="0.7" />
          </motion.g>

          {/* Lightning bolt — stroke draws in first */}
          <motion.path
            d="M 112 24 L 82 96 L 103 96 L 70 174 L 122 98 L 99 98 Z"
            fill="transparent"
            stroke="url(#pl-bolt-grad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#pl-bolt-glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.2, ease: 'easeInOut' }}
          />

          {/* Lightning bolt — fill appears after stroke completes */}
          <motion.path
            d="M 112 24 L 82 96 L 103 96 L 70 174 L 122 98 L 99 98 Z"
            fill="url(#pl-bolt-grad)"
            stroke="none"
            filter="url(#pl-bolt-glow)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.88 }}
            transition={{ duration: 0.55, delay: 1.45, ease: 'easeOut' }}
          />
        </svg>
      </div>

      {/* Name with letter stagger */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, userSelect: 'none', marginBottom: 10 }}>
        <div style={{ display: 'flex' }}>
          {FIRST.map((l, i) => (
            <motion.span
              key={`f${i}`}
              initial={{ opacity: 0, y: 22, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.55, delay: 0.3 + i * 0.055, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontSize: 38, fontWeight: 900, letterSpacing: '-0.02em',
                color: '#f1f5f9', fontFamily: 'Inter, sans-serif',
              }}
            >
              {l}
            </motion.span>
          ))}
        </div>
        <div style={{ display: 'flex' }}>
          {LAST.map((l, i) => (
            <motion.span
              key={`l${i}`}
              initial={{ opacity: 0, y: 22, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.55, delay: 0.62 + i * 0.055, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontSize: 38, fontWeight: 900, letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text', fontFamily: 'Inter, sans-serif',
              }}
            >
              {l}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.05, duration: 0.5 }}
        style={{
          margin: 0,
          fontSize: 11,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: 'rgba(148,163,184,0.55)',
          fontFamily: 'monospace',
        }}
      >
        Salesforce Developer
      </motion.p>

      {/* Full-width thin progress bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        style={{
          position: 'absolute',
          bottom: 48,
          left: 0,
          right: 0,
          padding: '0 48px',
        }}
      >
        <div style={{
          width: '100%',
          height: 2,
          borderRadius: 99,
          background: 'rgba(255,255,255,0.07)',
          overflow: 'hidden',
        }}>
          <div
            style={{
              height: '100%',
              borderRadius: 99,
              background: 'linear-gradient(90deg, #6366f1, #a78bfa)',
              width: `${count}%`,
              transition: 'width 0.15s ease',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <span style={{ fontSize: 10, color: 'rgba(148,163,184,0.38)', fontFamily: 'monospace' }}>Loading</span>
          <span style={{ fontSize: 10, color: '#6366f1', fontFamily: 'monospace', fontVariantNumeric: 'tabular-nums' }}>
            {String(Math.min(count, 100)).padStart(3, '0')}%
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
}
