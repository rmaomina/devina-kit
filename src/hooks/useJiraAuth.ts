import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

const STORAGE_KEY = 'devina-kit-jira-auth'

export interface JiraAuth {
  domain: string
  email: string
  token: string
  displayName?: string
}

function loadLocal(): JiraAuth | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

export function useJiraAuth() {
  const { user } = useAuth()
  const [auth, setAuth] = useState<JiraAuth | null>(loadLocal)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [remembered, setRemembered] = useState(false)

  // 로그인 시 Supabase에서 JIRA 설정 자동 로드
  useEffect(() => {
    if (!user || !supabase) return
    supabase
      .from('user_jira_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const saved: JiraAuth = {
            domain: data.domain,
            email: data.email,
            token: data.token,
            displayName: data.display_name ?? undefined,
          }
          setAuth(saved)
          setRemembered(true)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
        }
      })
  }, [user])

  const connect = useCallback(
    async (domain: string, email: string, token: string, rememberMe = false) => {
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

        // Supabase에 저장
        if (rememberMe && user && supabase) {
          setRemembered(true)
          await supabase.from('user_jira_settings').upsert(
            {
              user_id: user.id,
              domain,
              email,
              token,
              display_name: data.displayName,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' },
          )
        }

        return true
      } catch {
        setError('서버에 연결할 수 없습니다')
        return false
      } finally {
        setLoading(false)
      }
    },
    [user],
  )

  const disconnect = useCallback(async () => {
    localStorage.removeItem(STORAGE_KEY)
    setAuth(null)
    setRemembered(false)
    // Supabase에서도 삭제
    if (user && supabase) {
      await supabase.from('user_jira_settings').delete().eq('user_id', user.id)
    }
  }, [user])

  return { auth, loading, error, remembered, connect, disconnect }
}
