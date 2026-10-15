let cachedToken = null
let tokenExpiry = 0

export async function getSalesforceToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken

  const res = await fetch(`${process.env.SF_DOMAIN}/services/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.SF_CLIENT_ID,
      client_secret: process.env.SF_CLIENT_SECRET,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Salesforce auth failed: ${text}`)
  }

  const data = await res.json()
  cachedToken = { access_token: data.access_token, instance_url: data.instance_url }
  tokenExpiry = Date.now() + 25 * 60 * 1000 // cache for 25 min
  return cachedToken
}

// Calls the Salesforce REST API; if the cached session has expired, logs in again and retries once
export async function sfFetch(path, init = {}) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const { access_token, instance_url } = await getSalesforceToken()
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

export async function sfQuery(soql) {
  const res = await sfFetch(`/services/data/v62.0/query?q=${encodeURIComponent(soql)}`)
  if (!res.ok) throw new Error(`SOQL query failed: ${res.status}`)
  return res.json()
}
