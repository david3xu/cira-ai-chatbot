export interface FormattedMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  type?: 'text' | 'image';
}

export interface CompletionResponse {
  content: string;
  finish_reason: string;
}

export interface AIConfig {
  model: string;
  temperature: number;
  max_tokens: number;
  stream?: boolean;
}

export interface SearchResult {
  content: string;
  score: number;
}

export interface AnswerQuestionParams {
  message: string;
  chatHistory: any[];
  dominationField?: string;
  chatId: string;
  customPrompt?: string;
  imageBase64?: string;
  model?: string;
  onToken?: (token: string) => void;
  onError?: (error: string) => void;
  skipMessageStorage?: boolean;
}

export interface AnswerQuestionResponse {
  content: string;
  chat_topic?: string;
} 