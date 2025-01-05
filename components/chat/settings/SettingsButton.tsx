import React from 'react'
import { Button } from '@/components/ui/button'
import { SettingsDialog } from './SettingsDialog'
import { Settings } from 'lucide-react'

export function SettingsButton() {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="hover:bg-muted"
      >
        <Settings className="h-5 w-5" />
      </Button>
      <SettingsDialog 
        open={open} 
        onOpenChange={setOpen} 
      />
    </>
  )
} 