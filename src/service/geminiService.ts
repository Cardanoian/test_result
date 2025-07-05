import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY ?? '',
});

export const callGeminiApi = async (contents: string): Promise<string> => {
  const model = 'gemini-2.5-flash';

  try {
    const result = await ai.models.generateContent({
      model,
      contents,
      config: {
        thinkingConfig: {
          thinkingBudget: 0,
        },
        temperature: 1.2,
      },
    });

    if (!result.text) {
      throw new Error('No Response.');
    }
    let text = result.text.trim();
    if (!text.endsWith('.')) {
      text += '.';
    }
    return text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
};
