"use client";

import SharedLayout from '@/components/chat/layout/SharedLayout';
import { ChatArea } from '@/components/chat/area/ChatArea';
import { Suspense } from 'react';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

const ChatErrorFallback = ({ error }: { error: Error }) => (
  <div className="flex items-center justify-center h-full">
    <div className="text-white">
      Something went wrong. Please try again.
    </div>
  </div>
);

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Suspense fallback={<div className="flex items-center justify-center h-screen">
        <div className="text-white">Loading...</div>
      </div>}>
        <SharedLayout>
          <ErrorBoundary FallbackComponent={ChatErrorFallback}>
            <ChatArea />
          </ErrorBoundary>
        </SharedLayout>
      </Suspense>
    </div>
  );
}
