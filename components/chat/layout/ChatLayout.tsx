'use client';

import { useEffect, useRef, memo } from 'react';
import { ChatSidebar } from "@/components/chat/sidebar/ChatSidebar";
import { useSidebarState } from '@/lib/hooks/ui/useSidebarState';
import { cn } from "@/lib/utils/utils";

interface ChatLayoutProps {
  children: React.ReactNode;
}

export const ChatLayout = memo(function ChatLayout({ children }: ChatLayoutProps) {
  const { isSidebarOpen, setSidebarState } = useSidebarState();
  const initialized = useRef(false);

  // Ensure sidebar state is set only once on initial mount
  useEffect(() => {
    if (!initialized.current) {
      setSidebarState(true);
      initialized.current = true;
    }
  }, [setSidebarState]);

  return (
    <div className="flex h-screen">
      <ChatSidebar />
      <main 
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          isSidebarOpen ? "ml-[320px] lg:ml-[400px]" : "ml-0"
        )}
      >
        {children}
      </main>
    </div>
  );
}); 