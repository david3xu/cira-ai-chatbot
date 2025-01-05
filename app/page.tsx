'use client';

import { memo } from 'react';
import { ChatLayout } from '@/components/chat/layout/ChatLayout';
import { ChatContainer } from '@/components/chat/conversation/ChatContainer';
import { RootChatProvider } from '@/components/providers/chat';
import { ChatDomainProvider } from '@/components/providers/chat/ChatDomainProvider';

function HomePage() {
  return (
    <RootChatProvider>
      <ChatDomainProvider>
        <ChatLayout>
          <ChatContainer />
        </ChatLayout>
      </ChatDomainProvider>
    </RootChatProvider>
  );
}

export default memo(HomePage);

