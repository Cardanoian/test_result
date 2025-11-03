# Grade Generator

학생 평가 및 행동 특성 생성을 위한 AI 기반 웹 애플리케이션입니다.

## 프로젝트 구조

이 프로젝트는 프론트엔드와 백엔드로 분리되어 있습니다:

- **프론트엔드**: React + Vite + TypeScript
- **백엔드**: Node.js + Express + TypeScript

```
.
├── src/                    # 프론트엔드 소스 코드
├── backend/                # 백엔드 소스 코드
├── nginx/                  # Nginx 설정 파일
├── Dockerfile              # 프론트엔드 Docker 설정
├── docker-compose.yml      # 프론트엔드 Docker Compose
└── DEPLOYMENT.md           # 배포 가이드
```

## 기능

- 성적 평가 생성 (GradeGenerator)
- 행동 특성 평가 생성 (BehaviorGenerator)
- Excel 파일 업로드 및 다운로드
- AI 기반 자동 평가 생성 (Google Gemini)
- 다크 모드 지원

## 로컬 개발 환경 설정

### 프론트엔드

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

개발 서버는 http://localhost:5173 에서 실행됩니다.

### 백엔드

```bash
# 백엔드 디렉토리로 이동
cd backend

# 의존성 설치
npm install

# .env 파일 생성
cp .env.example .env
# .env 파일을 열어 GOOGLE_API_KEY를 설정하세요

# 개발 서버 실행
npm run dev
```

백엔드 서버는 http://localhost:3050 에서 실행됩니다.

## 환경 변수

### 프론트엔드

개발 환경에서는 기본적으로 `http://localhost:3050`을 백엔드 URL로 사용합니다.

프로덕션 환경에서는 `.env.production` 파일에 다음을 설정하세요:

```
VITE_BACKEND_API_URL=https://grade-server.gbeai.net
```

### 백엔드

`backend/.env` 파일에 다음을 설정하세요:

```
GOOGLE_API_KEY=your_google_api_key_here
PORT=3050
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

## 프로덕션 빌드

### 프론트엔드

```bash
npm run build
```

빌드된 파일은 `dist/` 디렉토리에 생성됩니다.

### 백엔드

```bash
cd backend
npm run build
```

빌드된 파일은 `backend/dist/` 디렉토리에 생성됩니다.

## Docker 배포

### 프론트엔드

```bash
docker-compose up -d --build
```

### 백엔드

```bash
cd backend
docker-compose up -d --build
```

## 프로덕션 배포

상세한 배포 가이드는 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참조하세요.

배포 환경:

- 프론트엔드: https://grade.gbeai.net
- 백엔드: https://grade-server.gbeai.net

## 기술 스택

### 프론트엔드

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Radix UI
- React Router
- XLSX (Excel 처리)

### 백엔드

- Node.js 22 LTS
- Express.js
- TypeScript
- Google Gemini AI
- Winston (로깅)
- CORS

### 인프라

- Docker
- Nginx
- Let's Encrypt (SSL)
- Ubuntu Server

## API 문서

백엔드 API 문서는 [backend/README.md](./backend/README.md)를 참조하세요.

## 프로젝트 상세 정보

### 프론트엔드 구조

```
src/
├── constants/          # 상수 정의
├── contexts/           # React Context
├── model/              # 데이터 모델
├── service/            # API 및 비즈니스 로직
├── view/               # React 컴포넌트
├── viewmodel/          # 뷰모델 (커스텀 훅)
└── lib/                # 유틸리티 함수
```

### 백엔드 구조

```
backend/src/
├── config/             # 설정
├── controllers/        # 컨트롤러
├── services/           # 비즈니스 로직
├── routes/             # 라우트
├── middleware/         # 미들웨어
└── utils/              # 유틸리티
```

## 라이센스

ISC

## 기여

이슈나 풀 리퀘스트를 환영합니다.
