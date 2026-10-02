import { sfQuery } from './_sf.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')

  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 50
    const soql = `
      SELECT Id, Title__c, Slug__c, Summary__c, Cover_Image_URL__c,
             Tags__c, Published_Date__c, Read_Time__c
      FROM Blog_Post__c
      WHERE Is_Published__c = true
      ORDER BY Published_Date__c DESC
      LIMIT ${limit}
    `
    const data = await sfQuery(soql)
    res.status(200).json(data.records)
  } catch (err) {
    console.error('blogs error:', err.message)
    res.status(500).json({ error: 'Failed to fetch blog posts' })
  }
}
