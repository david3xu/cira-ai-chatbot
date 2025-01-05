'use client'

import React, { memo, useCallback, useState, useEffect } from 'react';
import { useChatDomain } from '@/lib/hooks/domain/useChatDomain';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { usePersistentState } from '@/lib/hooks/state/usePersistentState';

export const CustomPromptArea = memo(function CustomPromptArea() {
  const { state, actions } = useChatDomain();
  const { customPrompt, setCustomPrompt } = usePersistentState();
  const [value, setValue] = useState(customPrompt || '');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (customPrompt !== undefined && customPrompt !== null) {
      setValue(customPrompt);
    }
  }, [customPrompt]);

  const handleSave = useCallback(() => {
    const trimmedValue = value.trim();
    if (trimmedValue) {
      setCustomPrompt(trimmedValue);
      actions.setCustomPrompt(trimmedValue);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  }, [value, actions, setCustomPrompt]);

  return (
    <div className="p-4">
      <label className="block text-sm font-medium text-gray-200 mb-2">
        Custom Prompt
      </label>
      <Textarea
        placeholder="Enter a custom prompt..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full h-24 bg-gray-800 text-white border-gray-700 resize-none mb-2"
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
  );
}); 