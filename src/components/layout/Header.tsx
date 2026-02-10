interface HeaderProps {
  dark: boolean
  onToggleTheme: () => void
}

export default function Header({ dark, onToggleTheme }: HeaderProps) {
  return (
    <header className="h-12 flex items-center justify-between px-5 shrink-0 border-b border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#171717] transition-colors duration-150">
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-black bg-dewalt text-[#1A1A1A]">
          D
        </div>
        <span className="font-bold text-sm tracking-tight text-[#1A1A1A] dark:text-[#F5F5F5]">
          devina-kit
        </span>
      </div>
      <button
        onClick={onToggleTheme}
        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors duration-150"
        title={dark ? '라이트 모드' : '다크 모드'}
      >
        {dark ? '\u2600\uFE0F' : '\uD83C\uDF19'}
      </button>
    </header>
  )
}
