"use client"

import React from 'react'
import { useChat } from '@/lib/hooks/chat/useChat'

export function StreamingIndicator() {
  const { isStreaming } = useChat()

  if (!isStreaming) return null

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <div className="flex space-x-1">
        <div className="h-2 w-2 animate-bounce rounded-full bg-current" />
        <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:0.2s]" />
        <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:0.4s]" />
      </div>
      <span>AI is typing...</span>
    </div>
  )
} 