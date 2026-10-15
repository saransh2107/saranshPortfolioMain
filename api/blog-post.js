import { sfQuery } from './_sf.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')

  const { slug } = req.query

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Slug is required' })
  }

  // Sanitize slug to prevent SOQL injection
  const safe = slug.replace(/[^a-zA-Z0-9_-]/g, '')

  try {
    const soql = `
      SELECT Id, Title__c, Slug__c, Summary__c, Body__c, Cover_Image_URL__c,
             Tags__c, Published_Date__c, Read_Time__c
      FROM Blog_Post__c
      WHERE Slug__c = '${safe}' AND Is_Published__c = true
      LIMIT 1
    `
    const data = await sfQuery(soql)
    if (!data.records || data.records.length === 0) {
      return res.status(404).json({ error: 'Post not found' })
    }
    res.status(200).json(data.records[0])
  } catch (err) {
    console.error('blog detail error:', err.message)
    res.status(500).json({ error: 'Failed to fetch post' })
  }
}
