import { useEffect, useState, useCallback, useRef } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useChat } from '@/lib/features/chat/hooks/useChat';
import { Button } from "@/components/ui/button";
import { RefreshCw } from 'lucide-react';
import { 
  getAvailableModels,
  normalizeModelName
} from '@/lib/features/ai/utils/modelUtils';
import { ModelOption } from '@/lib/features/ai/types/ollama';

interface ModelSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

function ErrorMessage({ message }: { message: string }) {
  return <span className="text-sm text-red-500">{message}</span>;
}

function RefreshButton({ onClick, isLoading }: { onClick: () => void; isLoading: boolean }) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick} disabled={isLoading}>
      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
    </Button>
  );
}

function ModelDisplay({ 
  selectedModel, 
  activeModel 
}: { 
  selectedModel: string; 
  activeModel?: string | null 
}) {
  if (activeModel && activeModel !== selectedModel) {
    return (
      <div className="flex flex-col">
        <span>{selectedModel}</span>
        <span className="text-xs text-gray-400">Current: {activeModel}</span>
      </div>
    );
  }
  return <span>{selectedModel}</span>;
}

export function ModelSelector({ className = "" }: ModelSelectorProps) {
  const [models, setModels] = useState<ModelOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentChat, updateModel, model: globalModel, setModel } = useChat();
  
  // Initialize localModel with empty string instead of potentially 'null'
  const [localModel, setLocalModel] = useState<string>('');

  const refreshModels = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const availableModels = await getAvailableModels();
      setModels(availableModels);
      
      // If we have available models, ensure we select one
      if (availableModels.length > 0) {
        // Use the first available model if no valid model is selected
        if (!localModel || localModel === 'null') {
          const modelToUse = availableModels[0].value;
          setLocalModel(modelToUse);
          setModel(modelToUse);
          localStorage.setItem('selectedModel', modelToUse);
        }
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      setError('Failed to load models');
    } finally {
      setIsLoading(false);
    }
  }, [localModel, setModel]);

  // Load initial models
  useEffect(() => {
    refreshModels();
  }, [refreshModels]);

  // Sync with global model when it's valid
  useEffect(() => {
    if (globalModel && globalModel !== 'null' && globalModel !== localModel) {
      setLocalModel(globalModel);
    }
  }, [globalModel]);

  const handleModelChange = async (newValue: string) => {
    if (!newValue || newValue === localModel) return;
    
    try {
      setError(null);
      setIsLoading(true);
      
      setLocalModel(newValue);
      setModel(newValue);
      localStorage.setItem('selectedModel', newValue);

      if (currentChat?.id) {
        await updateModel(newValue);
      }
    } catch (error) {
      console.error('Error updating model:', error);
      setError('Failed to update model');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Select 
        value={localModel || ''}
        onValueChange={handleModelChange}
        disabled={isLoading}
      >
        <SelectTrigger className="min-w-[200px]">
          <SelectValue placeholder="Select model">
            {localModel && localModel !== 'null' ? (
              <ModelDisplay 
                selectedModel={normalizeModelName(localModel)}
                activeModel={currentChat?.model ? normalizeModelName(currentChat.model) : undefined}
              />
            ) : (
              "Select model"
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {models.map((model) => (
            <SelectItem 
              key={model.value} 
              value={model.value}
              className="cursor-pointer"
            >
              {normalizeModelName(model.value)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <RefreshButton onClick={refreshModels} isLoading={isLoading} />
      
      {error && <ErrorMessage message={error} />}
    </div>
  );
} 