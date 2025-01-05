/**
 * InputActions Component
 * 
 * Action buttons for chat input:
 * - Send message button
 * - Attachment button
 * - Loading states
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils/utils';

interface InputActionsProps {
  children: React.ReactNode;
  className?: string;
  position?: 'top' | 'bottom' | 'right';
  align?: 'start' | 'center' | 'end';
}

export function InputActions({
  children,
  className,
  position = 'right',
  align = 'center'
}: InputActionsProps) {
  return (
    <div
      className={cn(
        'flex gap-2',
        // Position
        position === 'top' && 'absolute -top-12 right-0',
        position === 'bottom' && 'absolute -bottom-12 right-0',
        position === 'right' && 'absolute right-2 top-0 h-full',
        // Alignment
        position === 'right' && 'items-center',
        align === 'start' && 'items-start',
        align === 'center' && 'items-center',
        align === 'end' && 'items-end',
        // Custom classes
        className
      )}
    >
      {children}
    </div>
  );
}

// Action button wrapper for consistent styling
export function ActionButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center',
        'rounded-md p-2',
        'text-sm font-medium',
        'transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        'focus-visible:outline-none focus-visible:ring-1',
        'focus-visible:ring-ring disabled:pointer-events-none',
        'disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// Divider for action groups
export function ActionDivider() {
  return (
    <div className="h-4 w-[1px] bg-border" />
  );
}

// Action group for organizing related buttons
export function ActionGroup({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {children}
    </div>
  );
}
