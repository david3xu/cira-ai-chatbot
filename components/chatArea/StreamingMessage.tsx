import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { StreamingMessageProps } from './types';
import { Bot } from 'lucide-react';

export const StreamingMessage: React.FC<StreamingMessageProps> = ({ assistantContent }) => {
  const [loadingDots, setLoadingDots] = useState('');

  useEffect(() => {
    if (!assistantContent) {
      const interval = setInterval(() => {
        setLoadingDots(dots => dots.length >= 3 ? '' : dots + '.');
      }, 500);
      return () => clearInterval(interval);
    }
  }, [assistantContent]);

  return (
    <div className="flex justify-start mb-4 animate-fadeIn">
      <div className="w-8 h-8 rounded-full bg-blue-500 dark:bg-blue-600 flex-shrink-0 mr-2 flex items-center justify-center">
        <Bot className="w-5 h-5 text-white" />
      </div>
      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 max-w-[80%] shadow-sm">
        {!assistantContent ? (
          <div className="text-gray-600 dark:text-gray-300 flex items-center">
            <span className="animate-pulse">Generating response{loadingDots}</span>
          </div>
        ) : (
          <ReactMarkdown
            className="text-gray-800 dark:text-gray-200 prose dark:prose-invert max-w-none"
            components={{
              p: ({ children }) => (
                <div className="mb-3 leading-relaxed">{children}</div>
              ),
              code: ({ node, inline, className, children, ...props }: any) => {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <pre className="bg-gray-200 dark:bg-gray-800 p-4 rounded-md mt-3 mb-3 overflow-x-auto relative">
                    <div className="absolute right-2 top-2 text-xs text-gray-500 dark:text-gray-400">
                      {match[1]}
                    </div>
                    <code className={`${className} text-sm`} {...props}>
                      {children}
                    </code>
                  </pre>
                ) : (
                  <code className="bg-gray-200 dark:bg-gray-800 rounded-md px-2 py-1 text-sm" {...props}>
                    {children}
                  </code>
                );
              },
              ul: ({ children }) => (
                <ul className="list-disc pl-6 mb-3 space-y-1">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-6 mb-3 space-y-1">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="mb-1">{children}</li>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-3 italic">
                  {children}
                </blockquote>
              ),
            }}
          >
            {assistantContent}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
};
