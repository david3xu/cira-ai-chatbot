'use client';

import { useEffect, useState } from 'react';
import { usePersistentState } from '@/lib/hooks/state/usePersistentState';

export function ChatHydrationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isHydrated, setIsHydrated] = useState(false);
  const { setSidebarState, setCustomPrompt } = usePersistentState();

  useEffect(() => {
    // Initialize the store
    usePersistentState.persist.rehydrate();
    
    // Clear custom prompt
    setCustomPrompt('');
    
    // Clear persisted storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chat-persistent-storage');
      // Force Zustand to clear its storage
      usePersistentState.persist.clearStorage();
    }
    
    // Set initial state after hydration
    const isMobile = window.innerWidth < 768;
    setSidebarState(!isMobile); // Open on desktop, closed on mobile
    
    setIsHydrated(true);
  }, [setSidebarState, setCustomPrompt]);

  if (!isHydrated) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
} 