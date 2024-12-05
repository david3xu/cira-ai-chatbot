import { ChatState } from '@/lib/types/chat/chat';
import { ChatStorageManager } from '../utils/ChatStorageManager';
import { ChatAction } from '@/lib/types/chat/chat';

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_CURRENT_CHAT':
      if (!action.payload) {
        return {
          ...state,
          currentChat: null,
          messages: []
        };
      }

      // Don't update storage during loading states
      if (!state.isLoading) {
        ChatStorageManager.updateChat(action.payload);
      }

      return {
        ...state,
        currentChat: action.payload,
        messages: action.payload?.messages || []
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    case 'SET_CHATS':
      const validatedChats = action.payload.map(chat => ({
        ...chat,
        dominationField: chat.dominationField || 'Normal Chat',
        model: chat.model || 'null',
        messages: chat.messages || [],
        metadata: chat.metadata || {},
        customPrompt: chat.customPrompt || null
      }));

      return {
        ...state,
        chats: validatedChats
      };

    case 'ADD_MESSAGE': {
      if (state.isLoading) return state;

      const newMessage = action.payload;
      const updatedChat = state.currentChat ? {
        ...state.currentChat,
        messages: [...state.currentChat.messages, newMessage],
        dominationField: state.currentChat.dominationField || 'Normal Chat'
      } : null;

      if (updatedChat && !state.isLoading) {
        ChatStorageManager.updateChat(updatedChat);
      }

      return {
        ...state,
        currentChat: updatedChat,
        messages: updatedChat?.messages || []
      };
    }

    case 'UPDATE_CHAT_STATE':
      return {
        ...state,
        ...action.payload
      };

    default:
      return state;
  }
}
