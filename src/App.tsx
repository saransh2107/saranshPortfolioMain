import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ThemeProvider } from './context/ThemeContext'
import Preloader from './components/Preloader'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import FloatingTerminal from './components/FloatingTerminal'
import Home from './pages/Home'

const BlogList   = lazy(() => import('./pages/BlogList'))
const BlogDetail = lazy(() => import('./pages/BlogDetail'))

export default function App() {
  const [loaded, setLoaded] = useState(false)
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [hintDismissed, setHintDismissed] = useState(false)

  // First-visit hint: show bubble after load, auto-dismiss after 6s
  useEffect(() => {
    if (!loaded) return
    const seen = localStorage.getItem('terminal-hint-seen')
    if (seen) return
    const t1 = setTimeout(() => setShowHint(true), 2000)
    const t2 = setTimeout(() => {
      setShowHint(false)
      localStorage.setItem('terminal-hint-seen', '1')
    }, 8000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [loaded])

  const dismissHint = () => {
    setShowHint(false)
    setHintDismissed(true)
    localStorage.setItem('terminal-hint-seen', '1')
  }

  const openTerminal = () => {
    dismissHint()
    setTerminalOpen(true)
  }

  return (
    <ThemeProvider>
      <div className="grain">
        {!loaded && <Preloader onComplete={() => setLoaded(true)} />}
        <BrowserRouter>
          <Navbar />
          <main>
            <Suspense fallback={null}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/blog" element={<BlogList />} />
                <Route path="/blog/:slug" element={<BlogDetail />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </BrowserRouter>

        {/* Floating terminal */}
        <AnimatePresence>
          {terminalOpen && (
            <FloatingTerminal onClose={() => setTerminalOpen(false)} />
          )}
        </AnimatePresence>

        {/* Hint bubble */}
        <AnimatePresence>
          {showHint && !hintDismissed && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.94 }}
              transition={{ type: 'spring', damping: 18, stiffness: 280 }}
              style={{
                position: 'fixed', bottom: '6.5rem', right: '1.5rem',
                zIndex: 9996, background: '#1a1a2e',
                border: '1px solid rgba(139,92,246,0.4)',
                borderRadius: 14, padding: '12px 16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(139,92,246,0.15)',
                maxWidth: 220,
              }}
            >
              {/* Arrow pointing down to button */}
              <div style={{
                position: 'absolute', bottom: -7, right: 18,
                width: 14, height: 14,
                background: '#1a1a2e',
                border: '1px solid rgba(139,92,246,0.4)',
                borderTop: 'none', borderLeft: 'none',
                transform: 'rotate(45deg)',
              }} />

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ fontSize: 18, lineHeight: 1 }}>👨‍💻</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f5', marginBottom: 3, lineHeight: 1.3 }}>
                    Try the terminal!
                  </p>
                  <p style={{ fontSize: 11, color: 'rgba(240,240,245,0.5)', lineHeight: 1.5 }}>
                    Type <code style={{ color: '#a78bfa', fontFamily: 'monospace' }}>whoami</code> or{' '}
                    <code style={{ color: '#a78bfa', fontFamily: 'monospace' }}>help</code> to explore.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                <button
                  onClick={openTerminal}
                  style={{
                    flex: 1, padding: '6px 0', borderRadius: 8, border: 'none',
                    background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                    color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Open it →
                </button>
                <button
                  onClick={dismissHint}
                  style={{
                    padding: '6px 10px', borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'transparent', color: 'rgba(240,240,245,0.4)',
                    fontSize: 11, cursor: 'pointer',
                  }}
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Terminal toggle button */}
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9997 }}>
          {/* Pulsing ring — only when closed */}
          {!terminalOpen && (
            <>
              <span style={{
                position: 'absolute', inset: -4, borderRadius: 16,
                border: '2px solid rgba(139,92,246,0.5)',
                animation: 'pulse-ring 2s ease-out infinite',
                pointerEvents: 'none',
              }} />
              <span style={{
                position: 'absolute', inset: -8, borderRadius: 20,
                border: '1.5px solid rgba(139,92,246,0.25)',
                animation: 'pulse-ring 2s ease-out infinite 0.4s',
                pointerEvents: 'none',
              }} />
            </>
          )}

          <button
            onClick={() => { dismissHint(); setTerminalOpen(o => !o) }}
            style={{
              position: 'relative',
              width: 48, height: 48, borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'transform .15s, box-shadow .15s',
              background: terminalOpen
                ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)'
                : 'var(--bg-2)',
              border: terminalOpen
                ? 'none'
                : '1px solid rgba(139,92,246,0.35)',
              boxShadow: terminalOpen
                ? '0 8px 30px rgba(139,92,246,0.45)'
                : '0 4px 20px rgba(0,0,0,0.3), 0 0 12px rgba(139,92,246,0.2)',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            title="Open terminal"
          >
            {terminalOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}>
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth={2.2}>
                <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
              </svg>
            )}
          </button>
        </div>

        <style>{`
          @keyframes pulse-ring {
            0%   { opacity: 0.8; transform: scale(1); }
            80%  { opacity: 0; transform: scale(1.35); }
            100% { opacity: 0; transform: scale(1.35); }
          }
        `}</style>
      </div>
    </ThemeProvider>
  )
}
