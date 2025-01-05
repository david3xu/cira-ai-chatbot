/**
 * HistoryItem Component
 * 
 * Individual chat history item that:
 * - Displays chat info
 * - Handles selection
 * - Manages deletion
 */

'use client'

import { Button } from '@/components/ui/button';
import { Chat } from '@/lib/types';
import { cn } from '@/lib/utils/utils';
import { Check, Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useChat } from '@/lib/hooks/chat/useChat';

interface HistoryItemProps {
  chat: Chat;
  isSelected: boolean;
  onClick: () => void;
  collapsed: boolean;
}

export function HistoryItem({ chat, isSelected, onClick }: HistoryItemProps) {
  const { deleteChat } = useChat();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }
    try {
      setIsDeleting(true);
      await deleteChat(chat.id);
    } catch (error) {
      console.error('Failed to delete chat:', error);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div
      className={cn(
        'mx-2 p-2 rounded cursor-pointer relative group flex items-center justify-between',
        isSelected ? 'bg-blue-600' : 'hover:bg-gray-700'
      )}
      onClick={onClick}
    >
      <span className="text-white truncate flex-1" title={chat.name || undefined}>
        {chat.name || 'New Chat'}
      </span>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting}
        className={cn(
          "opacity-0 group-hover:opacity-100 transition-opacity",
          showConfirm && "bg-red-600 hover:bg-red-700 opacity-100"
        )}
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : showConfirm ? (
          <Check className="h-4 w-4" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
