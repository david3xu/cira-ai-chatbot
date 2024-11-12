"use client";

import { useMessageInput } from '@/hooks/useMessageInput';
import { DocumentPreview } from './DocumentPreview';
import { ImagePreview } from './ImagePreview';
import { FileUpload } from './FileUpload';
import { MessageInputField } from './MessageInputField';

const MessageInput: React.FC = () => {
  const {
    message,
    error,
    selectedImage,
    imagePreviewUrl,
    selectedFile,
    documentPreviewUrl,
    isLoading,
    fileInputRef,
    handleSend,
    handleInputChange,
    handleImageUpload,
    handleFileChange,
    handlePaste
  } = useMessageInput();

  return (
    <div className="relative bg-gray-800 rounded-lg p-1.5">
      <div className="flex flex-col space-y-2">
        {selectedFile && !selectedImage && (
          <DocumentPreview 
            fileName={selectedFile.name}
            previewUrl={documentPreviewUrl || undefined}
          />
        )}
        {imagePreviewUrl && selectedImage && (
          <ImagePreview previewUrl={imagePreviewUrl} />
        )}
        <div className="flex items-center relative w-full">
          <FileUpload
            ref={fileInputRef}
            onUpload={handleImageUpload}
            onChange={handleFileChange}
          />
          <div className="flex-1">
            <MessageInputField
              value={message}
              onChange={handleInputChange}
              onPaste={handlePaste}
              onSend={handleSend}
              isLoading={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
          </div>
        </div>
      </div>
      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
    </div>
  );
};

export default MessageInput; 