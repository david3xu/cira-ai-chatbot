import React, { useEffect, useState, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useChat } from '@/components/ChatContext';
import { DEFAULT_MODEL, formatModelName, getFullModelName } from '@/lib/modelUtils';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';

interface ModelOption {
  value: string;
  label: string;
  details?: {
    parameter_size?: string;
    family?: string;
    quantization_level?: string;
  };
}

export function ModelSelector() {
  const { model, setModel, currentChat } = useChat();
  const [mounted, setMounted] = useState(false);
  const [localModels, setLocalModels] = useState<ModelOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshModels = useCallback(async (retryCount = 0) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/ollama/tags', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }

      const data = await response.json();
      setLocalModels(data.models || [{ value: DEFAULT_MODEL, label: 'Default Model' }]);

    } catch (error) {
      console.error('Error fetching models:', error);
      if (retryCount < 3) {
        setTimeout(() => refreshModels(retryCount + 1), 1000 * (retryCount + 1));
      } else {
        setError('Failed to connect to Ollama server. Please ensure it is running.');
        setLocalModels([{ value: DEFAULT_MODEL, label: 'Default Model' }]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await refreshModels();
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to initialize');
      }
    };
    
    initializeApp();
  }, [refreshModels]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleModelChange = async (value: string) => {
    console.log('Changing model to:', value);
    const fullModelName = getFullModelName(value);
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Update model in database without pulling
      const updateResponse = await fetch('/api/ollama/update-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: fullModelName })
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || 'Failed to update model');
      }

      // Update chat model if there's a current chat
      if (currentChat?.id) {
        const chatResponse = await fetch('/api/chat/update-model', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            chatId: currentChat.id,
            model: fullModelName 
          })
        });

        if (!chatResponse.ok) {
          const errorData = await chatResponse.json();
          throw new Error(errorData.error || 'Failed to update chat model');
        }
      }

      setModel(value);
      localStorage.setItem('selectedModel', value);
      localStorage.setItem('lastUsedModel', fullModelName);

    } catch (error) {
      console.error('Failed to update model:', error);
      setError(error instanceof Error ? error.message : 'Failed to update model');
      
      // Revert to previous model
      const previousModel = localStorage.getItem('lastUsedModel');
      if (previousModel) setModel(previousModel);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return <div className="w-[200px]" />;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} retry={() => refreshModels()} />;
  }

  return (
    <div className="flex items-center gap-2">
      <Select 
        onValueChange={handleModelChange}
        value={model || DEFAULT_MODEL}
        defaultValue={DEFAULT_MODEL}
      >
        <SelectTrigger 
          className="w-[250px] bg-transparent text-white border-gray-700"
          disabled={isLoading}
        >
          <SelectValue>
            {isLoading ? 'Loading models...' : formatModelName(model || DEFAULT_MODEL)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {localModels.map((model) => (
            <SelectItem 
              key={model.value} 
              value={model.value}
              className="flex justify-between items-center"
            >
              <span>{model.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <button 
        onClick={() => refreshModels()}
        className="p-2 rounded-full hover:bg-gray-700 transition-colors"
        title="Refresh models"
        disabled={isLoading}
      >
        <svg 
          className={`w-4 h-4 text-white ${isLoading ? 'animate-spin' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
          />
        </svg>
      </button>
      {error && (
        <span className="text-red-500 text-sm">{error}</span>
      )}
    </div>
  );
}
