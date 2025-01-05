import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface PersistentState {
  isSidebarOpen: boolean;
  currentChatId: string | null;
  messages: any[];
  chats: any[];
  theme: 'light' | 'dark';
  isSettingsOpen: boolean;
  isInputFocused: boolean;
  inputHeight: number;
  scrollPosition: number;
  isLoading: boolean;
  loadingMessage: string;
  customPrompt: string | null;
}

interface PersistentActions {
  setTheme: (theme: 'light' | 'dark') => void;
  setCurrentChat: (chatId: string) => void;
  toggleSidebar: () => void;
  toggleSettings: () => void;
  setInputFocus: (focused: boolean) => void;
  setInputHeight: (height: number) => void;
  setScrollPosition: (position: number) => void;
  setLoadingState: (state: { isLoading: boolean; message?: string }) => void;
  updateMessages: (messages: any[]) => void;
  updateChats: (chats: any[]) => void;
  setSidebarState: (isOpen: boolean) => void;
  setCustomPrompt: (prompt: string | null) => void;
}

export const usePersistentState = create<PersistentState & PersistentActions>()(
  persist(
    (set, get) => ({
      // Initial state
      isSidebarOpen: true,
      currentChatId: null,
      messages: [],
      chats: [],
      theme: 'light',
      isSettingsOpen: false,
      isInputFocused: false,
      inputHeight: 60,
      scrollPosition: 0,
      isLoading: false,
      loadingMessage: '',
      customPrompt: null,

      // Actions
      setTheme: (theme) => set({ theme }),
      setCurrentChat: (chatId) => set({ currentChatId: chatId }),
      toggleSidebar: () => {
        const currentState = get().isSidebarOpen;
        console.log('toggleSidebar: current state:', currentState);
        set({ isSidebarOpen: !currentState });
        console.log('toggleSidebar: new state:', !currentState);
      },
      toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
      setInputFocus: (focused) => set({ isInputFocused: focused }),
      setInputHeight: (height) => set({ inputHeight: height }),
      setScrollPosition: (position) => set({ scrollPosition: position }),
      setLoadingState: (state) => set({ 
        isLoading: state.isLoading, 
        loadingMessage: state.message || '' 
      }),
      updateMessages: (messages) => set({ messages }),
      updateChats: (chats) => set({ chats }),
      setSidebarState: (isOpen) => {
        console.log('setSidebarState called with:', isOpen);
        set({ isSidebarOpen: isOpen });
        console.log('new isSidebarOpen state:', get().isSidebarOpen);
      },
      setCustomPrompt: (prompt) => set({ customPrompt: prompt }),
    }),
    {
      name: 'chat-persistent-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        console.log('Rehydrated state:', state);
      },
      partialize: (state) => {
        const persistedState = {
          isSidebarOpen: state.isSidebarOpen,
          currentChatId: state.currentChatId,
          theme: state.theme,
          customPrompt: state.customPrompt,
        };
        console.log('Persisting state:', persistedState);
        return persistedState;
      },
    }
  )
); 