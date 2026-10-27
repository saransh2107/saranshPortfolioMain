import { useState } from 'react'
import { Link } from 'react-router-dom'
import { certs, technologies, jobs, impactAnalyzer, tradeNotes } from '../../data/resume'
import { useExperience } from '../../hooks/useExperience'
import { useBlogPosts } from '../../hooks/useBlogPosts'
import { useView } from '../../context/ViewContext'
import { SfButton, Spinner } from '../ui'

const tasks = [
  { id: 'resume',   label: "Review Saransh's résumé record", to: '/#about' },
  { id: 'certs',    label: 'Check the 6 certifications',      to: '/#certifications' },
  { id: 'project',  label: `Try ${impactAnalyzer.name}`,      to: '/#projects' },
  { id: 'tradenotes', label: `Install ${tradeNotes.name}`,    to: '/#projects' },
  { id: 'quiz',     label: 'Take the Trailhead quiz',         to: '/#quiz' },
  { id: 'contact',  label: 'Log a Case to say hello',         to: '/#contact' },
]

function loadDone(): string[] {
  try { return JSON.parse(localStorage.getItem('sf-tasks') || '[]') } catch { return [] }
}

export default function HomePage() {
  const exp = useExperience()
  const { setView } = useView()
  const { posts, loading, error } = useBlogPosts(3)
  const [done, setDone] = useState<string[]>(loadDone)

  const toggleTask = (id: string) => setDone(d => {
    const next = d.includes(id) ? d.filter(x => x !== id) : [...d, id]
    try { localStorage.setItem('sf-tasks', JSON.stringify(next)) } catch { /* storage blocked */ }
    return next
  })

  const kpis = [
    { value: exp.decimal.toFixed(2), label: 'Years of experience' },
    { value: String(certs.length),   label: 'Salesforce certifications' },
    { value: String(technologies.length), label: 'Technologies' },
    { value: jobs[0].company.split(' ')[0], label: 'Current account' },
  ]

  return (
    <>
      <div className="sf-card sf-card-body" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
          <div className="sf-avatar" style={{ width: 56, height: 56, borderRadius: '50%' }}><img src="/profile.webp" alt="Saransh Batham" width={56} height={56} /></div>
          <div style={{ minWidth: 0 }}>
            <h1 className="sf-title" style={{ fontSize: 20 }}>Welcome to Saransh's org 👋</h1>
            <p className="sf-help" style={{ fontSize: 13, maxWidth: 560 }}>
              This is my portfolio as a Lightning app. My résumé is a Contact record, my blog posts are Knowledge articles, and the contact form logs a Case.
            </p>
          </div>
        </div>
        <div className="sf-btn-group">
          <SfButton href="/#about">View Résumé Record</SfButton>
          <SfButton href="/#contact" brand>Log a Case</SfButton>
        </div>
      </div>

      <div className="sf-kpis">
        {kpis.map(k => (
          <div key={k.label} className="sf-card sf-kpi"><b>{k.value}</b><span>{k.label}</span></div>
        ))}
      </div>

      <div className="sf-layout">
        <div className="sf-card">
          <div className="sf-card-head">
            <h2 className="sf-card-title">Recent Knowledge Articles</h2>
            <SfButton href="/blog">View All</SfButton>
          </div>
          <div style={{ padding: '8px 0' }}>
            {loading ? <Spinner /> : error || posts.length === 0 ? (
              <p className="sf-help" style={{ padding: '12px 16px' }}>No articles to show right now.</p>
            ) : (
              <ul style={{ listStyle: 'none' }}>
                {posts.map(p => (
                  <li key={p.Id} style={{ padding: '10px 16px', borderTop: '1px solid var(--sf-border)' }}>
                    <Link to={`/blog/${p.Slug__c}`} style={{ fontSize: 14, fontWeight: 600 }}>{p.Title__c}</Link>
                    <p className="sf-help" style={{ marginTop: 2 }}>{p.Summary__c}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="sf-card">
          <div className="sf-card-head">
            <h2 className="sf-card-title">Today's Tasks</h2>
            <span className="sf-help">{done.length}/{tasks.length} done</span>
          </div>
          <ul className="sf-tasks" style={{ padding: '4px 16px 8px' }}>
            {tasks.map(t => (
              <li key={t.id} className={done.includes(t.id) ? 'is-done' : undefined}>
                <input type="checkbox" checked={done.includes(t.id)} onChange={() => toggleTask(t.id)} aria-label={`Mark "${t.label}" done`} />
                <Link to={t.to} onClick={() => done.includes(t.id) || toggleTask(t.id)}>{t.label}</Link>
              </li>
            ))}
          </ul>
          <div style={{ padding: '0 16px 14px' }}>
            <button className="sf-btn" onClick={() => setView('standard')}>Switch to standard portfolio</button>
          </div>
        </div>
      </div>
    </>
  )
}
