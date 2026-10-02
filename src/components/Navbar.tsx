import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const links = [
  { label: 'About',    href: '/#about' },
  { label: 'Certs',   href: '/#certifications' },
  { label: 'Skills',   href: '/#skills' },
  { label: 'Quiz',     href: '/#quiz' },
  { label: 'Blog',     href: '/blog' },
  { label: 'Contact',  href: '/#contact' },
]

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const [isMobile, setIsMobile]   = useState(window.innerWidth < 768)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('scroll', onScroll)
    window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize) }
  }, [])

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        height: 56,
        background: scrolled ? (theme === 'dark' ? 'rgba(12,12,15,0.88)' : 'rgba(255,255,255,0.88)') : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        transition: 'background .25s, border-color .25s, backdrop-filter .25s',
      }}
    >
      <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
            overflow: 'hidden', flexShrink: 0,
          }}>
            <img src="/profile.webp" alt="SB" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 12%', transform: 'scale(1.6)', transformOrigin: 'center top' }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)', letterSpacing: '-.01em' }}>
            Saransh Batham
          </span>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: isMobile ? 'none' : 'flex', alignItems: 'center', gap: 2 }}>
          {links.map(l => l.href.startsWith('/blog') ? (
            <Link key={l.label} to={l.href}
              style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-2)', padding: '6px 12px', borderRadius: 8, textDecoration: 'none', transition: 'color .15s, background .15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--fg)'; (e.currentTarget as HTMLElement).style.background = 'var(--bg-2)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--fg-2)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >{l.label}</Link>
          ) : (
            <a key={l.label} href={l.href}
              onClick={() => { if (l.href.startsWith('/#') && location.pathname !== '/') window.location.href = l.href }}
              style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-2)', padding: '6px 12px', borderRadius: 8, textDecoration: 'none', transition: 'color .15s, background .15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--fg)'; (e.currentTarget as HTMLElement).style.background = 'var(--bg-2)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--fg-2)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >{l.label}</a>
          ))}
        </nav>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            style={{
              width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border)',
              background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--fg-3)', transition: 'color .15s, background .15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-2)'; (e.currentTarget as HTMLElement).style.color = 'var(--fg-2)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--fg-3)' }}
          >
            {theme === 'dark' ? (
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            ) : (
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"/>
              </svg>
            )}
          </button>

          {/* Mobile burger */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{ display: isMobile ? 'flex' : 'none', width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}
          >
            {[0,1,2].map(i => (
              <span key={i} style={{ display: 'block', width: 16, height: 1.5, background: 'var(--fg-2)', borderRadius: 99, transition: 'all .2s',
                transform: menuOpen ? (i===0 ? 'rotate(45deg) translate(4px,4px)' : i===2 ? 'rotate(-45deg) translate(4px,-4px)' : 'scaleX(0)') : 'none',
              }}/>
            ))}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ background: theme === 'dark' ? 'rgba(12,12,15,0.97)' : 'rgba(255,255,255,0.97)', backdropFilter: 'blur(16px)', borderTop: '1px solid var(--border)', padding: '12px 24px 20px' }}>
          {links.map(l => l.href.startsWith('/blog') ? (
            <Link key={l.label} to={l.href} onClick={() => setMenuOpen(false)}
              style={{ display: 'block', padding: '10px 0', fontSize: 15, fontWeight: 500, color: 'var(--fg-2)', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}
            >{l.label}</Link>
          ) : (
            <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)}
              style={{ display: 'block', padding: '10px 0', fontSize: 15, fontWeight: 500, color: 'var(--fg-2)', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}
            >{l.label}</a>
          ))}
        </div>
      )}
    </motion.header>
  )
}
