import { useJiraAuth } from '../../hooks/useJiraAuth'

/** 티켓 번호를 연결된 JIRA의 이슈 화면으로 여는 링크. 미연결이면 평문으로 둔다. */
export default function IssueLink({
  issueKey,
  className = '',
}: {
  issueKey: string
  className?: string
}) {
  const { auth } = useJiraAuth()

  if (!auth) return <span className={className}>{issueKey}</span>

  return (
    <a
      href={`https://${auth.domain}/browse/${issueKey}`}
      target="_blank"
      rel="noopener noreferrer"
      title={`${issueKey} — JIRA에서 열기`}
      className={`hover:text-dewalt hover:underline underline-offset-2 transition-colors ${className}`}
    >
      {issueKey}
    </a>
  )
}
