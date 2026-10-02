import { getSalesforceToken } from './_sf.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { name, email, message } = req.body || {}
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' })
  }

  try {
    const { access_token, instance_url } = await getSalesforceToken()

    const sfRes = await fetch(`${instance_url}/services/data/v62.0/sobjects/Case`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Subject: 'Portfolio Contact',
        Description: message,
        SuppliedName: name,
        SuppliedEmail: email,
        Origin: 'Web',
      }),
    })

    if (!sfRes.ok) throw new Error('Salesforce case creation failed')
    res.status(200).json({ success: true })
  } catch (err) {
    console.error('contact error:', err.message)
    res.status(500).json({ error: 'Failed to send message' })
  }
}
