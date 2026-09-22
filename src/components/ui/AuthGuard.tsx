import type { ReactNode } from 'react'
import { useAuth } from '../../hooks/useAuth'
import SignInForm from './SignInForm'

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { user, configured } = useAuth()

  if (user) return <>{children}</>

  return (
    <div className="flex items-center justify-center min-h-[420px] rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40">
      <div className="w-full max-w-[260px] space-y-4">
        <p className="text-sm font-medium text-blue-800 dark:text-blue-200 text-center">
          로그인이 필요한 메뉴입니다
        </p>
        {configured ? (
          <SignInForm />
        ) : (
          <p className="text-xs text-blue-500 dark:text-blue-400 text-center">
            인증 서비스가 설정되지 않았습니다
          </p>
        )}
      </div>
    </div>
  )
}
