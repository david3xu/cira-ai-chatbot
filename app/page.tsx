"use client";

import SharedLayout from '@/components/SharedLayout';
import { ChatArea } from '@/components/chatArea/ChatArea';
import MessageInput from '@/components/message-input';
import { Suspense } from 'react';

export default function Home() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mb-4"></div>
            <div>Loading chat interface...</div>
          </div>
        </div>
      }
    >
      <SharedLayout>
        <ChatArea />
        <MessageInput />
      </SharedLayout>
    </Suspense>
  );
}
