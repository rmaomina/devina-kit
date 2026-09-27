import type { VercelRequest, VercelResponse } from '@vercel/node'

// 완전한 이슈 키(VAN-7019)인지 판별
const ISSUE_KEY = /^[A-Za-z][A-Za-z0-9]*-\d+$/
// JQL에서 구문 오류를 내는 문자 — 공백으로 치환 후 검색
const JQL_SPECIAL = /["\\[\](){}^~*?:+\-!|&']/g

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' })
  }

  const { domain, email, token, query } = req.body || {}

  if (!domain || !email || !token || !query) {
    return res.status(400).json({ error: 'domain, email, token, query 필수' })
  }

  const q = String(query).trim()

  // issue/picker는 currentJQL 없이는 '최근 조회한 이슈'만 돌려주기 때문에
  // 존재하는 티켓도 0건이 된다. JQL 검색으로 대체.
  let jql: string
  if (ISSUE_KEY.test(q)) {
    jql = `key = "${q.toUpperCase()}"`
  } else {
    const safe = q.replace(JQL_SPECIAL, ' ').replace(/\s+/g, ' ').trim().slice(0, 80)
    if (!safe) return res.status(200).json({ issues: [] })
    jql = `summary ~ "${safe}" ORDER BY updated DESC`
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
      body: JSON.stringify({ jql, fields: ['summary'], maxResults: 20 }),
    })

    const data = await response.json()
    if (!response.ok) {
      // 없는 키를 key= 로 조회하면 JQL 오류(400)가 난다 — 이때만 0건으로 처리.
      // 401/403/5xx까지 삼키면 인증 실패가 '검색 결과 없음'으로 둔갑한다.
      if (response.status === 400 && ISSUE_KEY.test(q)) {
        return res.status(200).json({ issues: [] })
      }
      return res.status(response.status).json({
        error: data.errorMessages?.[0] || `티켓 검색 실패 (HTTP ${response.status})`,
      })
    }

    const issues = (data.issues || []).map((i: { key: string; fields?: { summary?: string } }) => ({
      key: i.key,
      summary: i.fields?.summary || '',
    }))

    return res.status(200).json({ issues })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ error: msg })
  }
}
