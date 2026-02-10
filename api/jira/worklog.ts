import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { domain, email, token } = req.body || {}

  if (!domain || !email || !token) {
    return res.status(400).json({ error: 'domain, email, token 필수' })
  }

  const auth = Buffer.from(`${email}:${token}`).toString('base64')
  const headers = {
    Authorization: `Basic ${auth}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  try {
    // POST: worklog 추가
    if (req.method === 'POST') {
      const { issueKey, timeSpentMinutes, startDate } = req.body

      if (!issueKey || !timeSpentMinutes || !startDate) {
        return res.status(400).json({ error: 'issueKey, timeSpentMinutes, startDate 필수' })
      }

      const response = await fetch(
        `https://${domain}/rest/api/3/issue/${issueKey}/worklog`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            timeSpentSeconds: timeSpentMinutes * 60,
            started: `${startDate}T09:00:00.000+0900`,
          }),
        }
      )

      const data = await response.json()
      if (!response.ok) {
        return res.status(response.status).json({
          error: data.errorMessages?.[0] || data.errors
            ? JSON.stringify(data.errors)
            : 'Worklog 추가 실패',
        })
      }
      return res.status(201).json({ success: true, worklog: data })
    }

    return res.status(405).json({ error: 'POST only' })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ error: msg })
  }
}
