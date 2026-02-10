import { useState } from 'react'
import ToolCard from '../components/ui/ToolCard'
import CopyButton from '../components/ui/CopyButton'

export default function URLDecoder() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [hops, setHops] = useState<string[]>([])

  const resolve = async () => {
    const url = input.trim()
    if (!url) return

    // 간단한 URL 형식 검증
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setError('http:// 또는 https://로 시작하는 URL을 입력하세요')
      return
    }

    setLoading(true)
    setError('')
    setResult('')
    setHops([])

    try {
      const res = await fetch(`/api/resolve-url?url=${encodeURIComponent(url)}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '요청에 실패했습니다')
        return
      }

      setResult(data.finalUrl)
      if (data.hops && data.hops.length > 0) {
        setHops(data.hops)
      }
    } catch {
      setError('서버에 연결할 수 없습니다. 개발 환경에서는 Vercel 배포가 필요합니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') resolve()
  }

  const reset = () => {
    setInput('')
    setResult('')
    setError('')
    setHops([])
  }

  return (
    <ToolCard title="단축URL 디코딩" description="단축 URL의 최종 목적지 URL을 확인">
      <div className="flex gap-2">
        <input
          type="url"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://bit.ly/xxxxx"
          className="flex-1 px-3 py-2 rounded border-2 border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-mono focus:outline-none focus:border-dewalt transition-colors duration-150"
        />
        <button
          onClick={resolve}
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-dewalt hover:bg-dewalt-hover disabled:opacity-50 text-black text-sm font-semibold rounded transition-colors duration-150"
        >
          {loading ? '확인 중...' : '확인'}
        </button>
      </div>

      {/* 리다이렉트 경로 */}
      {hops.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
            리다이렉트 경로 ({hops.length}단계)
          </p>
          <div className="space-y-1">
            {hops.map((hop, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-mono text-gray-500 dark:text-gray-400">
                <span className="text-gray-300 dark:text-gray-600 shrink-0">
                  {i + 1}.
                </span>
                <span className="break-all">{hop}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 최종 결과 */}
      {result && (
        <div className="mt-4">
          <p className="text-xs text-emerald-500 font-medium mb-1">
            최종 URL
          </p>
          <div className="flex items-start gap-2">
            <div className="flex-1 px-3 py-2 bg-gray-50 dark:bg-neutral-900 rounded border border-gray-200 dark:border-neutral-700">
              <a
                href={result}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono text-blue-600 dark:text-blue-400 hover:underline break-all"
              >
                {result}
              </a>
            </div>
            <CopyButton text={result} />
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 px-3 py-2 bg-red-50 dark:bg-red-950/30 rounded border border-red-200 dark:border-red-900 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {(result || error) && (
        <button
          onClick={reset}
          className="mt-3 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-150"
        >
          초기화
        </button>
      )}
    </ToolCard>
  )
}
