# GitHub 리포지토리 설정 가이드

## 1단계: GitHub에서 리포지토리 생성

1. [GitHub](https://github.com)에 로그인
2. 우측 상단의 "+" 버튼 클릭 → "New repository" 선택
3. 리포지토리 설정:
   - **Repository name**: `news-clipping` (또는 원하는 이름)
   - **Description**: `코레일유통 뉴스클리핑 프론트엔드`
   - **Visibility**: Public 또는 Private 선택
   - **⚠️ 중요**: "Initialize this repository with" 옵션들은 모두 체크 해제
     - README, .gitignore, license 추가하지 않음 (이미 로컬에 있음)
4. "Create repository" 클릭

## 2단계: 로컬 리포지토리와 연결

GitHub에서 리포지토리를 생성하면 표시되는 명령어 중 **"push an existing repository"** 섹션의 명령어를 사용합니다:

```bash
cd "/Users/hoonsbook/AI vive coding projects/Test1/news_clipping"

# GitHub 리포지토리 URL을 리모트로 추가
git remote add origin https://github.com/YOUR_USERNAME/news-clipping.git

# 또는 SSH를 사용하는 경우:
# git remote add origin git@github.com:YOUR_USERNAME/news-clipping.git

# 메인 브랜치 이름 확인 및 설정
git branch -M main

# GitHub에 푸시
git push -u origin main
```

**주의**: `YOUR_USERNAME`을 실제 GitHub 사용자명으로 변경하세요.

## 3단계: 푸시 확인

GitHub 웹사이트에서 리포지토리 페이지를 새로고침하여 파일들이 업로드되었는지 확인하세요.

## 다음 단계

GitHub 리포지토리 연결이 완료되면:
1. Vercel 프로젝트 생성
2. 환경 변수 설정
3. 배포 실행

자세한 내용은 `DEPLOYMENT.md`를 참고하세요.

