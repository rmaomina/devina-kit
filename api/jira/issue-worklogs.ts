import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' })
  }

  const { domain, email, token, issueKey } = req.body || {}

  if (!domain || !email || !token || !issueKey) {
    return res.status(400).json({ error: 'domain, email, token, issueKey 필수' })
  }

  try {
    const auth = Buffer.from(`${email}:${token}`).toString('base64')
    const response = await fetch(
      `https://${domain}/rest/api/3/issue/${issueKey}/worklog?maxResults=1000`,
      {
        method: 'GET',
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: 'application/json',
        },
      },
    )

    const data = await response.json()
    if (!response.ok) {
      return res.status(response.status).json({
        error: data.errorMessages?.[0] || 'Worklog 조회 실패',
      })
    }
    return res.status(200).json(data)
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ error: msg })
  }
}
