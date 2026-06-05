# 하루 루틴 플래너 - Netlify 배포용

React + Vite 기반 하루 루틴 플래너입니다. 기존 AI Studio Express 서버 구조를 Netlify 정적 배포 + Netlify Functions 구조로 변경했습니다.

## 로컬 실행

```bash
npm install
npm run dev
```

프론트엔드만 확인할 때는 위 명령을 사용합니다.
Netlify Functions까지 로컬에서 함께 확인하려면 Netlify CLI를 설치한 뒤 아래 명령을 사용하세요.

```bash
npm install -g netlify-cli
netlify dev
```

## Netlify 배포 설정

Netlify에서 저장소를 연결하면 `netlify.toml`에 따라 다음 설정이 자동 적용됩니다.

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`

## 환경 변수

Gemini API 기능을 사용하려면 Netlify 대시보드에서 환경 변수를 추가하세요.

```bash
GEMINI_API_KEY=발급받은_Gemini_API_Key
```

Netlify Functions 런타임에서 읽어야 하므로 Functions scope에 포함되도록 설정하세요.
API 키가 없거나 호출에 실패하면 앱은 내장 추천/명언 데이터로 동작합니다.

## 변경된 구조

```text
src/
  main.tsx
  App.tsx
  index.css
  types.ts
  components/
  data/
netlify/
  functions/
    suggest-todo.mjs
    quote.mjs
  lib/
    gemini-utils.mjs
netlify.toml
```

## 주요 API 경로

- `POST /api/gemini/suggest-todo`
- `GET /api/gemini/quote`
