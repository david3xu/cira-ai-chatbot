import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import { ChatMessagesProps } from './types';
import { CopyButton } from './CopyButton';
import { StreamingMessage } from './StreamingMessage';
import { ChatMessage } from '@/lib/chat';
import { DocumentPreview } from '@/components/message-input/DocumentPreview';
import { MessageContent } from '@/types/messages';

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

export const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, streamingMessage, isLoading, error }) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [loadingText, setLoadingText] = useState("Generating response...");

  useEffect(() => {
    if (isLoading) {
      const loadingPhrases = [
        "Thinking...",
        "Processing your request...",
        "Generating response...",
        "Almost there...",
        "Computing answer..."
      ];
      
      let index = 0;
      const interval = setInterval(() => {
        setLoadingText(loadingPhrases[index]);
        index = (index + 1) % loadingPhrases.length;
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isLoading]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, streamingMessage]);

  const renderMessage = (msg: ChatMessage) => {
    const isUser = msg.role === 'user';
    const bubbleClass = isUser ? 'bg-gray-200 dark:bg-gray-700 ml-auto' : 'bg-gray-100 dark:bg-gray-600';
    const alignClass = isUser ? 'justify-end' : 'justify-start';

    // Handle different content types
    const getMessageContent = (content: ChatMessage['content']) => {
      if (typeof content === 'string') {
        return content;
      }
      if (Array.isArray(content)) {
        return content
          .filter(item => item.type === 'text')
          .map(item => item.text)
          .join('\n');
      }
      if (typeof content === 'object' && content !== null) {
        if ('text' in content) {
          return content.text;
        }
        if ('type' in content && content.type === 'text') {
          return content.text || '';
        }
      }
      return '';
    };

    return (
      <div key={msg.id} className={`flex ${alignClass} mb-4`}>
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-blue-500 dark:bg-blue-600 flex-shrink-0 mr-2">
            {/* AI avatar icon */}
          </div>
        )}
        <div className={`${bubbleClass} rounded-lg p-3 pr-10 max-w-[70%] relative`}>
          <div className="absolute top-2 right-2">
            <CopyButton content={getMessageContent(msg.content) || ''} messageId={msg.id} />
          </div>
          <div className="text-gray-900 dark:text-white">
            <ReactMarkdown
              className="prose dark:prose-invert max-w-none"
              components={{
                h1: ({ node, children, ...props }) => 
                  <h1 className="text-2xl font-bold mb-2" {...props}>{children}</h1>,
                h2: ({ node, children, ...props }) => 
                  <h2 className="text-xl font-bold mb-2" {...props}>{children}</h2>,
                h3: ({ node, children, ...props }) => 
                  <h3 className="text-lg font-bold mb-2" {...props}>{children}</h3>,
                p: ({ node, children, ...props }) => 
                  <p className="mb-2" {...props}>{children}</p>,
                ul: ({ node, children, ...props }) => 
                  <ul className="list-disc list-inside mb-2" {...props}>{children}</ul>,
                ol: ({ node, children, ...props }) => 
                  <ol className="list-decimal list-inside mb-2" {...props}>{children}</ol>,
                li: ({ node, children, ...props }) => 
                  <li className="mb-1" {...props}>{children}</li>,
                blockquote: ({ node, children, ...props }) => 
                  <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-2" {...props}>{children}</blockquote>,
                code: ({ node, inline, className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline && match ? (
                    <div className="relative">
                      <div className="absolute top-2 right-2">
                        <CopyButton content={String(children)} messageId={msg.id} />
                      </div>
                      <pre className="bg-gray-200 dark:bg-gray-800 p-2 pr-10 rounded mt-2 overflow-x-auto">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    </div>
                  ) : (
                    <code className="bg-gray-200 dark:bg-gray-800 rounded px-1" {...props}>
                      {children}
                    </code>
                  )
                }
              }}
            >
              {getMessageContent(msg.content)}
            </ReactMarkdown>
          </div>
          
          {msg.image && (
            <Image
              src={msg.image}
              alt="User uploaded image"
              width={200}
              height={200}
              className="rounded-lg mt-2"
            />
          )}

          {typeof msg.content === 'object' && 
           'document' in msg.content && 
           msg.content.document && (
            <DocumentPreview 
              fileName={msg.content.document.metadata.fileName}
              previewUrl={msg.content.document.metadata.previewUrl}
              metadata={msg.content.document.metadata}
              variant="chat"
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map(renderMessage)}
      
      {/* Show streaming message only when there's content */}
      {streamingMessage && <StreamingMessage assistantContent={streamingMessage} />}
      
      {/* Show loading indicator when no streaming content yet */}
      {isLoading && !streamingMessage && (
        <div className="flex justify-start items-center mb-4">
          <div className="loader mr-2"></div>
          <div className="text-white">{loadingText}</div>
        </div>
      )}
      
      {error && (
        <div className="mb-4 flex justify-center">
          <div className="p-4 rounded-lg bg-red-200 dark:bg-red-600 text-red-800 dark:text-white">
            Error: {error}
          </div>
        </div>
      )}
    </div>
  );
};
