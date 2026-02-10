import { useState, useMemo } from 'react'
import ToolCard from '../components/ui/ToolCard'
import CopyButton from '../components/ui/CopyButton'

export default function JsonFormatter() {
  const [input, setInput] = useState('')
  const [indent, setIndent] = useState(2)
  const [sortKeys, setSortKeys] = useState(false)

  const result = useMemo(() => {
    if (!input.trim()) return { ok: true, text: '', error: '' }
    try {
      const parsed = JSON.parse(input)
      const formatted = sortKeys
        ? JSON.stringify(sortObject(parsed), null, indent)
        : JSON.stringify(parsed, null, indent)
      return { ok: true, text: formatted, error: '' }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      return { ok: false, text: '', error: msg }
    }
  }, [input, indent, sortKeys])

  const minify = () => {
    if (!input.trim()) return
    try {
      const parsed = JSON.parse(input)
      setInput(JSON.stringify(parsed))
    } catch {
      // 에러 무시 - 이미 result에서 표시됨
    }
  }

  return (
    <ToolCard title="JSON Formatter" description="JSON 데이터를 보기 좋게 정렬하고 오류를 확인">
      {/* 옵션 바 */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <div className="flex gap-1.5">
          {[2, 4].map((n) => (
            <button
              key={n}
              onClick={() => setIndent(n)}
              className={`px-3 py-1 text-xs rounded font-medium transition-colors duration-150 ${
                indent === n
                  ? 'bg-dewalt text-black'
                  : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              {n} spaces
            </button>
          ))}
          <button
            onClick={() => setIndent(0)}
            className={`px-3 py-1 text-xs rounded font-medium transition-colors duration-150 ${
              indent === 0
                ? 'bg-dewalt text-black'
                : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            Tab
          </button>
        </div>
        <label className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={sortKeys}
            onChange={(e) => setSortKeys(e.target.checked)}
            className="accent-[#FECC02]"
          />
          키 정렬
        </label>
        <button
          onClick={minify}
          className="px-3 py-1 text-xs rounded font-medium bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors duration-150"
        >
          Minify
        </button>
      </div>

      {/* 입력 */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder='{"key": "value"}'
        rows={8}
        spellCheck={false}
        className="w-full p-3 rounded-lg border-2 border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-mono resize-y focus:outline-none focus:border-dewalt transition-colors duration-150"
      />

      {/* 결과 */}
      {input.trim() && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-xs font-medium ${
                result.ok ? 'text-emerald-500' : 'text-red-500'
              }`}
            >
              {result.ok ? '\u2713 Valid JSON' : '\u2717 Error'}
            </span>
            {result.ok && result.text && <CopyButton text={result.text} />}
          </div>
          <pre
            className={`p-3 rounded-lg text-xs font-mono overflow-auto max-h-80 ${
              result.ok
                ? 'bg-gray-50 dark:bg-neutral-900 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-neutral-700'
                : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900'
            }`}
          >
            {result.ok ? result.text : result.error}
          </pre>
        </div>
      )}

      {input && (
        <button
          onClick={() => setInput('')}
          className="mt-3 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-150"
        >
          초기화
        </button>
      )}
    </ToolCard>
  )
}

// 키를 알파벳 순으로 재귀 정렬
function sortObject(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(sortObject)
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj as Record<string, unknown>)
      .sort()
      .reduce((acc, key) => {
        acc[key] = sortObject((obj as Record<string, unknown>)[key])
        return acc
      }, {} as Record<string, unknown>)
  }
  return obj
}
