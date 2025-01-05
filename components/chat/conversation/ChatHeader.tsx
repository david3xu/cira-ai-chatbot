/**
 * ChatHeader Component
 * 
 * Header section of chat that provides:
 * - Model selection dropdown
 * - Document uploader toggle
 * - Loading states
 * - Responsive design
 */

'use client';

import React, { useCallback, memo } from 'react';
import { ModelSelector } from '../model/ModelSelector';
import { useSidebarState } from '@/lib/hooks/ui/useSidebarState';

const MenuIcon = memo(function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 12h18" />
      <path d="M3 6h18" />
      <path d="M3 18h18" />
    </svg>
  );
});

export const ChatHeader = memo(function ChatHeader() {
  const { isSidebarOpen, toggleSidebar } = useSidebarState();

  const handleToggleSidebar = useCallback(() => {
    toggleSidebar();
  }, [toggleSidebar]);

  return (
    <div className="flex items-center justify-between border-b px-4 py-2">
      <div className="flex items-center gap-2">
        <button 
          onClick={handleToggleSidebar} 
          className="p-2 hover:bg-gray-800 rounded-md"
          aria-label="Toggle Sidebar"
        >
          <MenuIcon className="w-6 h-6 text-gray-400" />
        </button>
        <ModelSelector />
      </div>
    </div>
  );
});

