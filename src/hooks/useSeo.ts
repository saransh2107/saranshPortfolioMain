import { useEffect } from 'react'

export const SITE_URL = 'https://saranshbatham.com'
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`

interface Seo {
  title: string
  description: string
  path: string
  image?: string | null
  type?: 'website' | 'profile' | 'article'
  jsonLd?: object
}

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = value
}

// Keeps title, description, canonical and social tags in sync with the current page
export function useSeo({ title, description, path, image, type = 'website', jsonLd }: Seo) {
  useEffect(() => {
    const url = SITE_URL + path
    const img = image || DEFAULT_IMAGE
    document.title = title
    setMeta('name', 'description', description)
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:type', type)
    setMeta('property', 'og:image', img)
    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', img)

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = url

    let script: HTMLScriptElement | null = null
    if (jsonLd) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.dataset.page = 'true'
      script.textContent = JSON.stringify(jsonLd)
      document.head.appendChild(script)
    }
    return () => { script?.remove() }
  }, [title, description, path, image, type, jsonLd])
}
