import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' })
  }

  const { domain, email, token, jql, fields, maxResults = 100, startAt = 0 } = req.body || {}

  if (!domain || !email || !token || !jql) {
    return res.status(400).json({ error: 'domain, email, token, jql 필수' })
  }

  try {
    const auth = Buffer.from(`${email}:${token}`).toString('base64')
    const response = await fetch(`https://${domain}/rest/api/3/search/jql`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        jql,
        fields: fields || [
          'summary', 'status', 'project', 'issuetype',
          'timespent', 'resolutiondate', 'updated',
          'customfield_10020', // sprint
        ],
        maxResults,
        startAt,
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      return res.status(response.status).json({ error: data.errorMessages?.[0] || 'JIRA API error' })
    }
    return res.status(200).json(data)
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ error: msg })
  }
}
