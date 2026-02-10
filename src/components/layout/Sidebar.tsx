import type { Tool } from '../../config/toolRegistry'

interface SidebarProps {
  tools: Tool[]
  activeTool: string
  favorites: string[]
  search: string
  onSearchChange: (value: string) => void
  onSelectTool: (id: string) => void
  onToggleFavorite: (id: string) => void
}

export default function Sidebar({
  tools,
  activeTool,
  favorites,
  search,
  onSearchChange,
  onSelectTool,
  onToggleFavorite,
}: SidebarProps) {
  const sorted = [...tools].sort((a, b) => a.name.localeCompare(b.name, 'ko'))

  const filtered = search.trim()
    ? sorted.filter((t) => {
        const q = search.toLowerCase()
        return (
          t.name.toLowerCase().includes(q) ||
          t.keywords.some((k) => k.toLowerCase().includes(q))
        )
      })
    : null

  const favTools = sorted.filter((t) => favorites.includes(t.id))

  return (
    <aside className="w-56 shrink-0 border-r border-gray-200 dark:border-[#2A2A2A] flex flex-col overflow-hidden bg-white dark:bg-[#171717] transition-colors duration-150">
      {/* 검색 */}
      <div className="p-3 pb-2">
        <div className="relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-40"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="도구 검색..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border bg-gray-50 dark:bg-[#111111] border-gray-200 dark:border-[#2A2A2A] text-[#1A1A1A] dark:text-[#F5F5F5] focus:outline-none focus:border-dewalt transition-colors duration-150"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-1.5 pb-3" style={{ scrollbarWidth: 'thin' }}>
        {filtered !== null ? (
          <div>
            <SectionLabel text={`검색 결과 (${filtered.length})`} />
            {filtered.length === 0 ? (
              <p className="text-xs text-gray-400 px-2 py-4 text-center">결과 없음</p>
            ) : (
              filtered.map((t) => (
                <SidebarItem
                  key={t.id}
                  tool={t}
                  active={activeTool === t.id}
                  fav={favorites.includes(t.id)}
                  onSelect={() => {
                    onSelectTool(t.id)
                    onSearchChange('')
                  }}
                  onToggleFav={() => onToggleFavorite(t.id)}
                />
              ))
            )}
          </div>
        ) : (
          <>
            {favTools.length > 0 && (
              <div className="mb-2">
                <SectionLabel text="즐겨찾기" />
                {favTools.map((t) => (
                  <SidebarItem
                    key={t.id}
                    tool={t}
                    active={activeTool === t.id}
                    fav={true}
                    onSelect={() => onSelectTool(t.id)}
                    onToggleFav={() => onToggleFavorite(t.id)}
                  />
                ))}
              </div>
            )}
            <div>
              <SectionLabel text="전체 도구" />
              {sorted.map((t) => (
                <SidebarItem
                  key={t.id}
                  tool={t}
                  active={activeTool === t.id}
                  fav={favorites.includes(t.id)}
                  onSelect={() => onSelectTool(t.id)}
                  onToggleFav={() => onToggleFavorite(t.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </aside>
  )
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="px-2 pt-2 pb-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-600">
        {text}
      </span>
    </div>
  )
}

interface SidebarItemProps {
  tool: Tool
  active: boolean
  fav: boolean
  onSelect: () => void
  onToggleFav: () => void
}

function SidebarItem({ tool, active, fav, onSelect, onToggleFav }: SidebarItemProps) {
  return (
    <div
      className={`group flex items-center gap-1 rounded-md mx-1 cursor-pointer transition-colors duration-150 ${
        active
          ? 'bg-dewalt/20 dark:bg-dewalt/15'
          : 'hover:bg-gray-100 dark:hover:bg-white/5'
      }`}
    >
      <button
        onClick={onSelect}
        className={`flex-1 text-left px-2 py-1.5 text-xs truncate ${
          active
            ? 'font-semibold text-dewalt-hover dark:text-dewalt'
            : 'font-normal'
        }`}
      >
        {tool.name}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggleFav()
        }}
        className={`px-1.5 transition-opacity text-xs ${
          fav
            ? 'opacity-100 text-dewalt'
            : 'opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
        }`}
        title={fav ? '즐겨찾기 해제' : '즐겨찾기'}
      >
        {fav ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
            <path d="M12 2C12 2 12 12 12 17L6 21L8 14L2 9H9L12 2Z" />
            <path d="M12 2C12 2 12 12 12 17L18 21L16 14L22 9H15L12 2Z" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="3" x2="12" y2="15" />
            <circle cx="12" cy="3" r="2" />
          </svg>
        )}
      </button>
    </div>
  )
}
