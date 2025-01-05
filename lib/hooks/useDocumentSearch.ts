// import { useState, useCallback } from 'react'
// import { useChatContext } from '@/lib/features/chat/context/useChatContext'
// import { useLoadingActions } from './useLoadingActions'
// import { DocumentService } from '@/lib/services/DocumentService'
// import type { Document, SearchOptions } from '@/lib/types/app'

// export function useDocumentSearch() {
//   const { dispatch } = useChatContext()
//   const { withLoading } = useLoadingActions()
//   const [searchResults, setSearchResults] = useState<Document[]>([])

//   const searchDocuments = useCallback(async (
//     query: string, 
//     options?: SearchOptions
//   ) => {
//     return withLoading(async () => {
//       try {
//         const results = await DocumentService.searchDocuments(query, options)
//         setSearchResults(results)
//         return results
//       } catch (error) {
//         dispatch({ 
//           type: 'SET_ERROR', 
//           payload: error instanceof Error ? error.message : 'Failed to search documents' 
//         })
//         throw error
//       }
//     }, 'Searching documents...')
//   }, [dispatch, withLoading])

//   const clearSearch = useCallback(() => {
//     setSearchResults([])
//   }, [])

//   return {
//     // State
//     searchResults,
    
//     // Actions
//     searchDocuments,
//     clearSearch,

//     // Helpers
//     hasResults: searchResults.length > 0,
//     getResultCount: () => searchResults.length,
//     getFirstResult: () => searchResults[0] || null
//   }
// } 