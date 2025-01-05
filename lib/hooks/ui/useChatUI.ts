'use client';

import { useCallback, useState } from 'react'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { create } from 'zustand'

interface UIState {
  isSidebarOpen: boolean
  isSettingsOpen: boolean
  isLoading: boolean
  loadingText: string
  setLoading: (loading: boolean, text?: string) => void
  toggleSidebar: () => void
  toggleSettings: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  isSettingsOpen: false,
  isLoading: false,
  loadingText: '',
  setLoading: (loading: boolean, text = '') => 
    set({ isLoading: loading, loadingText: text }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen }))
}))

export function useChatUI() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const {
    isSidebarOpen,
    isSettingsOpen,
    isLoading,
    loadingText,
    setLoading,
    toggleSidebar,
    toggleSettings
  } = useUIStore()

  const closeAllModals = useCallback(() => {
    if (isSettingsOpen) {
      toggleSettings()
    }
    if (isMobile && isSidebarOpen) {
      toggleSidebar()
    }
  }, [isSettingsOpen, toggleSettings, isMobile, isSidebarOpen, toggleSidebar])

  return {
    isSidebarOpen,
    isSettingsOpen,
    isLoading,
    loadingText,
    isMobile,
    toggleSidebar,
    toggleSettings,
    setLoading,
    closeAllModals
  }
} 