import { ChatCompletionMessageParam, ChatCompletionContentPart } from 'openai/resources/chat/completions';

export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string | ChatCompletionContentPart[];
  dominationField?: string;
}

export interface FormattedMessage extends Omit<ChatCompletionMessageParam, 'content'> {
  content: string | ChatCompletionContentPart[];
  document?: {
    text: string;
    title?: string;
  };
} 