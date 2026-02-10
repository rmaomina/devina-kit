import type { ReactNode } from 'react'

interface ToolCardProps {
  title: string
  description: string
  children: ReactNode
}

export default function ToolCard({ title, description, children }: ToolCardProps) {
  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-bold mb-0.5">{title}</h2>
      <p className="text-sm text-gray-400 dark:text-gray-500 mb-5">{description}</p>
      {children}
    </div>
  )
}
