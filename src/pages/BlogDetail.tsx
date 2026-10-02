import { motion } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'
import { useBlogPost } from '../hooks/useBlogPosts'

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { post, loading, error } = useBlogPost(slug || '')

  if (loading) {
    return (
      <div className="min-h-screen px-6" style={{ paddingTop: '96px', paddingBottom: '80px' }}>
        <div className="animate-pulse space-y-4" style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div className="h-3 rounded w-24" style={{ background: 'var(--bg-2)' }} />
          <div className="h-10 rounded w-3/4" style={{ background: 'var(--bg-2)' }} />
          <div className="h-3 rounded w-1/2" style={{ background: 'var(--bg-2)' }} />
          <div className="h-56 rounded-xl mt-8" style={{ background: 'var(--bg-2)' }} />
          <div className="space-y-2 mt-8">
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className="h-3 rounded"
                style={{ background: 'var(--bg-2)', width: `${80 + (i % 3) * 8}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div
        className="min-h-screen px-6 flex items-center justify-center"
        style={{ paddingTop: '96px', paddingBottom: '80px' }}
      >
        <div className="text-center">
          <h2
            className="text-xl font-bold mb-2"
            style={{ color: 'var(--fg)' }}
          >
            Post not found
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--fg-3)' }}>
            This post may have been removed or the link is incorrect.
          </p>
          <Link
            to="/blog"
            className="text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            style={{
              background: 'var(--bg-2)',
              border: '1px solid var(--border)',
              color: 'var(--fg-2)',
            }}
          >
            ← Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  const tags = post.Tags__c ? post.Tags__c.split(',').map(t => t.trim()) : []
  const date = post.Published_Date__c
    ? new Date(post.Published_Date__c).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : ''

  return (
    <div
      className="min-h-screen px-6"
      style={{ paddingTop: '88px', paddingBottom: '80px' }}
    >
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-10"
        >
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
            style={{ color: 'var(--fg-3)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-3)')}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Blog
          </Link>
        </motion.div>

        {/* Article header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          {/* Tags row */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                  style={{
                    background: 'var(--accent-fg)',
                    color: 'var(--accent)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1
            className="font-bold leading-tight mb-5"
            style={{
              fontSize: '48px',
              color: 'var(--fg)',
              letterSpacing: '-0.03em',
            }}
          >
            {post.Title__c}
          </h1>

          {/* Meta row */}
          <div
            className="flex items-center gap-3 text-xs font-mono flex-wrap"
            style={{ color: 'var(--fg-3)' }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}
              >
                SB
              </div>
              <span style={{ color: 'var(--fg-2)' }}>Saransh Batham</span>
            </div>
            {date && (
              <>
                <span>·</span>
                <span>{date}</span>
              </>
            )}
            {post.Read_Time__c && (
              <>
                <span>·</span>
                <span>{post.Read_Time__c} min read</span>
              </>
            )}
          </div>
        </motion.div>

        {/* Cover image */}
        {post.Cover_Image_URL__c && (
          <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-10 overflow-hidden rounded-xl"
            style={{
              border: '1px solid var(--border)',
              aspectRatio: '16/9',
            }}
          >
            <img
              src={post.Cover_Image_URL__c}
              alt={post.Title__c}
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}

        {/* Body */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="prose-sf"
          dangerouslySetInnerHTML={{ __html: post.Body__c }}
        />

        {/* Bottom nav */}
        <div
          className="mt-16 pt-8"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
            style={{ color: 'var(--fg-3)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-3)')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            All Posts
          </Link>
        </div>
      </div>
    </div>
  )
}
