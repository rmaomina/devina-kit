import { useState } from 'react'
import { useJiraAuth } from '../../hooks/useJiraAuth'

const TOKEN_URL = 'https://id.atlassian.com/manage-profile/security/api-tokens'

const inputClass =
  'w-full px-3 py-2 rounded border-2 border-gray-200 dark:border-neutral-700 ' +
  'bg-white dark:bg-neutral-900 text-sm font-mono text-gray-800 dark:text-gray-100 ' +
  'placeholder:text-gray-400 focus:outline-none focus:border-dewalt transition-colors duration-150'

export default function JiraSettings({ onClose }: { onClose?: () => void }) {
  const { auth, loading, error, remembered, tokenInvalid, connect, disconnect } = useJiraAuth()

  const [domain, setDomain] = useState(auth?.domain ?? '')
  const [email, setEmail] = useState(auth?.email ?? '')
  const [token, setToken] = useState('')
  const [keep, setKeep] = useState(remembered)
  const [saved, setSaved] = useState(false)

  if (!auth) return null

  // 토큰은 저장값을 되돌려주지 않는다. 비워두면 기존 토큰을 그대로 쓴다.
  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(false)
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/+$/, '')
    const ok = await connect(cleanDomain, email.trim(), token.trim() || auth.token, keep)
    if (ok) {
      setToken('')
      setSaved(true)
    }
  }

  return (
    <div className="rounded border-2 border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          JIRA 연결 설정
        </h4>
        {onClose && (
          <button
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-dewalt transition-colors"
          >
            닫기
          </button>
        )}
      </div>

      <form onSubmit={save} className="max-w-sm space-y-3">
        <label className="block">
          <span className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1">도메인</span>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="domain.atlassian.net"
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1">이메일</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1">
            API 토큰{' '}
            <span className={tokenInvalid ? 'text-red-500' : 'text-gray-400'}>
              (현재 {'•'.repeat(12)} · {auth.token.length}자
              {tokenInvalid ? ' · 인증 실패' : ' · 정상'})
            </span>
          </span>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="새 토큰으로 교체하려면 입력 (비우면 유지)"
            autoComplete="off"
            className={inputClass}
          />
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={keep}
            onChange={(e) => setKeep(e.target.checked)}
            className="w-4 h-4 accent-dewalt rounded"
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            내 계정에 저장 (다른 기기에서도 사용)
          </span>
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {saved && <p className="text-sm text-green-600 dark:text-green-400">저장했습니다</p>}

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={loading || !domain || !email}
            className="px-4 py-2 bg-dewalt hover:bg-dewalt-hover disabled:opacity-50 text-black text-sm font-semibold rounded transition-colors duration-150"
          >
            {loading ? '확인 중...' : '저장'}
          </button>
          <button
            type="button"
            onClick={disconnect}
            className="px-4 py-2 text-sm text-gray-400 hover:text-red-500 transition-colors duration-150"
            title="저장된 설정을 모두 삭제합니다"
          >
            연결 해제
          </button>
        </div>

        <p className="text-[11px] text-gray-400 dark:text-gray-500">
          저장 시 실제 JIRA에 인증을 시도해 성공한 값만 반영됩니다.{' '}
          <a
            href={TOKEN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-dewalt"
          >
            토큰 발급
          </a>
        </p>
      </form>
    </div>
  )
}
