// import { useCallback } from 'react'
// import { useChatContext } from '../chat/useChatContext'
// import type { ChatMessage } from '@/lib/types'

// export function useMessages() {
//   const { state, dispatch } = useChatContext()

//   const updateMessage = useCallback((messageId: string, updates: Partial<ChatMessage>) => {
//     dispatch({
//       type: 'UPDATE_MESSAGE',
//       payload: { id: messageId, ...updates }
//     })
//   }, [dispatch])

//   const deleteMessage = useCallback((messageId: string) => {
//     dispatch({
//       type: 'DELETE_MESSAGE',
//       payload: messageId
//     })
//   }, [dispatch])

//   return {
//     messages: state.messages,
//     updateMessage,
//     deleteMessage,
//     isStreaming: state.isStreaming,
//     streamingMessageId: state.streamingMessageId
//   }
// } 