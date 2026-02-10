import { useState, useEffect } from 'react'

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

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(formatTime(new Date()))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

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
      <button
        onClick={onToggleTheme}
        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors duration-150"
        title={dark ? '라이트 모드' : '다크 모드'}
      >
        {dark ? '\u2600\uFE0F' : '\uD83C\uDF19'}
      </button>
    </header>
  )
}
