import { lazy } from 'react'
import type { ComponentType } from 'react'

export interface Tool {
  id: string
  name: string
  keywords: string[]
  component: React.LazyExoticComponent<ComponentType>
}

// 도구 등록: 한글 가나다순으로 사이드바에 표시됨
export const tools: Tool[] = [
  {
    id: 'char-counter',
    name: '글자수 체크',
    keywords: ['char', 'counter', '글자', '글자수', 'byte'],
    component: lazy(() => import('../tools/CharCounter')),
  },
  {
    id: 'qr-decoder',
    name: 'QR 디코딩',
    keywords: ['qr', 'decode', '큐알', '디코딩'],
    component: lazy(() => import('../tools/QRDecoder')),
  },
  {
    id: 'url-decoder',
    name: '단축URL 디코딩',
    keywords: ['url', 'decode', 'short', '단축'],
    component: lazy(() => import('../tools/URLDecoder')),
  },
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    keywords: ['json', 'format', 'pretty', '포맷'],
    component: lazy(() => import('../tools/JsonFormatter')),
  },
  {
    id: 'ratio-calc',
    name: '비율 계산기',
    keywords: ['ratio', '비율', '해상도'],
    component: lazy(() => import('../tools/RatioCalculator')),
  },
  {
    id: 'vw-converter',
    name: 'VW 변환기',
    keywords: ['vw', 'viewport', 'px', '뷰포트'],
    component: lazy(() => import('../tools/VWConverter')),
  },
  {
    id: 'uuid-generator',
    name: 'UUID 생성기',
    keywords: ['uuid', 'random', '랜덤', '유유아이디'],
    component: lazy(() => import('../tools/UUIDGenerator')),
  },
  {
    id: 'jira-dashboard',
    name: 'JIRA Dashboard',
    keywords: ['jira', 'worklog', 'dashboard', '지라', '대시보드', '공수'],
    component: lazy(() => import('../tools/JiraDashboard')),
  },
]
