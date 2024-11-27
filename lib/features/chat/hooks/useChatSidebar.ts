import { useCallback } from 'react';
import { useChat } from './useChat';
import { CreateNewChatParams } from '@/lib/types/chat/chat';
// import { Chat } from '@/lib/types/chat/chat';
import ReactDOM from 'react-dom';

export function useChatSidebar() {
  const {
    createNewChat: createNewChatBase,
    deleteChat,
    loadChat,
    currentChat,
    setCurrentChat,
    chats,
    model,
    dominationField,
    setDominationField,
    setModel
  } = useChat();

  const handleSidebarChatCreation = useCallback(async (params?: Partial<CreateNewChatParams>) => {
    try {
      const selectedModel = params?.model || model || 'llama3.1';
      const selectedDomination = params?.dominationField || dominationField || 'Normal Chat';
      
      const chat = await createNewChatBase({
        model: selectedModel,
        dominationField: selectedDomination,
        source: params?.source || 'sidebar',
        name: params?.name === undefined ? null : params.name,
        metadata: params?.metadata === undefined ? null : params.metadata
      });

      if (!chat?.id) {
        throw new Error('Failed to create chat: Invalid chat data');
      }

      // Store chat data atomically
      ReactDOM.unstable_batchedUpdates(() => {
        localStorage.setItem(`chat_${chat.id}`, JSON.stringify(chat));
        sessionStorage.setItem(`chat_${chat.id}`, JSON.stringify(chat));
        setCurrentChat(chat);
        setModel(selectedModel);
        setDominationField(selectedDomination);
      });

      return chat;
    } catch (error) {
      console.error('Sidebar chat creation failed:', error);
      return null;
    }
  }, [createNewChatBase, model, dominationField, setCurrentChat, setModel, setDominationField]);

  return {
    currentChat,
    setCurrentChat,
    createNewChat: handleSidebarChatCreation,
    loadChat,
    deleteChat,
    chats,
    dominationField,
    setDominationField,
    model,
    setModel
  };
}
