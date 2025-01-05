import { useContext } from 'react';
import { ChatDomainContext } from '@/components/providers/chat/contexts';

export function useDomainContext() {
  const context = useContext(ChatDomainContext);
  if (!context) {
    throw new Error('useDomainContext must be used within ChatDomainProvider');
  }
  return context;
}
