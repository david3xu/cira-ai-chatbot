"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useChat } from '@/components/ChatContext';

interface SharedLayoutProps {
  children: React.ReactNode;
}

export default function SharedLayout({ children }: SharedLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const context = useChat();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-gray-900 min-h-screen flex relative">
        <div className="flex-1 p-4 flex flex-col items-center">
          <div className="w-full max-w-[800px] flex flex-col h-[calc(100vh-100px)]">
            <div className="text-white flex items-center justify-center h-full">
              Loading...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen flex relative">
      {context && <Sidebar />}
      <main className="flex-1 p-4 flex flex-col items-center">
        <div className="w-full max-w-[800px] flex flex-col h-[calc(100vh-100px)]">
          {children}
        </div>
      </main>
    </div>
  );
}