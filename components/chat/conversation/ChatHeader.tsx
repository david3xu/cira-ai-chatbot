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

import React, { useCallback, memo, useState } from 'react';
import { ModelSelector } from '../model/ModelSelector';
import { useSidebarState } from '@/lib/hooks/ui/useSidebarState';
import { FileUploader } from '../uploader/FileUploader';
import { Upload, X } from 'lucide-react';
import { uploadDocument, uploadMultipleDocuments } from '@/lib/features/document/actions/uploadDocument';
import { DominationField } from '@/lib/features/ai/config/constants';

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
  const [showUploader, setShowUploader] = useState(false);

  const handleToggleSidebar = useCallback(() => {
    toggleSidebar();
  }, [toggleSidebar]);

  const handleUpload = async (
    files: File[], 
    options: {
      author: string;
      source: string;
      dominationField: DominationField;
    },
    onProgress?: (fileName: string, progress: number, status: string) => void
  ) => {
    await uploadMultipleDocuments(files, {
      ...options,
      onProgress
    });
  };

  return (
    <>
      <div className="flex items-center justify-between border-b h-[60px] px-4 bg-gray-900 sticky top-0 z-20">
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
        <button 
          className="text-white font-semibold cursor-pointer flex items-center gap-2 hover:text-gray-300 transition-colors duration-200" 
          onClick={() => setShowUploader(!showUploader)}
        >
          {showUploader ? (
            <>
              <X className="w-5 h-5" />
              Hide Uploader
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Show Uploader
            </>
          )}
        </button>
      </div>
      
      {showUploader && (
        <div className="sticky top-[60px] z-10 bg-gray-800 rounded-lg p-4">
          <FileUploader onUpload={handleUpload} />
        </div>
      )}
    </>
  );
});

