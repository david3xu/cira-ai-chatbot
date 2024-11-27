import { useState, useEffect } from 'react';
import { useChat } from '@/lib/features/chat/hooks/useChat';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ChatService } from '@/lib/services/chat/ChatService';
import { Sparkles } from 'lucide-react';
import { forwardRef } from 'react';
import { ButtonProps } from '@/components/ui/button';

const PromptButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => (
    <Button {...props} ref={ref} />
  )
);
PromptButton.displayName = 'PromptButton';

export function CustomPromptArea() {
  const { currentChat, updateCurrentChat } = useChat();
  const [prompt, setPrompt] = useState(currentChat?.customPrompt || '');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setPrompt(currentChat?.customPrompt || '');
  }, [currentChat?.customPrompt]);

  const handleSave = async () => {
    if (!currentChat) return;
    try {
      await ChatService.updatePrompt(currentChat.id, prompt);
      updateCurrentChat((prev) => prev ? {
        ...prev,
        customPrompt: prompt
      } : null);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update prompt:', error);
    }
  };

  if (!isEditing) {
    return (
      <PromptButton 
        variant="ghost" 
        onClick={() => setIsEditing(true)}
        className="w-full text-left text-sm text-white/80 hover:text-white hover:bg-gray-700 h-[60px] flex items-center gap-2"
      >
        <Sparkles className="h-4 w-4" />
        <span className="truncate">
          {prompt ? prompt : 'Add Custom Prompt...'}
        </span>
      </PromptButton>
    );
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your custom prompt..."
        className="min-h-[60px] text-sm bg-gray-800 border-gray-600"
      />
      <div className="flex gap-2">
        <Button 
          onClick={handleSave}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
        >
          Save
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setIsEditing(false)}
          size="sm"
          className="border-gray-600 hover:bg-gray-700"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
} 