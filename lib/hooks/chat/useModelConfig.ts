import { useState, useCallback, FormEvent } from 'react'

export function useModelConfig(
  initialConfig: Record<string, any>,
  onUpdate: (config: Record<string, any>) => void
) {
  const [configValues, setConfigValues] = useState(initialConfig)

  const handleConfigChange = useCallback((key: string, value: string) => {
    setConfigValues(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault()
    onUpdate(configValues)
  }, [configValues, onUpdate])

  return {
    configValues,
    handleConfigChange,
    handleSubmit
  }
} 