import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { jobs, education, skills, certs, links, summary, projects, fmtMonth, tenure } from '../../data/resume'
import { useExperience } from '../../hooks/useExperience'
import Rich from '../../components/Rich'
import { Accordion, Field, Highlights, RelatedList, SfButton } from '../ui'

const current = jobs[0]

const pathStages = [
  { label: 'B.Tech CSE', done: true },
  { label: `Joined ${current.company.split(' ')[0]}`, done: true },
  { label: 'UK Onsite', done: true },
  { label: current.title, current: true },
  { label: 'Next Chapter' },
]

type Tab = 'details' | 'related'

export default function ProfileRecord() {
  const { hash } = useLocation()
  const exp = useExperience()
  const [tab, setTab] = useState<Tab>(hash.startsWith('#tab-related') ? 'related' : 'details')
  const [open, setOpen] = useState<Record<string, boolean>>({ about: true, experience: true, education: true, skills: true })
  const toggle = (id: string) => setOpen(o => ({ ...o, [id]: !o[id] }))

  // /#experience and /#tab-details_accordion-<id> land on that section of the record
  const target = hash.match(/^#(?:tab-details_accordion-)?(experience|education|skills)$/)?.[1]
  const [prevHash, setPrevHash] = useState(hash)
  if (hash !== prevHash) {
    setPrevHash(hash)
    if (target) { setTab('details'); setOpen(o => ({ ...o, [target]: true })) }
  }

  useEffect(() => {
    if (!target) return
    const t = setTimeout(() => document.getElementById(`tab-details_accordion-${target}`)?.scrollIntoView({ behavior: 'smooth' }), 60)
    return () => clearTimeout(t)
  }, [target, hash])

  return (
    <>
      <div className="sf-card">
        <div className="sf-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <div className="sf-avatar"><img src="/profile.webp" alt="" width={40} height={40} /></div>
            <div style={{ minWidth: 0 }}>
              <div className="sf-eyebrow">Contact</div>
              <h1 className="sf-title">Saransh Batham</h1>
            </div>
          </div>
          <div className="sf-btn-group">
            <SfButton href={links.linkedin}>+ Follow</SfButton>
            <SfButton href="/#contact">Log a Case</SfButton>
            <SfButton href={links.resume} brand>Download Résumé</SfButton>
          </div>
        </div>
        <Highlights items={[
          { label: 'Title',          value: current.title },
          { label: 'Account Name',   value: <span className="sf-link">{current.company}</span> },
          { label: 'Experience',     value: `${exp.decimal.toFixed(2)} yrs` },
          { label: 'Certifications', value: <Link to="/#certifications">{certs.length}</Link> },
          { label: 'Status',         value: 'Open to opportunities' },
        ]} />
      </div>

      <div className="sf-card">
        <ol className="sf-path">
          {pathStages.map(s => (
            <li key={s.label} className={s.current ? 'is-current' : s.done ? 'is-done' : undefined}>
              {s.done ? <span aria-label={`${s.label} (complete)`}>✓<span className="sf-path-text"> {s.label}</span></span> : s.label}
            </li>
          ))}
        </ol>
      </div>

      <div className="sf-layout">
        <div className="sf-card">
          <div className="sf-tabs" role="tablist">
            {([['details', 'Details'], ['related', 'Related']] as const).map(([id, label]) => (
              <button key={id} id={`tab-${id}`} role="tab" aria-selected={tab === id} className={tab === id ? 'active' : undefined} onClick={() => setTab(id)}>{label}</button>
            ))}
          </div>

          {tab === 'details' ? (
            <div style={{ padding: '4px 16px 16px' }}>
              <Accordion id="about" title="About" open={open.about} onToggle={toggle}>
                <Field label="Summary"><Rich text={summary} strong={{ fontWeight: 700 }} /></Field>
              </Accordion>

              <Accordion id="experience" title="Work Experience" open={open.experience} onToggle={toggle}>
                <div className="sf-fields">
                  <Field label="Employer"><span className="sf-link">{current.company}</span></Field>
                  <Field label="Title">{current.title}</Field>
                  <Field label="Start Date">{fmtMonth(current.start)}</Field>
                  <Field label="End Date">{fmtMonth(current.end)}</Field>
                  <Field label="Tenure">{tenure(current.start, current.end)}</Field>
                  <Field label="Location">{current.location}</Field>
                </div>
                <Field label="Key Achievements" wide>
                  <ul className="sf-list">
                    {current.achievements.map(a => <li key={a}><Rich text={a} strong={{ fontWeight: 700 }} /></li>)}
                  </ul>
                </Field>
                <Field label="Technologies" wide>
                  <div className="sf-pills">{current.stack.map(s => <span key={s} className="sf-pill">{s}</span>)}</div>
                </Field>
              </Accordion>

              <Accordion id="education" title="Education" open={open.education} onToggle={toggle}>
                <div className="sf-fields">
                  <Field label="Institution">{education.school}</Field>
                  <Field label="University">{education.university}</Field>
                  <Field label="Degree">{education.degree}</Field>
                  <Field label="Years">{education.years}</Field>
                  <Field label="Grade">{education.grade}</Field>
                </div>
              </Accordion>

              <Accordion id="skills" title="Skills Summary" open={open.skills} onToggle={toggle}>
                <div className="sf-fields">
                  {skills.map(s => (
                    <Field key={s.label} label={s.label}>
                      <div className="sf-pills">{s.items.map(i => <span key={i} className="sf-pill">{i}</span>)}</div>
                    </Field>
                  ))}
                </div>
              </Accordion>
            </div>
          ) : (
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <RelatedList title="Certifications" count={certs.length} icon="cert" action={{ label: 'View All', href: '/#certifications' }}>
                <table className="sf-table">
                  <thead><tr><th>Certification Name</th><th>Area</th><th>Status</th></tr></thead>
                  <tbody>
                    {certs.map(c => (
                      <tr key={c.name}>
                        <td><span className="sf-link">{c.name}</span></td>
                        <td>{c.short}</td>
                        <td><span className="sf-badge sf-badge-success">Active</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </RelatedList>
              <RelatedList title="Projects" count={projects.length} icon="project" action={{ label: 'View All', href: '/#projects' }}>
                <table className="sf-table">
                  <thead><tr><th>Project Name</th><th>Type</th><th>Stage</th></tr></thead>
                  <tbody>
                    {projects.map(p => (
                      <tr key={p.id}>
                        <td><Link to="/#projects">{p.name}</Link></td>
                        <td>{p.type}</td>
                        <td><span className="sf-badge sf-badge-success">Live</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </RelatedList>
            </div>
          )}
        </div>

        <aside className="sf-stack">
          <div className="sf-card sf-card-body">
            <h2 className="sf-card-title">Contact Details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
              <Field label="LinkedIn"><a href={links.linkedin} target="_blank" rel="noreferrer">in/batham</a></Field>
              <Field label="GitHub"><a href={links.github} target="_blank" rel="noreferrer">saransh2107</a></Field>
              <Field label="Trailblazer Profile"><a href={links.trailhead} target="_blank" rel="noreferrer">saranshbatham21</a></Field>
            </div>
          </div>
          <div className="sf-card sf-card-body">
            <h2 className="sf-card-title">Experience Counter</h2>
            <p className="sf-help">Live since first day on the platform</p>
            <div className="sf-counter">
              {[
                { v: exp.totalDays.toLocaleString(), l: 'days' },
                { v: String(exp.remHours).padStart(2, '0'), l: 'hrs' },
                { v: String(exp.remMinutes).padStart(2, '0'), l: 'min' },
                { v: String(exp.remSeconds).padStart(2, '0'), l: 'sec' },
              ].map(u => <div key={u.l}><b>{u.v}</b><span>{u.l}</span></div>)}
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
