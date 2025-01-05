import { ChatMessage } from './chat-message'

// UI-specific types that don't need persistence
export interface ChatUIState {
  isInputFocused: boolean;
  isSidebarOpen: boolean;
  isSettingsOpen: boolean;
  selectedMessageId: string | null;
  scrollPosition: number;
  theme: string;
  isEditing: boolean;
  editingMessage: ChatMessage | null;
  inputHeight: number;
  isLoading: boolean;
  loadingMessage?: string;
}

export type UIAction = 
  | { type: 'SET_INPUT_FOCUS'; payload: boolean }
  | { type: 'SET_SIDEBAR_OPEN'; payload: boolean }
  | { type: 'SET_SETTINGS_OPEN'; payload: boolean }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_EDITING'; payload: boolean }
  | { type: 'SET_EDITING_MESSAGE'; payload: ChatMessage | null }
  | { type: 'SET_SELECTED_MESSAGE'; payload: string | null }
  | { type: 'SET_INPUT_HEIGHT'; payload: number }
  | { type: 'SET_SCROLL_POSITION'; payload: number }
  | { type: 'SET_LOADING_STATE'; payload: { isLoading: boolean; message?: string } };
  