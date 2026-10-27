import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useView } from '../context/ViewContext'
import { links } from '../data/resume'
import { CloudIcon, ObjIcon, type IconKind } from './ui'

export interface LauncherItem { label: string; to: string; icon: IconKind }

type App = { label: string; desc: string; color: string; glyph: React.ReactNode; current?: boolean } & ({ href: string } | { action: () => void })

/** Waffle button that opens an App Launcher panel: apps on top, the current app's items below. */
export default function AppLauncher({ items }: { items: LauncherItem[] }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { setView } = useView()

  const close = () => { setOpen(false); setQuery('') }

  useEffect(() => {
    if (!open) return
    searchRef.current?.focus()
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (!panelRef.current?.contains(t) && !buttonRef.current?.contains(t)) { setOpen(false); setQuery('') }
    }
    // Escape returns focus to the launcher button, like a closed menu should
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); setQuery(''); buttonRef.current?.focus() } }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])

  const apps: App[] = [
    { label: 'Portfolio',          desc: 'This Lightning app',          color: '#066afe', glyph: <CloudIcon size={20} />, current: true, action: () => { navigate('/'); close() } },
    { label: 'Standard Portfolio', desc: 'Switch to the classic site',  color: '#7f56d9', glyph: <span style={{ fontWeight: 800, fontSize: 15 }}>SB</span>, action: () => { setOpen(false); setView('standard') } },
    { label: 'Trailhead',          desc: 'Badges & certifications',     color: '#2e844a', glyph: <span style={{ fontSize: 17 }}>⛰</span>, href: links.trailhead },
    { label: 'LinkedIn',           desc: 'Professional profile',        color: '#0a66c2', glyph: <span style={{ fontWeight: 800, fontSize: 15 }}>in</span>, href: links.linkedin },
    { label: 'GitHub',             desc: 'Code & repositories',         color: '#24292f', glyph: <span style={{ fontWeight: 800, fontSize: 13 }}>GH</span>, href: links.github },
  ]

  const q = query.trim().toLowerCase()
  const matchedApps = apps.filter(a => !q || a.label.toLowerCase().includes(q))
  const matchedItems = items.filter(i => !q || i.label.toLowerCase().includes(q))

  return (
    <>
      <button ref={buttonRef} className="sf-waffle" aria-label="App Launcher" title="App Launcher" aria-expanded={open} aria-haspopup="dialog"
        onClick={() => (open ? close() : setOpen(true))}
      >
        {Array.from({ length: 9 }, (_, i) => <i key={i} />)}
      </button>

      {open && (
        <div ref={panelRef} className="sf-launcher" role="dialog" aria-label="App Launcher">
          <div className="sf-launcher-head">
            <h2 className="sf-card-title">App Launcher</h2>
            <div className="sf-search sf-launcher-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
              <input ref={searchRef} type="search" placeholder="Search apps and items…" value={query} onChange={e => setQuery(e.target.value)} aria-label="Search apps and items" />
            </div>
          </div>

          {matchedApps.length > 0 && (
            <section>
              <h3 className="sf-launcher-label">Apps</h3>
              <div className="sf-launcher-apps">
                {matchedApps.map(a => {
                  const body = (
                    <>
                      <span className="sf-launcher-tile" style={{ background: a.color }}>{a.glyph}</span>
                      <span style={{ minWidth: 0 }}>
                        <b>{a.label}{a.current && <span className="sf-badge sf-badge-success" style={{ marginLeft: 6 }}>Current</span>}</b>
                        <small>{a.desc}{'href' in a && ' ↗'}</small>
                      </span>
                    </>
                  )
                  return 'href' in a
                    ? <a key={a.label} className="sf-launcher-app" href={a.href} target="_blank" rel="noreferrer" onClick={close}>{body}</a>
                    : <button key={a.label} className="sf-launcher-app" onClick={a.action}>{body}</button>
                })}
              </div>
            </section>
          )}

          {matchedItems.length > 0 && (
            <section>
              <h3 className="sf-launcher-label">Items</h3>
              <div className="sf-launcher-items">
                {matchedItems.map(i => (
                  <button key={i.label} className="sf-launcher-item" onClick={() => { navigate(i.to); close() }}>
                    <ObjIcon kind={i.icon} size={24} />{i.label}
                  </button>
                ))}
              </div>
            </section>
          )}

          {matchedApps.length === 0 && matchedItems.length === 0 && (
            <p className="sf-help" style={{ padding: '8px 20px 20px' }}>No apps or items match "{query}".</p>
          )}
        </div>
      )}
    </>
  )
}
