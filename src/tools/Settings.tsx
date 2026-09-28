import ToolCard from '../components/ui/ToolCard'
import SignInForm from '../components/ui/SignInForm'
import JiraSettings from '../components/jira/JiraSettings'
import { useAuth } from '../hooks/useAuth'
import { useJiraAuth } from '../hooks/useJiraAuth'
import { useTheme } from '../hooks/useTheme'

function Section({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="rounded border-2 border-gray-200 dark:border-neutral-700 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
        {title}
      </h3>
      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 mb-3">{hint}</p>
      {children}
    </section>
  )
}

export default function Settings() {
  const { user, configured, signOut } = useAuth()
  const { auth: jiraAuth } = useJiraAuth()
  const { dark, toggle } = useTheme()

  return (
    <ToolCard title="설정" description="일반 설정은 로그인 없이, 계정 설정은 로그인 후 사용합니다">
      <div className="space-y-4 max-w-xl">
        {/* ── 일반: 로그인 없이 이 브라우저에만 적용 ── */}
        <Section title="일반" hint="로그인 없이 사용 · 이 브라우저에만 저장됩니다 (localStorage)">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">테마</span>
              <button
                onClick={toggle}
                className="px-3 py-1.5 text-xs font-medium rounded border-2 border-gray-200 dark:border-neutral-700 hover:border-dewalt transition-colors"
              >
                {dark ? '다크 모드' : '라이트 모드'}
              </button>
            </div>

          </div>
        </Section>

        {/* ── 계정: 로그인해야 쓰는 것들 (JIRA 토큰 포함) ── */}
        <Section title="계정" hint="로그인 필요 · 기기 간 동기화되는 설정입니다">
          {!configured ? (
            <p className="text-sm text-gray-400">인증 서비스가 설정되지 않았습니다</p>
          ) : !user ? (
            <div className="max-w-[280px]">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                로그인하면 JIRA 토큰과 즐겨찾기가 계정에 저장됩니다.
              </p>
              <SignInForm />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{user.email}</p>
                  <p className="text-[11px] text-gray-400">
                    {user.app_metadata?.provider ?? 'email'} 로그인
                  </p>
                </div>
                <button
                  onClick={signOut}
                  className="px-3 py-1.5 text-xs font-medium rounded border-2 border-gray-200 dark:border-neutral-700 hover:border-red-400 hover:text-red-500 transition-colors"
                >
                  로그아웃
                </button>
              </div>

              <div className="border-t border-gray-100 dark:border-neutral-800 pt-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">JIRA 토큰 관리</p>
                {jiraAuth ? (
                  <JiraSettings />
                ) : (
                  <p className="text-sm text-gray-400">
                    JIRA Dashboard에서 먼저 연결하면 여기서 토큰을 관리할 수 있습니다.
                  </p>
                )}
              </div>
            </div>
          )}
        </Section>
      </div>
    </ToolCard>
  )
}
