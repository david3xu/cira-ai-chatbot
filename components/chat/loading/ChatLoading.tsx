"use client"

import React, { memo } from 'react'
import { useLoading } from '@/lib/hooks/useLoading'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export const ChatLoading = memo(function ChatLoading() {
  const { isLoading, loadingText } = useLoading()

  if (!isLoading) return null

  return (
    <div className="flex h-full items-center justify-center">
      <LoadingSpinner className="h-8 w-8" />
      <span className="ml-2 text-muted-foreground">
        {loadingText}
      </span>
    </div>
  )
}) 