import { useEffect, useState } from 'react'
import type { BlogPost } from '../types/blog'

export function useBlogPosts(limit?: number) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const url = limit ? `/api/blogs?limit=${limit}` : '/api/blogs'
    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch')
        return r.json()
      })
      .then(data => {
        setPosts(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [limit])

  return { posts, loading, error }
}

export function useBlogPost(slug: string) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    fetch(`/api/blogs/${slug}`)
      .then(r => {
        if (!r.ok) throw new Error('Post not found')
        return r.json()
      })
      .then(data => {
        setPost(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [slug])

  return { post, loading, error }
}
