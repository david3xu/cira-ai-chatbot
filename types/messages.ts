import { ChatCompletionMessageParam, ChatCompletionContentPart } from 'openai/resources/chat/completions';

export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string | ChatCompletionContentPart[];
  dominationField?: string;
  image?: string;
  model?: string;
}

export interface FormattedMessage extends Omit<ChatCompletionMessageParam, 'content'> {
  content: string | ChatCompletionContentPart[];
  document?: {
    text: string;
    title?: string;
  };
}

export type MessageContent = {
  type: 'text' | 'image_url' | 'image_file';
  text?: string;
  image_url?: {
    url: string;
    detail?: string;
  };
  image_file?: {
    file: string;
    detail?: string;
  };
};

export type DocumentContent = {
  text: string;
  document?: {
    text: string;
  };
}; 