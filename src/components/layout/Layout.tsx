import { useState, type ReactNode } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import type { Tool } from '../../config/toolRegistry'

interface LayoutProps {
  dark: boolean
  onToggleTheme: () => void
  tools: Tool[]
  activeTool: string | null
  favorites: string[]
  search: string
  onSearchChange: (value: string) => void
  onSelectTool: (id: string) => void
  onToggleFavorite: (id: string) => void
  rightPanel?: ReactNode
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
  rightPanel,
  children,
}: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-surface-light dark:bg-surface-dark text-[#1A1A1A] dark:text-[#F5F5F5] transition-colors duration-150">
      <Header dark={dark} onToggleTheme={onToggleTheme} />

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar toggle (when collapsed) */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="shrink-0 w-6 flex items-center justify-center border-r border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#171717] text-gray-400 hover:text-dewalt hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors duration-150"
            title="사이드바 열기"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}

        {/* Sidebar */}
        <div
          className={`shrink-0 overflow-hidden transition-all duration-200 ease-in-out ${
            sidebarOpen ? 'w-56' : 'w-0'
          }`}
        >
          <div className="w-56 h-full flex flex-col">
            <Sidebar
              tools={tools}
              activeTool={activeTool}
              favorites={favorites}
              search={search}
              onSearchChange={onSearchChange}
              onSelectTool={onSelectTool}
              onToggleFavorite={onToggleFavorite}
              onCollapse={() => setSidebarOpen(false)}
            />
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>

        {/* Right panel */}
        {rightPanel && (
          <>
            <div
              className={`shrink-0 overflow-hidden transition-all duration-200 ease-in-out border-l border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#171717] ${
                rightPanelOpen ? 'w-80' : 'w-0 border-l-0'
              }`}
            >
              <div className="w-80 h-full overflow-hidden">
                {rightPanel}
              </div>
            </div>

            {/* Right panel toggle (when collapsed) */}
            {!rightPanelOpen && (
              <button
                onClick={() => setRightPanelOpen(true)}
                className="shrink-0 w-6 flex items-center justify-center border-l border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#171717] text-gray-400 hover:text-dewalt hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors duration-150"
                title="패널 열기"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}

            {/* Right panel collapse button (when open) */}
            {rightPanelOpen && (
              <button
                onClick={() => setRightPanelOpen(false)}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-5 h-10 flex items-center justify-center rounded-l bg-gray-200 dark:bg-neutral-700 text-gray-500 dark:text-gray-400 hover:text-dewalt hover:bg-gray-300 dark:hover:bg-neutral-600 transition-colors duration-150 shadow"
                title="패널 접기"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )}
          </>
        )}
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
