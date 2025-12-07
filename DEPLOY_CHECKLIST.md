# 배포 체크리스트

하이브리드 방식으로 뉴스클리핑을 배포하기 전 확인사항입니다.

## ✅ 준비 완료된 항목

- [x] `vercel.json` 배포 설정 파일 생성
- [x] `vite.config.js` base 경로 수정 (`/`로 변경)
- [x] `README.md` 배포 가이드 추가
- [x] `DEPLOYMENT.md` 상세 배포 가이드 작성
- [x] `.gitignore` 확인 (node_modules, dist, .env 제외)

## 📋 배포 전 확인사항

### 1. 메인 프로젝트 서버 확인

- [ ] 메인 프로젝트 서버가 정상 실행 중인지 확인
  - URL: `https://myteamdashboard.onrender.com`
- [ ] 뉴스클리핑 API 엔드포인트가 정상 작동하는지 확인
  - `POST /api/news-clipping/generate-pdf`
  - `GET /api/news-clipping/download-pdf/:filename`
- [ ] CORS 설정이 올바른지 확인 (메인 프로젝트 `server.js`)

### 2. GitHub 리포지토리 준비

- [ ] GitHub에 새 리포지토리 생성
  - 리포지토리명: `news-clipping` (또는 원하는 이름)
- [ ] 현재 `news_clipping/` 폴더를 새 리포지토리로 이동/복사
- [ ] Git 초기화 및 커밋
  ```bash
  cd news_clipping
  git init
  git add .
  git commit -m "Initial commit: 뉴스클리핑 프론트엔드"
  ```
- [ ] GitHub에 푸시
  ```bash
  git remote add origin https://github.com/your-username/news-clipping.git
  git branch -M main
  git push -u origin main
  ```

### 3. Vercel 프로젝트 생성

- [ ] Vercel 계정 로그인
- [ ] "Add New Project" 클릭
- [ ] GitHub 리포지토리 선택 (`news-clipping`)
- [ ] 프로젝트 설정 확인:
  - Framework Preset: **Vite** (자동 감지)
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Install Command: `npm install`

### 4. 환경 변수 설정

Vercel 프로젝트 설정 → Environment Variables에서 추가:

- [ ] `VITE_API_URL` = `https://myteamdashboard.onrender.com`
- [ ] `VITE_PERPLEXITY_API_URL` = `https://api.perplexity.ai/chat/completions` (선택사항)

**중요**: 환경 변수 추가 후 반드시 재배포 필요!

### 5. 배포 실행

- [ ] "Deploy" 버튼 클릭
- [ ] 빌드 로그 확인 (에러 없는지 확인)
- [ ] 배포 완료 대기

### 6. 배포 후 테스트

- [ ] 배포된 URL로 접속 (예: `https://news-clipping-xxx.vercel.app`)
- [ ] 페이지가 정상 로드되는지 확인
- [ ] "자료 생성" 기능 테스트
- [ ] "PDF 다운로드" 기능 테스트
- [ ] 브라우저 개발자 도구 → Network 탭에서 API 호출 확인
  - `POST https://myteamdashboard.onrender.com/api/news-clipping/generate-pdf`
  - `GET https://myteamdashboard.onrender.com/api/news-clipping/download-pdf/:filename`

## 🔧 문제 발생 시

### API 호출 실패 (CORS 에러)

메인 프로젝트의 `server.js`에서 CORS 설정 확인:

```javascript
// 뉴스클리핑 도메인 허용 추가 필요
const corsOptions = {
  origin: [
    'https://myteamdashboard.onrender.com',
    'https://news-clipping-xxx.vercel.app',  // Vercel 도메인 추가
    // 또는 모든 Vercel 도메인 허용
    /\.vercel\.app$/
  ]
};
```

### 빌드 실패

- Vercel 대시보드 → Deployments → 해당 배포 클릭 → Build Logs 확인
- 로컬에서 빌드 테스트: `npm run build`

### 환경 변수 미적용

- 환경 변수 추가 후 "Redeploy" 클릭
- 변수명이 `VITE_`로 시작하는지 확인

## 📝 배포 완료 후

- [ ] 배포 URL 기록
- [ ] 커스텀 도메인 설정 (선택사항)
- [ ] 팀원들에게 배포 완료 알림
- [ ] 메인 프로젝트 README에 뉴스클리핑 링크 추가 (선택사항)

