'use client'

import React, { memo } from 'react'
import { Chat } from '@/lib/types/chat'
import { HistoryItem } from './HistoryItem'

interface HistoryListProps {
  chats: Chat[]
  currentChatId?: string
  onSelectChat: (chat: Chat) => void
}

export const HistoryList = memo(function HistoryList({
  chats,
  currentChatId,
  onSelectChat
}: HistoryListProps) {
  return (
    <div className="history-list">
      {chats.map(chat => (
        <HistoryItem
          key={chat.id}
          chat={chat}
          isSelected={chat.id === currentChatId}
          onClick={() => onSelectChat(chat)}
        />
      ))}
    </div>
  )
}) 