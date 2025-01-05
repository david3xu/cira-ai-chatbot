// import { useState, useCallback } from 'react'
// import { useChatContext } from '@/lib/features/chat/context/useChatContext'
// import { useLoadingActions } from './useLoadingActions'
// import { DocumentService } from '@/lib/services/DocumentService'
// import type { Document, ProcessDocumentOptions } from '@/lib/types/app'

// export function useDocument() {
//   const { dispatch } = useChatContext()
//   const { withLoading } = useLoadingActions()
//   const [document, setDocument] = useState<Document | null>(null)

//   const processDocument = useCallback(async (
//     file: File, 
//     options: ProcessDocumentOptions
//   ) => {
//     return withLoading(async () => {
//       try {
//         const processedDoc = await DocumentService.processDocument(file, options)
//         setDocument(processedDoc)
//         return processedDoc
//       } catch (error) {
//         dispatch({ 
//           type: 'SET_ERROR', 
//           payload: error instanceof Error ? error.message : 'Failed to process document' 
//         })
//         throw error
//       }
//     }, 'Processing document...')
//   }, [dispatch, withLoading])

//   const deleteDocument = useCallback(async (documentId: string) => {
//     return withLoading(async () => {
//       try {
//         await DocumentService.deleteDocument(documentId)
//         setDocument(null)
//         dispatch({ type: 'REMOVE_DOCUMENT', payload: documentId })
//       } catch (error) {
//         dispatch({ 
//           type: 'SET_ERROR', 
//           payload: error instanceof Error ? error.message : 'Failed to delete document' 
//         })
//         throw error
//       }
//     }, 'Deleting document...')
//   }, [dispatch, withLoading])

//   return {
//     // State
//     document,
    
//     // Actions
//     processDocument,
//     deleteDocument,
//     clearDocument: () => setDocument(null),

//     // Helpers
//     hasDocument: Boolean(document),
//     getDocumentId: () => document?.id || null
//   }
// } 