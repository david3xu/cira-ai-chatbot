import React from 'react'

export function MessageSkeleton() {
  return (
    <div className="flex items-start gap-4 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      </div>
    </div>
  )
} 