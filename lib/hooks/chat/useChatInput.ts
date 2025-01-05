import { useState, useCallback, KeyboardEvent } from 'react'
import { useChatMessage } from './useChatMessage'

export function useChatInput() {
  const { sendMessage } = useChatMessage()
  const [content, setContent] = useState('')
  const [isComposing, setIsComposing] = useState(false)

  const handleSubmit = useCallback(async () => {
    if (!content.trim()) return

    try {
      await sendMessage(content)
      setContent('')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }, [content, sendMessage])

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault()
      handleSubmit()
    }
  }, [handleSubmit, isComposing])

  return {
    content,
    setContent,
    handleSubmit,
    handleKeyDown,
    handleCompositionStart: () => setIsComposing(true),
    handleCompositionEnd: () => setIsComposing(false)
  }
} 