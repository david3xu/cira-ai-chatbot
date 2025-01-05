import React, { memo } from 'react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { AVAILABLE_MODELS } from '@/lib/config/models'

interface ModelListProps {
  currentModel: string | null
  onModelChange: (modelId: string) => void
}

export const ModelList = memo(function ModelList({
  currentModel,
  onModelChange
}: ModelListProps) {
  return (
    <Select value={currentModel || ''} onValueChange={onModelChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent>
        {AVAILABLE_MODELS.map(model => (
          <SelectItem key={model.id} value={model.id}>
            {model.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}) 