'use client'

import React, { memo } from 'react'
import { Chat } from '@/lib/types/chat'
import { useHistoryItem } from '@/lib/hooks/features/useHistoryItem'
import { DeleteButton } from './DeleteButton'

interface Props {
  chat: Chat
  isSelected: boolean
  onClick: () => void
}

export const HistoryItem = memo(function HistoryItem({ chat, isSelected, onClick }: Props) {
  const { isDeleting, showConfirm, handleDelete, handleConfirmDelete } = useHistoryItem(chat.id)

  return (
    <div 
      className={`flex items-center justify-between p-2 cursor-pointer hover:bg-gray-100 ${isSelected ? 'bg-gray-100' : ''}`}
      onClick={onClick}
    >
      <span className="truncate">{chat.title}</span>
      <DeleteButton 
        isDeleting={isDeleting}
        showConfirm={showConfirm}
        onDelete={handleDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}) 