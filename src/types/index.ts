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

export interface EvaluationItem {
	number: string;
	area: string;
	standard: string;
	element: string;
	level: string;
	result: string;
}

export interface ExcelData {
	subject: string;
	evaluations: EvaluationItem[];
}
