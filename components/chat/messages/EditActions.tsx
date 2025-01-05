'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';

interface EditActionsProps {
  onCancel: () => void;
}

export function EditActions({ onCancel }: EditActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" onClick={onCancel}>
        <XIcon className="h-4 w-4" />
      </Button>
    </div>
  );
} 