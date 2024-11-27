import { useEffect, useState, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useChat } from '@/lib/features/chat/hooks/useChat';
import { Button } from "@/components/ui/button";
import { RefreshCw } from 'lucide-react';
import { 
  DEFAULT_MODEL, 
  getAvailableModels,
  normalizeModelName
} from '@/lib/features/ai/utils/modelUtils';
import { ModelOption } from '@/lib/features/ai/types/ollama';

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

function ModelDisplay({ model }: { model: ModelOption }) {
  return <span>{model.label}</span>;
}

export function ModelSelector() {
  const { currentChat, updateModel, model, setModel } = useChat();
  const [models, setModels] = useState<ModelOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshModels = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Fetching models...');
      const models = await getAvailableModels();
      console.log('Available models:', models);
      setModels(models);
      
      if (!model) {
        const defaultModel = models.find(m => m.value === DEFAULT_MODEL)?.value 
          || models[0]?.value 
          || DEFAULT_MODEL;
        console.log('Setting default model:', defaultModel);
        setModel(defaultModel);
      }
    } catch (error) {
      console.error('Error in refreshModels:', error);
      setError('Failed to load models');
    } finally {
      setIsLoading(false);
    }
  }, [model, setModel]);

  useEffect(() => {
    refreshModels();
  }, [refreshModels]);

  const handleModelChange = async (value: string) => {
    if (!value) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const normalizedModel = normalizeModelName(value);
      
      setModel(normalizedModel);
      
      if (currentChat?.id) {
        await updateModel(normalizedModel);
      }
    } catch (error) {
      setError('Failed to update model');
      console.error('Error updating model:', error);
      setModel(currentChat?.model || DEFAULT_MODEL);
    } finally {
      setIsLoading(false);
    }
  };

  // console.log('Current model:', model);
  // console.log('Available models:', models);

  return (
    <div className="flex items-center gap-2">
      <Select 
        onValueChange={handleModelChange}
        value={model || DEFAULT_MODEL}
        disabled={isLoading}
      >
        <SelectTrigger className="min-w-[200px]">
          <SelectValue placeholder="Select model">
            {model ? models.find(m => m.value === model)?.label || model : "Loading models..."}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {models.length > 0 ? (
            models.map((model) => (
              <SelectItem key={model.value} value={model.value}>
                {model.label}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="loading" disabled>
              No models available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      
      <RefreshButton onClick={refreshModels} isLoading={isLoading} />
      
      {error && <ErrorMessage message={error} />}
    </div>
  );
} 