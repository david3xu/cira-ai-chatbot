'use client';

import { PageLayout } from '@/components/layouts/PageLayout';
import { ChatLayout } from '@/components/chat/layout/ChatLayout';

export default function ChatPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageLayout>
      <ChatLayout>{children}</ChatLayout>
    </PageLayout>
  );
} 