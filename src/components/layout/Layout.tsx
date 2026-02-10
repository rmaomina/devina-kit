import type { ReactNode } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import type { Tool } from '../../config/toolRegistry'

interface LayoutProps {
  dark: boolean
  onToggleTheme: () => void
  tools: Tool[]
  activeTool: string
  favorites: string[]
  search: string
  onSearchChange: (value: string) => void
  onSelectTool: (id: string) => void
  onToggleFavorite: (id: string) => void
  children: ReactNode
}

export default function Layout({
  dark,
  onToggleTheme,
  tools,
  activeTool,
  favorites,
  search,
  onSearchChange,
  onSelectTool,
  onToggleFavorite,
  children,
}: LayoutProps) {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-surface-light dark:bg-surface-dark text-[#1A1A1A] dark:text-[#F5F5F5] transition-colors duration-150">
      <Header dark={dark} onToggleTheme={onToggleTheme} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          tools={tools}
          activeTool={activeTool}
          favorites={favorites}
          search={search}
          onSearchChange={onSearchChange}
          onSelectTool={onSelectTool}
          onToggleFavorite={onToggleFavorite}
        />

        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>

      <footer className="h-8 flex items-center justify-center gap-2 text-xs shrink-0 border-t border-gray-200 dark:border-[#2A2A2A] text-gray-500 dark:text-gray-400 transition-colors duration-150">
        <a
          href="https://github.com/rmaomina/devina-kit"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-dewalt transition-colors duration-150"
        >
          devina-kit
        </a>
        <span className="text-gray-300 dark:text-gray-600">·</span>
        <span className="text-[10px] font-semibold tracking-widest uppercase text-dewalt">
          ad-free
        </span>
      </footer>
    </div>
  )
}
