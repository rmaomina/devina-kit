import ToolCard from '../components/ui/ToolCard'

export default function UUIDGenerator() {
  return (
    <ToolCard title="UUID 생성기" description="랜덤 UUID v4를 생성하고 클립보드에 복사">
      <div className="py-12 text-center text-gray-400 dark:text-gray-600">
        <div className="text-3xl mb-2">🚧</div>
        <p className="text-sm">이 도구는 아직 준비 중이에요</p>
      </div>
    </ToolCard>
  )
}
