"use client";

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/chat/area/Sidebar';
import { useChatContext } from '@/lib/features/chat/context/useChatContext';

interface SharedLayoutProps {
  children: React.ReactNode;
}

export default function SharedLayout({ children }: SharedLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebarVisible') !== 'false';
    }
    return true;
  });
  const context = useChatContext();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (sidebarVisible !== undefined) {
      localStorage.setItem('sidebarVisible', String(sidebarVisible));
    }
  }, [sidebarVisible]);

  if (!mounted || !context) {
    return (
      <div className="min-h-screen bg-gray-900 flex">
        <div className="flex-1">
          <div className="text-white flex items-center justify-center h-screen">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <Sidebar onSidebarToggle={(visible) => setSidebarVisible(visible)} />
      <main 
        className={`flex-1 ${sidebarVisible ? 'ml-[300px]' : 'ml-[80px]'} transition-all duration-300`}
      >
        <div className="h-screen flex flex-col overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}