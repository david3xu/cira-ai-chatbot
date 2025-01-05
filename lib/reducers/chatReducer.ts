/**
 * Chat Reducer
 * 
 * Manages chat state updates with:
 * - Chat selection
 * - Message management
 * - Loading states
 * - Storage synchronization
 * 
 * Features:
 * - State validation
 * - Storage integration
 * - Message handling
 * - Loading management
 * - Chat list updates
 */

import { Chat, ChatMessage, ChatState, ChatAction } from '@/lib/types';
import { transformDatabaseMessage, transformMessageToDatabase } from '@/lib/utils/messageTransformer';
import { MessageStatus } from '../types/chat-message';

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    // Message Actions
    case 'SET_MESSAGES':
      return {
        ...state,
        messages: action.payload,
        streamingMessageId: null,
        isStreaming: false
      };

    case 'ADD_MESSAGE': {
      const { message, shouldCreateChat } = action.payload;
      const newMessages = [...(state.messages || []), message];
      
      if (!state.currentChat && shouldCreateChat) {
        const domainField = message.dominationField || state.dominationField || 'General';
        
        const newChat: Chat = {
          id: message.chatId,
          userId: '00000000-0000-0000-0000-000000000000',
          name: 'New Chat',
          messages: newMessages,
          model: message.model || state.selectedModel,
          domination_field: domainField,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt,
          custom_prompt: state.customPrompt || null,
          metadata: null
        };
        return {
          ...state,
          currentChat: newChat,
          messages: newMessages,
          chats: [newChat, ...state.chats],
          dominationField: domainField
        };
      }
      
      return {
        ...state,
        messages: newMessages,
        currentChat: state.currentChat ? {
          ...state.currentChat,
          messages: newMessages,
          updatedAt: new Date().toISOString()
        } : null
      };
    }

    case 'UPDATE_MESSAGE': {
      const updatedMessages = state.messages.map(message =>
        message.id === action.payload.id
          ? { 
              ...message, 
              ...action.payload,
              assistantContent: action.payload.assistantContent || message.assistantContent,
              status: action.payload.status || message.status
            }
          : message
      );

      return {
        ...state,
        messages: updatedMessages,
        currentChat: state.currentChat ? {
          ...state.currentChat,
          messages: updatedMessages,
          updatedAt: new Date().toISOString()
        } : null
      };
    }

    case 'DELETE_MESSAGE':
      return {
        ...state,
        messages: state.messages.filter(message => 
          message.id !== action.payload
        )
      };

    // Streaming Actions
    case 'SET_STREAMING_MESSAGE_ID':
      return {
        ...state,
        streamingMessageId: action.payload,
        isStreaming: Boolean(action.payload)
      };

    case 'UPDATE_STREAMING_CONTENT': {
      if (!state.streamingMessageId) return state;
      return {
        ...state,
        messages: state.messages.map(message =>
          message.id === state.streamingMessageId
            ? {
                ...message,
                assistantContent: (message.assistantContent || '') + action.payload,
                status: 'streaming'
              }
            : message
        )
      };
    }

    // Status Actions
    case 'SET_MESSAGE_STATUS': {
      const { messageId, status } = action.payload;
      return {
        ...state,
        messages: state.messages.map(message =>
          message.id === messageId
            ? { ...message, status: status as MessageStatus }
            : message
        )
      };
    }

    // Existing Chat Actions
    case 'SET_CHATS':
      return { ...state, chats: action.payload };

    case 'UPDATE_CHAT': {
      const updatedChat = action.payload;
      
      return {
        ...state,
        chats: state.chats.map(chat => 
          chat.id === updatedChat.id ? {
            ...chat,
            ...updatedChat,
            name: updatedChat.name || chat.name // Preserve existing name if new one is not provided
          } : chat
        ),
        currentChat: state.currentChat?.id === updatedChat.id ? {
          ...state.currentChat,
          ...updatedChat,
          name: updatedChat.name || state.currentChat.name
        } : state.currentChat
      };
    }

    case 'SET_CURRENT_CHAT': {
      const chat = action.payload;
      const savedDomainField = localStorage.getItem('selectedDominationField');
      return {
        ...state,
        currentChat: chat,
        messages: chat?.messages || [],
        selectedModel: chat?.model || state.selectedModel,
        dominationField: savedDomainField || chat?.domination_field || state.dominationField
      };
    }

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_MODEL':
      return { 
        ...state, 
        selectedModel: action.payload,
        currentChat: state.currentChat ? {
          ...state.currentChat,
          model: action.payload
        } : null
      };

    case 'SET_MODEL_CONFIG':
      return { ...state, modelConfig: action.payload };

    case 'SET_CUSTOM_PROMPT':
      const updatedCustomPrompt = action.payload;
      const updatedCurrentChat = state.currentChat ? {
        ...state.currentChat,
        custom_prompt: updatedCustomPrompt,
        updatedAt: new Date().toISOString()
      } : null;
      
      const updatedChats = state.chats.map(chat => 
        chat.id === updatedCurrentChat?.id 
          ? updatedCurrentChat
          : chat
      );
      
      return { 
        ...state, 
        customPrompt: updatedCustomPrompt,
        hasCustomPrompt: !!updatedCustomPrompt,
        currentChat: updatedCurrentChat,
        chats: updatedChats
      };

    case 'STREAM_EVENT': {
      const { messageId, event } = action.payload;
      
      switch (event.type) {
        case 'start':
          return {
            ...state,
            messages: state.messages.map(message =>
              message.id === messageId
                ? {
                    ...message,
                    streaming: {
                      isActive: true,
                      progress: 0,
                      startedAt: new Date().toISOString(),
                      completedAt: undefined,
                      response: undefined
                    }
                  }
                : message
            )
          };

        case 'message':
          return {
            ...state,
            messages: state.messages.map(message =>
              message.id === messageId
                ? {
                    ...message,
                    assistantContent: (message.assistantContent || '') + event.content
                  }
                : message
            )
          };

        case 'progress':
          return {
            ...state,
            messages: state.messages.map(message =>
              message.id === messageId
                ? {
                    ...message,
                    streaming: {
                      ...message.streaming,
                      isActive: true,
                      progress: event.progress.percentage
                    }
                  }
                : message
            )
          };

        case 'complete':
          return {
            ...state,
            messages: state.messages.map(message =>
              message.id === messageId
                ? {
                    ...message,
                    streaming: {
                      ...message.streaming,
                      isActive: false,
                      completedAt: new Date().toISOString(),
                      response: event.response
                    }
                  }
                : message
            )
          };

        default:
          return state;
      }
    }

    case 'SET_SIDEBAR_OPEN':
      return {
        ...state,
        isSidebarOpen: action.payload
      };

    case 'SET_EDITING_MESSAGE':
      return {
        ...state,
        editingMessage: action.payload,
        isEditing: Boolean(action.payload)
      };

    case 'SET_STREAMING_MESSAGE': {
      if (!state.streamingMessageId) return state;
      return {
        ...state,
        messages: state.messages.map(message =>
          message.id === state.streamingMessageId
            ? {
                ...message,
                assistantContent: action.payload,
                status: 'streaming',
                isStreaming: true
              }
            : message
        )
      };
    }

    case 'SET_STREAMING':
      return {
        ...state,
        isStreaming: action.payload,
        messages: state.messages.map(message =>
          message.streaming?.isActive
            ? { ...message, streaming: { ...message.streaming, isActive: action.payload } }
            : message
        )
      };

    case 'SET_DOMINATION_FIELD':
      return { 
        ...state, 
        dominationField: action.payload,
        currentChat: state.currentChat ? {
          ...state.currentChat,
          domination_field: action.payload
        } : null
      };

    case 'INITIALIZE_CHAT':
      const newChat = {
        ...action.payload,
        messages: action.payload.messages || [],
        model: action.payload.model || state.selectedModel,
        domination_field: action.payload.domination_field,
        custom_prompt: action.payload.custom_prompt || state.customPrompt || null
      };
      return {
        ...state,
        currentChat: newChat,
        chats: [newChat, ...state.chats],
        messages: newChat.messages,
        selectedModel: newChat.model || state.selectedModel,
        dominationField: newChat.domination_field,
        customPrompt: newChat.custom_prompt
      };

    default:
      return state;
  }
}
