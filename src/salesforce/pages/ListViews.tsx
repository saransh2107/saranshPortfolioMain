import { useMemo, useState } from 'react'
import { certs, technologies, links } from '../../data/resume'
import { PageHeader, SfButton } from '../ui'

export function CertificationsList() {
  return (
    <div className="sf-card">
      <PageHeader bare icon="cert" eyebrow="Certifications" title="All Certifications"
        meta={`${certs.length} items · Sorted by Certification Name`}
        actions={<SfButton href={links.trailhead} brand>Verify on Trailhead</SfButton>}
      />
      <div className="sf-scroll-x" style={{ borderTop: '1px solid var(--sf-border)' }}>
        <table className="sf-table">
          <thead><tr><th className="sf-num">#</th><th>Certification Name</th><th>Area</th><th>Description</th><th>Status</th></tr></thead>
          <tbody>
            {[...certs].sort((a, b) => a.name.localeCompare(b.name)).map((c, i) => (
              <tr key={c.name}>
                <td className="sf-num">{i + 1}</td>
                <td style={{ minWidth: 200 }}><span style={{ marginRight: 6 }}>{c.icon}</span><span className="sf-link">{c.name}</span></td>
                <td style={{ whiteSpace: 'nowrap' }}>{c.short}</td>
                <td style={{ minWidth: 240, color: 'var(--sf-weak)' }}>{c.desc}</td>
                <td><span className="sf-badge sf-badge-success">Active</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function SkillsList() {
  const categories = useMemo(() => ['All', ...new Set(technologies.map(t => t.category))], [])
  const [filter, setFilter] = useState('All')
  const rows = filter === 'All' ? technologies : technologies.filter(t => t.category === filter)

  return (
    <div className="sf-card">
      <PageHeader bare icon="skill" eyebrow="Technologies" title={filter === 'All' ? 'All Technologies' : `${filter} Technologies`}
        meta={`${rows.length} items · Filtered by Category`}
      />
      <div className="sf-pills" style={{ padding: '0 16px 12px' }} role="group" aria-label="Filter by category">
        {categories.map(c => (
          <button key={c} className={filter === c ? 'sf-btn is-selected' : 'sf-btn'}
            aria-pressed={filter === c} onClick={() => setFilter(c)}
          >{c}</button>
        ))}
      </div>
      <div className="sf-scroll-x" style={{ borderTop: '1px solid var(--sf-border)' }}>
        <table className="sf-table">
          <thead><tr><th className="sf-num">#</th><th>Technology</th><th>Category</th></tr></thead>
          <tbody>
            {rows.map((t, i) => (
              <tr key={t.name}>
                <td className="sf-num">{i + 1}</td>
                <td><span className="sf-pill" style={{ border: 'none', background: 'none', padding: 0 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: t.color }} />{t.name}</span></td>
                <td>{t.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
