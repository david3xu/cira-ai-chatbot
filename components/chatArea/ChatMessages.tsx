import React, { useRef, useEffect, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import { ChatMessagesProps } from './types';
import { CopyButton } from './CopyButton';
import { StreamingMessage } from './StreamingMessage';
import { ChatMessage } from '@/lib/chat';
import { DocumentPreview } from '@/components/message-input/DocumentPreview';
import { DocumentMetadata } from '@/types/types';
import { MessageBubble } from './ChatArea';
  
type CustomNode = {
  type: string;
  value?: string;
  children?: CustomNode[];
  className?: string;
  inline?: boolean;
  [key: string]: unknown;
};

type MarkdownComponentProps = {
  node: CustomNode;
  children: React.ReactNode;
  className?: string;
  inline?: boolean;
  [key: string]: unknown;
} & React.HTMLAttributes<HTMLElement>;

type MessageContent = {
  type: 'refusal';
  text: string;
} | {
  type: 'document';
  document: {
    metadata: {
      fileName: string;
      previewUrl: string;
      [key: string]: any;
    };
  };
} | {
  type?: string;
  text: string;
  document?: {
    metadata: {
      fileName: string;
      previewUrl: string;
      [key: string]: any;
    };
  };
};

interface StreamingState {
  content: string;
  isComplete: boolean;
  error: string | null;
  lastUpdate: number;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ 
  messages, 
  streamingMessage,
  isLoading 
}) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  
  useEffect(() => {
    // Filter out any invalid messages and ensure proper ordering
    const validMessages = messages.filter(msg => 
      msg && (msg.role === 'user' || msg.role === 'assistant') && msg.content
    );
    
    setLocalMessages(validMessages);
  }, [messages]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [localMessages, streamingMessage]);

  const renderMessage = (message: ChatMessage, isStreaming = false) => (
    <MessageBubble
      key={message.id}
      message={message}
      isStreaming={isStreaming}
    />
  );

  return (
    <div className="chat-messages" ref={chatContainerRef}>
      {localMessages.map(message => renderMessage(message))}
      
      {streamingMessage && renderMessage({
        id: 'streaming',
        role: 'assistant',
        content: streamingMessage,
        dominationField: localMessages[localMessages.length - 1]?.dominationField || '',
        model: localMessages[localMessages.length - 1]?.model || ''
      }, true)}
      
      {isLoading && !streamingMessage && (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      )}
    </div>
  );
};
