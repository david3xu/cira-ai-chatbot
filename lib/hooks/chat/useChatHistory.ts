import { useState, useCallback, useMemo } from 'react'
import { useChatContext } from '@/lib/features/chat/context/chatContext'
import { useLoadingActions } from '@/lib/hooks/state/useLoadingActions'
import { ChatService } from '@/lib/services/ChatService'
import type { Chat, ChatMessage } from '@/lib/types'

interface HistoryState {
  chats: Chat[]
  searchResults: Chat[]
  searchQuery: string
  selectedChatId: string | null
  isSearching: boolean
  error: Error | null
}

interface HistoryItemState {
  editingId: string | null
  editedTitle: string
  isDeleting: boolean
  showConfirm: boolean
}

export function useChatHistory() {
  const { state, dispatch } = useChatContext()
  const { withLoading } = useLoadingActions()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [itemState, setItemState] = useState<HistoryItemState>({
    editingId: null,
    editedTitle: '',
    isDeleting: false,
    showConfirm: false
  })

  // Search functionality
  const searchChats = useCallback((query: string) => {
    if (!query.trim()) return state.chats
    
    const normalizedQuery = query.toLowerCase()
    return state.chats.filter(chat => 
      chat.title?.toLowerCase().includes(normalizedQuery) ||
      chat.messages.some(msg => 
        (msg.userContent || msg.assistantContent || '').toLowerCase().includes(normalizedQuery)
      )
    )
  }, [state.chats])

  // History item actions
  const handleDelete = useCallback((chatId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setItemState(prev => ({ 
      ...prev, 
      showConfirm: true,
      editingId: chatId 
    }))
  }, [])

  const handleConfirmDelete = useCallback(async (chatId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()

    return withLoading(async () => {
      try {
        setItemState(prev => ({ ...prev, isDeleting: true }))
        await ChatService.deleteChat(chatId)
        
        dispatch({ 
          type: 'SET_CHATS', 
          payload: state.chats.filter(chat => chat.id !== chatId)
        })

        if (state.currentChat?.id === chatId) {
          dispatch({ type: 'SET_CURRENT_CHAT', payload: null })
        }
      } catch (error) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: error instanceof Error ? error : new Error('Failed to delete chat')
        })
        throw error
      } finally {
        setItemState(prev => ({ 
          ...prev, 
          isDeleting: false,
          showConfirm: false,
          editingId: null 
        }))
      }
    }, 'Deleting chat...')
  }, [state.chats, state.currentChat?.id, dispatch, withLoading])

  const startEditing = useCallback((chatId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const currentTitle = state.chats.find(chat => chat.id === chatId)?.title || ''
    setItemState(prev => ({ 
      ...prev, 
      editingId: chatId,
      editedTitle: currentTitle
    }))
  }, [state.chats])

  const updateChatTitle = useCallback(async (chatId: string, newTitle: string) => {
    try {
      await ChatService.updateChat(chatId, { title: newTitle })
      dispatch({
        type: 'SET_CHATS',
        payload: state.chats.map(chat => 
          chat.id === chatId ? { ...chat, title: newTitle } : chat
        )
      })
      setItemState(prev => ({ ...prev, editingId: null }))
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error : new Error('Failed to update title')
      })
    }
  }, [dispatch])

  // Computed values
  const searchResults = useMemo(() => 
    searchQuery ? searchChats(searchQuery) : state.chats
  , [searchQuery, searchChats, state.chats])

  return {
    // State
    chats: state.chats,
    searchResults,
    searchQuery,
    isSearching,
    error: state.error,
    
    // History item state
    editingId: itemState.editingId,
    editedTitle: itemState.editedTitle,
    isDeleting: itemState.isDeleting,
    showConfirm: itemState.showConfirm,

    // Search actions
    setSearchQuery,
    clearSearch: () => setSearchQuery(''),

    // History item actions
    handleDelete,
    handleConfirmDelete,
    startEditing,
    updateChatTitle,
    cancelEditing: () => setItemState(prev => ({ ...prev, editingId: null })),
    hideConfirm: () => setItemState(prev => ({ ...prev, showConfirm: false })),
    updateTitle: (title: string) => setItemState(prev => ({ ...prev, editedTitle: title })),

    // Helpers
    isCurrentChat: (chatId: string) => state.currentChat?.id === chatId,
    getChatTitle: (chatId: string) => state.chats.find(chat => chat.id === chatId)?.title || '',
    hasSearchResults: searchResults.length > 0,
    isSearchActive: Boolean(searchQuery)
  }
} 