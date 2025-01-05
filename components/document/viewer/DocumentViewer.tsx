'use client'

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { DocumentToolbar } from './DocumentToolbar';
import { PageNavigation } from './PageNavigation';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { Components } from 'react-markdown';
import type { SyntaxHighlighterProps } from 'react-syntax-highlighter';

interface DocumentViewerProps {
  content: string;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function DocumentViewer({
  content,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className
}: DocumentViewerProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [content]);

  const components: Components = {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return match ? (
        <SyntaxHighlighter
          {...(props as SyntaxHighlighterProps)}
          style={vscDarkPlus as any}
          language={match[1]}
          PreTag="div"
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <DocumentToolbar />
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className={cn('prose dark:prose-invert max-w-none mx-auto', className)}>
          <ReactMarkdown components={components}>
            {content}
          </ReactMarkdown>
        </div>
      </div>

      {totalPages > 1 && (
        <PageNavigation
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
} 