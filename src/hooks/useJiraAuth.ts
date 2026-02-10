import { useState, useCallback } from 'react'

const STORAGE_KEY = 'devina-kit-jira-auth'

export interface JiraAuth {
  domain: string
  email: string
  token: string
  displayName?: string
}

function load(): JiraAuth | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

export function useJiraAuth() {
  const [auth, setAuth] = useState<JiraAuth | null>(load)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const connect = useCallback(async (domain: string, email: string, token: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/jira/myself', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, email, token }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || '연결 실패')
        return false
      }
      const newAuth: JiraAuth = { domain, email, token, displayName: data.displayName }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAuth))
      setAuth(newAuth)
      return true
    } catch {
      setError('서버에 연결할 수 없습니다')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setAuth(null)
  }, [])

  return { auth, loading, error, connect, disconnect }
}
