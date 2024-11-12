import { useState, useCallback, useEffect } from 'react';
import { Chat, ChatMessage } from '@/lib/chat';
import { fetchChatHistory, handleSendMessage as sendMessageToAPI, storeChatMessage } from '@/actions/chat';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation'; // Change this to use the new App Router
import { DEFAULT_MODEL } from '@/lib/modelUtils';

// Update the ChatStateType to include all properties and methods
export type ChatStateType = {
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  currentChat: Chat | null;
  setCurrentChat: React.Dispatch<React.SetStateAction<Chat | null>>;
  createNewChat: () => Chat;
  deleteChat: (chatId: string) => void;
  addMessageToCurrentChat: (message: ChatMessage) => void;
  streamingMessage: string;
  setStreamingMessage: React.Dispatch<React.SetStateAction<string>>;
  updateCurrentChat: (updater: (prevChat: Chat | null) => Chat | null) => void;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isLoadingHistory: boolean;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  handleSendMessage: (message: string, imageFile?: File) => Promise<void>;
  dominationField: string;
  setDominationField: React.Dispatch<React.SetStateAction<string>>;
  savedCustomPrompt: string;
  setSavedCustomPrompt: React.Dispatch<React.SetStateAction<string>>;
  customPrompt: string;
  setCustomPrompt: (newPrompt: string) => void;
  loadChatHistory: (chatId: string) => Promise<void>;
  model: string;
  setModel: React.Dispatch<React.SetStateAction<string>>;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  addMessage: (message: ChatMessage) => void;
  isInitializing: boolean;
};

export const useChatState = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dominationField, setDominationField] = useState<string>('Normal Chat');
  const [savedCustomPrompt, setSavedCustomPrompt] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [model, setModel] = useState<string>(DEFAULT_MODEL);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  // Consolidate all initialization logic
  useEffect(() => {
    const initialize = async () => {
      try {
        // Load saved model
        const savedModel = localStorage.getItem('selectedModel');
        setModel(savedModel || DEFAULT_MODEL);
        
        // Add any other initialization logic here
        
        setIsInitializing(false);
      } catch (error) {
        console.error('Initialization error:', error);
        setModel(DEFAULT_MODEL);
        setIsInitializing(false);
      }
    };
    
    initialize();
  }, []);

  const router = useRouter();

  const createNewChat = useCallback(() => {
    const newChat: Chat = {
      id: uuidv4(),
      name: `New Chat ${chats.length + 1}`,
      dominationField: dominationField,
      messages: [],
      historyLoaded: true,
      chat_topic: '' // Add this line, initialize as empty string
    };
    setChats(prevChats => [...prevChats, newChat]);
    setCurrentChat(newChat);
    return newChat;
  }, [chats, dominationField]);

  const deleteChat = useCallback((chatId: string) => {
    setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
    if (currentChat && currentChat.id === chatId) {
      setCurrentChat(null);
    }
  }, [currentChat]);

  const addMessageToCurrentChat = useCallback((message: ChatMessage) => {
    setCurrentChat(prevChat => {
      if (!prevChat) {
        // If there's no current chat, create a new one
        const newChat: Chat = {
          id: uuidv4(),
          name: 'New Chat',
          dominationField: dominationField,
          messages: [message],
          historyLoaded: true,
        };
        setChats(prevChats => [...prevChats, newChat]);
        return newChat;
      }
      const updatedMessages = [...prevChat.messages, message];
      return { ...prevChat, messages: updatedMessages };
    });
  }, [dominationField]);

  const updateCurrentChat = useCallback((updater: (prevChat: Chat | null) => Chat | null) => {
    setCurrentChat(prevChat => {
      const updatedChat = updater(prevChat);
      if (updatedChat) {
        setChats(prevChats => 
          prevChats.map(chat => 
            chat.id === updatedChat.id ? updatedChat : chat
          )
        );
        return updatedChat;
      }
      return prevChat; // Return the previous chat if updatedChat is null
    });
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
    if (currentChat) {
      setCurrentChat(prev => ({
        ...prev!,
        messages: [...prev!.messages, message]
      }));
    }
  }, [currentChat]);

  const handleSendMessage = useCallback(async (message: string, imageFile?: File) => {
    if (!currentChat) {
      const newChat = createNewChat();
      router?.push(`/chat/${newChat.id}`);
      setCurrentChat(newChat);
    }

    const chatId = currentChat?.id ?? uuidv4();

    setIsLoading(true);
    setError(null);
    setStreamingMessage('');

    try {
      const response = await sendMessageToAPI(
        message,
        imageFile,
        dominationField,
        savedCustomPrompt,
        chatId,
        currentChat?.messages || [],
        !!currentChat?.historyLoaded,
        model,
        (token: string) => setStreamingMessage(prev => prev + token)
      );

      if (response) {
        const { userMessage, assistantMessage } = response;
        addMessageToCurrentChat(userMessage);
        addMessageToCurrentChat(assistantMessage);
      } else {
        throw new Error('No response received from handleSendMessage');
      }
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      setError('An error occurred while processing your message.');
    } finally {
      setIsLoading(false);
      setStreamingMessage('');
    }
  }, [currentChat, dominationField, savedCustomPrompt, model, router, addMessageToCurrentChat]);

  const loadChatHistory = useCallback(async (chatId: string) => {
    if (!chatId) {
      console.warn('No chat ID provided');
      setIsLoadingHistory(false);
      return;
    }

    setIsLoadingHistory(true);
    try {
      console.log(`Fetching chat history for chatId: ${chatId}`);
      const history = await fetchChatHistory(chatId);
      console.log(`Received history:`, history);
      const updatedChat: Chat = {
        id: chatId,
        messages: history,
        historyLoaded: true,
        name: history.length > 0 ? `Chat ${history.length}` : 'New Chat',
        dominationField: dominationField,
        chat_topic: history.length > 0 ? history[0].chat_topic : ''
      };
      setCurrentChat(updatedChat);
      setChats(prevChats => {
        const chatExists = prevChats.some(chat => chat.id === chatId);
        if (chatExists) {
          return prevChats.map(chat => chat.id === chatId ? updatedChat : chat);
        } else {
          return [...prevChats, updatedChat];
        }
      });
    } catch (error) {
      console.error('Error loading chat history:', error);
      setError('Failed to load chat history. Creating a new chat.');
      const newChat: Chat = {
        id: chatId,
        messages: [],
        historyLoaded: true,
        name: 'New Chat',
        dominationField: dominationField,
      };
      setCurrentChat(newChat);
      setChats(prevChats => [...prevChats, newChat]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [dominationField, setCurrentChat, setChats, setError]);

  const handleSetCustomPrompt = useCallback((newPrompt: string) => {
    setCustomPrompt(newPrompt);
    setSavedCustomPrompt(newPrompt);
  }, []);

  useEffect(() => {
    console.log('Model changed in state:', model);
  }, [model]);

  return {
    chats,
    setChats, // Add this line
    currentChat,
    setCurrentChat,
    createNewChat,
    deleteChat,
    addMessageToCurrentChat,
    streamingMessage,
    setStreamingMessage,
    updateCurrentChat,
    isLoading,
    setIsLoading,
    isLoadingHistory,
    error,
    setError,
    handleSendMessage,
    dominationField,
    setDominationField,
    savedCustomPrompt,
    setSavedCustomPrompt,
    customPrompt,
    setCustomPrompt: handleSetCustomPrompt,
    loadChatHistory,
    model, // Add this line
    setModel, // Add this line
    messages,
    setMessages,
    addMessage,
    isInitializing
  };
};
