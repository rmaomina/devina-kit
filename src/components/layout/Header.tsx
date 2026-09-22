import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import SignInForm from '../ui/SignInForm'

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
  const { user, configured, signOut } = useAuth()
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
            <div className="absolute right-0 top-full mt-1 w-60 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-700 py-1 z-50">
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
                <div className="px-3 py-2">
                  <SignInForm onDone={() => setShowMenu(false)} />
                </div>
              )}
            </div>
          )}
        </div>
        )}
      </div>
    </header>
  )
}
