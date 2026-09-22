import { createContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase, supabaseEnabled } from '../lib/supabase'

export interface AuthContextType {
  user: User | null
  loading: boolean
  configured: boolean
  signInGithub: () => Promise<void>
  signInEmail: (email: string, password: string) => Promise<string | null>
  signUpEmail: (email: string, password: string) => Promise<{ error: string | null; info: string | null }>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(supabaseEnabled)

  useEffect(() => {
    if (!supabase) return

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInGithub = async () => {
    if (!supabase) return
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.origin },
    })
  }

  // Supabase 에러 메시지를 사용자 문구로 변환 (영문 그대로 노출 방지)
  const toMessage = (raw: string): string => {
    if (/Invalid login credentials/i.test(raw)) return '이메일 또는 비밀번호가 올바르지 않습니다'
    if (/Email not confirmed/i.test(raw)) return '이메일 인증이 완료되지 않았습니다. 메일함을 확인해주세요'
    if (/User already registered/i.test(raw)) return '이미 가입된 이메일입니다'
    if (/Password should be at least/i.test(raw)) return '비밀번호는 6자 이상이어야 합니다'
    if (/rate limit|too many/i.test(raw)) return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요'
    return raw
  }

  const signInEmail = async (email: string, password: string) => {
    if (!supabase) return '인증 서비스가 설정되지 않았습니다'
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error ? toMessage(error.message) : null
  }

  const signUpEmail = async (email: string, password: string) => {
    if (!supabase) return { error: '인증 서비스가 설정되지 않았습니다', info: null }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) return { error: toMessage(error.message), info: null }
    // 이미 가입된 이메일은 Supabase가 에러 대신 identities 빈 배열을 돌려준다
    if (data.user && data.user.identities?.length === 0) {
      return { error: '이미 가입된 이메일입니다', info: null }
    }
    // 이메일 확인이 켜져 있으면 세션 없이 user만 돌아온다
    if (data.user && !data.session) {
      return { error: null, info: '확인 메일을 보냈습니다. 메일의 링크를 클릭하면 로그인됩니다' }
    }
    return { error: null, info: null }
  }

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, configured: supabaseEnabled, signInGithub, signInEmail, signUpEmail, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}
