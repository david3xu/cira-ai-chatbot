import { useCallback } from 'react';
import { usePersistentState } from '../state/usePersistentState';

export function useSidebarState() {
  const { isSidebarOpen, setSidebarState } = usePersistentState();

  const toggleSidebar = useCallback(() => {
    setSidebarState(!isSidebarOpen);
  }, [isSidebarOpen, setSidebarState]);

  return {
    isSidebarOpen,
    toggleSidebar,
    setSidebarState
  };
} 