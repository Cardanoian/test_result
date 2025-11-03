import { BACKEND_API_URL } from '@/constants/constants';

export const callApi = async (contents: string): Promise<string> => {
  try {
    const response = await fetch(`${BACKEND_API_URL}/api/gemini/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contents }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'API 요청 실패');
    }

    const data = await response.json();

    if (!data.success || !data.data?.text) {
      throw new Error('No Response.');
    }

    return data.data.text;
  } catch (error) {
    console.error('Error calling API:', error);
    throw error;
  }
};
