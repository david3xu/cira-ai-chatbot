"use client";

import React, { useEffect, useCallback, useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useChatDomain } from '@/lib/hooks/domain/useChatDomain'
import { usePersistentState } from '@/lib/hooks/state/usePersistentState'

export const CustomPromptInput = () => {
  const { state, actions } = useChatDomain()
  const { customPrompt, setCustomPrompt } = usePersistentState()
  const [value, setValue] = useState('')
  const [isSaved, setIsSaved] = React.useState(false)
  const lastSetPromptRef = React.useRef<string | null>(null)
  const isInitializedRef = React.useRef(false)

  // Set initial value from persistent state or chat state
  useEffect(() => {
    // Skip if already initialized with this value
    if (isInitializedRef.current && lastSetPromptRef.current === value) {
      return
    }

    const chatPrompt = state.currentChat?.custom_prompt
    const persistentPrompt = customPrompt
    const promptToUse = chatPrompt || persistentPrompt || ''

    console.log('Setting custom prompt:', {
      chatPrompt,
      persistentPrompt,
      promptToUse,
      lastSetPrompt: lastSetPromptRef.current,
      currentValue: value,
      isInitialized: isInitializedRef.current
    })

    if (promptToUse !== value) {
      setValue(promptToUse)
      lastSetPromptRef.current = promptToUse
      isInitializedRef.current = true
    }
  }, [state.currentChat, customPrompt, value])

  // Update value when typing
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    // Auto-save as user types, but only if value has changed
    if (newValue.trim() && newValue !== lastSetPromptRef.current) {
      setCustomPrompt(newValue)
      actions.setCustomPrompt(newValue)
      lastSetPromptRef.current = newValue
    }
  }

  const handleSave = useCallback(() => {
    const trimmedValue = value.trim()
    if (trimmedValue && trimmedValue !== lastSetPromptRef.current) {
      console.log('Saving custom prompt:', {
        newValue: trimmedValue,
        lastValue: lastSetPromptRef.current
      })
      setCustomPrompt(trimmedValue)
      actions.setCustomPrompt(trimmedValue)
      lastSetPromptRef.current = trimmedValue
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2000)
    }
  }, [value, actions, setCustomPrompt])

  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={handleChange}
        placeholder="Enter custom system prompt..."
        className="min-h-[100px] resize-none"
      />
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={!value.trim() || value === lastSetPromptRef.current}
        >
          {isSaved ? 'Saved!' : 'Save Prompt'}
        </Button>
      </div>
    </div>
  )
} 