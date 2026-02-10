import { useState, Suspense } from 'react'
import Layout from './components/layout/Layout'
import { tools } from './config/toolRegistry'
import { useTheme } from './hooks/useTheme'
import { useFavorites } from './hooks/useFavorites'

function App() {
  const { dark, toggle: toggleTheme } = useTheme()
  const { favorites, toggle: toggleFavorite } = useFavorites()
  const [activeTool, setActiveTool] = useState(tools[0].id)
  const [search, setSearch] = useState('')

  const currentTool = tools.find((t) => t.id === activeTool)
  const ActiveComponent = currentTool?.component

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
    >
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12 text-gray-400">
            로딩 중...
          </div>
        }
      >
        {ActiveComponent && <ActiveComponent />}
      </Suspense>
    </Layout>
  )
}

export default App
