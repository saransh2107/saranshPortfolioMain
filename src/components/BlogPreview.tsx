import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useBlogPosts } from '../hooks/useBlogPosts'
import type { BlogPost } from '../types/blog'

function PostRow({ post, index }: { post: BlogPost; index: number }) {
  const tags = post.Tags__c ? post.Tags__c.split(',').map(t => t.trim()).slice(0, 2) : []
  const date = post.Published_Date__c
    ? new Date(post.Published_Date__c).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      style={{ borderBottom: '1px solid var(--border)', padding: '20px 0', display: 'grid', gridTemplateColumns: '90px 1fr auto', gap: 24, alignItems: 'start' }}
      className="post-row"
    >
      {/* Date */}
      <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--fg-3)', paddingTop: 2, lineHeight: 1.4 }}>{date}</span>

      {/* Content */}
      <div>
        <Link to={`/blog/${post.Slug__c}`}
          style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg)', textDecoration: 'none', lineHeight: 1.4, display: 'block', marginBottom: 5, transition: 'color .15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg)')}
        >{post.Title__c}</Link>
        {post.Summary__c && (
          <p style={{ fontSize: 13, color: 'var(--fg-3)', lineHeight: 1.6, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
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

      {/* Read link */}
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

export default function BlogPreview() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const { posts, loading, error } = useBlogPosts(4)

  return (
    <section id="blog" className="section" ref={ref}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40 }}>
          <div>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }} className="section-label">
              07 — Latest Writing
            </motion.p>
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.05 }}
              style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--fg)' }}>
              From the blog
            </motion.h2>
          </div>
          <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.2 }}>
            <Link to="/blog"
              style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-3)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5, transition: 'color .15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-3)')}
            >
              All posts
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </motion.div>
        </div>

        {/* First divider */}
        <div style={{ borderTop: '1px solid var(--border)' }} />

        {loading && [1,2,3].map(i => (
          <div key={i} style={{ borderBottom: '1px solid var(--border)', padding: '20px 0', display: 'grid', gridTemplateColumns: '90px minmax(0, 1fr) auto', gap: 24 }}>
            {/* Middle bar shrinks on phones so the skeleton never overflows the viewport */}
            {[80,300,50].map((w, j) => <div key={j} style={{ height: 14, background: 'var(--bg-2)', borderRadius: 4, width: '100%', maxWidth: w, animation: 'pulse 1.5s infinite' }} />)}
          </div>
        ))}

        {error && <p style={{ padding: '40px 0', color: 'var(--fg-3)', fontSize: 14 }}>Could not load posts.</p>}

        {!loading && !error && posts.length === 0 && (
          <p style={{ padding: '40px 0', color: 'var(--fg-3)', fontSize: 14 }}>Blog posts coming soon...</p>
        )}

        {posts.map((post, i) => <PostRow key={post.Id} post={post} index={i} />)}
      </div>
      <style>{`@media(max-width:520px){.post-row{grid-template-columns:1fr!important;gap:8px!important}}`}</style>
    </section>
  )
}
