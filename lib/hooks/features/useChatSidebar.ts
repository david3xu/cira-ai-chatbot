import { useCallback, useMemo } from 'react'
import { useChatContext } from '@/lib/features/chat/context/chatContext'
import { useChatUI } from '../ui/useChatUI'
import { useLoadingActions } from '@/lib/hooks/state/useLoadingActions'
import type { Chat } from '@/lib/types'
import { useContext } from 'react'
import { ChatDomainContext } from '@/lib/features/chat/context/chatContext'
import { DominationField } from '@/lib/features/ai/config/constants'

interface SidebarState {
  chats: Chat[]
  currentChatId: string | null
  isLoading: boolean
  isSidebarOpen: boolean
  searchQuery: string | null
  filteredChats: Chat[] | null
}

interface SidebarOptions {
  switchToChat?: boolean
  customPrompt?: string
}

interface ChatGroup {
  date: string
  chats: Chat[]
  totalMessages: number
}

export function useChatSidebar() {
  const chatContext = useChatContext();
  const domainContext = useContext(ChatDomainContext);

  if (!chatContext || !domainContext) {
    throw new Error('Chat contexts must be used within their providers');
  }

  const { state, dispatch } = chatContext;

  // Chat Organization
  const chatGroups = useMemo((): ChatGroup[] => {
    if (!state.chats) return [];
    
    const groups = state.chats.reduce<Record<string, Chat[]>>((acc: Record<string, Chat[]>, chat: Chat) => {
      const date = new Date(chat.createdAt).toLocaleDateString()
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(chat)
      return acc
    }, {})

    return Object.entries(groups)
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .map(([date, chats]: [string, Chat[]]) => ({
        date,
        chats: chats.sort((a: Chat, b: Chat) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
        totalMessages: chats.reduce((acc: number, chat: Chat) => acc + (chat.messages?.length || 0), 0)
      }))
  }, [state.chats])

  const recentChats = useMemo(() => {
    if (!state.chats) return [];
    
    return state.chats
      .sort((a: Chat, b: Chat) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  }, [state.chats])

  const pinnedChats = useMemo(() => {
    if (!state.chats) return [];
    
    return state.chats.filter((chat: Chat) => chat.isPinned)
      .sort((a: Chat, b: Chat) => 
        new Date(b.pinnedAt || b.createdAt).getTime() - new Date(a.pinnedAt || a.createdAt).getTime()
      )
  }, [state.chats])

  // Sidebar UI
  const setDominationField = useCallback((field: DominationField) => {
    domainContext.dispatch({ type: 'SET_DOMINATION_FIELD', payload: field });
  }, [domainContext]);

  return {
    // State
    chats: state.chats,
    currentChatId: state.currentChat?.id,
    isLoading: state.isLoading,
    isSidebarOpen: state.isSidebarOpen,

    // Chat Organization
    recentChats,
    chatGroups,
    pinnedChats,

    // Sidebar Actions
    setDominationField,

    // Helpers
    getSidebarState: (): SidebarState => ({
      chats: state.chats,
      currentChatId: state.currentChat?.id || null,
      isLoading: state.isLoading,
      isSidebarOpen: state.isSidebarOpen,
      searchQuery: state.searchQuery,
      filteredChats: state.filteredChats
    }),
    isChatSelected: (id: string) => state.currentChat?.id === id,
    hasChats: state.chats.length > 0,
    getChatById: (id: string) => state.chats.find((chat: Chat) => chat.id === id),
    getChatMessages: (id: string) => state.chats.find((chat: Chat) => chat.id === id)?.messages || [],
    getTotalMessages: (id: string) => state.chats.find((chat: Chat) => chat.id === id)?.messages.length || 0,

    // Add chat state needed by ChatSidebar
    currentChat: state.currentChat,
    dominationField: domainContext.state.dominationField || state.currentChat?.domination_field || 'NORMAL_CHAT',
  }
}
