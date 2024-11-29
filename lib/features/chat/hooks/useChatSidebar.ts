import { useCallback, useEffect } from 'react';
import { useChatContext } from '../context/useChatContext';
import { useChat } from './useChat';
import { storageActions } from '../actions/storage';

export function useChatSidebar() {
  const { state, dispatch } = useChatContext();
  const chat = useChat();

  const fetchChats = useCallback(async () => {
    try {
      const { data: chats, error } = await storageActions.database.fetchChats();
      if (error) throw error;
      
      if (chats) {
        dispatch({
          type: 'SET_CHATS',
          payload: chats
        });
        // Also update local storage
        storageActions.persistent.saveChats(chats);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchChats();
  }, []); 

  return {
    ...chat,
    fetchChats
  };
}
