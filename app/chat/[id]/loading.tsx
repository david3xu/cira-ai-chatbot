'use client';

import { ChatLoading } from '@/components/chat/loading/ChatLoading'
import { ChatLayout } from '@/components/chat/layout/ChatLayout'

export default function ChatLoadingPage() {
  return (
    <ChatLayout>
      <div className="flex-1 h-full">
        <ChatLoading />
      </div>
    </ChatLayout>
  )
}

export function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-muted-foreground animate-pulse">
        Loading chat...
      </div>
    </div>
  );
} 