'use client';

import { memo, useMemo, useEffect, useState } from 'react';
import { Chat } from '@/lib/types';
import { cn } from '@/lib/utils/utils';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { ChatService } from '@/lib/services/ChatService';
import { useChatContext } from '@/lib/features/chat/context/chatContext';
import { toast } from 'react-hot-toast';

interface ChatListProps {
  chats: Chat[];
  currentChatId?: string;
  onChatSelect?: (chat: Chat) => void;
}

export const ChatList = memo(function ChatList({ chats, currentChatId, onChatSelect }: ChatListProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { dispatch } = useChatContext();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Force re-render when chat names change
  const chatListKey = useMemo(() => {
    const key = chats.map(chat => `${chat.id}-${chat.name}-${chat.updatedAt}`).join('|');
    return key;
  }, [chats]);

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent event bubbling
    
    if (isDeleting) return; // Prevent multiple deletes

    try {
      setIsDeleting(chatId);
      await ChatService.deleteChat(chatId);
      dispatch({ type: 'DELETE_CHAT', payload: chatId });
      
      // If we're on the deleted chat's page, redirect to home
      if (pathname === `/chat/${chatId}`) {
        router.push('/');
      }
      
      toast.success('Chat deleted successfully');
    } catch (error) {
      console.error('Failed to delete chat:', error);
      toast.error('Failed to delete chat. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="flex-1 overflow-hidden" key={chatListKey}>
      <div className="h-full overflow-y-auto">
        <div className="flex flex-col gap-2 px-2">
          {chats.map((chat) => {
            const isActive = pathname === `/chat/${chat.id}` || chat.id === currentChatId;
            const chatName = chat.name !== null && chat.name !== undefined ? chat.name : 'New Chat';
            const truncatedName = chatName.length > 30 ? chatName.substring(0, 27) + '...' : chatName;

            return (
              <Link
                key={`${chat.id}-${chat.updatedAt}`}
                href={`/chat/${chat.id}`}
                onClick={() => onChatSelect?.(chat)}
                className={cn(
                  'flex flex-col gap-1 rounded-lg px-3 py-3 text-sm transition-colors group',
                  'hover:bg-gray-700/50',
                  isActive ? 'bg-gray-700/50' : 'bg-transparent',
                  'cursor-pointer relative'
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="flex-1 truncate text-sm">
                    {truncatedName}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(chat.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={(e) => handleDeleteChat(e, chat.id)}
                    className={cn(
                      "ml-2 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-gray-600/50 transition-all",
                      isDeleting === chat.id && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={isDeleting === chat.id}
                    aria-label="Delete chat"
                  >
                    <Trash2 className={cn(
                      "h-4 w-4 text-gray-400 hover:text-red-400",
                      isDeleting === chat.id && "animate-pulse"
                    )} />
                  </button>
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