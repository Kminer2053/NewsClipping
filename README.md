# 코레일유통 뉴스클리핑

코레일유통 홍보문화처를 위한 뉴스 클리핑 자동화 도구입니다.

## 기능

1. **프롬프트 입력**: 구조화된 프롬프트를 입력하여 뉴스 클리핑 생성
2. **기본값 관리**: 자주 사용하는 설정을 저장하고 불러오기
3. **자료 생성**: Perplexity AI를 활용한 자동 뉴스 클리핑
4. **PDF 생성**: 생성된 자료를 PDF 파일로 저장 (메인 프로젝트 서버 API 사용)
5. **뉴스목록 복사**: 1페이지 요약을 클립보드에 복사
6. **카카오톡 공유자료**: 카카오톡 단체방 공유용 형식으로 변환

## 설치 및 실행

```bash
# 패키지 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 사용 방법

1. 헤더 문자열과 기준 날짜를 입력합니다.
2. (선택) 기사 목록을 입력합니다. 입력하지 않으면 자동으로 웹 검색을 통해 수집합니다.
3. "자료 생성" 버튼을 클릭합니다.
4. 생성된 결과를 확인하고, 필요에 따라 PDF 생성, 복사, 카카오톡 공유자료를 생성합니다.

## 환경 변수

Vercel 배포 시 환경 변수를 설정하세요:

- `VITE_API_URL`: 메인 프로젝트 서버 URL (예: `https://myteamdashboard.onrender.com`)
- `VITE_PERPLEXITY_API_URL`: Perplexity AI API URL (기본값: `https://api.perplexity.ai/chat/completions`)

로컬 개발 시 `.env` 파일을 생성하여 설정할 수 있습니다:

```env
VITE_API_URL=http://localhost:4000
VITE_PERPLEXITY_API_URL=https://api.perplexity.ai/chat/completions
```

## 배포 (Vercel)

### 1. GitHub 리포지토리 준비

이 폴더를 별도의 Git 리포지토리로 만들어 GitHub에 푸시합니다:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Vercel 프로젝트 생성

1. [Vercel](https://vercel.com)에 로그인
2. "Add New Project" 클릭
3. GitHub 리포지토리 선택
4. 프로젝트 설정:
   - **Framework Preset**: Vite (자동 감지됨)
   - **Build Command**: `npm run build` (자동 설정됨)
   - **Output Directory**: `dist` (자동 설정됨)
   - **Install Command**: `npm install` (자동 설정됨)

### 3. 환경 변수 설정

Vercel 프로젝트 설정 → Environment Variables에서 추가:

- `VITE_API_URL`: 메인 프로젝트 서버 URL
- `VITE_PERPLEXITY_API_URL`: (선택사항) Perplexity AI API URL

### 4. 배포

설정 완료 후 "Deploy" 버튼을 클릭하면 자동으로 배포됩니다.

### 5. 배포 확인

배포 완료 후 제공되는 URL로 접속하여 정상 작동을 확인합니다.

## 아키텍처 (하이브리드 방식)

이 프로젝트는 **하이브리드 방식**으로 배포됩니다:

- **프론트엔드**: 이 리포지토리 (Vercel에 배포)
- **백엔드 API**: 메인 프로젝트 서버 (`VITE_API_URL`)
  - PDF 생성 API: `POST /api/news-clipping/generate-pdf`
  - PDF 다운로드 API: `GET /api/news-clipping/download-pdf/:filename`

프론트엔드는 메인 프로젝트의 API를 호출하여 PDF 생성 및 다운로드 기능을 사용합니다.

## 개발

로컬 개발 시 메인 프로젝트 서버가 실행 중이어야 합니다:

```bash
# 메인 프로젝트 서버 실행 (포트 4000)
cd ../..
npm start

# 뉴스클리핑 개발 서버 실행 (포트 8002)
npm run dev
```

개발 서버는 `vite.config.js`의 proxy 설정을 통해 로컬 API를 자동으로 프록시합니다.

