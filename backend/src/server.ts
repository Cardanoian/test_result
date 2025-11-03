import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger';
import { PORT, CORS_ORIGIN } from './config/constants';
import { logger } from './utils/logger';
import fs from 'fs';
import path from 'path';

// 환경 변수 로드
dotenv.config();

// logs 디렉토리 생성
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const app = express();

// 미들웨어 설정
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(requestLogger);

// 라우트 설정
app.use('/api', apiRoutes);

// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 에러 핸들러
app.use(errorHandler);

// 서버 시작
app.listen(PORT, () => {
  logger.info(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  logger.info(`CORS Origin: ${CORS_ORIGIN}`);
});
