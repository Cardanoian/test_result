# Grade Generator Backend

Node.js + Express + TypeScript 기반의 백엔드 API 서버입니다.

## 기능

- Gemini API를 통한 AI 텍스트 생성
- CORS 설정으로 프론트엔드와 안전한 통신
- Winston을 사용한 로깅 시스템
- Docker를 통한 컨테이너화

## 기술 스택

- Node.js 22 LTS
- Express.js
- TypeScript
- Google Gemini AI
- Winston (로깅)
- Docker

## 로컬 개발 환경 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 입력하세요:

```
GOOGLE_API_KEY=your_google_api_key_here
PORT=3050
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

### 3. 개발 서버 실행

```bash
npm run dev
```

서버가 http://localhost:3050 에서 실행됩니다.

### 4. 프로덕션 빌드

```bash
npm run build
npm start
```

## API 엔드포인트

### POST /api/gemini/generate

Gemini API를 호출하여 텍스트를 생성합니다.

**요청:**

```json
{
  "contents": "프롬프트 내용"
}
```

**성공 응답:**

```json
{
  "success": true,
  "data": {
    "text": "생성된 텍스트..."
  }
}
```

**에러 응답:**

```json
{
  "success": false,
  "error": {
    "message": "에러 메시지",
    "code": "ERROR_CODE"
  }
}
```

### GET /health

서버 상태를 확인합니다.

**응답:**

```json
{
  "status": "ok",
  "timestamp": "2025-11-03T06:50:00.000Z"
}
```

## 프로젝트 구조

```
backend/
├── src/
│   ├── config/
│   │   └── constants.ts          # 상수 정의
│   ├── controllers/
│   │   └── geminiController.ts   # API 요청 처리
│   ├── services/
│   │   └── geminiService.ts      # Gemini API 호출
│   ├── routes/
│   │   └── api.ts                # 라우트 정의
│   ├── middleware/
│   │   ├── errorHandler.ts       # 에러 핸들링
│   │   └── logger.ts             # 요청 로깅
│   ├── utils/
│   │   └── logger.ts             # Winston 로거 설정
│   └── server.ts                 # 서버 진입점
├── logs/                         # 로그 파일
├── Dockerfile
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

## Docker 배포

### 이미지 빌드

```bash
docker build -t grade-backend .
```

### 컨테이너 실행

```bash
docker-compose up -d
```

### 로그 확인

```bash
docker-compose logs -f
```

## 로깅

- 모든 요청은 `logs/combined.log`에 기록됩니다
- 에러는 `logs/error.log`에 별도로 기록됩니다
- 개발 환경에서는 콘솔에도 로그가 출력됩니다

## 환경 변수

| 변수명         | 설명                 | 기본값                |
| -------------- | -------------------- | --------------------- |
| GOOGLE_API_KEY | Google Gemini API 키 | (필수)                |
| PORT           | 서버 포트            | 3050                  |
| CORS_ORIGIN    | CORS 허용 도메인     | http://localhost:5173 |
| NODE_ENV       | 실행 환경            | development           |

## 라이센스

ISC
