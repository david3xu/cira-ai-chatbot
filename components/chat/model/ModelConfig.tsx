import React, { memo } from 'react'
import { useModelConfig } from '@/lib/hooks/chat'

interface ModelConfigProps {
  config: Record<string, any>
  onConfigUpdate: (config: Record<string, any>) => void
}

export const ModelConfig = memo(function ModelConfig({
  config,
  onConfigUpdate
}: ModelConfigProps) {
  const {
    configValues,
    handleConfigChange,
    handleSubmit
  } = useModelConfig(config, onConfigUpdate)

  return (
    <form onSubmit={handleSubmit} className="model-config">
      {Object.entries(configValues).map(([key, value]) => (
        <div key={key} className="config-item">
          <label htmlFor={key}>{key}</label>
          <input
            id={key}
            type="text"
            value={value}
            onChange={e => handleConfigChange(key, e.target.value)}
          />
        </div>
      ))}
      <button type="submit">Update Configuration</button>
    </form>
  )
}) 