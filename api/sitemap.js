import { sfQuery } from './_sf.js'

const SITE = 'https://saranshbatham.com'

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const url = (loc, lastmod, changefreq, priority) => `  <url>
    <loc>${esc(loc)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`

export default async function handler(req, res) {
  let posts = []
  try {
    const data = await sfQuery(`
      SELECT Slug__c, Published_Date__c, LastModifiedDate
      FROM Blog_Post__c
      WHERE Is_Published__c = true
      ORDER BY Published_Date__c DESC
      LIMIT 500
    `)
    posts = data.records
  } catch (err) {
    // Still serve the core pages if Salesforce is unreachable
    console.error('sitemap error:', err.message)
  }

  const latest = posts[0]?.LastModifiedDate?.slice(0, 10)
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[
    url(`${SITE}/`, latest, 'monthly', '1.0'),
    url(`${SITE}/blog`, latest, 'weekly', '0.8'),
    ...posts
      .filter(p => p.Slug__c)
      .map(p => url(`${SITE}/blog/${encodeURIComponent(p.Slug__c)}`, (p.LastModifiedDate || p.Published_Date__c)?.slice(0, 10), 'monthly', '0.7')),
  ].join('\n')}
</urlset>
`

  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
  res.status(200).send(body)
}
