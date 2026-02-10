import ToolCard from '../components/ui/ToolCard'

export default function QRDecoder() {
  return (
    <ToolCard title="QR 디코딩" description="이미지 업로드/붙여넣기로 QR 내용 추출">
      <div className="py-12 text-center text-gray-400 dark:text-gray-600">
        <div className="text-3xl mb-2">🚧</div>
        <p className="text-sm">이 도구는 아직 준비 중이에요</p>
      </div>
    </ToolCard>
  )
}
