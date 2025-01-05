'use client';

import { memo } from 'react';
import { ChatMessage } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';

interface MessageControlsProps {
  message: ChatMessage;
  onDelete: () => void;
  onEdit: () => void;
}

export const MessageControls = memo(function MessageControls({
  message,
  onDelete,
  onEdit
}: MessageControlsProps) {
  return (
    <div className="flex items-center gap-1 ml-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onEdit}
        className="h-8 w-8"
        title="Edit message"
      >
        <Pencil1Icon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="h-8 w-8"
        title="Delete message"
      >
        <TrashIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}); 