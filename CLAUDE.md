# devina-kit

개발자용 유틸리티 도구 모음 SPA.

## 기술 스택
- React (Vite) + TypeScript
- Tailwind CSS v4 (darkMode: class)
- 폰트: IBM Plex Sans / Mono
- 저장: localStorage (즐겨찾기, 테마)

## 디자인 컨셉
- DeWalt 공구 테마: 산업적이고 신뢰감 있는 도구 느낌
- 액센트: #FECC02 (DeWalt Yellow)
- 다크모드: 거의 순수 블랙 (#0F0F0F)

## 개발
```bash
npm run dev   # 개발 서버
npm run build # 프로덕션 빌드
```

## 도구 추가 방법
1. `src/tools/` 에 컴포넌트 생성
2. `src/config/toolRegistry.ts` 에 등록

## Git 규칙
- 작업 완료 후 main 브랜치에 커밋 + 푸시
- Remote: `git@github.com:rmaomina/devina-kit.git` (SSH)
