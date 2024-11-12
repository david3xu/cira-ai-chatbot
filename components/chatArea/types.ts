import type { ChatMessage } from '@/lib/chat';

export interface ChatAreaProps {
  className?: string;
}

export interface ChatMessagesProps {
  messages: ChatMessage[];
  streamingMessage: string;
  isLoading: boolean;
  error: string | null;
}

export interface StreamingMessageProps {
  assistantContent: string;
}

export interface CopyButtonProps {
  content: string;
  messageId: string;
}

export interface useChatProps {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  updateMessage: (messageId: string, content: string) => void;
  deleteMessage: (messageId: string) => void;
  clearMessages: () => void;
}

export interface ModelOption {
  value: string;
  label: string;
  details?: Record<string, unknown>;
}
