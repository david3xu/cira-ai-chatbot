'use client';

import React, { useEffect, useCallback, memo } from 'react';
import { DomainFieldSelector } from './DomainFieldSelector';
import { NewChatButton } from './NewChatButton';
import { ChatList } from './ChatList';
import { CustomPromptArea } from './CustomPromptArea';
import { useChatSidebar } from '@/lib/hooks/features/useChatSidebar';
import { useChatDomain } from '@/lib/hooks/domain/useChatDomain';
import { cn } from '@/lib/utils/utils';
import { useSidebarState } from '@/lib/hooks/ui/useSidebarState';
import { DominationField } from '@/lib/features/ai/config/constants';

export const ChatSidebar = memo(function ChatSidebar() {
  const { isSidebarOpen } = useSidebarState();
  const { 
    chats, 
    currentChat, 
    dominationField, 
    setDominationField 
  } = useChatSidebar();
  const { state: domainState } = useChatDomain();

  // Initialize domain field from localStorage or domain state
  useEffect(() => {
    const savedField = localStorage.getItem('selectedDominationField');
    if (savedField) {
      setDominationField(savedField as DominationField);
    } else if (domainState.dominationField && 
        domainState.dominationField !== 'undefined' && 
        domainState.dominationField !== dominationField) {
      setDominationField(domainState.dominationField as DominationField);
      localStorage.setItem('selectedDominationField', domainState.dominationField);
    }
  }, []); // Only run on mount

  const handleDomainChange = useCallback((value: DominationField) => {
    setDominationField(value);
    localStorage.setItem('selectedDominationField', value);
  }, [setDominationField]);

  return (
    <aside 
      className={cn(
        'fixed left-0 top-0 h-full',
        'w-[320px] lg:w-[400px]',
        'bg-gray-900 border-r border-gray-800',
        'transition-transform duration-300 ease-in-out z-50',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="h-full flex flex-col">
        <div className="border-b border-gray-800 h-[60px]">
          <DomainFieldSelector 
            value={dominationField as DominationField}
            onChange={handleDomainChange}
          />
        </div>

        <div className="p-3">
          <NewChatButton />
        </div>

        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="text-gray-400 text-sm p-4">No chats yet</div>
          ) : (
            <ChatList 
              chats={chats} 
              currentChatId={currentChat?.id} 
            />
          )}
        </div>

        <div className="mt-auto border-t border-gray-800">
          <CustomPromptArea />
        </div>
      </div>
    </aside>
  );
}); 