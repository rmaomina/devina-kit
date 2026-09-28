import { createContext, useState, useCallback, useEffect } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

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


export interface JiraAuthContextType {
  auth: JiraAuth | null
  loading: boolean
  error: string
  remembered: boolean
  tokenInvalid: boolean
  accountId: string | null
  /** worklog 입력 등으로 JIRA 데이터가 바뀌었을 때 올린다. 대시보드가 이 값을 보고 캐시를 버린다. */
  dataVersion: number
  bumpDataVersion: () => void
  connect: (domain: string, email: string, token: string, rememberMe?: boolean) => Promise<boolean>
  disconnect: () => Promise<void>
}

export const JiraAuthContext = createContext<JiraAuthContextType | undefined>(undefined)

export function JiraAuthProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [auth, setAuth] = useState<JiraAuth | null>(loadLocal)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [remembered, setRemembered] = useState(false)
  const [tokenInvalid, setTokenInvalid] = useState(false)
  // 본인 worklog만 골라내려면 accountId가 필요하다. myself 검증 응답에서 받아둔다.
  const [accountId, setAccountId] = useState<string | null>(null)
  const [dataVersion, setDataVersion] = useState(0)
  const bumpDataVersion = useCallback(() => setDataVersion((v) => v + 1), [])

  // 저장된 토큰은 만료돼도 displayName이 그대로 보여 정상처럼 착각하게 된다.
  // 게다가 JIRA의 /search/jql·issue/picker는 인증 실패에도 200 + 빈 결과를
  // 돌려주므로(myself만 401), 로드 시 myself로 한 번 검증해야 한다.
  useEffect(() => {
    if (!auth) {
      setTokenInvalid(false)
      setAccountId(null)
      return
    }
    let cancelled = false
    fetch('/api/jira/myself', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain: auth.domain, email: auth.email, token: auth.token }),
    })
      .then(async (res) => {
        if (cancelled) return
        setTokenInvalid(!res.ok)
        if (res.ok) {
          const data = await res.json()
          if (!cancelled) setAccountId(data.accountId ?? null)
        }
      })
      .catch(() => {
        // 네트워크 오류는 토큰 문제로 단정하지 않는다
      })
    return () => {
      cancelled = true
    }
  }, [auth])

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

  return (
    <JiraAuthContext.Provider
      value={{ auth, loading, error, remembered, tokenInvalid, accountId, dataVersion, bumpDataVersion, connect, disconnect }}
    >
      {children}
    </JiraAuthContext.Provider>
  )
}
