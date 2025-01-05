import { Chat } from './chat';
import { ChatMessage, MessageStatus } from './chat-message';
import { OllamaModel } from './model';
import { ChatUIState } from './chat-ui';
import { ModelConfig } from './model';

// API/Runtime state
export interface ChatAPIState {
  isLoading: boolean;
  isProcessing: boolean;
  isTyping: boolean;
  isStreaming: boolean;
  currentOperation: string | null;
  error: Error | null;
  pendingRequests: string[];
  streamingStatus: 'idle' | 'streaming' | 'complete';
  streamingMessage: string;
  streamingMessageId: string | null;
  loadingMessage?: string;
  activeOperations: Operation[];
}

// Domain/Data state that maps to database
export interface ChatDomainState {
  chats: Chat[];
  currentChat: Chat | null;
  currentMessage: ChatMessage | null;
  messages: ChatMessage[];
  searchResults: Chat[];
  searchQuery: string | null;
  filteredChats: Chat[] | null;
  selectedModel: string;
  dominationField: string;
  customPrompt: string | undefined | null;
  hasCustomPrompt: boolean;
  models: OllamaModel[];
  temperature: number;
  maxTokens: number;
  modelConfig: ModelConfig | null;
}

// New type for message actions
export interface NewMessagePayload {
  message: ChatMessage;
  shouldCreateChat?: boolean;
}

export interface MessageUpdatePayload {
  id: string;
  messagePairId?: string;
  chatId?: string;
  content?: string;
  assistant_content?: string;
  status?: MessageStatus;
  isStreaming?: boolean;
}

// Combined state
export interface ChatState extends ChatUIState, ChatAPIState, ChatDomainState {
  currentChat: Chat | null;
  lastMessageId: string | null;
  messageStatus: 'idle' | 'sending' | 'success' | 'failed';
}

// Initial state
export const initialChatState: ChatState = {
  // Domain state
  chats: [],
  currentChat: null,
  currentMessage: null,
  messages: [],
  searchResults: [],
  searchQuery: null,
  filteredChats: null,
  selectedModel: 'null',
  dominationField: typeof window !== 'undefined' 
    ? localStorage.getItem('selectedDominationField') || 'General'
    : 'General',
  customPrompt: undefined,
  hasCustomPrompt: false,
  models: [],
  temperature: 0.7,
  maxTokens: 2048,
  inputHeight: 0,
  modelConfig: null,
  
  // UI state
  isInputFocused: false,
  isSidebarOpen: false,
  isSettingsOpen: false,
  selectedMessageId: null,
  scrollPosition: 0,
  theme: 'light',
  isEditing: false,
  editingMessage: null,
  
  // API state
  isLoading: false,
  isProcessing: false,
  isTyping: false,
  isStreaming: false,
  currentOperation: null,
  error: null,
  streamingMessage: '',
  pendingRequests: [],
  streamingStatus: 'idle',
  streamingMessageId: null,
  loadingMessage: undefined,
  activeOperations: [],
  lastMessageId: null,
  messageStatus: 'idle'
};

export interface Operation {
  type: string;
  startedAt: string;
  endedAt?: string;
  message?: string;
}