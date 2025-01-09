'use client';

import React, { useReducer, useMemo, useEffect, useCallback } from 'react'
import { ChatUIContext } from '@/lib/features/chat/context/chatContext';
import { ChatUIState } from '@/lib/types'
import { UIAction } from '@/lib/types'
import { ChatMessage } from '@/lib/types'
import { usePersistentState } from '@/lib/hooks/state/usePersistentState';

const DEFAULT_PREFERENCES = {
  theme: 'light' as const,
  fontSize: 16,
  inputHeight: 60
}

const initialState: Omit<ChatUIState, 'isSidebarOpen'> = {
  isSettingsOpen: false,
  selectedMessageId: null,
  isEditing: false,
  editingMessage: null,
  isInputFocused: false,
  scrollPosition: 0,
  theme: DEFAULT_PREFERENCES.theme,
  isLoading: false,
  loadingMessage: undefined,
  inputHeight: DEFAULT_PREFERENCES.inputHeight
};

function uiReducer(state: Omit<ChatUIState, 'isSidebarOpen'>, action: UIAction): Omit<ChatUIState, 'isSidebarOpen'> {
  switch (action.type) {
    case 'SET_SETTINGS_OPEN':
      return { ...state, isSettingsOpen: action.payload };
    case 'SET_SELECTED_MESSAGE':
      return { ...state, selectedMessageId: action.payload };
    case 'SET_THEME':
      return { 
        ...state, 
        theme: action.payload 
      };
    case 'SET_EDITING':
      return { 
        ...state, 
        isEditing: action.payload 
      };
    case 'SET_EDITING_MESSAGE':
      return { 
        ...state, 
        editingMessage: action.payload 
      };
    case 'SET_INPUT_FOCUS':
      return { ...state, isInputFocused: action.payload };
    case 'SET_INPUT_HEIGHT':
      return { ...state, inputHeight: action.payload };
    case 'SET_SCROLL_POSITION':
      return { ...state, scrollPosition: action.payload };
    case 'SET_LOADING_STATE':
      return { 
        ...state, 
        isLoading: action.payload.isLoading,
        loadingMessage: action.payload.message 
      };
    default:
      return state;
  }
}

export function ChatUIProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(uiReducer, initialState);
  const { isSidebarOpen, toggleSidebar } = usePersistentState();

  const value = useMemo(() => ({
    state: {
      ...state,
      isSidebarOpen,
    },
    dispatch,
    actions: {
      toggleSidebar,
      setTheme: (theme: 'light' | 'dark') => dispatch({ type: 'SET_THEME', payload: theme }),
      toggleSettings: (isOpen?: boolean) => dispatch({ 
        type: 'SET_SETTINGS_OPEN', 
        payload: isOpen ?? !state.isSettingsOpen 
      }),
      selectMessage: (id: string | null) => dispatch({ type: 'SET_SELECTED_MESSAGE', payload: id }),
      toggleTheme: () => dispatch({ type: 'SET_THEME', payload: state.theme === 'light' ? 'dark' : 'light' }),
      setEditing: (isEditing: boolean) => dispatch({ type: 'SET_EDITING', payload: isEditing }),
      setEditingMessage: (message: ChatMessage | null) => dispatch({ type: 'SET_EDITING_MESSAGE', payload: message }),
      setInputFocus: (focused: boolean) => dispatch({ type: 'SET_INPUT_FOCUS', payload: focused }),
      setInputHeight: (height: number) => dispatch({ type: 'SET_INPUT_HEIGHT', payload: height }),
      setScrollPosition: (position: number) => dispatch({ type: 'SET_SCROLL_POSITION', payload: position }),
      setLoadingState: ({ isLoading, message }: { isLoading: boolean; message?: string }) => 
        dispatch({ type: 'SET_LOADING_STATE', payload: { isLoading, message } }),
    },
    isDarkMode: state.theme === 'dark',
    isMobile: typeof window !== 'undefined' && window.innerWidth < 768,
    isSidebarOpen,
  }), [state, isSidebarOpen, toggleSidebar]);

  return <ChatUIContext.Provider value={value}>{children}</ChatUIContext.Provider>;
} 