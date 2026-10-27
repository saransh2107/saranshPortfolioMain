import { useState } from 'react'
import { projects, tradeNotes } from '../../data/resume'
import { MockWindow } from '../../components/Projects'
import Rich from '../../components/Rich'
import { Field, Highlights, PageHeader, SfButton } from '../ui'

/** Projects tab: list view of all projects, with the selected one opened as a record below. */
export default function ProjectRecord() {
  const [selectedId, setSelectedId] = useState(projects[0].id)
  const p = projects.find(x => x.id === selectedId) ?? projects[0]

  return (
    <>
      <div className="sf-card">
        <PageHeader bare icon="project" eyebrow="Projects" title="All Projects" meta={`${projects.length} items · Sorted by Name`} />
        <div className="sf-scroll-x" style={{ borderTop: '1px solid var(--sf-border)' }}>
          <table className="sf-table">
            <thead><tr><th className="sf-num">#</th><th>Project Name</th><th>Type</th><th>Stage</th><th></th></tr></thead>
            <tbody>
              {projects.map((x, i) => (
                <tr key={x.id} style={x.id === p.id ? { background: 'var(--slds-g-color-accent-container-soft)' } : undefined}>
                  <td className="sf-num">{i + 1}</td>
                  <td style={{ minWidth: 180 }}>
                    <button className="sf-linkbtn" onClick={() => setSelectedId(x.id)} aria-pressed={x.id === p.id}>
                      <img src={x.icon} alt="" width={20} height={20} style={{ borderRadius: 6 }} />{x.name}
                    </button>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>{x.type}</td>
                  <td><span className="sf-badge sf-badge-success">Live</span></td>
                  <td style={{ textAlign: 'right' }}><a href={x.url} target="_blank" rel="noreferrer" style={{ whiteSpace: 'nowrap' }}>Open ↗</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PageHeader
        icon={<img src={p.icon} alt="" width={48} height={48} style={{ borderRadius: 14 }} />}
        eyebrow="Project" title={p.name}
        actions={<SfButton href={p.url} brand>{p.cta}</SfButton>}
      >
        <Highlights items={[
          ...p.facts,
          { label: 'Stage', value: <span className="sf-badge sf-badge-success">Live</span> },
        ]} />
      </PageHeader>

      <div className="sf-layout">
        <div className="sf-card sf-card-body">
          <h2 className="sf-card-title" style={{ marginBottom: 8 }}>Details</h2>
          <Field label="Description"><Rich text={p.pitch} strong={{ fontWeight: 700 }} /></Field>
          <div className="sf-fields" style={{ marginTop: 4 }}>
            {p.features.map(f => (
              <Field key={f.title} label={`${f.icon} ${f.title}`}>{f.desc}</Field>
            ))}
          </div>
          <Field label="Highlights" wide>
            <div className="sf-pills">{p.highlights.map(h => <span key={h} className="sf-pill">✓ {h}</span>)}</div>
          </Field>
        </div>
        <aside className="sf-card sf-card-body">
          <h2 className="sf-card-title" style={{ marginBottom: 10 }}>Preview</h2>
          {p.id === tradeNotes.id
            ? <img src={tradeNotes.screenshots[0].src} alt="TradeNotes chart editor" width={1348} height={758} style={{ display: 'block', width: '100%', height: 'auto', borderRadius: 14, border: '1px solid var(--sf-border)' }} />
            : <MockWindow />}
        </aside>
      </div>
    </>
  )
}
