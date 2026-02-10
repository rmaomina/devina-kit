import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' })
  }

  const { domain, email, token } = req.body || {}

  if (!domain || !email || !token) {
    return res.status(400).json({ error: 'domain, email, token 필수' })
  }

  try {
    const auth = Buffer.from(`${email}:${token}`).toString('base64')
    const response = await fetch(`https://${domain}/rest/api/3/myself`, {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: 'application/json',
      },
    })

    const data = await response.json()
    if (!response.ok) {
      return res.status(response.status).json({ error: 'JIRA 연결 실패. 토큰을 확인하세요.' })
    }
    return res.status(200).json({
      displayName: data.displayName,
      emailAddress: data.emailAddress,
      accountId: data.accountId,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ error: msg })
  }
}
