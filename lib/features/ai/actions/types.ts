import { ChatMessage } from '@/lib/types';
import { DominationField } from '../prompts/types';

export interface AnswerQuestionOptions {
  messages: ChatMessage[];
  onToken?: (token: string) => void;
  dominationField?: DominationField;
  customPrompt?: string | null;
  chatId?: string;
  model?: string;
  contextText?: string;
}

export interface AnswerQuestionResponse {
  content: string;
  chat_topic?: string;
} 