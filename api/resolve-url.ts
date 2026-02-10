import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { url } = req.query

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'url 파라미터가 필요합니다' })
  }

  try {
    const hops: string[] = [url]
    let currentUrl = url
    const maxRedirects = 10

    for (let i = 0; i < maxRedirects; i++) {
      const response = await fetch(currentUrl, {
        method: 'HEAD',
        redirect: 'manual',
      })

      const location = response.headers.get('location')
      if (!location) break

      // 상대 경로 처리
      const nextUrl = location.startsWith('http')
        ? location
        : new URL(location, currentUrl).href

      hops.push(nextUrl)
      currentUrl = nextUrl
    }

    return res.status(200).json({
      originalUrl: url,
      finalUrl: currentUrl,
      hops: hops.length > 1 ? hops : [],
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ error: `URL 확인 실패: ${message}` })
  }
}
