import { useState, useRef, useCallback } from 'react'
import jsQR from 'jsqr'
import ToolCard from '../components/ui/ToolCard'
import CopyButton from '../components/ui/CopyButton'

export default function QRDecoder() {
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
    [decodeImage]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files?.[0]
      if (file && file.type.startsWith('image/')) {
        decodeImage(file)
      }
    },
    [decodeImage]
  )

  const reset = () => {
    setResult('')
    setError('')
    setPreview('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const isUrl = result.startsWith('http://') || result.startsWith('https://')

  return (
    <ToolCard title="QR 디코딩" description="이미지 업로드/붙여넣기로 QR 내용 추출">
      {/* 드롭 & 붙여넣기 영역 */}
      <div
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 dark:border-neutral-600 rounded-lg p-8 text-center cursor-pointer hover:border-dewalt transition-colors duration-150"
        onClick={() => fileRef.current?.click()}
        tabIndex={0}
      >
        {preview ? (
          <img
            src={preview}
            alt="QR 이미지"
            className="max-h-48 mx-auto rounded"
          />
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
              클릭하여 이미지 선택, 드래그 앤 드롭, 또는 <strong>Ctrl+V</strong>{' '}
              붙여넣기
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

      {/* 결과 */}
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
    </ToolCard>
  )
}
