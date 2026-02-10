import { useState } from 'react'
import ToolCard from '../components/ui/ToolCard'
import CopyButton from '../components/ui/CopyButton'

export default function UUIDGenerator() {
  const gen = () => crypto.randomUUID()
  const [uuids, setUuids] = useState<string[]>(() => [gen()])
  const [count, setCount] = useState(1)

  const generate = () => {
    setUuids(Array.from({ length: count }, () => gen()))
  }

  return (
    <ToolCard title="UUID 생성기" description="랜덤 UUID v4를 생성하고 클립보드에 복사">
      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm text-gray-500 dark:text-gray-400">생성 개수</label>
        <input
          type="number"
          min={1}
          max={50}
          value={count}
          onChange={(e) => setCount(Math.max(1, Math.min(50, +e.target.value)))}
          className="w-20 px-2 py-1.5 rounded border-2 border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-mono focus:outline-none focus:border-dewalt transition-colors duration-150"
        />
        <button
          onClick={generate}
          className="px-4 py-1.5 bg-dewalt hover:bg-dewalt-hover text-black text-sm font-semibold rounded transition-colors duration-150"
        >
          생성
        </button>
      </div>
      <div className="space-y-2">
        {uuids.map((u, i) => (
          <div key={i} className="flex items-center gap-2 group">
            <code className="flex-1 px-3 py-2 bg-gray-50 dark:bg-neutral-900 rounded text-sm font-mono border border-gray-200 dark:border-neutral-700 select-all">
              {u}
            </code>
            <CopyButton text={u} />
          </div>
        ))}
      </div>
      {uuids.length > 1 && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-gray-400">전체 복사:</span>
          <CopyButton text={uuids.join('\n')} />
        </div>
      )}
    </ToolCard>
  )
}
