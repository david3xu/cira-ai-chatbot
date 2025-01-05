"use client";

import { useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useChat } from '@/lib/hooks/chat/useChat';
import { useModelSelector } from '@/lib/hooks/features/useModelSelector';
import { useChatSidebar } from '@/lib/hooks/features/useChatSidebar';
import { useChatContext } from '@/lib/hooks/chat/useChatContext';

const PlusIcon = memo(function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
});

export const NewChatButton = memo(function NewChatButton() {
  const router = useRouter();
  const { createChat } = useChat();
  const { selectedModel } = useModelSelector();
  const { dominationField } = useChatSidebar();
  const { state: { customPrompt }, dispatch } = useChatContext();

  console.log('NewChatButton render - State:', { 
    selectedModel, 
    dominationField, 
    customPrompt
  });

  const handleClick = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (!selectedModel) {
      console.error('No model selected');
      return;
    }
    
    // Ensure we have a valid domination field
    const currentDominationField = dominationField || 'NORMAL_CHAT';
    
    console.log('Creating chat with settings:', {
      selectedModel,
      dominationField: currentDominationField,
      customPrompt
    });

    try {
      console.log('Calling createChat with model:', selectedModel);
      const newChat = await createChat({
        model: selectedModel,
        name: 'New Chat',
        dominationField: currentDominationField,
        customPrompt: customPrompt || undefined
      });
      
      if (!newChat?.id) {
        console.error('Invalid chat response:', newChat);
        return;
      }

      console.log('Chat created successfully:', {
        id: newChat.id,
        model: newChat.model,
        dominationField: newChat.domination_field
      });
      
      // Store the domination field in localStorage
      localStorage.setItem('selectedDominationField', currentDominationField);
      
      // Update the global state with the domination field
      dispatch({ type: 'SET_DOMINATION_FIELD', payload: currentDominationField });
      
      console.log('Navigating to:', `/chat/${newChat.id}`);
      router.push(`/chat/${newChat.id}`);
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  }, [selectedModel, dominationField, customPrompt, createChat, router, dispatch]);

  return (
    <Button
      onClick={handleClick}
      className="w-full bg-gray-800 hover:bg-gray-700 text-white"
      variant="ghost"
      disabled={!selectedModel}
    >
      <PlusIcon className="w-4 h-4 mr-2" />
      New Chat
    </Button>
  );
});
