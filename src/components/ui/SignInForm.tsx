import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

const inputClass =
  'w-full px-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-neutral-600 ' +
  'bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-100 ' +
  'placeholder:text-gray-400 focus:outline-none focus:border-dewalt'

export default function SignInForm({ onDone }: { onDone?: () => void }) {
  const { signInGithub, signInEmail, signUpEmail } = useAuth()

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfo('')

    const mail = email.trim()
    if (!mail || !password) {
      setError('이메일과 비밀번호를 입력해주세요')
      return
    }
    if (mode === 'signup' && password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다')
      return
    }

    setBusy(true)
    try {
      if (mode === 'signin') {
        const err = await signInEmail(mail, password)
        if (err) setError(err)
        else onDone?.()
      } else {
        const { error: err, info: msg } = await signUpEmail(mail, password)
        if (err) setError(err)
        else if (msg) setInfo(msg)
        else onDone?.()
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={signInGithub}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-medium rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
        GitHub로 계속하기
      </button>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-gray-200 dark:bg-neutral-700" />
        <span className="text-[10px] text-gray-400">또는</span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-neutral-700" />
      </div>

      <form onSubmit={submit} className="space-y-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일"
          autoComplete="email"
          className={inputClass}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          className={inputClass}
        />
        <button
          type="submit"
          disabled={busy}
          className="w-full px-3 py-2 bg-dewalt hover:bg-dewalt-hover disabled:opacity-50 text-black text-xs font-semibold rounded-lg transition-colors"
        >
          {busy ? '처리 중...' : mode === 'signin' ? '로그인' : '회원가입'}
        </button>
      </form>

      {error && <p className="text-[11px] text-red-500 text-center">{error}</p>}
      {info && <p className="text-[11px] text-green-600 dark:text-green-400 text-center">{info}</p>}

      <button
        onClick={() => {
          setMode((m) => (m === 'signin' ? 'signup' : 'signin'))
          setError('')
          setInfo('')
        }}
        className="w-full text-[11px] text-gray-500 dark:text-gray-400 hover:text-dewalt transition-colors"
      >
        {mode === 'signin' ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
      </button>
    </div>
  )
}
