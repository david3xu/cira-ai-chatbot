'use client'

import React, { useMemo, useCallback } from 'react'
import { useChat } from '@/lib/hooks/chat/useChat'
import { useChatContext } from '@/lib/hooks/chat/useChatContext'
import { useChatHistory } from '@/lib/hooks/chat/useChatHistory'
import { HistoryList } from './HistoryList'
import { HistorySearch } from './HistorySearch'
import { Chat } from '@/lib/types'

export function ChatHistory() {
  const { chats, currentChat } = useChat()
  const { dispatch } = useChatContext()
  const { 
    searchQuery, 
    searchResults,
    setSearchQuery
  } = useChatHistory()

  const handleSelectChat = useCallback((chat: Chat) => {
    dispatch({ type: 'SET_CURRENT_CHAT', payload: chat });
  }, [dispatch]);

  const isEmpty = useMemo(() => chats.length === 0, [chats])

  if (isEmpty) {
    return <div className="history-empty">No chat history</div>
  }

  return (
    <div className="chat-history">
      <HistorySearch 
        value={searchQuery}
        onChange={setSearchQuery}
      />
      <HistoryList
        chats={searchResults}
        currentChatId={currentChat?.id}
        onSelectChat={handleSelectChat}
      />
    </div>
  )
} 