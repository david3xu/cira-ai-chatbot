'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useChat } from '@/lib/hooks/chat/useChat'

export function ChatSettings() {
  const { modelConfig, updateSettings } = useChat()
  const [isSaving, setIsSaving] = React.useState(false)

  const settings = {
    streamResponses: modelConfig?.streamResponses ?? false,
    showTimestamps: modelConfig?.showTimestamps ?? false
  }

  const handleSave = async () => {
    setIsSaving(true)
    await updateSettings({ modelConfig: settings })
    setIsSaving(false)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Chat Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure your chat experience
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">
            Stream Responses
          </label>
          <Switch
            checked={settings.streamResponses}
            onCheckedChange={(checked) => 
              updateSettings({ modelConfig: { ...modelConfig, streamResponses: checked } })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">
            Show Timestamps
          </label>
          <Switch
            checked={settings.showTimestamps}
            onCheckedChange={(checked) =>
              updateSettings({ modelConfig: { ...modelConfig, showTimestamps: checked } })
            }
          />
        </div>
      </div>

      <Button 
        onClick={handleSave} 
        disabled={isSaving}
        className="w-full"
      >
        {isSaving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  )
} 