export interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  systemTheme: 'light' | 'dark';
  resolvedTheme: 'light' | 'dark';
}

export type ThemeAction = 
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
  | { type: 'SET_SYSTEM_THEME'; payload: 'light' | 'dark' };

export interface ThemeContextValue {
  state: ThemeState;
  actions: {
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    setSystemTheme: (theme: 'light' | 'dark') => void;
  };
  isDark: boolean;
  isSystem: boolean;
} 