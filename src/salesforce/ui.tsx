import { Link } from 'react-router-dom'

/* Small Lightning-style building blocks shared by the Salesforce view pages */

const ICONS = {
  home:      { bg: '#ff538a', d: 'M12 3l9 8h-3v9h-5v-6h-2v6H6v-9H3z' },
  contact:   { bg: '#a094ed', d: 'M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8c0-3.3 3.1-6 7-6s7 2.7 7 6z' },
  cert:      { bg: '#f59e0b', d: 'M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 14.4l-4.8 2.5.9-5.4L4.2 7.7l5.4-.8zM8 17.5V22l4-2 4 2v-4.5' },
  project:   { bg: '#3c97dd', d: 'M4 6h6l2 2h8v11H4z' },
  skill:     { bg: '#4bc076', d: 'M4 20V10h3v10zm6.5 0V4h3v16zM17 20v-7h3v7z' },
  quiz:      { bg: '#00a1e0', d: 'M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2zm2.1-7.7l-.9.9c-.7.7-1.2 1.3-1.2 2.8h-2v-.5c0-1.1.5-2.1 1.2-2.8l1.2-1.3a2 2 0 10-3.4-1.4H8a4 4 0 118 0c0 .9-.4 1.7-.9 2.3z' },
  knowledge: { bg: '#ec94ed', d: 'M5 3h10l4 4v14H5zm9 1v4h4M8 12h8M8 15h8M8 18h5' },
  case:      { bg: '#f2cf5b', d: 'M4 7h16v12H4zM9 7V5h6v2M4 12h16' },
} as const

export type IconKind = keyof typeof ICONS

export function ObjIcon({ kind, size = 32 }: { kind: IconKind; size?: number }) {
  const { bg, d } = ICONS[kind]
  return (
    <span className="sf-objicon" style={{ width: size, height: size, background: bg }} aria-hidden>
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="#fff" stroke="#fff" strokeWidth={kind === 'knowledge' || kind === 'case' ? 1.2 : 0} strokeLinejoin="round"><path d={d} fillRule="evenodd" /></svg>
    </span>
  )
}

export function CloudIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M10 5.5a4.5 4.5 0 013.9 2.3A3.8 3.8 0 0119.5 10a4 4 0 01-1 7.9H6a4 4 0 01-.9-7.9A4.5 4.5 0 0110 5.5z" />
    </svg>
  )
}

/** Record or list-view page header: icon, object label, title, actions, optional meta line. */
export function PageHeader({ icon, eyebrow, title, meta, actions, bare, children }: {
  icon: IconKind | React.ReactNode
  eyebrow: string
  title: React.ReactNode
  meta?: React.ReactNode
  actions?: React.ReactNode
  /** Render without its own card, for headers that sit inside a larger card */
  bare?: boolean
  children?: React.ReactNode
}) {
  return (
    <div className={bare ? undefined : 'sf-card'}>
      <div className="sf-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          {typeof icon === 'string' ? <ObjIcon kind={icon as IconKind} size={48} /> : icon}
          <div style={{ minWidth: 0 }}>
            <div className="sf-eyebrow">{eyebrow}</div>
            <h1 className="sf-title">{title}</h1>
            {meta && <div className="sf-help" style={{ marginTop: 2 }}>{meta}</div>}
          </div>
        </div>
        {actions && <div className="sf-btn-group">{actions}</div>}
      </div>
      {children}
    </div>
  )
}

export function Highlights({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="sf-highlights">
      {items.map(h => (
        <div key={h.label}>
          <dt>{h.label}</dt>
          <dd>{h.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className={wide ? 'sf-field sf-field-wide' : 'sf-field'}>
      <div className="sf-field-label">{label}</div>
      <div className="sf-field-value">{children}</div>
    </div>
  )
}

export function Accordion({ id, title, open, onToggle, children }: { id: string; title: string; open: boolean; onToggle: (id: string) => void; children: React.ReactNode }) {
  return (
    <section id={`tab-details_accordion-${id}`} className="sf-section">
      <button className="sf-section-head" aria-expanded={open} onClick={() => onToggle(id)}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}><path d="M8 4l10 8-10 8z" /></svg>
        {title}
      </button>
      {open && <div style={{ padding: '12px 4px 4px' }}>{children}</div>}
    </section>
  )
}

/** Button that is a router link for in-app paths and a new-tab anchor for external URLs. */
export function SfButton({ href, brand, children }: { href: string; brand?: boolean; children: React.ReactNode }) {
  const cls = brand ? 'sf-btn sf-btn-brand' : 'sf-btn'
  if (href.startsWith('/') && !href.endsWith('.pdf')) return <Link className={cls} to={href}>{children}</Link>
  return <a className={cls} href={href} target="_blank" rel="noreferrer">{children}</a>
}

export function RelatedList({ title, count, icon, action, children }: { title: string; count: number; icon: IconKind; action?: { label: string; href: string }; children: React.ReactNode }) {
  return (
    <div className="sf-related">
      <div className="sf-related-head">
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ObjIcon kind={icon} size={24} />
          <h2 className="sf-card-title">{title} ({count})</h2>
        </span>
        {action && <SfButton href={action.href}>{action.label}</SfButton>}
      </div>
      <div className="sf-scroll-x">{children}</div>
    </div>
  )
}

export function Spinner() {
  return <div className="sf-spinner" role="status" aria-label="Loading"><span /><span /><span /></div>
}
