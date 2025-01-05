"use client"

import { cn } from '@/lib/utils/utils';

interface StreamingIndicatorProps {
  className?: string;
}

export function StreamingIndicator({ className }: StreamingIndicatorProps) {
  return (
    <span className={cn('animate-pulse', className)}>▋</span>
  );
} 