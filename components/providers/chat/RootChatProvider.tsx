'use client';

import React from 'react';
import { ChatProvider } from './ChatProvider';
import { ChatAPIProvider } from './ChatAPIProvider';
import { ChatUIProvider } from './ChatUIProvider';
import { ChatDomainProvider } from './ChatDomainProvider';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { ProviderProps } from '@/lib/types/provider';

/**
 * RootChatProvider composes all chat-related providers in the correct order
 * Provider hierarchy:
 * 1. ChatErrorBoundary (catches chat-specific errors)
 * 2. ChatProvider (core chat state)
 * 3. ChatDomainProvider (domain-specific state)
 * 4. ChatAPIProvider (API state)
 * 5. ChatUIProvider (UI state)
 */
export function RootChatProvider({ children }: ProviderProps) {
  return (
    <ErrorBoundary>
      <ChatProvider>
        <ChatDomainProvider>
          <ChatAPIProvider>
            <ChatUIProvider>
              {children}
            </ChatUIProvider>
          </ChatAPIProvider>
        </ChatDomainProvider>
      </ChatProvider>
    </ErrorBoundary>
  );
}

/**
 * Provider dependency flow:
 * ChatProvider (core state)
 * └── ChatDomainProvider (domain-specific state)
 *     └── ChatAPIProvider (API state)
 *         └── ChatUIProvider (UI state)
 */

/**
 * withChatProviders HOC to wrap components with chat providers only
 */
export function withChatProviders<T extends object>(
  WrappedComponent: React.ComponentType<T>
) {
  return function WithChatProvidersComponent(props: T) {
    return (
      <RootChatProvider>
        <WrappedComponent {...props} />
      </RootChatProvider>
    );
  };
} 