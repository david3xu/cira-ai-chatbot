'use client';

import { PageHeader } from '@/components/shared/PageHeader'
import { ModelList } from '@/components/chat/model/ModelList'
import { useModelSelector } from '@/lib/hooks/features/useModelSelector'

export default function ModelsPage() {
  const { selectedModel: currentModel, selectModel: onModelChange } = useModelSelector()

  return (
    <>
      <PageHeader 
        title="AI Models" 
        description="Select and configure AI models"
      />
      <div className="container mx-auto py-6">
        <ModelList currentModel={currentModel || null} onModelChange={onModelChange} />
      </div>
    </>
  )
} 