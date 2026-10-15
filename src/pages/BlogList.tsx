import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBlogPosts } from '../hooks/useBlogPosts'
import { useSeo } from '../hooks/useSeo'
import type { BlogPost } from '../types/blog'

function PostRow({ post, index }: { post: BlogPost; index: number }) {
  const tags = post.Tags__c ? post.Tags__c.split(',').map(t => t.trim()).slice(0, 2) : []
  const date = post.Published_Date__c
    ? new Date(post.Published_Date__c).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      style={{ borderBottom: '1px solid var(--border)', padding: '20px 0', display: 'grid', gridTemplateColumns: '100px 1fr auto', gap: 24, alignItems: 'start' }}
      className="bl-row"
    >
      <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--fg-3)', paddingTop: 2, lineHeight: 1.4 }}>{date}</span>

      <div>
        <Link to={`/blog/${post.Slug__c}`}
          style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg)', textDecoration: 'none', lineHeight: 1.4, display: 'block', marginBottom: 5, transition: 'color .15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg)')}
        >{post.Title__c}</Link>
        {post.Summary__c && (
          <p style={{ fontSize: 13, color: 'var(--fg-3)', lineHeight: 1.6, marginBottom: tags.length ? 8 : 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {post.Summary__c}
          </p>
        )}
        {tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6 }}>
            {tags.map(t => (
              <span key={t} style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-3)', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 5, padding: '2px 8px' }}>{t}</span>
            ))}
          </div>
        )}
      </div>

      <Link to={`/blog/${post.Slug__c}`}
        style={{ fontSize: 13, color: 'var(--fg-3)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', paddingTop: 2, transition: 'color .15s' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-3)')}
      >
        {post.Read_Time__c ? `${post.Read_Time__c} min` : 'Read'}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </Link>
    </motion.div>
  )
}

export default function BlogList() {
  const { posts, loading, error } = useBlogPosts()
  useSeo({
    title: 'Salesforce Blog — Apex, LWC, Agentforce Tips | Saransh Batham',
    description: 'Practical Salesforce development articles by Saransh Batham — Apex, Lightning Web Components, Flow, Data Cloud and Agentforce.',
    path: '/blog',
  })
  const [search, setSearch]       = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const allTags = [...new Set(posts.flatMap(p => p.Tags__c ? p.Tags__c.split(',').map(t => t.trim()) : []))].slice(0, 8)
  const filtered = posts.filter(p => {
    const ms = !search || p.Title__c.toLowerCase().includes(search.toLowerCase()) || p.Summary__c?.toLowerCase().includes(search.toLowerCase())
    const mt = !activeTag || p.Tags__c?.includes(activeTag)
    return ms && mt
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Zone 1: Header ── */}
      <div style={{ paddingTop: 100, paddingBottom: 48, borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <Link to="/"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--fg-3)', textDecoration: 'none', marginBottom: 28, transition: 'color .15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg-2)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-3)')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Home
          </Link>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
            style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--fg)', marginBottom: 10, lineHeight: 1.05 }}>
            Blog
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            style={{ fontSize: 15, color: 'var(--fg-2)' }}>
            Thoughts on Salesforce, Apex, LWC, and the ecosystem.
          </motion.p>
        </div>
      </div>

      {/* ── Zone 2: Filters ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        style={{ padding: '16px 0', background: 'var(--bg-2)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-3)', pointerEvents: 'none' }}
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input type="text" placeholder="Search posts…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '9px 14px 9px 36px', borderRadius: 9, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg)', fontSize: 14, outline: 'none' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Tag filter */}
          {allTags.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)', letterSpacing: '.06em', textTransform: 'uppercase', flexShrink: 0 }}>Filter:</span>
              {[null, ...allTags].map(tag => (
                <button key={tag ?? 'all'} onClick={() => setActiveTag(tag)}
                  style={{ fontSize: 12, padding: '4px 12px', borderRadius: 99, border: `1px solid ${activeTag === tag ? 'var(--accent)' : 'var(--border)'}`, background: activeTag === tag ? 'var(--accent)' : 'transparent', color: activeTag === tag ? '#fff' : 'var(--fg-3)', cursor: 'pointer', transition: 'all .15s', fontWeight: 500 }}>
                  {tag ?? 'All'}
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Zone 3: Posts ── */}
      <div style={{ padding: '48px 0 80px' }}>
        <div className="container">
          {/* Count */}
          {!loading && !error && posts.length > 0 && (
            <p style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--fg-3)', marginBottom: 4 }}>
              {filtered.length} {filtered.length === 1 ? 'post' : 'posts'}
              {activeTag && <> — <span style={{ color: 'var(--accent)' }}>#{activeTag}</span></>}
            </p>
          )}

          {/* Top border */}
          <div style={{ borderTop: '1px solid var(--border)' }} />

          {loading && [1,2,3].map(i => (
            <div key={i} style={{ borderBottom: '1px solid var(--border)', padding: '20px 0', display: 'grid', gridTemplateColumns: '100px 1fr auto', gap: 24 }}>
              {[80,320,50].map((w,j) => <div key={j} style={{ height: 13, background: 'var(--bg-2)', borderRadius: 4, width: w }}/>)}
            </div>
          ))}

          {error && <p style={{ padding: '48px 0', color: 'var(--fg-3)', fontSize: 14 }}>Failed to load posts. Try again later.</p>}

          {!loading && !error && filtered.length === 0 && (
            <div style={{ padding: '64px 0', textAlign: 'center' }}>
              <p style={{ color: 'var(--fg-3)', fontSize: 14 }}>{search || activeTag ? 'No posts match your filters.' : 'Blog posts coming soon...'}</p>
              {(search || activeTag) && (
                <button onClick={() => { setSearch(''); setActiveTag(null) }}
                  style={{ marginTop: 12, fontSize: 13, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Clear filters
                </button>
              )}
            </div>
          )}

          {filtered.map((post, i) => <PostRow key={post.Id} post={post} index={i} />)}
        </div>
      </div>
      <style>{`@media(max-width:520px){.bl-row{grid-template-columns:1fr!important;gap:8px!important}}`}</style>
    </div>
  )
}
