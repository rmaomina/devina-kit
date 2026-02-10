import { useState, useMemo } from 'react'
import ToolCard from '../components/ui/ToolCard'

export default function CharCounter() {
  const [text, setText] = useState('')

  const stats = useMemo(() => {
    const bytes = new TextEncoder().encode(text).length
    const noSpace = text.replace(/\s/g, '').length
    const lines = text ? text.split('\n').length : 0
    return { total: text.length, noSpace, bytes, lines }
  }, [text])

  return (
    <ToolCard title="글자수 체크" description="텍스트의 글자수, 바이트 수를 실시간으로 확인">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="텍스트를 입력하세요..."
        rows={6}
        className="w-full p-3 rounded-lg border-2 border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-mono resize-y focus:outline-none focus:border-dewalt transition-colors duration-150"
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        <StatBox label="전체 글자" value={stats.total} />
        <StatBox label="공백 제외" value={stats.noSpace} />
        <StatBox label="바이트" value={stats.bytes} />
        <StatBox label="줄 수" value={stats.lines} />
      </div>
      {text && (
        <button
          onClick={() => setText('')}
          className="mt-3 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-150"
        >
          초기화
        </button>
      )}
    </ToolCard>
  )
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="px-3 py-3 rounded-lg bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-center">
      <div className="text-xl font-bold font-mono">{value.toLocaleString()}</div>
      <div className="text-xs text-gray-400 mt-0.5">{label}</div>
    </div>
  )
}
