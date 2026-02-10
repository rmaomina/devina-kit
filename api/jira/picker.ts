import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' })
  }

  const { domain, email, token, query } = req.body || {}

  if (!domain || !email || !token || !query) {
    return res.status(400).json({ error: 'domain, email, token, query 필수' })
  }

  try {
    const auth = Buffer.from(`${email}:${token}`).toString('base64')

    // Issue picker API — 부분 키 + summary 자동완성 지원
    const params = new URLSearchParams({
      query,
      showSubTasks: 'true',
      showSubTaskParent: 'true',
    })

    const response = await fetch(
      `https://${domain}/rest/api/2/issue/picker?${params.toString()}`,
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
        error: data.errorMessages?.[0] || 'Picker API error',
      })
    }

    // picker 응답을 단순화: sections → flat list
    const issues: { key: string; summary: string }[] = []
    for (const section of data.sections || []) {
      for (const issue of section.issues || []) {
        issues.push({
          key: issue.key,
          summary: issue.summaryText || issue.summary || '',
        })
      }
    }

    return res.status(200).json({ issues })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ error: msg })
  }
}
