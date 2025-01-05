"use client"

import { Copy, RotateCcw, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat } from '@/lib/hooks/chat/useChat';
import { useState } from 'react';

export function CopyButton({ content }: { content: string | null }) {
  const handleCopy = () => navigator.clipboard.writeText(content || '');
  return (
    <Button onClick={handleCopy} variant="ghost" size="sm">
      <Copy className="h-4 w-4" />
    </Button>
  );
}

export function RegenerateButton({ messagePairId }: { messagePairId: string }) {
  const { regenerateMessage } = useChat();
  const [isLoading, setIsLoading] = useState(false);

  const handleRegenerate = async () => {
    setIsLoading(true);
    await regenerateMessage(messagePairId);
    setIsLoading(false);
  };

  return (
    <Button onClick={handleRegenerate} variant="ghost" size="sm" disabled={isLoading}>
      <RotateCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
    </Button>
  );
}

export function DeleteButton({ messagePairId }: { messagePairId: string }) {
  const { deleteMessage } = useChat();
  return (
    <Button onClick={() => deleteMessage(messagePairId)} variant="ghost" size="sm">
      <Trash className="h-4 w-4" />
    </Button>
  );
} 