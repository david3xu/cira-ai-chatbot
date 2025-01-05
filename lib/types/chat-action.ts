import { Chat, ChatMessage } from './chat';
import { ModelConfig } from './model';
import { StreamEvent } from './streaming';
import { MessageStatus } from './chat-message';

export type ChatAction =
  // Message Actions
  | { type: 'SET_MESSAGES'; payload: ChatMessage[] }
  | { type: 'ADD_MESSAGE'; payload: { message: ChatMessage; shouldCreateChat?: boolean } }
  | { type: 'UPDATE_MESSAGE'; payload: Partial<ChatMessage> }
  | { type: 'DELETE_MESSAGE'; payload: string }
  
  // Chat Management
  | { type: 'SET_CHATS'; payload: Chat[] }
  | { type: 'SET_CURRENT_CHAT'; payload: Chat | null }
  | { type: 'UPDATE_CHAT'; payload: Chat }
  | { type: 'INITIALIZE_CHAT'; payload: Chat }
  
  // State Management
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error | null }
  | { type: 'SET_MODEL'; payload: string }
  | { type: 'SET_MODEL_CONFIG'; payload: ModelConfig }
  | { type: 'SET_DOMINATION_FIELD'; payload: string }
  | { type: 'SET_CUSTOM_PROMPT'; payload: string | null }
  | { type: 'SET_SIDEBAR_OPEN'; payload: boolean }
  | { type: 'SET_EDITING_MESSAGE'; payload: ChatMessage | null }
  
  // Streaming Actions
  | { type: 'SET_STREAMING_MESSAGE_ID'; payload: string | null }
  | { type: 'UPDATE_STREAMING_CONTENT'; payload: string }
  | { type: 'SET_STREAMING_MESSAGE'; payload: string }
  | { type: 'SET_STREAMING'; payload: boolean }
  | { type: 'STREAM_EVENT'; payload: { messageId: string; event: StreamEvent } }
  | { type: 'SET_MESSAGE_STATUS'; payload: { messageId: string; status: MessageStatus } }; 