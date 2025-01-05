/**
 * ChatFilter Component
 * 
 * Search input for filtering chat history:
 * - Real-time filtering
 * - Clear button
 * - Debounced updates
 */

'use client';

import React from 'react'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { useDebounce } from '@/lib/hooks/ui/useDebounce'
import { useChat } from '@/lib/hooks/chat/useChat'

interface ChatFilterProps {
  visible: boolean
}

export function ChatFilter({ visible }: ChatFilterProps) {
  const [query, setQuery] = React.useState('')
  const debouncedQuery = useDebounce(query, 300)
  const { filterChats } = useChat()

  React.useEffect(() => {
    filterChats(debouncedQuery)
  }, [debouncedQuery, filterChats])

  if (!visible) return null

  return (
    <div className="px-4 py-2 border-b">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search chats..."
          className="pl-9 pr-8"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-2.5"
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>
    </div>
  )
}
