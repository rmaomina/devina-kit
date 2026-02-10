import { useState, Suspense } from 'react'
import Layout from './components/layout/Layout'
import { tools } from './config/toolRegistry'
import { useTheme } from './hooks/useTheme'
import { useFavorites } from './hooks/useFavorites'
import { useAuth } from './hooks/useAuth'
import AuthGuard from './components/ui/AuthGuard'
import WorklogPanel from './components/jira/WorklogPanel'

function App() {
  const { dark, toggle: toggleTheme } = useTheme()
  const { favorites, toggle: toggleFavorite } = useFavorites()
  const { user } = useAuth()
  const [activeTool, setActiveTool] = useState<string | null>(
    favorites.length > 0 ? favorites[0] : null,
  )
  const [search, setSearch] = useState('')

  const currentTool = tools.find((t) => t.id === activeTool)
  const ActiveComponent = currentTool?.component
  const needsAuth = currentTool?.requiresAuth && !user

  // JIRA Dashboard 활성 + 로그인 시 우측 패널 표시
  const showRightPanel = activeTool === 'jira-dashboard' && user

  return (
    <Layout
      dark={dark}
      onToggleTheme={toggleTheme}
      tools={tools}
      activeTool={activeTool}
      favorites={favorites}
      search={search}
      onSearchChange={setSearch}
      onSelectTool={setActiveTool}
      onToggleFavorite={toggleFavorite}
      rightPanel={showRightPanel ? <WorklogPanel /> : undefined}
    >
      {activeTool ? (
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12 text-gray-400">
              로딩 중...
            </div>
          }
        >
          {ActiveComponent && (
            needsAuth ? <AuthGuard><ActiveComponent /></AuthGuard> : <ActiveComponent />
          )}
        </Suspense>
      ) : (
        <div className="flex flex-col items-center justify-center h-full py-24 text-center">
          <span className="text-5xl mb-4">⚡</span>
          <p className="text-lg text-gray-400">
            사이드바에서 도구를 선택하세요
          </p>
          <p className="text-sm text-gray-500 mt-1">
            자주 쓰는 도구는 ★ 즐겨찾기에 추가해보세요
          </p>
        </div>
      )}
    </Layout>
  )
}

export default App
