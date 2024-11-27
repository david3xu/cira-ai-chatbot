import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/utils';

interface DocumentViewerProps {
  content: string;
  className?: string;
}

export function DocumentViewer({ content, className }: DocumentViewerProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [content]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className={cn('prose dark:prose-invert max-w-none', className)}>
      <ReactMarkdown
        components={{
          pre: ({ node, ...props }) => (
            <pre className="overflow-auto rounded-lg bg-muted p-4" {...props} />
          ),
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <code className={className} {...props}>
                {children}
              </code>
            ) : (
              <code className="rounded bg-muted px-1 py-0.5" {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
} 