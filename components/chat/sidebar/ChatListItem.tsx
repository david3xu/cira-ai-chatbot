'use client';

import React from 'react'
import { cn } from '@/lib/utils/utils'
import type { Chat } from '@/lib/types/chat'

interface ChatListItemProps {
  chat: Chat
  isSelected?: boolean
  onClick?: () => void
  isActive: boolean
  onSelect: () => void
  onDelete: () => void
}

export function ChatListItem({ chat, isSelected, onClick, isActive, onSelect, onDelete }: ChatListItemProps) {
  return (
    <button
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-4 py-2 text-left text-sm transition-colors hover:bg-accent',
        isSelected && 'bg-accent'
      )}
      onClick={onClick}
    >
      <ChatIcon className="h-4 w-4" />
      <span className="line-clamp-1">{chat.name || 'New Chat'}</span>
    </button>
  )
}

function ChatIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
} 