export interface FormattedMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  type?: 'text' | 'image';
} 