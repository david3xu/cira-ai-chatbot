import { PageHeader } from '@/components/shared/PageHeader'
import { ChatSettings } from '@/components/chat/settings/ChatSettings'

export default function SettingsPage() {
  return (
    <>
      <PageHeader 
        title="Settings" 
        description="Configure your chat experience"
      />
      <ChatSettings />
    </>
  )
} 