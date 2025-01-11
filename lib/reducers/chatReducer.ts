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

// Helper function for merging chat data
function mergeChatData(existingChat: Chat | undefined, newChat: Chat) {
  return existingChat ? {
    ...existingChat,
    ...newChat,
    // Preserve certain fields from existing chat unless explicitly provided
    messages: newChat.messages?.length ? newChat.messages : existingChat.messages || [],
    model: newChat.model || existingChat.model,
    custom_prompt: newChat.custom_prompt || existingChat.custom_prompt,
    domination_field: newChat.domination_field || existingChat.domination_field,
    metadata: { ...(existingChat.metadata || {}), ...(newChat.metadata || {}) }
  } : newChat;
}

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

    case 'DELETE_CHAT': {
      const deletedChatId = action.payload;
      const updatedChats = state.chats.filter(chat => chat.id !== deletedChatId);
      
      // If the deleted chat was the current chat, clear it
      const updatedCurrentChat = state.currentChat?.id === deletedChatId ? null : state.currentChat;
      const updatedMessages = updatedCurrentChat ? state.messages : [];

      return {
        ...state,
        chats: updatedChats,
        currentChat: updatedCurrentChat,
        messages: updatedMessages
      };
    }

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
              // Preserve assistant content when status changes to success
              assistantContent: action.payload.status === 'success' 
                ? message.assistantContent 
                : (action.payload.assistantContent || message.assistantContent),
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
        } : null,
        // Clear streaming state when message is complete
        streamingMessageId: action.payload.status === 'success' ? null : state.streamingMessageId,
        isStreaming: action.payload.status === 'success' ? false : state.isStreaming
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
      return {
        ...state,
        chats: action.payload.map(chat => ({
          ...chat,
          // Preserve messages if it's the current chat
          messages: chat.id === state.currentChat?.id ? state.currentChat.messages : chat.messages
        }))
      };

    case 'UPDATE_CHAT': {
      const updatedChat = action.payload;
      const existingChat = state.chats.find(chat => chat.id === updatedChat.id);
      const savedDomainField = localStorage.getItem('selectedDominationField');
      
      console.log('🔍 UPDATE_CHAT action received:', { 
        payload: updatedChat,
        existingChat,
        currentChatId: state.currentChat?.id,
        chatName: updatedChat.name
      });
      
      // Use shared merging logic for data consistency
      const mergedChat = {
        ...mergeChatData(existingChat, updatedChat),
        // Ensure name is never undefined
        name: updatedChat.name || existingChat?.name || 'New Chat',
        // Preserve current messages if no new messages provided
        messages: updatedChat.messages?.length ? updatedChat.messages : (
          state.currentChat?.id === updatedChat.id ? state.messages : (existingChat?.messages || [])
        )
      };

      console.log('🔄 Merged chat result:', {
        mergedChat,
        existingName: existingChat?.name,
        updatedName: updatedChat.name,
        finalName: mergedChat.name,
        messageCount: mergedChat.messages?.length || 0,
        preservedMessages: !updatedChat.messages?.length
      });

      // Update chats list first (data sync)
      const updatedChats = state.chats.map(chat => 
        chat.id === updatedChat.id ? mergedChat : chat
      );

      // Only update current chat state if it's the active chat
      const isCurrentChat = state.currentChat?.id === updatedChat.id;
      
      const newState = {
        ...state,
        chats: updatedChats,
        // Only update UI state if it's the current chat
        currentChat: isCurrentChat ? mergedChat : state.currentChat,
        // Preserve current messages if we're just updating the name
        messages: isCurrentChat ? mergedChat.messages : state.messages,
        // Only update model/domain if it's the current chat
        selectedModel: isCurrentChat ? mergedChat.model || state.selectedModel : state.selectedModel,
        dominationField: isCurrentChat ? (savedDomainField || mergedChat.domination_field || state.dominationField) : state.dominationField
      };

      console.log('🎯 UPDATE_CHAT state result:', {
        currentChatName: newState.currentChat?.name,
        prevName: state.currentChat?.name,
        chatsChanged: JSON.stringify(newState.chats) !== JSON.stringify(state.chats),
        messagesChanged: JSON.stringify(newState.messages) !== JSON.stringify(state.messages),
        chatListNames: newState.chats.map(c => ({ id: c.id, name: c.name })),
        preservedMessages: !updatedChat.messages?.length
      });

      return newState;
    }

    case 'SET_CURRENT_CHAT': {
      const chat = action.payload;
      const savedDomainField = localStorage.getItem('selectedDominationField');

      // Handle navigation to no chat (clear selection)
      if (!chat) {
        console.log('🔄 SET_CURRENT_CHAT: Clearing current chat');
        return {
          ...state,
          currentChat: null,
          messages: [],
          // Preserve other state
          selectedModel: state.selectedModel,
          dominationField: state.dominationField
        };
      }

      // Find existing chat data to ensure UI shows latest state
      const existingChat = state.chats.find(c => c.id === chat.id);
      
      // Merge with existing data for UI consistency
      const finalChat = mergeChatData(existingChat, chat);

      console.log('🔄 SET_CURRENT_CHAT navigation:', {
        providedName: chat.name,
        existingName: existingChat?.name,
        finalName: finalChat.name,
        messageCount: finalChat.messages?.length || 0
      });

      // Update UI state for navigation
      return {
        ...state,
        // Update UI-specific state
        currentChat: finalChat,
        messages: finalChat.messages || [],
        // Update related UI state
        selectedModel: finalChat.model || state.selectedModel,
        dominationField: savedDomainField || finalChat.domination_field || state.dominationField
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
