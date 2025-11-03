import { Request, Response } from 'express';
import { callGeminiApi } from '../services/geminiService';
import { logger } from '../utils/logger';

export const generateContent = async (req: Request, res: Response) => {
  try {
    const { contents } = req.body;

    if (!contents || typeof contents !== 'string') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'contents 필드가 필요합니다.',
          code: 'INVALID_REQUEST',
        },
      });
    }

    logger.info(`API 요청 받음 - contents 길이: ${contents.length}`);

    const result = await callGeminiApi(contents);

    logger.info('API 응답 성공');

    return res.status(200).json({
      success: true,
      data: {
        text: result,
      },
    });
  } catch (error) {
    logger.error('API 요청 처리 중 오류:', error);

    return res.status(500).json({
      success: false,
      error: {
        message:
          error instanceof Error ? error.message : '서버 오류가 발생했습니다.',
        code: 'INTERNAL_SERVER_ERROR',
      },
    });
  }
};
