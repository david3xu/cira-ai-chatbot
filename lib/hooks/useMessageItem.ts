// import { useState, useCallback } from 'react'
// import { useChatContext } from '@/lib/hooks/chat/useChatContext'
// import { useLoadingActions } from './state/useLoadingActions'
// import { ChatService } from '@/lib/services/ChatService'
// import type { ChatMessage } from '@/lib/types'

// interface MessageItemState {
//   isHovered: boolean
//   isEditing: boolean
//   isDeleting: boolean
//   showActions: boolean
//   editedContent: string | null
//   error: Error | null
// }

// interface MessageActions {
//   onEdit?: (content: string) => void
//   onDelete?: () => void
//   onCopy?: () => void
//   onRegenerate?: () => void
// }

// export const useMessageItem = (
//   message: ChatMessage,
//   actions: MessageActions = {}
// ) => {
//   const { dispatch } = useChatContext()
//   const { withLoading } = useLoadingActions()
//   const [state, setState] = useState<MessageItemState>({
//     isHovered: false,
//     isEditing: false,
//     isDeleting: false,
//     showActions: false,
//     editedContent: null,
//     error: null
//   })

//   // Mouse Event Handlers
//   const handleMouseEnter = useCallback(() => {
//     setState(prev => ({ ...prev, isHovered: true, showActions: true }))
//   }, [])

//   const handleMouseLeave = useCallback(() => {
//     setState(prev => ({ ...prev, isHovered: false }))
//     // Keep actions visible if editing or deleting
//     if (!state.isEditing && !state.isDeleting) {
//       setState(prev => ({ ...prev, showActions: false }))
//     }
//   }, [state.isEditing, state.isDeleting])

//   // Edit Handlers
//   const startEditing = useCallback(() => {
//     setState(prev => ({ 
//       ...prev, 
//       isEditing: true, 
//       editedContent: message.user_content || message.assistant_content || ''
//     }))
//   }, [message.user_content, message.assistant_content])

//   const cancelEditing = useCallback(() => {
//     setState(prev => ({ 
//       ...prev, 
//       isEditing: false, 
//       editedContent: null 
//     }))
//   }, [])

//   const saveEdit = useCallback(async () => {
//     if (!state.editedContent || state.editedContent === message.user_content || state.editedContent === message.assistant_content) {
//       cancelEditing()
//       return
//     }

//     return withLoading(async () => {
//       try {
//         await ChatService.updateMessage(message.id, state.editedContent || '')
//         dispatch({ 
//           type: 'UPDATE_MESSAGE', 
//           payload: { 
//             id: message.id, 
//             content: state.editedContent || ''
//           }
//         })
//         actions.onEdit?.(state.editedContent || '')
//         setState(prev => ({ ...prev, isEditing: false, editedContent: null }))
//       } catch (error) {
//         dispatch({ 
//           type: 'SET_ERROR', 
//           payload: new Error(error instanceof Error ? error.message : 'Failed to update message')
//         })
//         setState(prev => ({ ...prev, error: error as Error }))
//       }
//     }, 'Updating message...')
//   }, [message.id, state.editedContent, dispatch, actions.onEdit, cancelEditing])

//   // Delete Handlers
//   const confirmDelete = useCallback(async () => {
//     return withLoading(async () => {
//       try {
//         setState(prev => ({ ...prev, isDeleting: true }))
//         await ChatService.deleteMessage(message.id)
//         dispatch({ type: 'DELETE_MESSAGE', payload: message.id })
//         actions.onDelete?.()
//       } catch (error) {
//         dispatch({ 
//           type: 'SET_ERROR', 
//           payload: new Error(error instanceof Error ? error.message : 'Failed to delete message')
//         })
//         setState(prev => ({ ...prev, error: error as Error }))
//       } finally {
//         setState(prev => ({ ...prev, isDeleting: false }))
//       }
//     }, 'Deleting message...')
//   }, [message.id, dispatch, actions.onDelete])

//   // Copy Handler
//   const copyContent = useCallback(async () => {
//     try {
//       await navigator.clipboard.writeText(message.user_content || message.assistant_content || '')
//       actions.onCopy?.()
//     } catch (error) {
//       setState(prev => ({ 
//         ...prev, 
//         error: new Error('Failed to copy message') 
//       }))
//     }
//   }, [message.user_content, message.assistant_content, actions.onCopy])

//   // Regenerate Handler
//   const regenerateResponse = useCallback(async () => {
//     if (message.user_role !== 'user') return

//     return withLoading(async () => {
//       try {
//         await ChatService.regenerateResponse(message.id)
//         actions.onRegenerate?.()
//       } catch (error) {
//         dispatch({ 
//           type: 'SET_ERROR', 
//           payload: new Error(error instanceof Error ? error.message : 'Failed to regenerate response')
//         })
//         setState(prev => ({ ...prev, error: error as Error }))
//       }
//     }, 'Regenerating response...')
//   }, [message.id, message.user_role, dispatch, actions.onRegenerate])

//   return {
//     // State
//     isHovered: state.isHovered,
//     isEditing: state.isEditing,
//     isDeleting: state.isDeleting,
//     showActions: state.showActions,
//     editedContent: state.editedContent,
//     error: state.error,

//     // Event Handlers
//     handleMouseEnter,
//     handleMouseLeave,

//     // Edit Actions
//     startEditing,
//     cancelEditing,
//     saveEdit,
//     updateEditedContent: (content: string) => 
//       setState(prev => ({ ...prev, editedContent: content })),

//     // Other Actions
//     confirmDelete,
//     copyContent,
//     regenerateResponse,

//     // Helpers
//     clearError: () => setState(prev => ({ ...prev, error: null })),
//     isUserMessage: message.user_role === 'user',
//     isAssistantMessage: message.assistant_role === 'assistant',
//     isSystemMessage: message.user_role === 'system',
//     hasChanges: state.editedContent !== null && state.editedContent !== message.user_content && state.editedContent !== message.assistant_content
//   }
// } 