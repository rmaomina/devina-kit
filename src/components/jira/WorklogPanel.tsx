import { useState, useEffect, useRef, useCallback } from 'react'
import { useJiraAuth } from '../../hooks/useJiraAuth'

interface SearchResult {
  key: string
  summary: string
}

interface WorklogEntry {
  started: string
  timeSpentSeconds: number
  author: { displayName: string }
}

function formatMin(sec: number): string {
  const m = Math.round(sec / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  const rest = m % 60
  return rest > 0 ? `${h}h ${rest}m` : `${h}h`
}

export default function WorklogPanel() {
  const { auth } = useJiraAuth()

  // Search
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [searching, setSearching] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Selected ticket
  const [selected, setSelected] = useState<SearchResult | null>(null)
  const [worklogs, setWorklogs] = useState<WorklogEntry[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)

  // Log form
  const [timeMin, setTimeMin] = useState('')
  const [startDate, setStartDate] = useState('')
  const [logging, setLogging] = useState(false)
  const [logSuccess, setLogSuccess] = useState('')
  const [logError, setLogError] = useState('')

  // ─── Ticket search (debounce 300ms) ───
  useEffect(() => {
    if (!auth || !query.trim()) {
      setResults([])
      setShowDropdown(false)
      return
    }
    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const q = query.trim()
        // key 매칭이면 정확 검색, 아니면 summary 검색
        const isKey = /^[A-Z]+-\d+$/i.test(q)
        const jql = isKey
          ? `key = "${q.toUpperCase()}"`
          : `summary ~ "${q}" ORDER BY updated DESC`

        const res = await fetch('/api/jira/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            domain: auth.domain,
            email: auth.email,
            token: auth.token,
            jql,
            fields: ['summary'],
            maxResults: 10,
            startAt: 0,
          }),
        })
        if (res.ok) {
          const data = await res.json()
          const items: SearchResult[] = (data.issues || []).map(
            (i: { key: string; fields: { summary: string } }) => ({
              key: i.key,
              summary: i.fields.summary,
            }),
          )
          setResults(items)
          setShowDropdown(items.length > 0)
        }
      } catch {
        // silent
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query, auth])

  // ─── Click outside to close dropdown ───
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ─── Fetch worklogs for selected ticket ───
  const fetchWorklogs = useCallback(
    async (issueKey: string) => {
      if (!auth) return
      setLoadingLogs(true)
      try {
        const res = await fetch('/api/jira/issue-worklogs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            domain: auth.domain,
            email: auth.email,
            token: auth.token,
            issueKey,
          }),
        })
        if (res.ok) {
          const data = await res.json()
          setWorklogs(data.worklogs || [])
        }
      } catch {
        // silent
      } finally {
        setLoadingLogs(false)
      }
    },
    [auth],
  )

  // ─── Select ticket ───
  const handleSelect = (item: SearchResult) => {
    setSelected(item)
    setQuery(item.key)
    setShowDropdown(false)
    setLogSuccess('')
    setLogError('')
    fetchWorklogs(item.key)
  }

  // ─── Submit worklog ───
  const handleLog = async () => {
    if (!auth || !selected || !timeMin || !startDate) return
    setLogging(true)
    setLogError('')
    setLogSuccess('')

    try {
      const dateFormatted = startDate.replace(/\./g, '-')
      const res = await fetch('/api/jira/worklog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: auth.domain,
          email: auth.email,
          token: auth.token,
          issueKey: selected.key,
          timeSpentMinutes: parseInt(timeMin),
          startDate: dateFormatted,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Worklog 추가 실패')

      setLogSuccess(`${selected.key} — ${timeMin}m logged`)
      setTimeMin('')
      setStartDate('')
      // refresh worklogs
      fetchWorklogs(selected.key)
    } catch (e) {
      setLogError(e instanceof Error ? e.message : 'Worklog 추가 실패')
    } finally {
      setLogging(false)
    }
  }

  if (!auth) return null

  // Compute worklog display with running total
  const sortedLogs = [...worklogs].sort(
    (a, b) => new Date(a.started).getTime() - new Date(b.started).getTime(),
  )
  let runningTotal = 0

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 pt-4 pb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
          Worklog
        </h3>

        {/* Ticket search */}
        <div ref={wrapperRef} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              if (selected && e.target.value !== selected.key) {
                setSelected(null)
                setWorklogs([])
              }
            }}
            placeholder="티켓 검색 (VAN-123 또는 키워드)"
            className="w-full px-3 py-2 rounded border-2 border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-mono focus:outline-none focus:border-dewalt transition-colors duration-150"
          />
          {searching && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
              ...
            </span>
          )}

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg max-h-60 overflow-y-auto">
              {results.map((r) => (
                <button
                  key={r.key}
                  onClick={() => handleSelect(r)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors duration-100"
                >
                  <span className="text-xs font-mono font-semibold text-dewalt">
                    {r.key}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 truncate">
                    {r.summary}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected ticket info */}
      {selected && (
        <div className="px-4 py-2 border-t border-gray-100 dark:border-neutral-800">
          <div className="text-xs font-mono font-semibold text-dewalt">
            {selected.key}
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
            {selected.summary}
          </div>
        </div>
      )}

      {/* Worklog list */}
      {selected && (
        <div
          className="flex-1 overflow-y-auto px-4 py-2 border-t border-gray-100 dark:border-neutral-800"
          style={{ scrollbarWidth: 'thin' }}
        >
          {loadingLogs ? (
            <p className="text-[11px] text-gray-400 py-2">Loading...</p>
          ) : sortedLogs.length === 0 ? (
            <p className="text-[11px] text-gray-400 py-2">등록된 worklog 없음</p>
          ) : (
            <div className="space-y-0.5">
              {sortedLogs.map((log, i) => {
                runningTotal += log.timeSpentSeconds
                const date = new Date(log.started)
                const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between text-[11px] font-mono py-1 px-2 rounded hover:bg-gray-50 dark:hover:bg-neutral-800/50"
                  >
                    <span className="text-gray-500 dark:text-gray-400">
                      {dateStr}
                    </span>
                    <span className="text-gray-300 dark:text-gray-600 mx-1">|</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {formatMin(log.timeSpentSeconds)}
                    </span>
                    <span className="text-gray-300 dark:text-gray-600 ml-auto text-[10px]">
                      total: {formatMin(runningTotal)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Log form */}
      {selected && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-neutral-700 space-y-2">
          <div className="flex gap-1.5">
            <input
              type="number"
              value={timeMin}
              onChange={(e) => setTimeMin(e.target.value)}
              placeholder="min"
              className="w-16 px-2 py-1.5 rounded border-2 border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-mono focus:outline-none focus:border-dewalt transition-colors duration-150"
            />
            <input
              type="text"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="YYYY.MM.DD"
              className="flex-1 px-2 py-1.5 rounded border-2 border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-mono focus:outline-none focus:border-dewalt transition-colors duration-150"
            />
            <button
              onClick={handleLog}
              disabled={logging || !timeMin || !startDate}
              className="px-3 py-1.5 bg-dewalt hover:bg-dewalt-hover disabled:opacity-50 text-black text-xs font-semibold rounded transition-colors duration-150"
            >
              {logging ? '...' : 'Log'}
            </button>
          </div>

          {logSuccess && (
            <p className="text-[11px] text-emerald-500">{logSuccess}</p>
          )}
          {logError && (
            <p className="text-[11px] text-red-500">{logError}</p>
          )}
        </div>
      )}
    </div>
  )
}
