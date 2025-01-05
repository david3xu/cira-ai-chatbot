import { PageHeader } from '@/components/shared/PageHeader'
import { ChatContainer } from '@/components/chat/conversation/ChatContainer'

export default function ChatPage() {
  return (
    <>
      <PageHeader 
        title="Chat" 
        description="Start a new conversation"
      />
      <ChatContainer />
    </>
  )
} 