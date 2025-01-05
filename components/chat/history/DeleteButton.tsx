'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { TrashIcon } from 'lucide-react';
import { Loader } from '@/components/ui/icons';

interface DeleteButtonProps {
  isDeleting: boolean;
  showConfirm: boolean;
  onDelete: (e: React.MouseEvent) => void;
  onConfirm: (e: React.MouseEvent) => void;
}

export function DeleteButton({ isDeleting, showConfirm, onDelete, onConfirm }: DeleteButtonProps) {
  if (showConfirm) {
    return (
      <Button variant="destructive" size="sm" onClick={onConfirm} disabled={isDeleting}>
        {isDeleting ? <Loader className="h-4 w-4" /> : 'Confirm'}
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="icon" onClick={onDelete}>
      <TrashIcon className="h-4 w-4" />
    </Button>
  );
} 