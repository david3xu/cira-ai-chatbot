"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useChatState, ChatStateType as ImportedChatStateType } from '@/lib/chatState';
import { Chat, ChatMessage } from '@/lib/chat';
import { getCurrentModel } from '@/lib/modelUtils';
import { DEFAULT_MODEL } from '@/lib/modelUtils';


type ExtendedChatStateType = Omit<ImportedChatStateType, 'createNewChat'> & {
  loadChat: (chatId: string) => Promise<void>;
  createNewChat: (options: {
    chatId: string;
    model: string;
    customPrompt?: string;
    dominationField: string;
  }) => Promise<Chat>;
  model: string;
  setModel: (model: string) => void;
  messages: ChatMessage[];
  setMessages: (newMessages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
};

const ChatContext = createContext<ExtendedChatStateType | undefined>(undefined);

interface ChatContextType {
  currentChat: Chat | null;
  error: string | null;
  loadChat: (chatId: string) => Promise<void>;
}

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [model, setModel] = useState<string>(getCurrentModel());
  const [isInitializing, setIsInitializing] = useState(false);
  const lastInitTime = useRef<number>(0);
  const INIT_COOLDOWN = 5000; // 5 seconds

  // Add this console log to debug context values
  useEffect(() => {
    console.log('Chat context updated:', {
      currentChat,
      messagesCount: messages.length,
      isLoading,
      error
    });
  }, [currentChat, messages, isLoading, error]);

  const chatState = useChatState();

  useEffect(() => {
    setIsClient(true);
    // Load saved model from localStorage
    const savedModel = getCurrentModel();
    if (savedModel) {
      setModel(savedModel);
    }
  }, []);

  const loadChat = async (chatId: string) => {
    try {
      const response = await fetch('/api/chat/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customPrompt: '', 
          model: model || DEFAULT_MODEL // Use current model
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to load chat: ${response.statusText}`);
      }

      const { chat } = await response.json();
      chatState.setCurrentChat(chat);
    } catch (err) {
      chatState.setError(err instanceof Error ? err.message : 'Failed to load chat');
    }
  };

  const canInitialize = () => {
    const now = Date.now();
    if (now - lastInitTime.current < INIT_COOLDOWN) {
      return false;
    }
    lastInitTime.current = now;
    return true;
  };

  const createNewChat = useCallback(async (options: {
    chatId: string;
    model: string;
    customPrompt?: string;
    dominationField: string;
  }) => {
    if (!canInitialize()) {
      throw new Error('Please wait before creating another chat');
    }
    
    setIsInitializing(true);
    
    try {
      console.log('Creating new chat with options:', options);
      
      const response = await fetch('/api/chat/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: options.chatId,
          model: options.model,
          customPrompt: options.customPrompt || '',
          dominationField: options.dominationField
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to initialize chat');
      }

      const data = await response.json();
      if (!data.success || !data.chat) {
        throw new Error('Invalid response from server');
      }

      const newChat = data.chat;
      setCurrentChat(newChat);
      setMessages([]); // Reset messages for new chat
      return newChat;
    } catch (error) {
      console.error('Error creating chat:', error);
      setError(error instanceof Error ? error.message : 'Failed to create chat');
      throw error; // Propagate error to caller
    } finally {
      setIsInitializing(false);
    }
  }, [setError, setCurrentChat, setMessages]);

  const initializeChat = useCallback(async (customPrompt?: string) => {
    // Prevent multiple simultaneous initialization attempts
    if (isInitializing) {
      return;
    }

    try {
      setIsInitializing(true);
      const response = await fetch('/api/chat/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customPrompt }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          console.warn('Chat initialization rate limited. Please wait.');
          return;
        }
        throw new Error('Failed to initialize chat');
      }

      const data = await response.json();
      if (data.success && data.chat) {
        chatState.setCurrentChat(data.chat);
      }
    } catch (error) {
      console.error('Failed to initialize chat:', error);
    } finally {
      setIsInitializing(false);
    }
  }, [isInitializing]); // Add isInitializing to dependencies

  const value: ExtendedChatStateType = {
    ...chatState,
    loadChat,
    model,
    setModel,
    createNewChat,
    messages: currentChat?.messages || [],
    setMessages: (newMessages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
      chatState.updateCurrentChat(prev => ({
        ...prev!,
        messages: typeof newMessages === 'function' ? newMessages(prev?.messages || []) : newMessages
      }));
    }
  };
  
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Initializing...</div>
      </div>
    );
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const useGlobalChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useGlobalChat must be used within a ChatProvider');
  }
  return context;
};

