export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GPTRequestBody {
  model: string;
  messages: Message[];
  temperature: number;
  max_tokens: number;
}

export interface GPTResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Choice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface Choice {
  message: Message;
  finish_reason: string;
  index: number;
}

export interface GradeEvaluationItem {
  number: string;
  area: string;
  standard: string;
  element: string;
  level: string;
  result: string;
}

export interface GradeExcelData {
  evaluations: GradeEvaluationItem[];
}

export interface BehaviorEvaluationItem {
  number: string;
  characteristics: string;
  activity?: string;
  result: string;
}

export interface BehaviorExcelData {
  evaluations: BehaviorEvaluationItem[];
}

export type SchoolCategory = 'ele' | 'kinder' | 'mid';
