// Core database types
export type {
  ChatTableRow,
  ChatMessageTableRow,
  DBChat,
  DBMessage,
  DBDocument,
  DBChatExtended
} from './database';

// Application types
export type { Chat, ChatMessage, ChatUpdate } from './chat';

// State management
export type { 
  ChatState, 
  ChatAPIState, 
  ChatDomainState,
} from './chat-state';

// UI types
export type { 
  ChatUIState,
} from './chat-ui';

// Context and hooks
export type { 
  ChatHookReturn,
  ChatContextValue,
  ChatActions,
  ChatProviderProps 
} from './chat-context';

// API types
export type {
  SendMessageParams,
  CreateNewChatParams,
  TransactionResponse,
  ChatStorageResponse,
  MessageRequest,
  MessageResponse,
  APIAction
} from './chat-api';

// AI Types
export type { 
  AIModel, 
  AICompletionOptions 
} from './ai';

// General API Types
export type {
  ApiResponse,
  ModelUpdateRequest,
  EmbeddingRequest,
  UploadMarkdownRequest,
  OllamaRequest,
  DocumentChatRequest
} from './api';

// App Types
export type {
  Document,
  ProcessDocumentOptions,
  SearchOptions,
  ChatOptions,
  StreamOptions,
  ChatStreamOptions,
  UploadedFile,
  UploadProgress,
  FormattedMessage
} from './app';

// Document Types
export type {
  Document as DocumentType,
  DocumentState,
  DocumentAction
} from './document';

// Model Types
export type {
  ModelDetails,
  OllamaModel,
  Model,
  ModelConfig
} from './model';

// Provider Types
export type {
  ProviderProps,
  ProviderState
} from './provider';

// Theme Types
export type {
  ThemeState,
  ThemeContextValue,
  ThemeAction
} from './theme';

// Action Types
export type { ChatAction } from './chat-action';
export type { UIAction } from './chat-ui';
export type { ChatDomainAction } from './chat-domain-state';

// Re-export initial states
export { initialChatState } from './chat-state';
export { initialChatDomainState } from './chat-domain-state';


// Rest of your existing exports...

