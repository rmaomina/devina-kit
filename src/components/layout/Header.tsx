import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'

interface HeaderProps {
  dark: boolean
  onToggleTheme: () => void
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

function formatTime(date: Date): string {
  const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
  const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']

  const month = months[date.getMonth()]
  const day = date.getDate()
  const week = getWeekNumber(date)
  const dayOfWeek = days[date.getDay()]
  const ampm = date.getHours() < 12 ? '오전' : '오후'
  const hours = date.getHours() % 12 || 12
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${month} ${day}일 ${week}주차 (${dayOfWeek}) ${ampm} ${hours}:${minutes}:${seconds}  ٩( ᐛ )و`
}

export default function Header({ dark, onToggleTheme }: HeaderProps) {
  const [time, setTime] = useState(() => formatTime(new Date()))
  const { user, configured, signInGithub, signInGoogle, signOut } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(formatTime(new Date()))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    if (showMenu) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showMenu])

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? '??'

  return (
    <header className="h-12 flex items-center justify-between px-5 shrink-0 border-b border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#171717] transition-colors duration-150">
      <div className="flex items-center gap-3">
        <span className="font-bold text-sm tracking-tight text-[#1A1A1A] dark:text-[#F5F5F5]">
          devina-kit
        </span>
        <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500 tabular-nums">
          {time}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleTheme}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors duration-150"
          title={dark ? '라이트 모드' : '다크 모드'}
        >
          {dark ? '\u2600\uFE0F' : '\uD83C\uDF19'}
        </button>

        {/* Auth */}
        {configured && (
        <div className="relative" ref={menuRef}>
          {user ? (
            <button
              onClick={() => setShowMenu((v) => !v)}
              className="w-8 h-8 rounded-lg bg-dewalt/20 text-dewalt text-[10px] font-bold flex items-center justify-center hover:bg-dewalt/30 transition-colors duration-150"
              title={user.email ?? ''}
            >
              {initials}
            </button>
          ) : (
            <button
              onClick={() => setShowMenu((v) => !v)}
              className="px-3 py-1.5 text-[11px] font-semibold bg-dewalt hover:bg-dewalt-hover text-black rounded-lg transition-colors duration-150"
            >
              로그인
            </button>
          )}

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-700 py-1 z-50">
              {user ? (
                <>
                  <div className="px-3 py-2 text-[11px] text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-neutral-700 truncate">
                    {user.email}
                  </div>
                  <button
                    onClick={() => { signOut(); setShowMenu(false) }}
                    className="w-full text-left px-3 py-2 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { signInGithub(); setShowMenu(false) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    GitHub로 로그인
                  </button>
                  <button
                    onClick={() => { signInGoogle(); setShowMenu(false) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google로 로그인
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        )}
      </div>
    </header>
  )
}
