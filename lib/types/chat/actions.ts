import { Chat, ChatMessage } from '@/lib/types/chat/chat';

export type ChatAction =
  | { type: 'UPDATE_CHAT_STATE'; payload: { currentChat: Chat; chats: Chat[] } }
  | { type: 'SET_CURRENT_CHAT'; payload: Chat | null }
  | { type: 'SET_CHATS'; payload: Chat[] }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_MESSAGES'; payload: ChatMessage[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };