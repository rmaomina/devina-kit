import { useContext } from 'react'
import { JiraAuthContext } from '../contexts/JiraAuthContext'
import type { JiraAuthContextType } from '../contexts/JiraAuthContext'

export type { JiraAuth } from '../contexts/JiraAuthContext'

export function useJiraAuth(): JiraAuthContextType {
  const ctx = useContext(JiraAuthContext)
  if (!ctx) throw new Error('useJiraAuth must be used within JiraAuthProvider')
  return ctx
}
