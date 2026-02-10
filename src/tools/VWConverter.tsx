import { useState } from 'react'
import ToolCard from '../components/ui/ToolCard'
import CopyButton from '../components/ui/CopyButton'

export default function VWConverter() {
  const [viewport, setViewport] = useState(1920)
  const [px, setPx] = useState('')
  const [vw, setVw] = useState('')

  const pxToVw = (pxVal: string) => {
    if (!pxVal || !viewport) return ''
    return ((parseFloat(pxVal) / viewport) * 100).toFixed(4)
  }

  const vwToPx = (vwVal: string) => {
    if (!vwVal || !viewport) return ''
    return ((parseFloat(vwVal) * viewport) / 100).toFixed(2)
  }

  const reset = () => {
    setPx('')
    setVw('')
  }

  return (
    <ToolCard title="VW 변환기" description="기준 viewport 기반으로 px ↔ vw 상호 변환">
      <div className="mb-4">
        <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">
          기준 Viewport (px)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={viewport}
            onChange={(e) => setViewport(+e.target.value)}
            className="w-40 px-3 py-2 rounded border-2 border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-mono focus:outline-none focus:border-dewalt transition-colors duration-150"
          />
          {[375, 768, 1280, 1920].map((v) => (
            <button
              key={v}
              onClick={() => setViewport(v)}
              className={`px-2 py-1 text-xs rounded font-medium transition-colors duration-150 ${
                viewport === v
                  ? 'bg-dewalt text-black'
                  : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-700'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">PX → VW</label>
          <input
            type="number"
            value={px}
            onChange={(e) => setPx(e.target.value)}
            placeholder="px 값 입력"
            className="w-full px-3 py-2 rounded border-2 border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-mono focus:outline-none focus:border-dewalt transition-colors duration-150"
          />
          {px && (
            <div className="mt-2 flex items-center gap-2">
              <code className="px-3 py-1.5 bg-gray-50 dark:bg-neutral-900 rounded text-sm font-mono border border-gray-200 dark:border-neutral-700">
                {pxToVw(px)}vw
              </code>
              <CopyButton text={`${pxToVw(px)}vw`} />
            </div>
          )}
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">VW → PX</label>
          <input
            type="number"
            value={vw}
            onChange={(e) => setVw(e.target.value)}
            placeholder="vw 값 입력"
            className="w-full px-3 py-2 rounded border-2 border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-mono focus:outline-none focus:border-dewalt transition-colors duration-150"
          />
          {vw && (
            <div className="mt-2 flex items-center gap-2">
              <code className="px-3 py-1.5 bg-gray-50 dark:bg-neutral-900 rounded text-sm font-mono border border-gray-200 dark:border-neutral-700">
                {vwToPx(vw)}px
              </code>
              <CopyButton text={`${vwToPx(vw)}px`} />
            </div>
          )}
        </div>
      </div>

      {(px || vw) && (
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
