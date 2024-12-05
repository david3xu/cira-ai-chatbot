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
import { getDominationFieldOptions } from '@/lib/features/ai/config/constants';
import { CustomPromptArea } from './CustomPromptArea';
import { storageActions } from '@/lib/features/chat/actions/storage';
import { ChatService } from '@/lib/services/chat/ChatService';
import { DOMINATION_FIELDS, DominationField, isValidDominationField } from '@/lib/features/ai/config/constants';
import { supabase } from '@/lib/supabase/client';

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
  const { 
    currentChat,
    setCurrentChat,
    dominationField,
    setDominationField,
    updateDominationField,
    model,
    chats,
    loadChat,
    isLoading,
    error,
    fetchChats,
    updateCurrentChat,
    setError
  } = useChatSidebar();

  const [sidebarVisible, setSidebarVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebarVisible') !== 'false';
    }
    return true;
  });

  // Add local storage for domination field
  const [selectedDomField, setSelectedDomField] = useState<DominationField>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('selectedDomField') as DominationField) || DOMINATION_FIELDS.NORMAL_CHAT;
    }
    return DOMINATION_FIELDS.NORMAL_CHAT;
  });

  // Add state for chat names
  const [chatNames, setChatNames] = useState<Record<string, string>>({});

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

  // Handle domination field change
  const handleDomFieldChange = useCallback(async (value: string) => {
    if (isValidDominationField(value)) {
      console.log('🔄 [Sidebar] Domination field changing to:', value);
      
      try {
        // Update local state and storage
        setSelectedDomField(value as DominationField);
        await updateDominationField(value as DominationField);
        
        console.log('✅ [Sidebar] Domination field updated successfully');
      } catch (error) {
        console.error('❌ [Sidebar] Error updating domination field:', error);
        setError(error instanceof Error ? error.message : 'Failed to update domination field');
      }
    }
  }, [updateDominationField, setError]);

  // Sync with current chat's domination field
  useEffect(() => {
    if (currentChat?.dominationField && currentChat.dominationField !== selectedDomField) {
      setSelectedDomField(currentChat.dominationField as DominationField);
      localStorage.setItem('selectedDomField', currentChat.dominationField);
    }
  }, [currentChat?.dominationField, selectedDomField]);

  // Add function to fetch and update chat name
  const updateChatName = useCallback(async (chat: Chat) => {
    try {
      // Skip if chat already has a custom name
      if (chat.name && chat.name !== 'New Chat') return;

      // Fetch chat history with proper headers
      const { data: messages, error } = await supabase
        .from('chat_history')
        .select('user_content, created_at')
        .eq('chat_id', chat.id)
        .order('created_at', { ascending: true })
        .limit(1);

      if (error) {
        console.error('Error fetching chat history:', error);
        return;
      }

      // Check if we have any messages
      if (messages && messages.length > 0 && messages[0].user_content) {
        const newName = messages[0].user_content.slice(0, 30);
        console.log('Updating chat name:', { chatId: chat.id, newName });
        
        try {
          await ChatService.updateChatName(chat.id, newName);
          setChatNames(prev => ({ ...prev, [chat.id]: newName }));
        } catch (nameError) {
          console.error('Error updating chat name:', nameError);
        }
      }
    } catch (error) {
      console.error('Error in updateChatName:', error);
    }
  }, []);

  // Update useEffect to fetch chat names with debounce
  useEffect(() => {
    const updateChatsWithDelay = async () => {
      if (chats?.length) {
        for (const chat of chats) {
          if (chat.name === 'New Chat') {
            await updateChatName(chat);
            // Add small delay between requests to prevent rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }
    };

    updateChatsWithDelay();
  }, [chats, updateChatName]);

  const handleNewChat = useCallback(async () => {
    try {
      const domField = selectedDomField || DOMINATION_FIELDS.NORMAL_CHAT;
      
      console.log('🎯 [Sidebar] Creating new chat with:', { 
        model, 
        dominationField: domField,
        customPrompt: currentChat?.customPrompt 
      });

      const newChat = await ChatService.createFromSidebar({
        model: model || 'null',
        dominationField: domField,
        source: 'sidebar',
        name: 'New Chat',
        metadata: {
          source: 'sidebar_button',
          selectedDomField: domField
        },
        customPrompt: currentChat?.customPrompt || null
      });

      console.log('✅ [Sidebar] New chat created:', {
        id: newChat.id,
        model: newChat.model,
        dominationField: newChat.dominationField
      });

      if (newChat) {
        // Update state with the new chat
        await updateCurrentChat(() => ({
          ...newChat,
          dominationField: domField
        }));
        
        // Navigate to the new chat
        router.push(`/chat/${newChat.id}`);
      }
    } catch (error) {
      console.error('❌ [Sidebar] Error creating chat:', error);
      setError(error instanceof Error ? error.message : 'Failed to create chat');
    }
  }, [model, selectedDomField, currentChat, updateCurrentChat, router]);

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
      return <div className="text-white text-center p-4 mt-2">Loading chats...</div>;
    }

    if (error) {
      return (
        <div className="text-white text-center p-4 mt-2">
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={() => fetchChats()} className="text-sm text-blue-400 hover:text-blue-300 mt-2">
            Try Again
          </button>
        </div>
      );
    }

    if (!chats || chats.length === 0) {
      return (
        <div className="text-white text-center p-4 mt-2 bg-gray-700/20 mx-4 rounded-lg border border-gray-600/50">
          <p className="text-sm text-gray-400">Start a new chat</p>
        </div>
      );
    }

    return chats.map((chat: Chat) => {
      const displayName = chatNames[chat.id] || chat.name || 'New Chat';
      
      return (
        <div
          key={`chat-${chat.id}`}
          className={`mx-2 p-2 rounded cursor-pointer relative group flex items-center justify-between ${
            currentChat?.id === chat.id ? 'bg-blue-600' : 'hover:bg-gray-700'
          }`}
          onClick={() => handleChatClick(chat.id)}
        >
          <span className="text-white truncate flex-1" title={displayName}>
            {displayName}
          </span>
          <DeleteChatButton chat={chat} onDelete={handleDeleteChat} />
        </div>
      );
    });
  }, [chats, currentChat?.id, chatNames, handleChatClick, isLoading, error, fetchChats, handleDeleteChat]);

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
          value={selectedDomField}
          onValueChange={handleDomFieldChange}
          defaultValue={DOMINATION_FIELDS.NORMAL_CHAT}
        >
          <SelectTrigger className="mb-4 bg-gray-700 border-gray-600 text-white">
            <SelectValue placeholder="Select Domination Field" />
          </SelectTrigger>
          <SelectContent className="bg-gray-700 border-gray-600">
            {getDominationFieldOptions().map((field) => (
              <SelectItem 
                key={field.value} 
                value={field.value}
                className="text-white hover:bg-gray-600 focus:bg-gray-600 cursor-pointer"
              >
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