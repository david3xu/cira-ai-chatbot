import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChatSettings } from './ChatSettings'
import { ModelConfig } from '../model/ModelConfig'
import { useModelSelector } from '@/lib/hooks/features/useModelSelector';

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { modelConfig, updateModelConfig } = useModelSelector();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your chat and model settings
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="chat">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat">Chat Settings</TabsTrigger>
            <TabsTrigger value="model">Model Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="chat">
            <ChatSettings />
          </TabsContent>
          <TabsContent value="model">
            <ModelConfig 
              config={modelConfig || {}}
              onConfigUpdate={updateModelConfig}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 