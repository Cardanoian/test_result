import { GoogleGenAI } from '@google/genai';
import { MODEL } from '../config/constants';
import { logger } from '../utils/logger';

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY ?? '',
});

export const callGeminiApi = async (contents: string): Promise<string> => {
  try {
    logger.info('Gemini API 호출 시작');

    const result = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: {
        thinkingConfig: {
          thinkingBudget: 0,
        },
        temperature: 2,
      },
    });

    if (!result.text) {
      throw new Error('No Response from Gemini API');
    }

    let text = result.text.trim();
    if (!text.endsWith('.')) {
      text += '.';
    }

    logger.info('Gemini API 호출 성공');
    return text;
  } catch (error) {
    logger.error('Gemini API 호출 실패:', error);
    throw error;
  }
};
