'use client';

import React, { useReducer, useMemo, useEffect } from 'react';
import { ThemeContext } from './contexts';
import { ThemeState, ThemeAction } from '@/lib/types';
import { ProviderProps } from '@/lib/types/provider';

const initialState: ThemeState = {
  theme: 'system',
  systemTheme: 'light',
  resolvedTheme: 'light'
};

function themeReducer(state: ThemeState, action: ThemeAction): ThemeState {
  switch (action.type) {
    case 'SET_THEME':
      return { 
        ...state, 
        theme: action.payload,
        resolvedTheme: action.payload === 'system' ? state.systemTheme : action.payload
      };
    case 'SET_SYSTEM_THEME':
      return { 
        ...state, 
        systemTheme: action.payload,
        resolvedTheme: state.theme === 'system' ? action.payload : state.theme
      };
    default:
      return state;
  }
}

export function ThemeProvider({ children }: ProviderProps) {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // Theme Actions
  const actions = useMemo(() => ({
    setTheme: (theme: 'light' | 'dark' | 'system') => 
      dispatch({ type: 'SET_THEME', payload: theme }),
      
    setSystemTheme: (theme: 'light' | 'dark') => 
      dispatch({ type: 'SET_SYSTEM_THEME', payload: theme })
  }), []);

  // Computed values
  const computedValues = useMemo(() => ({
    isDark: state.resolvedTheme === 'dark',
    isSystem: state.theme === 'system'
  }), [state.resolvedTheme, state.theme]);

  // System theme detection
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      actions.setSystemTheme(e.matches ? 'dark' : 'light');
    };

    // Set initial system theme
    actions.setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    // Listen for system theme changes
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [actions]);

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(state.resolvedTheme);
  }, [state.resolvedTheme]);

  const value = useMemo(() => ({
    state,
    actions,
    ...computedValues
  }), [state, actions, computedValues]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
} 