const PREFIX = 'devina-kit-jira-dash'
const MAX_ENTRIES = 24 // 월·계정별로 쌓이므로 오래된 것부터 정리

export interface CacheEntry<T> {
  data: T
  fetchedAt: number
}

/** 계정이 바뀌면 다른 캐시를 보도록 도메인·이메일을 키에 넣는다. */
export function cacheKey(domain: string, email: string, year: number, mm: string): string {
  return `${PREFIX}:${domain}:${email}:${year}-${mm}`
}

export function readCache<T>(key: string): CacheEntry<T> | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CacheEntry<T>
    // fetchedAt이 없거나 미래 시각이면 손상된 것으로 보고 버린다
    if (typeof parsed?.fetchedAt !== 'number' || parsed.fetchedAt > Date.now()) return null
    return parsed
  } catch {
    return null
  }
}

export function writeCache<T>(key: string, data: T): number {
  const fetchedAt = Date.now()
  try {
    localStorage.setItem(key, JSON.stringify({ data, fetchedAt }))
    prune()
  } catch {
    // 용량 초과 등 — 캐시는 실패해도 기능에 영향이 없어야 한다
  }
  return fetchedAt
}

export function dropCache(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // 무시
  }
}

/** 오래된 캐시 정리. MAX_ENTRIES를 넘으면 fetchedAt이 이른 것부터 지운다. */
function prune(): void {
  const entries: { key: string; fetchedAt: number }[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (!k || !k.startsWith(`${PREFIX}:`)) continue
    const c = readCache<unknown>(k)
    entries.push({ key: k, fetchedAt: c?.fetchedAt ?? 0 })
  }
  if (entries.length <= MAX_ENTRIES) return
  entries
    .sort((a, b) => a.fetchedAt - b.fetchedAt)
    .slice(0, entries.length - MAX_ENTRIES)
    .forEach((e) => dropCache(e.key))
}

/** '방금 / N분 전 / N시간 전 / 날짜' */
export function formatAge(fetchedAt: number, now = Date.now()): string {
  const sec = Math.max(0, Math.floor((now - fetchedAt) / 1000))
  if (sec < 60) return '방금 동기화'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}분 전 동기화`
  const hour = Math.floor(min / 60)
  if (hour < 24) return `${hour}시간 전 동기화`
  return `${new Date(fetchedAt).toLocaleDateString('ko-KR')} 동기화`
}
