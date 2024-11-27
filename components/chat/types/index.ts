import { ChatMessage } from '@/lib/types/chat/chat';

export interface ChatAreaProps {
  className?: string;
}

export interface ChatMessagesProps {
  messages: ChatMessage[];
  streamingMessage?: string;
  isLoading: boolean;
  error?: string | null;
  renderMessage: (message: ChatMessage) => React.ReactNode;
  onRetry?: (messageId: string) => void;
}

export interface ChatHistoryDisplayProps {
  chatId?: string;
  messages: ChatMessage[];
  streamingMessage?: string;
  isLoading: boolean;
  error: string | null;
}

export interface QuestionAnsweringProps {
  onSubmit?: (query: string, imageFile?: File) => Promise<void>;
} 