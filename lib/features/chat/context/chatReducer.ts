import { ChatState } from '@/lib/types/chat/chat';
import { storageActions } from '../actions/storage';
import { ChatAction } from '@/lib/types/chat/actions';


export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'UPDATE_CHAT_STATE':
      return {
        ...state,
        currentChat: action.payload.currentChat,
        chats: action.payload.chats,
        error: null
      };

    case 'SET_CURRENT_CHAT':
      storageActions.session.setCurrentChat(action.payload);
      return {
        ...state,
        currentChat: action.payload,
        error: null
      };

    case 'SET_CHATS':
      storageActions.persistent.saveChats(action.payload);
      return {
        ...state,
        chats: action.payload,
        error: null
      };

    case 'ADD_MESSAGE': {
      console.log('Adding message:', action.payload);
      console.log('Current state:', state);
      const newMessage = action.payload;
      
      if (!state.currentChat) {
        return {
          ...state,
          messages: [...state.messages, newMessage]
        };
      }
      
      const updatedChat = {
        ...state.currentChat,
        messages: [...(state.currentChat.messages || []), newMessage]
      };
      
      storageActions.persistent.saveChat(updatedChat);
      
      const newState = {
        ...state,
        currentChat: updatedChat,
        messages: [...(state.messages || []), newMessage],
        chats: state.chats.map(chat => 
          chat.id === updatedChat.id ? updatedChat : chat
        )
      };
      
      console.log('Updated state:', newState);
      return newState;
    }

    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}
