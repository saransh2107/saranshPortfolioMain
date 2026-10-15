import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// Load .env.local manually
const __dir = dirname(fileURLToPath(import.meta.url))
try {
  const env = readFileSync(join(__dir, '.env.local'), 'utf-8')
  for (const line of env.split('\n')) {
    const [key, ...rest] = line.split('=')
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim()
  }
} catch { /* no .env.local found */ }

const SF_DOMAIN = process.env.SF_DOMAIN
const SF_CLIENT_ID = process.env.SF_CLIENT_ID
const SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET

// Token cache
let cachedToken = null
let tokenExpiry = 0

async function getSFToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken
  const res = await fetch(`${SF_DOMAIN}/services/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: SF_CLIENT_ID,
      client_secret: SF_CLIENT_SECRET,
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`SF auth failed: ${text}`)
  }
  const data = await res.json()
  cachedToken = { access_token: data.access_token, instance_url: data.instance_url }
  tokenExpiry = Date.now() + 25 * 60 * 1000
  return cachedToken
}

// Retries once with a fresh token if the cached session has expired
async function sfFetch(path, init = {}) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const { access_token, instance_url } = await getSFToken()
    const res = await fetch(`${instance_url}${path}`, {
      ...init,
      headers: { ...init.headers, Authorization: `Bearer ${access_token}` },
    })
    if (res.status === 401 && attempt === 0) {
      cachedToken = null
      tokenExpiry = 0
      continue
    }
    return res
  }
}

async function sfQuery(soql) {
  const res = await sfFetch(`/services/data/v62.0/query?q=${encodeURIComponent(soql)}`)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`SOQL failed (${res.status}): ${text}`)
  }
  return res.json()
}

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
  res.end(JSON.stringify(data))
}

function parseBody(req) {
  return new Promise(resolve => {
    let body = ''
    req.on('data', chunk => (body += chunk))
    req.on('end', () => { try { resolve(JSON.parse(body)) } catch { resolve({}) } })
  })
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost')
  const path = url.pathname

  try {
    // GET /api/blogs
    if (req.method === 'GET' && path === '/api/blogs') {
      const limit = parseInt(url.searchParams.get('limit') || '50')
      const soql = `
        SELECT Id, Title__c, Slug__c, Summary__c, Cover_Image_URL__c,
               Tags__c, Published_Date__c, Read_Time__c
        FROM Blog_Post__c
        WHERE Is_Published__c = true
        ORDER BY Published_Date__c DESC
        LIMIT ${limit}
      `
      const data = await sfQuery(soql)
      return json(res, 200, data.records)
    }

    // GET /api/blogs/:slug
    const slugMatch = path.match(/^\/api\/blogs\/([a-zA-Z0-9_-]+)$/)
    if (req.method === 'GET' && slugMatch) {
      const slug = slugMatch[1]
      const soql = `
        SELECT Id, Title__c, Slug__c, Summary__c, Body__c, Cover_Image_URL__c,
               Tags__c, Published_Date__c, Read_Time__c
        FROM Blog_Post__c
        WHERE Slug__c = '${slug}' AND Is_Published__c = true
        LIMIT 1
      `
      const data = await sfQuery(soql)
      if (!data.records?.length) return json(res, 404, { error: 'Post not found' })
      return json(res, 200, data.records[0])
    }

    // POST /api/contact
    if (req.method === 'POST' && path === '/api/contact') {
      const { name, email, message } = await parseBody(req)
      if (!name || !email || !message) return json(res, 400, { error: 'All fields required' })
      const sfRes = await sfFetch('/services/data/v62.0/sobjects/Case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Subject: 'Portfolio Contact', Description: message, SuppliedName: name, SuppliedEmail: email, Origin: 'Web' }),
      })
      if (!sfRes.ok) throw new Error('Case creation failed')
      return json(res, 200, { success: true })
    }

    json(res, 404, { error: 'Not found' })
  } catch (err) {
    console.error('❌', err.message)
    json(res, 500, { error: err.message })
  }
})

server.listen(3001, () => {
  console.log('✅ Dev API server running on http://localhost:3001')
  console.log(`   SF_DOMAIN: ${SF_DOMAIN || '⚠️  not set'}`)
})
