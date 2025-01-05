'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { useChat } from '@/lib/hooks/chat/useChat'
import { formatDate } from '@/lib/utils'
import { Chat } from '@/lib/types/chat'
import { TrashIcon } from 'lucide-react'
import { Loader } from '@/components/ui/icons'

interface ChatHistoryItemProps {
  chat: Chat
  isSelected: boolean
  onSelect: () => void
}

export function ChatHistoryItem({ chat, isSelected, onSelect }: ChatHistoryItemProps) {
  const { deleteChat } = useChat()
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDeleting(true)
    await deleteChat(chat.id)
    setIsDeleting(false)
  }

  return (
    <div
      onClick={onSelect}
      className={`
        group flex items-center justify-between p-3 rounded-lg cursor-pointer
        hover:bg-muted/50 transition-colors
        ${isSelected ? 'bg-muted' : ''}
      `}
    >
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium truncate">{chat.name}</span>
        <span className="text-xs text-muted-foreground">
          {formatDate(chat.updatedAt)}
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        disabled={isDeleting}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {isDeleting ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          <TrashIcon className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
} 