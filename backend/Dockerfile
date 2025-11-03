# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# 의존성 파일 복사 및 설치
COPY package*.json ./
RUN npm ci

# 소스 코드 복사
COPY . .

# TypeScript 빌드
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# 프로덕션 의존성만 설치
COPY package*.json ./
RUN npm ci --only=production

# 빌드된 파일 복사
COPY --from=builder /app/dist ./dist

# logs 디렉토리 생성
RUN mkdir -p logs

# 포트 노출
EXPOSE 3050

# 서버 실행
CMD ["node", "dist/server.js"]
