import { useState, useRef, useCallback, useEffect } from 'react'
import jsQR from 'jsqr'
import QRCode from 'qrcode'
import ToolCard from '../components/ui/ToolCard'
import CopyButton from '../components/ui/CopyButton'

type Tab = 'encode' | 'decode'

// 오류 정정 레벨 — 높을수록 훼손에 강하지만 같은 내용도 코드가 커진다
const LEVELS = [
  { value: 'L', label: 'L (7%)' },
  { value: 'M', label: 'M (15%)' },
  { value: 'Q', label: 'Q (25%)' },
  { value: 'H', label: 'H (30%)' },
] as const

const SIZES = [256, 512, 1024]

// ─── 인코딩 ───
function EncodePanel() {
  const [text, setText] = useState('')
  const [size, setSize] = useState(512)
  const [level, setLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M')
  const [error, setError] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (!text) {
      canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
      return
    }
    // 다크모드에서도 흰 배경·검은 모듈을 유지한다. 반전시키면 인식률이 떨어진다.
    QRCode.toCanvas(canvas, text, {
      width: size,
      margin: 2,
      errorCorrectionLevel: level,
      color: { dark: '#000000', light: '#FFFFFF' },
    })
      .then(() => setError(''))
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'QR 생성에 실패했습니다')
      })
  }, [text, size, level])

  const download = () => {
    const canvas = canvasRef.current
    if (!canvas || !text) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `qr-${Date.now()}.png`
    a.click()
  }

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          setError('')
        }}
        placeholder="QR로 만들 텍스트 또는 URL을 입력하세요"
        rows={4}
        className="w-full px-3 py-2 rounded border-2 border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm resize-y focus:outline-none focus:border-dewalt transition-colors duration-150"
      />

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500 dark:text-gray-400">크기</span>
          <select
            value={size}
            onChange={(e) => setSize(+e.target.value)}
            className="px-2 py-1 rounded border-2 border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-mono focus:outline-none focus:border-dewalt"
          >
            {SIZES.map((s) => (
              <option key={s} value={s}>{s}px</option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500 dark:text-gray-400">오류 정정</span>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as 'L' | 'M' | 'Q' | 'H')}
            className="px-2 py-1 rounded border-2 border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-mono focus:outline-none focus:border-dewalt"
          >
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </label>

        <span className="text-xs text-gray-400 font-mono">{text.length}자</span>
      </div>

      {error && (
        <div className="px-3 py-2 bg-red-50 dark:bg-red-950/30 rounded border border-red-200 dark:border-red-900 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex flex-col items-center gap-3">
        {/* 캔버스는 항상 마운트해둔다. 조건부로 감추면 ref가 사라져 그릴 대상이 없어진다. */}
        <div
          className={`p-3 bg-white rounded border border-gray-200 dark:border-neutral-700 ${
            text && !error ? '' : 'hidden'
          }`}
        >
          <canvas ref={canvasRef} className="block max-w-full h-auto" />
        </div>

        {text && !error && (
          <div className="flex gap-2">
            <button
              onClick={download}
              className="px-4 py-2 bg-dewalt hover:bg-dewalt-hover text-black text-sm font-semibold rounded transition-colors duration-150"
            >
              PNG 다운로드
            </button>
            <button
              onClick={() => setText('')}
              className="px-4 py-2 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-150"
            >
              초기화
            </button>
          </div>
        )}

        {!text && (
          <p className="py-8 text-sm text-gray-400 dark:text-gray-500">
            텍스트를 입력하면 QR이 바로 생성됩니다
          </p>
        )}
      </div>
    </div>
  )
}

// ─── 디코딩 ───
function DecodePanel() {
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [preview, setPreview] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const decodeImage = useCallback((file: File) => {
    setError('')
    setResult('')

    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) return setError('Canvas를 생성할 수 없습니다')

        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)

        if (code) {
          setResult(code.data)
        } else {
          setError('QR 코드를 찾을 수 없습니다')
        }
      }
      img.src = reader.result as string
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) decodeImage(file)
  }

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) decodeImage(file)
          break
        }
      }
    },
    [decodeImage],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files?.[0]
      if (file && file.type.startsWith('image/')) {
        decodeImage(file)
      }
    },
    [decodeImage],
  )

  const reset = () => {
    setResult('')
    setError('')
    setPreview('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const isUrl = result.startsWith('http://') || result.startsWith('https://')

  return (
    <>
      <div
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 dark:border-neutral-600 rounded-lg p-8 text-center cursor-pointer hover:border-dewalt transition-colors duration-150"
        onClick={() => fileRef.current?.click()}
        tabIndex={0}
      >
        {preview ? (
          <img src={preview} alt="QR 이미지" className="max-h-48 mx-auto rounded" />
        ) : (
          <div className="text-gray-400 dark:text-gray-500">
            <svg
              className="w-10 h-10 mx-auto mb-2 opacity-40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="3" height="3" />
              <rect x="18" y="18" width="3" height="3" />
              <rect x="18" y="14" width="3" height="1" />
              <rect x="14" y="18" width="1" height="3" />
            </svg>
            <p className="text-sm">
              클릭하여 이미지 선택, 드래그 앤 드롭, 또는 <strong>Ctrl+V</strong> 붙여넣기
            </p>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
      </div>

      {result && (
        <div className="mt-4 flex items-start gap-2">
          <div className="flex-1 px-3 py-2 bg-gray-50 dark:bg-neutral-900 rounded border border-gray-200 dark:border-neutral-700">
            {isUrl ? (
              <a
                href={result}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono text-blue-600 dark:text-blue-400 hover:underline break-all"
              >
                {result}
              </a>
            ) : (
              <span className="text-sm font-mono break-all">{result}</span>
            )}
          </div>
          <CopyButton text={result} />
        </div>
      )}

      {error && (
        <div className="mt-4 px-3 py-2 bg-red-50 dark:bg-red-950/30 rounded border border-red-200 dark:border-red-900 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {(result || error || preview) && (
        <button
          onClick={reset}
          className="mt-3 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-150"
        >
          초기화
        </button>
      )}
    </>
  )
}

export default function QRCodeTool() {
  const [tab, setTab] = useState<Tab>('encode')

  return (
    <ToolCard
      title="QR 인코딩/디코딩"
      description="텍스트로 QR 생성, 이미지에서 QR 내용 추출"
    >
      <div className="flex gap-1 mb-4">
        {([
          ['encode', '인코딩'],
          ['decode', '디코딩'],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors duration-150 ${
              tab === value
                ? 'bg-dewalt text-black'
                : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'encode' ? <EncodePanel /> : <DecodePanel />}
    </ToolCard>
  )
}
