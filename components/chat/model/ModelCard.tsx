'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Model } from '@/lib/types'
import { useModelSelector } from '@/lib/hooks/features/useModelSelector'

interface ModelCardProps {
  model: Model
}

export function ModelCard({ model }: ModelCardProps) {
  const { selectedModel, selectModel } = useModelSelector()
  const isSelected = selectedModel === model.id

  return (
    <Card className={isSelected ? 'border-primary' : undefined}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{model.name}</CardTitle>
          <Button
            variant={isSelected ? "secondary" : "outline"}
            onClick={() => selectModel(model.id)}
            disabled={isSelected}
          >
            {isSelected ? 'Selected' : 'Select'}
          </Button>
        </div>
        <CardDescription>
          {model.details.description}
          <div className="mt-2 text-sm">
            <span className="font-medium">Parameters:</span> {model.details.parameters}
          </div>
        </CardDescription>
      </CardHeader>
    </Card>
  )
} 