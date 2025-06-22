import { GPTResponse, GPTRequestBody, EvaluationItem } from '../types';
const { VITE_OPENAI_API_KEY } = import.meta.env;

export const CallGpt = async (
  subject: string,
  item: EvaluationItem
): Promise<string> => {
  console.log(VITE_OPENAI_API_KEY);
  const apiKey = VITE_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OpenAI API key is not configured');
  }

  const prompt = `
[역할]
교과 담당 교사로서 학교생활기록부 세부능력 및 특기사항 작성자

[맥락]
- 교과별 학생 평가 결과를 객관적이고 긍정적으로 서술
- 성취기준과 평가요소를 바탕으로 학생의 성취 수준 기술

[형식 요구사항]
1. 문장 구조
  - 한 문장으로 작성
  - 필수 종결어미: '-임', '-함'
  - 금지 종결어미: '-다', '-하다', '-학생임'
  - 부정적 표현 사용 금지

2. 내용 구성
  A. 필수 포함 요소
  - 성취기준과 관련 능력
  - 평가요소 관련 수행 내용
  - 단계(A,B,C)에 따른 성취 수준
  
  B. 서술 방식
  - 객관적 사실 중심
  - 긍정적 표현
  - 구체적 능력 명시
  - 단계와 수준을 직접적으로 언급하는 것은 금지

3. 입력 정보 활용
  - 과목: 교과 특성 반영
  - 영역: 해당 단원/영역의 핵심 개념
  - 성취기준: 습득해야 할 능력
  - 평가요소: 평가 문항의 핵심 내용
  - 단계: 성취 수준(A,B,C)

[출력 형식]
성취기준과 평가요소를 연계하여 서술하되,
1. 명사형 종결어미('-함', '-임') 사용
2. 평가 내용 + 수행 능력/태도의 구조
3. 부정적 표현 대신 발전적 표현 사용

[예시]
1. 세계 각 대륙의 다양한 나라들의 영토와 범위를 체계적으로 파악하고 각국의 특징을 정확하게 이해하는 능력이 우수함.

2. 지구촌 환경 문제의 심각성을 인식하고 이를 해결하기 위한 구체적인 방안을 제시하며 실천하려는 태도가 돋보임.

3. 비례식의 성질을 정확히 이해하고 이를 실생활 문제 해결에 적절히 활용하는 능력이 탁월한 모습을 보여줌.

4. 평행사변형의 넓이 구하기에서 밑변과 높이의 관계를 명확히 파악하고 문제를 정확하게 해결하는 능력이 우수함.

5. 논설문 작성 시 주장을 뒷받침하는 타당한 근거와 적절한 자료를 효과적으로 활용하는 능력이 뛰어난 모습을 보임.

예시 구조 분석:
"각 대륙에 있는 다양한 나라를 살펴보고 그 나라의 영토 크기와 범위를 파악해 각 나라의 특징을 이해함."
↓
[평가 내용: 각 대륙의 나라 탐구] + [수행 능력: 영토 크기와 범위 파악] + [결과: 특징 이해] + [종결어미: -함]

[입력할 평가 정보]
아래에 제시하는 과목, 영역, 성취기준, 평가요소, 단계를 바탕으로 위 형식에 맞는 평가 결과를 작성해주세요:
과목: ${subject}
영역: ${item.area}
성취기준: ${item.standard}
평가요소: ${item.element}
단계: ${item.level}
`;

  const requestBody: GPTRequestBody = {
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful assistant that writes concise and precise academic evaluations. Please respond in Korean.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 1,
    max_tokens: 200,
  };

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData: GPTResponse = await response.json();
    return responseData.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error calling GPT API:', error);
    throw error;
  }
};
