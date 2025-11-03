import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction // eslint-disable-line @typescript-eslint/no-unused-vars
) => {
  logger.error(`에러 발생: ${err.message}`, { stack: err.stack });

  res.status(500).json({
    success: false,
    error: {
      message: '서버 내부 오류가 발생했습니다.',
      code: 'INTERNAL_SERVER_ERROR',
    },
  });
};
