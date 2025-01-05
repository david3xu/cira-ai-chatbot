"use client";

import React, { useEffect, useCallback, useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useChatDomain } from '@/lib/hooks/domain/useChatDomain'
import { usePersistentState } from '@/lib/hooks/state/usePersistentState'

export const CustomPromptInput = () => {
  const { state, actions } = useChatDomain()
  const { customPrompt, setCustomPrompt } = usePersistentState()
  const [value, setValue] = useState(customPrompt || '')
  const [isSaved, setIsSaved] = React.useState(false)

  useEffect(() => {
    if (customPrompt !== undefined && customPrompt !== null) {
      setValue(customPrompt);
    }
  }, [customPrompt])

  const handleSave = useCallback(() => {
    const trimmedValue = value.trim()
    if (trimmedValue) {
      setCustomPrompt(trimmedValue)
      actions.setCustomPrompt(trimmedValue)
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2000)
    }
  }, [value, actions, setCustomPrompt])

  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter custom system prompt..."
        className="min-h-[100px] resize-none"
      />
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={!value.trim() || value === customPrompt}
        >
          {isSaved ? 'Saved!' : 'Save Prompt'}
        </Button>
      </div>
    </div>
  )
} 