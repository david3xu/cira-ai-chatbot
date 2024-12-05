import { useCallback, useEffect, useState, useRef } from 'react';
import { useChatContext } from '../context/useChatContext';
import { useChat } from './useChat';
import { storageActions } from '../actions/storage';
import ReactDOM from 'react-dom';
import { Chat } from '@/lib/types/chat/chat';

export function useChatSidebar() {
  const { state, dispatch, setLoading } = useChatContext();
  const chat = useChat();
  const [sidebarLoading, setSidebarLoading] = useState(false);
  const loadingRef = useRef(false);

  const fetchChats = useCallback(async () => {
    if (loadingRef.current) return;
    
    try {
      loadingRef.current = true;
      setSidebarLoading(true);
      setLoading(true);

      const { data: chats, error } = await storageActions.database.fetchChats();
      if (error) throw error;
      
      if (chats) {
        const transformedChats = chats.map((chat): Chat => ({
          ...chat,
          messages: chat.messages || [],
          metadata: chat.metadata || null,
          customPrompt: chat.customPrompt || null,
          dominationField: chat.dominationField || 'Normal Chat'
        }));

        ReactDOM.unstable_batchedUpdates(() => {
          dispatch({
            type: 'SET_CHATS',
            payload: transformedChats
          });
          storageActions.persistent.saveChats(transformedChats);
        });
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      ReactDOM.unstable_batchedUpdates(() => {
        loadingRef.current = false;
        setSidebarLoading(false);
        setLoading(false);
      });
    }
  }, [dispatch, setLoading]);

  const updateChatInList = useCallback((updatedChat: Chat) => {
    dispatch({
      type: 'SET_CHATS',
      payload: state.chats.map(chat => 
        chat.id === updatedChat.id ? updatedChat : chat
      )
    });
  }, [dispatch, state.chats]);

  useEffect(() => {
    fetchChats();
  }, []); 

  return {
    ...chat,
    fetchChats,
    isLoading: sidebarLoading,
    updateChatInList
  };
}
