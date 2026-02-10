import { useState, useMemo } from 'react'
import ToolCard from '../components/ui/ToolCard'
import CopyButton from '../components/ui/CopyButton'

export default function RatioCalculator() {
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const [c, setC] = useState('')

  const result = useMemo(() => {
    if (!a || !b || !c || +a === 0) return ''
    return ((+b * +c) / +a).toFixed(2)
  }, [a, b, c])

  const reset = () => {
    setA('')
    setB('')
    setC('')
  }

  return (
    <ToolCard title="비율 계산기" description="A : B = C : ? 비율을 계산">
      <div className="flex items-center gap-2 flex-wrap">
        <RatioInput value={a} onChange={setA} placeholder="A" />
        <span className="text-gray-400 font-mono">:</span>
        <RatioInput value={b} onChange={setB} placeholder="B" />
        <span className="text-gray-400 font-mono">=</span>
        <RatioInput value={c} onChange={setC} placeholder="C" />
        <span className="text-gray-400 font-mono">:</span>
        <div className="flex items-center gap-2">
          <code className="w-24 px-3 py-2 bg-amber-50 dark:bg-amber-950/30 rounded border-2 border-dewalt text-sm font-mono font-bold text-center">
            {result || '?'}
          </code>
          {result && <CopyButton text={result} />}
        </div>
      </div>

      {(a || b || c) && (
        <button
          onClick={reset}
          className="mt-4 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-150"
        >
          초기화
        </button>
      )}
    </ToolCard>
  )
}

function RatioInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-24 px-3 py-2 rounded border-2 border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-mono text-center focus:outline-none focus:border-dewalt transition-colors duration-150"
    />
  )
}
