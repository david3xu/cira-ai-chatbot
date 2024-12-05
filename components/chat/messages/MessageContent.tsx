import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils/utils';

interface MessageContentProps {
  content: string;
  isStreaming?: boolean;
}

export function MessageContent({ content, isStreaming }: MessageContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [displayedContent, setDisplayedContent] = useState('');
  const previousContentRef = useRef('');

  useEffect(() => {
    if (isStreaming) {
      const newToken = content.slice(previousContentRef.current.length);
      if (newToken) {
        setDisplayedContent(prev => prev + newToken);
        previousContentRef.current = content;
      }
    } else {
      setDisplayedContent(content);
      previousContentRef.current = content;
    }
  }, [content, isStreaming]);

  useEffect(() => {
    if (isStreaming && contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [displayedContent, isStreaming]);

  return (
    <div 
      ref={contentRef} 
      className={cn(
        "prose prose-invert max-w-none",
        isStreaming && "streaming-content"
      )}
    >
      <ReactMarkdown
        components={{
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return match ? (
              <pre className="bg-gray-800 p-2 rounded">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className="bg-gray-800 rounded px-1" {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {displayedContent}
      </ReactMarkdown>
      {isStreaming && <span className="typing-cursor">▊</span>}
    </div>
  );
} 