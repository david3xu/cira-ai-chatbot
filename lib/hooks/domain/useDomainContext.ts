import { useContext } from 'react';
import { ChatDomainContext } from '@/lib/features/chat/context/chatContext';

export function useDomainContext() {
  const context = useContext(ChatDomainContext);
  if (!context) {
    throw new Error('useDomainContext must be used within ChatDomainProvider');
  }
  return context;
}
