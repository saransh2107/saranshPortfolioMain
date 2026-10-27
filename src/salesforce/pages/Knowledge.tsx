import { Link, useLocation } from 'react-router-dom'
import { useBlogPost, useBlogPosts } from '../../hooks/useBlogPosts'
import { useSeo } from '../../hooks/useSeo'
import { Highlights, PageHeader, SfButton, Spinner } from '../ui'

const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
const splitTags = (t: string | null) => t ? t.split(',').map(s => s.trim()).filter(Boolean) : []

export function KnowledgeList() {
  const { posts, loading, error } = useBlogPosts()

  useSeo({
    title: 'Blog | Saransh Batham — Salesforce Developer',
    description: 'Salesforce development articles by Saransh Batham.',
    path: '/blog',
  })

  return (
    <div className="sf-card">
      <PageHeader bare icon="knowledge" eyebrow="Knowledge" title="All Articles"
        meta={loading ? 'Loading…' : `${posts.length} items · Sorted by Published Date`}
      />
      {loading ? <Spinner /> : error ? (
        <p className="sf-help" style={{ padding: 16 }}>Articles couldn't be loaded. Please try again later.</p>
      ) : (
        <div className="sf-scroll-x" style={{ borderTop: '1px solid var(--sf-border)' }}>
          <table className="sf-table">
            <thead><tr><th className="sf-num">#</th><th>Title</th><th>Summary</th><th>Tags</th><th>Published</th><th>Read Time</th></tr></thead>
            <tbody>
              {posts.map((p, i) => (
                <tr key={p.Id}>
                  <td className="sf-num">{i + 1}</td>
                  <td style={{ minWidth: 200 }}><Link to={`/blog/${p.Slug__c}`}>{p.Title__c}</Link></td>
                  <td style={{ minWidth: 260, color: 'var(--sf-weak)' }}>{p.Summary__c}</td>
                  <td><div className="sf-pills">{splitTags(p.Tags__c).slice(0, 2).map(t => <span key={t} className="sf-pill">{t}</span>)}</div></td>
                  <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(p.Published_Date__c)}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{p.Read_Time__c ? `${p.Read_Time__c} min` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export function KnowledgeArticle() {
  // SalesforceApp picks pages from the URL itself (no <Routes>), so read the slug from the path
  const slug = decodeURIComponent(useLocation().pathname.replace(/^\/blog\//, '').replace(/\/$/, ''))
  const { post, loading, error } = useBlogPost(slug)
  const { posts } = useBlogPosts(5)

  useSeo({
    title: post ? `${post.Title__c} | Saransh Batham` : 'Blog | Saransh Batham — Salesforce Developer',
    description: post?.Summary__c || 'Salesforce development articles by Saransh Batham.',
    path: `/blog/${slug}`,
    image: post?.Cover_Image_URL__c,
    type: 'article',
  })

  if (loading) return <div className="sf-card"><Spinner /></div>
  if (error || !post) {
    return (
      <div className="sf-card sf-card-body">
        <h1 className="sf-title">Article not found</h1>
        <p className="sf-help" style={{ margin: '4px 0 12px' }}>This article may have been archived or the link is incorrect.</p>
        <SfButton href="/blog">Back to Knowledge</SfButton>
      </div>
    )
  }

  return (
    <>
      <PageHeader icon="knowledge" eyebrow="Knowledge Article" title={post.Title__c}
        actions={<SfButton href="/blog">Back to Knowledge</SfButton>}
      >
        <Highlights items={[
          { label: 'Author',          value: 'Saransh Batham' },
          { label: 'Published',       value: fmtDate(post.Published_Date__c) },
          { label: 'Read Time',       value: post.Read_Time__c ? `${post.Read_Time__c} min` : '—' },
          { label: 'Tags',            value: <span className="sf-pills">{splitTags(post.Tags__c).map(t => <span key={t} className="sf-pill">{t}</span>)}</span> },
        ]} />
      </PageHeader>

      <div className="sf-layout">
        <article className="sf-card sf-card-body">
          {post.Cover_Image_URL__c && <img src={post.Cover_Image_URL__c} alt={post.Title__c} style={{ display: 'block', width: '100%', height: 'auto', borderRadius: 14, marginBottom: 16 }} />}
          <div className="prose-sf" dangerouslySetInnerHTML={{ __html: post.Body__c }} />
        </article>
        <aside className="sf-card">
          <div className="sf-card-head"><h2 className="sf-card-title">More Articles</h2></div>
          <ul style={{ listStyle: 'none', padding: '8px 0' }}>
            {posts.filter(p => p.Slug__c !== slug).slice(0, 4).map(p => (
              <li key={p.Id} style={{ padding: '8px 16px', borderTop: '1px solid var(--sf-border)' }}>
                <Link to={`/blog/${p.Slug__c}`}>{p.Title__c}</Link>
                <div className="sf-help">{fmtDate(p.Published_Date__c)}</div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  )
}
