import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import ToolCard from '../components/ui/ToolCard'
import CopyButton from '../components/ui/CopyButton'
import { useJiraAuth } from '../hooks/useJiraAuth'

// ─── Types ───
interface JiraIssue {
  key: string
  fields: {
    summary: string
    status: { name: string }
    project: { key: string }
    timespent: number | null
    resolutiondate: string | null
  }
}

interface ProjectWorklog { project: string; hours: number }
interface StatusCount { status: string; count: number }
interface ClosedTicket { key: string; summary: string; status: string; resolved: string }

// ─── Constants ───
const COLORS = {
  dewalt: '#FECC02',
  dark: '#1A1A1A',
  Done: '#22C55E',
  'QA Done': '#3B82F6',
  'Deployment Done': '#F59E0B',
  fallback: '#9CA3AF',
}

const getStatusColor = (s: string) => COLORS[s as keyof typeof COLORS] || COLORS.fallback

const normalizeStatus = (s: string): string => {
  const up = s.toUpperCase()
  if (up === 'QA DONE') return 'QA Done'
  if (up === 'DEPLOYMENT DONE') return 'Deployment Done'
  if (up === 'DONE') return 'Done'
  return s
}

const getNextMonth = (y: number, m: number) =>
  m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`

// ─── JIRA Fetch (with pagination) ───
async function fetchJira(
  domain: string, email: string, token: string, jql: string
): Promise<JiraIssue[]> {
  const all: JiraIssue[] = []
  let startAt = 0

  while (true) {
    const res = await fetch('/api/jira/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        domain, email, token, jql,
        fields: ['summary', 'status', 'project', 'timespent', 'resolutiondate'],
        maxResults: 100, startAt,
      }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'JIRA API error')
    }
    const data = await res.json()
    all.push(...data.issues)
    if (startAt + data.maxResults >= data.total) break
    startAt += data.maxResults
  }
  return all
}

// ─── Component ───
export default function JiraDashboard() {
  const { auth, loading: authLoading, error: authError, remembered, connect, disconnect } = useJiraAuth()

  // Auth form
  const [domain, setDomain] = useState('')
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  // Dashboard state
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [projectData, setProjectData] = useState<ProjectWorklog[]>([])
  const [statusData, setStatusData] = useState<StatusCount[]>([])
  const [recentClosings, setRecentClosings] = useState<ClosedTicket[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Worklog form moved to WorklogPanel

  const mm = String(month).padStart(2, '0')
  const nextMonth = getNextMonth(year, month)

  // ─── Data Fetch ───
  const loadData = useCallback(async () => {
    if (!auth) return
    setLoading(true)
    setError('')

    try {
      const worklogJql = `worklogDate >= "${year}-${mm}-01" AND worklogDate < "${nextMonth}" AND worklogAuthor = currentUser()`
      const closedJql = `resolved >= "${year}-${mm}-01" AND resolved < "${nextMonth}" AND assignee = currentUser() AND status in (Done, "QA Done", "QA DONE", "Deployment Done")`

      const [worklogIssues, closedIssues] = await Promise.all([
        fetchJira(auth.domain, auth.email, auth.token, worklogJql),
        fetchJira(auth.domain, auth.email, auth.token, closedJql),
      ])

      // Project worklog
      const pMap = new Map<string, number>()
      worklogIssues.forEach((i) => {
        const pk = i.fields.project.key
        pMap.set(pk, (pMap.get(pk) || 0) + (i.fields.timespent || 0) / 3600)
      })
      setProjectData(
        Array.from(pMap, ([project, hours]) => ({ project, hours: Math.round(hours * 10) / 10 }))
          .sort((a, b) => b.hours - a.hours)
      )

      // Status counts
      const sMap = new Map<string, number>()
      const tickets: ClosedTicket[] = []
      closedIssues.forEach((i) => {
        const st = normalizeStatus(i.fields.status.name)
        sMap.set(st, (sMap.get(st) || 0) + 1)
        tickets.push({
          key: i.key,
          summary: i.fields.summary,
          status: st,
          resolved: i.fields.resolutiondate || '',
        })
      })
      setStatusData(
        Array.from(sMap, ([status, count]) => ({ status, count })).sort((a, b) => b.count - a.count)
      )
      setRecentClosings(
        tickets.sort((a, b) => new Date(b.resolved).getTime() - new Date(a.resolved).getTime()).slice(0, 5)
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [auth, year, mm, nextMonth])

  useEffect(() => { loadData() }, [loadData])

  // Worklog add is now handled by the right-side WorklogPanel

  // ─── Auth Form ───
  if (!auth) {
    return (
      <ToolCard title="JIRA Dashboard" description="Connect your JIRA account to view worklog & ticket data">
        <div className="max-w-sm space-y-3">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="domain.atlassian.net"
            className="w-full px-3 py-2 rounded border-2 border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-mono focus:outline-none focus:border-dewalt transition-colors duration-150"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className="w-full px-3 py-2 rounded border-2 border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-mono focus:outline-none focus:border-dewalt transition-colors duration-150"
          />
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="API token"
            className="w-full px-3 py-2 rounded border-2 border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-mono focus:outline-none focus:border-dewalt transition-colors duration-150"
          />
          {authError && (
            <p className="text-sm text-red-500">{authError}</p>
          )}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 accent-dewalt rounded"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">JIRA 설정 기억하기</span>
          </label>
          <button
            onClick={() => {
              const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/+$/, '')
              connect(cleanDomain, email, token, rememberMe)
            }}
            disabled={authLoading || !domain || !email || !token}
            className="w-full px-4 py-2 bg-dewalt hover:bg-dewalt-hover disabled:opacity-50 text-black text-sm font-semibold rounded transition-colors duration-150"
          >
            {authLoading ? 'Connecting...' : 'Connect'}
          </button>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            {remembered ? 'Saved to your account.' : 'Token is stored in localStorage only.'}{' '}
            <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noopener noreferrer" className="underline hover:text-dewalt">
              Atlassian API Tokens
            </a>
          </p>
        </div>
      </ToolCard>
    )
  }

  // ─── Dashboard ───
  const totalHours = projectData.reduce((s, d) => s + d.hours, 0)
  const totalClosed = statusData.reduce((s, d) => s + d.count, 0)

  return (
    <ToolCard title="JIRA Dashboard" description={`${auth.displayName || auth.email}`}>
      <div className="space-y-5">
        {/* Top bar: Year/Month + Worklog + Disconnect */}
        <div className="flex flex-wrap items-end gap-4">
          {/* Year */}
          <select
            value={year}
            onChange={(e) => setYear(+e.target.value)}
            className="px-2 py-1.5 rounded border-2 border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-mono focus:outline-none focus:border-dewalt transition-colors duration-150"
          >
            {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>

          {/* Months */}
          <div className="flex gap-1">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <button
                key={m}
                onClick={() => setMonth(m)}
                className={`w-7 h-7 text-xs rounded font-mono font-medium transition-colors duration-150 ${
                  month === m
                    ? 'bg-dewalt text-black font-bold'
                    : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-700'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Disconnect */}
          <button
            onClick={disconnect}
            className="px-2 py-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors duration-150"
            title="Disconnect"
          >
            Disconnect
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="px-3 py-1.5 bg-red-50 dark:bg-red-950/30 rounded border border-red-200 dark:border-red-900 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="py-12 text-center text-gray-400 dark:text-gray-500 font-mono text-sm">
            Loading {year}.{mm} data...
          </div>
        )}

        {/* Charts */}
        {!loading && (
          <>
            {/* Summary stats */}
            <div className="flex gap-4">
              <div className="px-4 py-3 rounded-lg bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700">
                <div className="text-2xl font-bold font-mono">{totalHours.toFixed(1)}<span className="text-sm text-gray-400 ml-1">h</span></div>
                <div className="text-[11px] text-gray-400">Total Effort</div>
              </div>
              <div className="px-4 py-3 rounded-lg bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700">
                <div className="text-2xl font-bold font-mono">{totalClosed}</div>
                <div className="text-[11px] text-gray-400">Tickets Closed</div>
              </div>
            </div>

            {/* Chart row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Effort by Project */}
              <div className="rounded-lg bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 p-4">
                <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                  Effort by Project
                </h3>
                {projectData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={Math.max(projectData.length * 36, 120)}>
                    <BarChart data={projectData} layout="vertical" margin={{ left: 40, right: 20, top: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#333" />
                      <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                      <YAxis type="category" dataKey="project" tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'monospace' }} width={40} />
                      <Tooltip
                        contentStyle={{ background: '#1A1A1A', border: '1px solid #FECC02', borderRadius: 6, fontSize: 12 }}
                        labelStyle={{ color: '#FECC02', fontFamily: 'monospace' }}
                        formatter={(v: number | undefined) => [`${v ?? 0}h`, 'Effort']}
                      />
                      <Bar dataKey="hours" fill={COLORS.dewalt} radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="py-8 text-center text-sm text-gray-400">No worklog data</p>
                )}
              </div>

              {/* Tickets Closed */}
              <div className="rounded-lg bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 p-4">
                <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                  Tickets Closed
                </h3>
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={statusData} margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                      <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ background: '#1A1A1A', border: '1px solid #FECC02', borderRadius: 6, fontSize: 12 }}
                        labelStyle={{ color: '#FECC02' }}
                        formatter={(v: number | undefined) => [v ?? 0, 'Tickets']}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                        {statusData.map((d, i) => (
                          <Cell key={i} fill={getStatusColor(d.status)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="py-8 text-center text-sm text-gray-400">No closed tickets</p>
                )}
              </div>
            </div>

            {/* Recent Closings */}
            <div className="rounded-lg bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 p-4">
              <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                Recent Closings
              </h3>
              {recentClosings.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-neutral-700 text-left text-[11px] text-gray-400 uppercase tracking-wider">
                      <th className="py-1.5 pr-3">Key</th>
                      <th className="py-1.5 pr-3">Summary</th>
                      <th className="py-1.5 pr-3">Status</th>
                      <th className="py-1.5">Resolved</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentClosings.map((t) => (
                      <tr key={t.key} className="border-b border-gray-100 dark:border-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors duration-100">
                        <td className="py-1.5 pr-3 font-mono text-xs">
                          <div className="flex items-center gap-1">
                            <span>{t.key}</span>
                            <CopyButton text={t.key} />
                          </div>
                        </td>
                        <td className="py-1.5 pr-3 text-xs truncate max-w-[240px]">{t.summary}</td>
                        <td className="py-1.5 pr-3">
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-white"
                            style={{ backgroundColor: getStatusColor(t.status) }}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="py-1.5 font-mono text-xs text-gray-400">
                          {t.resolved ? new Date(t.resolved).toLocaleDateString('ko-KR') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="py-6 text-center text-sm text-gray-400">No closed tickets</p>
              )}
            </div>
          </>
        )}
      </div>
    </ToolCard>
  )
}
