import ToolCard from '../components/ui/ToolCard'

export default function CharCounter() {
  return (
    <ToolCard title="글자수 체크" description="텍스트의 글자수, 바이트 수를 실시간으로 확인">
      <div className="py-12 text-center text-gray-400 dark:text-gray-600">
        <div className="text-3xl mb-2">🚧</div>
        <p className="text-sm">이 도구는 아직 준비 중이에요</p>
      </div>
    </ToolCard>
  )
}
