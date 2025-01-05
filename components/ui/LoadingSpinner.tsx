import React from 'react'
import { cn } from '@/lib/utils/utils'
import { Loader } from '@/components/ui/icons'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  message?: string
}

export function LoadingSpinner({
  size = 'md',
  className,
  message
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <Loader 
        className={cn(
          'animate-spin',
          sizeClasses[size],
          className
        )}
      />
      {message && (
        <span className="mt-2 text-sm text-muted-foreground">
          {message}
        </span>
      )}
    </div>
  )
}
