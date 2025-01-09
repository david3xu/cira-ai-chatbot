'use client';

import { memo } from 'react';
import { Chat } from '@/lib/types';
import { cn } from '@/lib/utils/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ChatListProps {
  chats: Chat[];
  currentChatId?: string;
  onChatSelect?: (chat: Chat) => void;
}

export const ChatList = memo(function ChatList({ chats, currentChatId, onChatSelect }: ChatListProps) {
  const pathname = usePathname();

  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-full overflow-y-auto">
        <div className="flex flex-col gap-2 px-2">
          {chats.map((chat) => {
            const isActive = pathname === `/chat/${chat.id}` || chat.id === currentChatId;
            const chatName = chat.name || 'New Chat';
            const truncatedName = chatName.length > 30 ? chatName.substring(0, 27) + '...' : chatName;

            return (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                onClick={() => onChatSelect?.(chat)}
                className={cn(
                  'flex flex-col gap-1 rounded-lg px-3 py-3 text-sm transition-colors',
                  'hover:bg-gray-700/50',
                  isActive ? 'bg-gray-700/50' : 'bg-transparent',
                  'cursor-pointer'
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="flex-1 truncate text-sm">
                    {truncatedName}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(chat.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {chat.domination_field || 'General'}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}); 