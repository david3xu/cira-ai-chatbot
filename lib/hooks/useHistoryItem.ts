// import { useState, useCallback } from 'react'
// import { useChatContext } from '@/lib/hooks/chat/useChatContext'
// import { useLoadingActions } from './state/useLoadingActions'
// import { ChatService } from '@/lib/services/ChatService'
// import type { Chat } from '@/lib/types'

// interface HistoryItemState {
//   isDeleting: boolean
//   showConfirm: boolean
//   isEditing: boolean
//   editedTitle: string | null
// }

// export function useHistoryItem(chatId: string) {
//   const { state, dispatch } = useChatContext()
//   const { withLoading } = useLoadingActions()
  
//   const [itemState, setItemState] = useState<HistoryItemState>({
//     isDeleting: false,
//     showConfirm: false,
//     isEditing: false,
//     editedTitle: null
//   })

//   const handleDelete = useCallback((e: React.MouseEvent) => {
//     e.stopPropagation()
//     setItemState(prev => ({ ...prev, showConfirm: true }))
//   }, [])

//   const handleConfirmDelete = useCallback(async (e: React.MouseEvent) => {
//     e.stopPropagation()

//     return withLoading(async () => {
//       try {
//         setItemState(prev => ({ ...prev, isDeleting: true }))
        
//         await ChatService.deleteChat(chatId)
        
//         dispatch({ 
//           type: 'SET_CHATS', 
//           payload: state.chats.filter((chat: Chat) => chat.id !== chatId)
//         })

//         if (state.currentChat?.id === chatId) {
//           dispatch({ type: 'SET_CURRENT_CHAT', payload: null })
//         }
//       } catch (error) {
//         dispatch({ 
//           type: 'SET_ERROR', 
//           payload: error instanceof Error ? error : new Error('Failed to delete chat')
//         })
//         throw error
//       } finally {
//         setItemState(prev => ({ 
//           ...prev, 
//           isDeleting: false,
//           showConfirm: false 
//         }))
//       }
//     }, 'Deleting chat...')
//   }, [chatId, state.currentChat?.id, dispatch, withLoading])

//   const startEditing = useCallback((e: React.MouseEvent) => {
//     e.stopPropagation()
//     const currentTitle = state.chats.find((chat: Chat) => chat.id === chatId)?.title || ''
//     setItemState(prev => ({ 
//       ...prev, 
//       isEditing: true,
//       editedTitle: currentTitle
//     }))
//   }, [chatId, state.chats])

//   const handleTitleChange = useCallback(async (newTitle: string) => {
//     try {
//       await ChatService.updateChatTitle(chatId, newTitle)
      
//       dispatch({ 
//         type: 'SET_CHATS', 
//         payload: state.chats.map((chat: Chat) => chat.id === chatId ? { ...chat, title: newTitle } : chat)
//       })
//       setItemState(prev => ({ ...prev, isEditing: false }))
//     } catch (error) {
//       dispatch({ 
//         type: 'SET_ERROR', 
//         payload: error instanceof Error ? error : new Error('Failed to update title')
//       })
//     }
//   }, [chatId, dispatch])

//   return {
//     // State
//     isDeleting: itemState.isDeleting,
//     showConfirm: itemState.showConfirm,
//     isEditing: itemState.isEditing,
//     editedTitle: itemState.editedTitle,

//     // Actions
//     handleDelete,
//     handleConfirmDelete,
//     startEditing,
//     handleTitleChange,
//     cancelEdit: () => setItemState(prev => ({ ...prev, isEditing: false })),
//     hideConfirm: () => setItemState(prev => ({ ...prev, showConfirm: false })),

//     // Helpers
//     isCurrentChat: state.currentChat?.id === chatId,
//     getChatTitle: () => state.chats.find((chat: Chat) => chat.id === chatId)?.title || ''
//   }
// } 