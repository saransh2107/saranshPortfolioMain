import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useView } from '../context/ViewContext'
import { certs, technologies, projects } from '../data/resume'
import { CloudIcon, ObjIcon, type IconKind } from './ui'
import AppLauncher from './AppLauncher'
import HomePage from './pages/HomePage'
import ProfileRecord from './pages/ProfileRecord'
import { CertificationsList, SkillsList } from './pages/ListViews'
import ProjectRecord from './pages/ProjectRecord'
import QuizPage from './pages/QuizPage'
import { KnowledgeList, KnowledgeArticle } from './pages/Knowledge'
import ContactCase from './pages/ContactCase'
import './sf.css'

const YEAR = new Date().getFullYear()

type Page = 'home' | 'profile' | 'certifications' | 'projects' | 'skills' | 'quiz' | 'knowledge' | 'article' | 'contact'

// Nav tabs use the standard site's section hashes, so the same URL opens the same content in either view
const tabs: { page: Page; label: string; to: string }[] = [
  { page: 'home',           label: 'Home',           to: '/' },
  { page: 'profile',        label: 'Saransh Batham', to: '/#about' },
  { page: 'certifications', label: 'Certifications', to: '/#certifications' },
  { page: 'projects',       label: 'Projects',       to: '/#projects' },
  { page: 'skills',         label: 'Technologies',   to: '/#skills' },
  { page: 'quiz',           label: 'Trailhead Quiz', to: '/#quiz' },
  { page: 'knowledge',      label: 'Knowledge',      to: '/blog' },
  { page: 'contact',        label: 'Cases',          to: '/#contact' },
]

function pageFor(pathname: string, hash: string): Page {
  if (pathname.startsWith('/blog/')) return 'article'
  if (pathname.startsWith('/blog')) return 'knowledge'
  const id = hash.slice(1)
  if (id === 'about' || id === 'experience' || id.startsWith('tab-')) return 'profile'
  if (['certifications', 'projects', 'skills', 'quiz', 'contact'].includes(id)) return id as Page
  return 'home'
}

const PAGES: Record<Page, () => React.ReactNode> = {
  home: HomePage, profile: ProfileRecord, certifications: CertificationsList, projects: ProjectRecord,
  skills: SkillsList, quiz: QuizPage, knowledge: KnowledgeList, article: KnowledgeArticle, contact: ContactCase,
}

export default function SalesforceApp() {
  const { pathname, hash } = useLocation()
  const page = pageFor(pathname, hash)
  const activeTab = page === 'article' ? 'knowledge' : page
  const Current = PAGES[page]

  // Each tab is its own "page": start at the top unless the hash targets a record section
  useEffect(() => {
    if (!/^#(experience|tab-details_accordion-)/.test(hash)) window.scrollTo(0, 0)
  }, [page, pathname, hash])

  return (
    <div className="sf-app">
      <div className="sf-top">
        <GlobalHeader />
        <nav className="sf-nav" aria-label="App navigation">
          <div className="sf-appname">
            <AppLauncher items={tabItems} />
            <span className="sf-appname-label">Portfolio</span>
          </div>
          <div className="sf-navtabs">
            {tabs.map(t => (
              <Link key={t.page} to={t.to} className={`sf-navtab${activeTab === t.page ? ' is-active' : ''}`} aria-current={activeTab === t.page ? 'page' : undefined}>
                {t.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      <main className="sf-main">
        <Current key={pathname} />
      </main>

      <footer className="sf-footer">
        © {YEAR} Saransh Batham · A Salesforce-inspired view of my portfolio — not affiliated with Salesforce, Inc.
      </footer>
    </div>
  )
}

const TAB_ICONS: Partial<Record<Page, IconKind>> = { profile: 'contact', certifications: 'cert', projects: 'project', skills: 'skill', contact: 'case' }
const tabItems = tabs.map(t => ({ label: t.label, to: t.to, icon: TAB_ICONS[t.page] ?? (t.page as IconKind) }))

type Hit = { label: string; sub: string; to: string; icon: IconKind }

const searchIndex: Hit[] = [
  ...tabItems.map(t => ({ ...t, sub: 'Tab' })),
  { label: 'Work Experience', sub: 'Saransh Batham · Contact', to: '/#tab-details_accordion-experience', icon: 'contact' },
  { label: 'Education',       sub: 'Saransh Batham · Contact', to: '/#tab-details_accordion-education',  icon: 'contact' },
  ...certs.map(c => ({ label: c.name, sub: 'Certification', to: '/#certifications', icon: 'cert' as IconKind })),
  ...projects.map(p => ({ label: p.name, sub: `Project · ${p.type}`, to: '/#projects', icon: 'project' as IconKind })),
  ...technologies.map(t => ({ label: t.name, sub: `Technology · ${t.category}`, to: '/#skills', icon: 'skill' as IconKind })),
]

function GlobalHeader() {
  const { theme, toggleTheme } = useTheme()
  const { setView } = useView()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const boxRef = useRef<HTMLDivElement>(null)

  const hits = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? searchIndex.filter(h => h.label.toLowerCase().includes(q)).slice(0, 8) : []
  }, [query])

  useEffect(() => {
    const close = (e: MouseEvent) => { if (!boxRef.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const go = (to: string) => { navigate(to); setQuery(''); setOpen(false) }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, hits.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(a => Math.max(a - 1, 0)) }
    if (e.key === 'Enter' && hits[active]) go(hits[active].to)
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <header className="sf-global">
      <Link to="/" className="sf-logo"><CloudIcon size={30} /><span className="sf-btn-label">Saransh's Org</span></Link>

      <div className="sf-search" ref={boxRef}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
        <input type="search" placeholder="Search certifications, skills, experience…" value={query} aria-label="Search"
          onChange={e => { setQuery(e.target.value); setOpen(true); setActive(0) }} onFocus={() => setOpen(true)} onKeyDown={onKey}
        />
        {open && query && (
          <div className="sf-search-results" role="listbox">
            {hits.length === 0 ? <p className="sf-help" style={{ padding: '6px 12px' }}>No results for "{query}"</p> : hits.map((h, i) => (
              <a key={h.label + h.sub} href={h.to} role="option" aria-selected={i === active} className={i === active ? 'is-active' : undefined}
                onClick={e => { e.preventDefault(); go(h.to) }} onMouseEnter={() => setActive(i)}
              >
                <ObjIcon kind={h.icon} size={22} />
                <span>{h.label}<small>{h.sub}</small></span>
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="sf-global-actions">
        <button className="sf-btn" onClick={() => setView('standard')} title="Switch back to the standard portfolio">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 12h18M3 12l6-6M3 12l6 6" /></svg>
          <span className="sf-btn-label">Standard view</span>
        </button>
        <button className="sf-icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark'
            ? <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            : <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"/></svg>}
        </button>
        <Link to="/#about" className="sf-avatar-sm" aria-label="View profile"><img src="/profile.webp" alt="" width={32} height={32} /></Link>
      </div>
    </header>
  )
}
