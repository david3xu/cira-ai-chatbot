import { useState, useCallback, useEffect, useRef, useContext } from 'react'
import { useLoadingActions } from '../state/useLoadingActions'
import { ModelService } from '@/lib/services/ModelService'
import { ChatDomainContext } from '@/components/providers/chat/contexts'

type Model = { id: string };

export function useModelSelector() {
  const context = useContext(ChatDomainContext);
  if (!context) {
    throw new Error('useModelSelector must be used within ChatDomainProvider');
  }
  const { state, actions } = context;
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const modelsLoadedRef = useRef(false);
  const lastFetchRef = useRef<number>(0);
  const { startLoading, stopLoading } = useLoadingActions();

  const loadModels = useCallback(async (force = false): Promise<Model[]> => {
    // Return cached models if within cache window (60 seconds)
    const now = Date.now();
    if (!force && models.length > 0 && now - lastFetchRef.current < 60000) {
      return models;
    }

    if (isLoading) return models;
    
    try {
      setIsLoading(true);
      const fetchedModels = await ModelService.getModels();
      
      // Only update state if models have changed
      if (JSON.stringify(fetchedModels) !== JSON.stringify(models)) {
        setModels(fetchedModels);
        
        // Set default model if none selected
        if ((!state.selectedModel || state.selectedModel === 'null') && fetchedModels.length > 0) {
          actions.setModel(fetchedModels[0].id);
        }
      }

      lastFetchRef.current = now;
      return fetchedModels;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load models'));
      return models;
    } finally {
      setIsLoading(false);
      modelsLoadedRef.current = true;
    }
  }, [actions, state.selectedModel, models]);

  const selectModel = useCallback(async (modelId: string) => {
    if (modelId === state.selectedModel) return;
    
    try {
      startLoading();
      const currentModels = models.length > 0 ? models : await loadModels();
      if (currentModels.find(m => m.id === modelId)) {
        actions.setModel(modelId);
      }
    } finally {
      stopLoading();
    }
  }, [models, loadModels, actions, state.selectedModel, startLoading, stopLoading]);

  useEffect(() => {
    if (!modelsLoadedRef.current) {
      loadModels();
    }
  }, [loadModels]);

  const refreshModels = useCallback(() => {
    modelsLoadedRef.current = false;
    lastFetchRef.current = 0;
    return loadModels(true);
  }, [loadModels]);

  return {
    models,
    selectedModel: state.selectedModel === 'null' ? undefined : state.selectedModel,
    selectModel,
    isLoading,
    error,
    loadModels,
    refreshModels
  };
} 