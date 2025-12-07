# 배포 가이드

## 하이브리드 배포 방식

이 프로젝트는 프론트엔드만 별도 리포지토리로 분리하여 배포하는 **하이브리드 방식**을 사용합니다.

## 배포 구조

```
┌─────────────────────────────────┐
│  뉴스클리핑 프론트엔드           │
│  (이 리포지토리)                 │
│  배포: Vercel                    │
│  도메인: news-clipping.vercel.app│
└──────────────┬──────────────────┘
               │ API 호출
               │ (VITE_API_URL)
               ▼
┌─────────────────────────────────┐
│  메인 프로젝트 서버              │
│  (Test1 리포지토리)              │
│  배포: Render                    │
│  도메인: myteamdashboard.onrender.com│
│                                 │
│  제공 API:                       │
│  - POST /api/news-clipping/generate-pdf│
│  - GET /api/news-clipping/download-pdf/:filename│
└─────────────────────────────────┘
```

## 배포 단계

### 1단계: 리포지토리 준비

```bash
# 현재 디렉토리에서 Git 초기화
git init

# .gitignore 확인 (필요시 생성)
# node_modules, dist, .env 등은 제외

# 파일 추가
git add .

# 커밋
git commit -m "Initial commit: 뉴스클리핑 프론트엔드"

# GitHub에 새 리포지토리 생성 후 연결
git remote add origin https://github.com/your-username/news-clipping.git
git branch -M main
git push -u origin main
```

### 2단계: Vercel 프로젝트 생성

1. [Vercel 대시보드](https://vercel.com/dashboard) 접속
2. "Add New..." → "Project" 클릭
3. GitHub 리포지토리 선택 (news-clipping)
4. 프로젝트 설정 확인:
   - **Framework Preset**: Vite (자동 감지)
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `npm run build` (자동)
   - **Output Directory**: `dist` (자동)
   - **Install Command**: `npm install` (자동)

### 3단계: 환경 변수 설정

Vercel 프로젝트 설정 → "Environment Variables"에서 추가:

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `VITE_API_URL` | `https://myteamdashboard.onrender.com` | 메인 프로젝트 서버 URL |
| `VITE_PERPLEXITY_API_URL` | `https://api.perplexity.ai/chat/completions` | (선택) Perplexity API URL |

**중요**: 환경 변수 추가 후 재배포가 필요합니다.

### 4단계: 배포 실행

"Deploy" 버튼을 클릭하면 자동으로:
1. GitHub에서 코드 가져오기
2. `npm install` 실행
3. `npm run build` 실행
4. `dist` 폴더를 Vercel에 배포

### 5단계: 배포 확인

배포 완료 후:
1. 제공된 URL로 접속 (예: `https://news-clipping-xxx.vercel.app`)
2. 뉴스클리핑 페이지가 정상 로드되는지 확인
3. "자료 생성" 기능 테스트
4. "PDF 다운로드" 기능 테스트 (메인 서버 API 호출 확인)

## 커스텀 도메인 설정 (선택사항)

1. Vercel 프로젝트 설정 → "Domains"
2. 원하는 도메인 입력
3. DNS 설정 안내에 따라 도메인 제공업체에서 설정
4. SSL 인증서 자동 발급 (Let's Encrypt)

## 트러블슈팅

### API 호출 실패

- 환경 변수 `VITE_API_URL`이 올바르게 설정되었는지 확인
- 메인 프로젝트 서버가 실행 중인지 확인
- CORS 설정 확인 (메인 프로젝트의 `server.js`에서 CORS 허용 필요)

### 빌드 실패

- Node.js 버전 확인 (Vercel은 자동으로 감지)
- `package.json`의 의존성 확인
- 빌드 로그 확인 (Vercel 대시보드 → Deployments → 해당 배포 클릭)

### 환경 변수 미적용

- 환경 변수 추가 후 재배포 필요
- 변수명이 `VITE_`로 시작하는지 확인 (Vite 환경 변수 규칙)

## 업데이트 배포

코드 변경 후 GitHub에 푸시하면 Vercel이 자동으로 재배포합니다:

```bash
git add .
git commit -m "Update: 기능 개선"
git push origin main
```

또는 Vercel 대시보드에서 "Redeploy" 버튼으로 수동 재배포 가능합니다.

## 로컬 개발

로컬에서 개발할 때는 메인 프로젝트 서버가 필요합니다:

```bash
# 터미널 1: 메인 프로젝트 서버 실행
cd ../..  # Test1 디렉토리로 이동
npm start  # 포트 4000에서 실행

# 터미널 2: 뉴스클리핑 개발 서버 실행
cd news_clipping
npm run dev  # 포트 8002에서 실행, API는 자동 프록시됨
```

개발 서버는 `vite.config.js`의 proxy 설정을 통해 로컬 API를 자동으로 프록시합니다.
