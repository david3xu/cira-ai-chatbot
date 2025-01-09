"use client";

import React from 'react'
import { Button } from '@/components/ui/button'
import { useChat } from '@/lib/hooks/chat/useChat'
import { useRouter } from 'next/navigation'
import { useChatDomain } from '@/lib/hooks/domain/useChatDomain'
import { usePersistentState } from '@/lib/hooks/state/usePersistentState'

export const NewChatButton = () => {
  const router = useRouter()
  const { createChat } = useChat()
  const { state } = useChatDomain()
  const { customPrompt } = usePersistentState()

  const handleClick = async () => {
    const settings = {
      selectedModel: state.selectedModel,
      dominationField: state.dominationField,
      customPrompt: customPrompt || undefined
    }

    console.log('Creating chat with settings:', settings)

    try {
      console.log('Calling createChat with model:', settings.selectedModel)
      const chat = await createChat({
        model: settings.selectedModel,
        dominationField: settings.dominationField,
        customPrompt: settings.customPrompt
      })

      if (!chat?.id) {
        throw new Error('Failed to create chat')
      }

      console.log('Chat created successfully:', {
        id: chat.id,
        model: chat.model,
        dominationField: chat.domination_field
      })

      // Navigate to the new chat
      const chatPath = `/chat/${chat.id}`
      console.log('Navigating to:', chatPath)
      router.push(chatPath)
    } catch (error) {
      console.error('Failed to create chat:', error)
    }
  }

  return (
    <Button 
      onClick={handleClick}
      className="w-full"
      variant="outline"
    >
      + New Chat
    </Button>
  )
}
