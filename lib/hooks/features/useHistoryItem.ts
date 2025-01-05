import { useState, useCallback } from 'react'
import { useChatContext } from '../chat/useChatContext'
import { ChatService } from '@/lib/services/ChatService'

export function useHistoryItem(chatId: string) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const { state, dispatch } = useChatContext()

  const handleDelete = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    setShowConfirm(true)
  }, [])

  const handleConfirmDelete = useCallback(async (e?: React.MouseEvent) => {
    e?.stopPropagation()
    try {
      setIsDeleting(true)
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
    } finally {
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }, [chatId, state.chats, state.currentChat?.id, dispatch])

  return {
    isDeleting,
    showConfirm,
    handleDelete,
    handleConfirmDelete
  }
} 