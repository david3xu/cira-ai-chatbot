'use client';

import React, { memo, useCallback, useMemo } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { useModelSelector } from '@/lib/hooks/features/useModelSelector'

export const ModelSelector = memo(function ModelSelector() {
  const { models, selectedModel, selectModel, isLoading, refreshModels } = useModelSelector()

  const handleModelChange = useCallback((value: string) => {
    selectModel(value);
  }, [selectModel]);

  const handleRefresh = useCallback(() => {
    refreshModels();
  }, [refreshModels]);

  // Memoize the model items to prevent unnecessary re-renders
  const modelItems = useMemo(() => 
    models.map((model) => (
      <SelectItem 
        key={model.id} 
        value={model.id}
        className="cursor-pointer"
      >
        {model.id}
      </SelectItem>
    )),
    [models]
  );

  // Memoize the select value to prevent unnecessary re-renders
  const selectValue = useMemo(() => 
    selectedModel || '',
    [selectedModel]
  );

  return (
    <div className="flex items-center gap-2">
      <Select 
        value={selectValue}
        onValueChange={handleModelChange}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select a model...">
            {selectValue || 'Select a model...'}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {modelItems}
        </SelectContent>
      </Select>
      <Button 
        variant="outline" 
        size="icon"
        onClick={handleRefresh}
        disabled={isLoading}
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  )
}) 