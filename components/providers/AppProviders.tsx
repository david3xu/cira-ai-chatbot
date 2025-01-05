"use client";

import React from 'react';
import { ThemeProvider } from './theme/ThemeProvider';
import { RootChatProvider } from './chat/RootChatProvider';
import { DocumentProvider } from './document/DocumentProvider';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { ProviderProps } from '@/lib/types/provider';
import { StateProvider } from './StateProvider';
import { ChatHydrationProvider } from './chat/ChatHydrationProvider';
import { ChatDomainProvider } from './chat/ChatDomainProvider';

/**
 * AppProviders composes all application providers in the correct order
 * Order matters for provider composition:
 * 1. ErrorBoundary (outermost)
 * 2. ThemeProvider (UI theme)
 * 3. ChatHydrationProvider (state hydration)
 * 4. StateProvider (state synchronization)
 * 5. RootChatProvider (chat functionality)
 * 6. DocumentProvider (document handling)
 */
export function AppProviders({ children }: ProviderProps) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ChatDomainProvider>
          <ChatHydrationProvider>
            <StateProvider>
              <RootChatProvider>
                <DocumentProvider>
                  {children}
                </DocumentProvider>
              </RootChatProvider>
            </StateProvider>
          </ChatHydrationProvider>
        </ChatDomainProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

/**
 * withProviders HOC to wrap components with all providers
 */
export function withProviders<T extends object>(
  WrappedComponent: React.ComponentType<T>
) {
  return function WithProvidersComponent(props: T) {
    return (
      <AppProviders>
        <WrappedComponent {...props} />
      </AppProviders>
    );
  };
}
