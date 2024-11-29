import { useState, useEffect, useCallback, forwardRef, useMemo } from 'react';
import { useChatSidebar } from '@/lib/features/chat/hooks/useChatSidebar';
import { useChatContext } from '@/lib/features/chat/context/useChatContext';
import { Chat } from '@/lib/types/chat/chat';
import { Button, ButtonProps } from '@/components/ui/button';
import { Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { dominationFieldsData } from '@/lib/data/domFields';
import { CustomPromptArea } from './CustomPromptArea';
import { storageActions } from '@/lib/features/chat/actions/storage';

interface SidebarProps {
  onSidebarToggle: (visible: boolean) => void;
}

interface DeleteChatButtonProps {
  chat: Chat;
  onDelete: (chatId: string, e: React.MouseEvent) => void;
}

const DeleteChatButton = ({ chat, onDelete }: DeleteChatButtonProps) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-600 rounded">
        <Trash2 className="h-4 w-4 text-gray-400" />
      </button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete Chat</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to delete this chat? This action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={(e) => onDelete(chat.id, e)}>Delete</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

// Add forwardRef to prevent ref issues
const SidebarButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => (
    <Button {...props} ref={ref} />
  )
);
SidebarButton.displayName = 'SidebarButton';

export function Sidebar({ onSidebarToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { state, dispatch } = useChatContext();
  const {
    currentChat,
    setCurrentChat,
    createNewChat,
    dominationField,
    setDominationField,
    model,
    chats,
    loadChat,
    isLoading,
    error,
    fetchChats
  } = useChatSidebar();

  const [sidebarVisible, setSidebarVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebarVisible') !== 'false';
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem('sidebarVisible', String(sidebarVisible));
    onSidebarToggle(sidebarVisible);
  }, [sidebarVisible, onSidebarToggle]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedVisibility = localStorage.getItem('sidebarVisible') !== 'false';
      setSidebarVisible(savedVisibility);
    }
  }, []);

  const handleNewChat = useCallback(async () => {
    try {
      const newChat = await createNewChat({
        model: model || 'llama3.1',
        dominationField: dominationField || 'Normal Chat',
        source: 'sidebar',
        name: 'New Chat',
        metadata: {
          source: 'sidebar_button'
        },
        customPrompt: null
      });

      if (newChat && pathname !== '/') {
        router.replace(`/chat/${newChat.id}`, { scroll: false });
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  }, [createNewChat, model, dominationField, pathname, router]);

  const handleChatClick = useCallback(async (chatId: string) => {
    try {
      const chat = await loadChat(chatId);
      if (chat) {
        setCurrentChat(chat);
        router.push(`/chat/${chat.id}`);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  }, [setCurrentChat, router, loadChat]);

  const handleDeleteChat = useCallback(async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Delete from database
      await storageActions.database.deleteChat(chatId);
      // Remove from local storage
      storageActions.persistent.removeChat(chatId);
      // Refresh the chat list
      await fetchChats();
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  }, [fetchChats]);

  // Memoize chat list rendering
  const chatList = useMemo(() => {
    if (isLoading) {
      return (
        <div className="text-white text-center p-4 mt-2">
          <p className="text-sm text-gray-400">Loading chats...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-white text-center p-4 mt-2">
          <p className="text-sm text-red-400">{error}</p>
          <button 
            onClick={() => fetchChats()}
            className="text-sm text-blue-400 hover:text-blue-300 mt-2"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (!chats || chats.length === 0) {
      return (
        <div key="empty-state" className="text-white text-center p-4 mt-2 bg-gray-700/20 mx-4 rounded-lg border border-gray-600/50">
          <p className="text-sm text-gray-400">Start a new chat by clicking the button above</p>
        </div>
      );
    }

    return chats.map((chat: Chat) => (
      <div
        key={`chat-${chat.id}`}
        className={`mx-2 p-2 rounded cursor-pointer relative group flex items-center justify-between ${
          currentChat?.id === chat.id ? 'bg-blue-600' : 'hover:bg-gray-700'
        }`}
        onClick={() => handleChatClick(chat.id)}
      >
        <span className="text-white truncate flex-1">
          {chat?.name || (chat.metadata?.source === 'input' ? 'Chat from Input' : 'New Chat')}
        </span>
        <DeleteChatButton chat={chat} onDelete={handleDeleteChat} />
      </div>
    ));
  }, [chats, currentChat?.id, handleChatClick, isLoading, error, fetchChats, handleDeleteChat]);

  // Debug in useEffect
  useEffect(() => {
    if (chats?.length) {
      console.log('Debug chats:', chats);
    }
  }, [chats]);

  // Mobile toggle button when sidebar is hidden
  if (!sidebarVisible) {
    return (
      <div className="fixed left-0 top-0 h-screen w-[80px] bg-gray-800 flex flex-col items-center py-4 z-50">
        <SidebarButton
          onClick={() => setSidebarVisible(true)}
          className="p-2 text-white hover:bg-gray-700 rounded-full"
          size="sm"
          variant="ghost"
        >
          <ChevronRight className="h-6 w-6" />
        </SidebarButton>
        <div className="mt-2 text-white text-xs text-center px-2 truncate w-full">
          {currentChat?.name || (currentChat?.id ? `Chat ${currentChat.id.slice(0, 4)}` : 'No chat selected')}
        </div>
      </div>
    );
  }

  return (
    <aside className="w-[300px] fixed left-0 top-0 h-screen bg-gray-800 flex flex-col">
      {/* Top Section */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Chats</h2>
          <SidebarButton
            onClick={() => setSidebarVisible(false)}
            className="text-white hover:bg-gray-700 transition-colors"
            size="sm"
            variant="ghost"
          >
            <ChevronLeft className="h-6 w-6" />
          </SidebarButton>
        </div>

        <Select
          onValueChange={setDominationField}
          value={dominationField || 'Normal Chat'}
          defaultValue="Normal Chat"
        >
          <SelectTrigger className="mb-4">
            <SelectValue placeholder="Select Domination Field" />
          </SelectTrigger>
          <SelectContent>
            {dominationFieldsData.map((field) => (
              <SelectItem key={field.value} value={field.value}>
                {field.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <SidebarButton
          onClick={handleNewChat}
          className="w-full flex items-center justify-center"
          variant="default"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </SidebarButton>
      </div>

      {/* Middle Section - Chat List */}
      <div className="flex-1 overflow-y-auto py-2">
        {chatList}
      </div>

      {/* Bottom Section - Custom Prompt */}
      <div className="border-t border-gray-700 p-4 bg-gray-800">
        <CustomPromptArea />
      </div>
    </aside>
  );
} 