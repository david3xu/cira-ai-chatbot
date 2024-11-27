import { useState, useEffect, useCallback, forwardRef } from 'react';
import { useChatSidebar } from '@/lib/features/chat/hooks/useChatSidebar';
import { useChatContext } from '@/lib/features/chat/context/chatContext';
import { Chat, CreateNewChatParams } from '@/lib/types/chat/chat';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
// import { v4 as uuidv4 } from 'uuid';
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
// import { CreateNewChatParams } from '@/lib/types/chat/chat';
import { ButtonProps } from '@/components/ui/button';

interface SidebarProps {
  onSidebarToggle: (visible: boolean) => void;
}

// Add forwardRef to prevent ref issues
const SidebarButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => (
    <Button {...props} ref={ref} />
  )
);
SidebarButton.displayName = 'SidebarButton';

export function Sidebar({ onSidebarToggle }: SidebarProps) {
  // Context hooks first
  const { state, dispatch } = useChatContext();
  const {
    currentChat,
    setCurrentChat,
    createNewChat,
    deleteChat,
    dominationField,
    setDominationField,
    model,
    loadChat,
    chats
  } = useChatSidebar();

  // All useState hooks together
  const [sidebarVisible, setSidebarVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebarVisible') !== 'false';
    }
    return true;
  });
  const [isLoading, setIsLoading] = useState(false);

  // useEffect hooks
  useEffect(() => {
    localStorage.setItem('sidebarVisible', String(sidebarVisible));
    onSidebarToggle(sidebarVisible);
  }, [sidebarVisible, onSidebarToggle]);

  // All useCallback hooks together
  const handleNewChat = useCallback(async () => {
    if (!createNewChat) return;
    
    try {
      const params: CreateNewChatParams = {
        model: model || 'llama3.1',
        dominationField: dominationField || 'Normal Chat',
        source: 'sidebar' as const,
        name: null,
        metadata: null
      };
      const newChat = await createNewChat(params);
      if (newChat && setCurrentChat) {
        localStorage.setItem(`chat_${newChat.id}`, JSON.stringify(newChat));
        
        const existingChats = JSON.parse(localStorage.getItem('chats') || '[]');
        const updatedChats = [...existingChats, newChat];
        localStorage.setItem('chats', JSON.stringify(updatedChats));
        
        setCurrentChat(newChat);
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  }, [createNewChat, model, dominationField, setCurrentChat]);

  const handleChatClick = useCallback((chat: Chat) => {
    if (setCurrentChat && loadChat) {
      setCurrentChat(chat);
      loadChat(chat.id);
    }
  }, [setCurrentChat, loadChat]);

  const handleDeleteChat = useCallback((chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteChat) {
      deleteChat(chatId);
    }
  }, [deleteChat]);

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
        {Array.isArray(chats) && chats.length > 0 ? (
          chats.filter(chat => chat?.id).map((chat) => (
            <div
              key={chat.id}
              className={`mx-2 p-2 rounded cursor-pointer relative group flex items-center justify-between ${
                currentChat?.id === chat.id ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
              onClick={() => handleChatClick(chat)}
            >
              <span className="text-white truncate flex-1">
                {chat?.name || 'New Chat'}
              </span>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 ml-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-400" />
                  </Button>
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
                    <AlertDialogAction onClick={(e) => handleDeleteChat(chat.id, e)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))
        ) : (
          <div className="text-gray-500 text-center p-4">
            Click "New Chat" to start a conversation
          </div>
        )}
      </div>

      {/* Bottom Section - Custom Prompt */}
      <div className="border-t border-gray-700 p-4 bg-gray-800">
        <CustomPromptArea />
      </div>
    </aside>
  );
} 